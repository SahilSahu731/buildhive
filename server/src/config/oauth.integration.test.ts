import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { PrismaClient } from "@prisma/client";
import type { PassportStatic } from "passport";

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;
integration("OAuth state, callbacks and persisted sessions", () => {
  let db: PrismaClient;
  let server: Server;
  let base: string;
  let passport: PassportStatic;
  const prefix = `oauth-${randomUUID()}`;
  const sessions: string[] = [];
  const nativeFetch = globalThis.fetch;
  function cookie(response: Response) {
    const value = response.headers.get("set-cookie")?.split(";")[0] || "";
    if (value)
      sessions.push(
        decodeURIComponent(value.split("=").slice(1).join("="))
          .slice(2)
          .split(".")[0],
      );
    return value;
  }
  function request(path: string, session = "", host = "localhost:5000") {
    return nativeFetch(base + path, {
      redirect: "manual",
      headers: {
        "X-Forwarded-Host": host,
        ...(session ? { Cookie: session } : {}),
      },
    });
  }
  async function start(provider: string) {
    const response = await request(`/auth/${provider}`);
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location")!);
    expect(location.hostname).toBe(
      provider === "google" ? "accounts.google.com" : "github.com",
    );
    expect(location.searchParams.get("redirect_uri")).toBe(
      `http://localhost:5000/api/auth/${provider}/callback`,
    );
    expect(location.searchParams.get("state")).toBeTruthy();
    return {
      state: location.searchParams.get("state")!,
      cookie: cookie(response),
    };
  }
  function providerResponse(
    provider: string,
    id: string,
    email: string,
    verified = true,
  ) {
    const strategy = (passport as any)._strategy(provider);
    const exchange = vi
      .spyOn(strategy._oauth2, "getOAuthAccessToken")
      .mockImplementation((...args: any[]) => {
        args[2](null, "fixture-token", "fixture-refresh", {});
      });
    vi.spyOn(strategy, "userProfile").mockImplementation(
      (_token: any, done: any) =>
        done(null, {
          id,
          displayName: "OAuth Fixture",
          username: "fixture",
          profileUrl: "https://github.com/fixture",
          emails: [{ value: email }],
          photos: [],
          _json: { email_verified: verified },
        }),
    );
    if (provider === "github")
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
        if (input === "https://api.github.com/user/emails")
          return new Response(
            JSON.stringify([
              {
                email: "private-unverified@example.test",
                primary: true,
                verified: false,
              },
              { email, primary: false, verified },
            ]),
            { headers: { "Content-Type": "application/json" } },
          );
        return nativeFetch(input, init);
      });
    return exchange;
  }
  beforeAll(async () => {
    process.env.FRONTEND_URL = "http://localhost:3000";
    const { app } = await import("../server.js");
    db = (await import("../lib/prisma.js")).default;
    passport = (await import("./passport.js")).default;
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(async () => {
    if (server)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    if (db) {
      await db.hiveSession.deleteMany({ where: { id: { in: sessions } } });
      await db.user.deleteMany({
        where: { email: { startsWith: prefix, mode: "insensitive" } },
      });
      await db.$disconnect();
    }
  });
  for (const provider of ["google", "github"] as const) {
    it(`${provider}: exchanges a valid callback, rotates the session and authenticates the account`, async () => {
      const email = `${prefix}-${provider}@example.test`;
      const exchange = providerResponse(
        provider,
        `${prefix}-${provider}`,
        email.toUpperCase(),
      );
      const initial = await start(provider);
      const response = await request(
        `/auth/${provider}/callback?code=fixture&state=${initial.state}`,
        initial.cookie,
      );
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/dashboard/projects/new",
      );
      expect(exchange).toHaveBeenCalledOnce();
      const signedIn = cookie(response);
      expect(signedIn).toBeTruthy();
      expect(signedIn).not.toBe(initial.cookie);
      expect((await request("/me", signedIn)).status).toBe(200);
      expect((await request("/me", initial.cookie)).status).toBe(401);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      expect(user.emailVerified).toBe(true);
      expect(user.skills).toEqual([]);
      expect(
        await db.hiveWorkspace.count({ where: { ownerId: user.id } }),
      ).toBe(1);
      const replay = await request(
        `/auth/${provider}/callback?code=fixture&state=${initial.state}`,
        signedIn,
      );
      cookie(replay);
      expect(replay.headers.get("location")).toContain("error=state");
      expect(exchange).toHaveBeenCalledOnce();
    });
    it(`${provider}: rejects a state mismatch before exchanging credentials`, async () => {
      const exchange = providerResponse(
        provider,
        "unused",
        "unused@example.test",
      );
      const initial = await start(provider);
      const response = await request(
        `/auth/${provider}/callback?code=fixture&state=incorrect`,
        initial.cookie,
      );
      cookie(response);
      expect(response.headers.get("location")).toContain("error=state");
      expect(exchange).not.toHaveBeenCalled();
    });
  }
  it("persists OAuth state before sending the provider redirect", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.spyOn(db.hiveSession, "upsert").mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError(
        "fixture writes unavailable",
        "6.19",
      ),
    );
    const response = await request("/auth/google");
    cookie(response);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=database",
    );
  });
  it("consumes state atomically when callbacks arrive concurrently", async () => {
    const exchange = providerResponse(
      "google",
      `${prefix}-concurrent`,
      `${prefix}-concurrent@example.test`,
    );
    const initial = await start("google");
    const callbacks = await Promise.all(
      [0, 1].map(() =>
        request(
          `/auth/google/callback?code=fixture&state=${initial.state}`,
          initial.cookie,
        ),
      ),
    );
    callbacks.forEach(cookie);
    expect(callbacks.map((r) => r.headers.get("location")).sort()).toEqual([
      "http://localhost:3000/dashboard/projects/new",
      "http://localhost:3000/login?error=state",
    ]);
    expect(exchange).toHaveBeenCalledOnce();
  });
  it("rejects expired state without exchanging a token", async () => {
    const exchange = providerResponse(
      "google",
      "unused",
      "unused@example.test",
    );
    const initial = await start("google");
    const id = decodeURIComponent(initial.cookie.split("=").slice(1).join("="))
      .slice(2)
      .split(".")[0];
    const row = await db.hiveSession.findUniqueOrThrow({ where: { id } });
    const data = row.data as Record<string, any>;
    data["buildhive-oauth-google"].expires = Date.now() - 1;
    await db.hiveSession.update({ where: { id }, data: { data } });
    const response = await request(
      `/auth/google/callback?code=fixture&state=${initial.state}`,
      initial.cookie,
    );
    cookie(response);
    expect(response.headers.get("location")).toContain("error=state");
    expect(exchange).not.toHaveBeenCalled();
  });
  it("detects a callback hostname that cannot receive the session cookie", async () => {
    const original = process.env.GOOGLE_CALLBACK_URL;
    try {
      process.env.GOOGLE_CALLBACK_URL =
        "https://other.example/api/auth/google/callback";
      expect((await request("/auth/google")).headers.get("location")).toContain(
        "error=configuration",
      );
    } finally {
      process.env.GOOGLE_CALLBACK_URL = original;
    }
  });
  it("shows a useful message when the user cancels provider consent", async () => {
    const response = await request("/auth/google/callback?error=access_denied");
    expect(response.headers.get("location")).toContain("error=denied");
  });
  it("canonicalizes localhost aliases before creating the OAuth state cookie", async () => {
    const response = await request("/auth/google", "", "127.0.0.1:5000");
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/api/auth/google",
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("fails before redirecting to a provider when session storage is unavailable", async () => {
    const { Prisma } = await import("@prisma/client");
    vi.spyOn(db.hiveSession, "findFirst").mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError(
        "fixture database unavailable",
        "6.19",
      ),
    );
    const response = await request("/auth/google");
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=database",
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("rejects a provider whose credentials are missing", async () => {
    const original = process.env.GOOGLE_CLIENT_ID;
    try {
      process.env.GOOGLE_CLIENT_ID = "";
      const response = await request("/auth/google");
      expect(response.headers.get("location")).toContain("error=configuration");
    } finally {
      process.env.GOOGLE_CLIENT_ID = original;
    }
  });
  it("links a verified email case-insensitively without creating a duplicate account", async () => {
    const email = `${prefix}-link@example.test`;
    const user = await db.user.create({
      data: { email: email.toUpperCase(), emailVerified: true, skills: [] },
    });
    providerResponse("google", `${prefix}-link`, email);
    const initial = await start("google");
    const response = await request(
      `/auth/google/callback?code=fixture&state=${initial.state}`,
      initial.cookie,
    );
    cookie(response);
    expect(response.headers.get("location")).toContain(
      "/dashboard/projects/new",
    );
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: user.id } })).googleId,
    ).toBe(`${prefix}-link`);
  });
  for (const scenario of [
    "unverified-local",
    "different-provider-id",
    "unverified-provider",
  ] as const) {
    it(`protects account ownership: ${scenario}`, async () => {
      const email = `${prefix}-${scenario}@example.test`;
      const user = await db.user.create({
        data: {
          email,
          emailVerified: scenario !== "unverified-local",
          skills: [],
          googleId:
            scenario === "different-provider-id" ? `${prefix}-original` : null,
        },
      });
      providerResponse(
        "google",
        `${prefix}-${scenario}`,
        email,
        scenario !== "unverified-provider",
      );
      const initial = await start("google");
      const response = await request(
        `/auth/google/callback?code=fixture&state=${initial.state}`,
        initial.cookie,
      );
      cookie(response);
      expect(response.headers.get("location")).toContain(
        `error=${scenario === "unverified-provider" ? "email" : "account"}`,
      );
      expect(
        (await db.user.findUniqueOrThrow({ where: { id: user.id } })).googleId,
      ).toBe(user.googleId);
    });
  }
});
