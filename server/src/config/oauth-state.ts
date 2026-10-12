import { randomBytes } from "node:crypto";
import type { Request } from "express";
import type { SessionData } from "express-session";
import type {
  Metadata,
  StateStore,
  StateStoreStoreCallback,
  StateStoreVerifyCallback,
} from "passport-oauth2";
import prisma from "../lib/prisma.js";

type State = { value: string; expires: number };
type OAuthSession = SessionData & Record<string, State | undefined>;
/** Save before redirect; consume in PostgreSQL once, including concurrent callbacks. */
export class PersistedOAuthState implements StateStore {
  private key: string;
  constructor(provider: string) {
    this.key = `buildhive-oauth-${provider}`;
  }
  store(req: Request, callback: StateStoreStoreCallback): void;
  store(
    req: Request,
    metadata: Metadata,
    callback: StateStoreStoreCallback,
  ): void;
  store(
    req: Request,
    metadata: Metadata | StateStoreStoreCallback,
    callback?: StateStoreStoreCallback,
  ) {
    const done = typeof metadata === "function" ? metadata : callback!;
    const value = randomBytes(24).toString("hex");
    (req.session as unknown as OAuthSession)[this.key] = {
      value,
      expires: Date.now() + 10 * 60000,
    };
    req.session.save((error) => done(error || null, error ? undefined : value));
  }
  verify(
    req: Request,
    supplied: string,
    callback: StateStoreVerifyCallback,
  ): void;
  verify(
    req: Request,
    supplied: string,
    metadata: Metadata,
    callback: StateStoreVerifyCallback,
  ): void;
  verify(
    req: Request,
    supplied: string,
    metadata: Metadata | StateStoreVerifyCallback,
    callback?: StateStoreVerifyCallback,
  ) {
    const done = typeof metadata === "function" ? metadata : callback!;
    const data = req.session as unknown as OAuthSession;
    const stored = data[this.key];
    delete data[this.key];
    if (
      !stored ||
      typeof supplied !== "string" ||
      stored.value !== supplied ||
      stored.expires < Date.now()
    ) {
      done(null, false, undefined);
      return;
    }
    // Both requests may have loaded the same session. Only one can claim its state.
    void prisma.$executeRaw`
      UPDATE "HiveSession" SET "data" = "data" - ${this.key}
      WHERE "id" = ${req.sessionID} AND "expiresAt" > NOW()
        AND "data" -> ${this.key} ->> 'value' = ${stored.value}
    `
      .then((count) => done(null, count === 1, undefined))
      .catch((error) => done(error, false, undefined));
  }
}
