import session, { SessionData } from "express-session";
import prisma from "../lib/prisma.js";
export class PrismaSessionStore extends session.Store {
  get(sid: string, cb: (err: unknown, data?: SessionData | null) => void) {
    prisma.hiveSession
      .findUnique({ where: { id: sid } })
      .then((s) =>
        cb(
          null,
          s && s.expiresAt > new Date()
            ? (s.data as unknown as SessionData)
            : null,
        ),
      )
      .catch(cb);
  }
  set(sid: string, data: SessionData, cb: (err?: unknown) => void = () => {}) {
    const userId = (data as SessionData & { passport?: { user?: string } })
      .passport?.user;
    const record = {
      data: JSON.parse(JSON.stringify(data)),
      userId: userId || null,
      expiresAt: data.cookie.expires
        ? new Date(data.cookie.expires)
        : new Date(Date.now() + 604800000),
    };
    prisma.hiveSession
      .upsert({
        where: { id: sid },
        create: { id: sid, ...record },
        update: record,
      })
      .then(() => cb())
      .catch(cb);
  }
  destroy(sid: string, cb: (err?: unknown) => void = () => {}) {
    prisma.hiveSession
      .deleteMany({ where: { id: sid } })
      .then(() => cb())
      .catch(cb);
  }
  touch(
    sid: string,
    data: SessionData,
    cb: (err?: unknown) => void = () => {},
  ) {
    prisma.hiveSession
      .updateMany({
        where: { id: sid },
        data: {
          expiresAt: data.cookie.expires
            ? new Date(data.cookie.expires)
            : new Date(Date.now() + 604800000),
        },
      })
      .then(() => cb())
      .catch(cb);
  }
}
