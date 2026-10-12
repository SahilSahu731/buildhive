/** Read-only OAuth/database diagnostics. Never prints credential values. */
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(resolve("server/package.json"));
require("dotenv").config({ path: resolve("server/.env") });
const { PrismaClient } = require("@prisma/client");
let failed = false;
function report(ok, label, detail = "") {
  if (!ok) failed = true;
  console.log(
    `${ok ? "OK" : "CHECK"}  ${label}${detail ? ` — ${detail}` : ""}`,
  );
}
function url(value) {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
const front = url(process.env.FRONTEND_URL || "http://localhost:3000");
report(!!front, "FRONTEND_URL", front?.origin);
report(
  (process.env.SESSION_SECRET || "").length >= 32,
  "SESSION_SECRET has at least 32 characters",
);
for (const provider of ["GOOGLE", "GITHUB"]) {
  for (const key of ["CLIENT_ID", "CLIENT_SECRET"]) {
    const value = process.env[`${provider}_${key}`];
    report(
      !!value && !/placeholder|your[_-]|replace[_-]/i.test(value),
      `${provider}_${key} present`,
    );
  }
  const callback = url(
    process.env[`${provider}_CALLBACK_URL`] ||
      `${front?.origin}/api/auth/${provider.toLowerCase()}/callback`,
  );
  report(
    !!callback &&
      callback.pathname === `/api/auth/${provider.toLowerCase()}/callback`,
    `${provider} callback`,
    callback ? `${callback.origin}${callback.pathname}` : "invalid URL",
  );
  report(
    !!callback && callback.hostname === front?.hostname,
    `${provider} callback and frontend use the same cookie hostname`,
  );
  if (process.env.NODE_ENV === "production")
    report(
      callback?.protocol === "https:" && front?.protocol === "https:",
      "Production uses HTTPS for secure cookies",
    );
}
for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  const connection = url(process.env[key]);
  if (
    !connection ||
    !["postgres:", "postgresql:"].includes(connection.protocol)
  ) {
    report(false, key, "missing or invalid PostgreSQL URL");
    continue;
  }
  connection.searchParams.set("connect_timeout", "5");
  connection.searchParams.set("pool_timeout", "5");
  const db = new PrismaClient({
    datasources: { db: { url: connection.href } },
    log: [],
  });
  try {
    await db.$queryRaw`SELECT 1`;
    report(true, `${key} connects`);
    if (key === "DATABASE_URL") {
      await db.hiveSession.findFirst({ select: { id: true } });
      await db.user.findFirst({
        select: { id: true, googleId: true, githubId: true },
      });
      await db.hiveWorkspace.findFirst({ select: { id: true } });
      await db.hiveProject.findFirst({ select: { id: true } });
      report(true, "OAuth/account tables are readable");
    }
  } catch (error) {
    const message = String(error?.message || "");
    const hint = /tenant.*(?:user|not found)/i.test(message)
      ? "Supabase pooler project/region mismatch. Copy the complete current URL from Dashboard → Connect."
      : /P2021|does not exist/i.test(`${error?.code} ${message}`)
        ? "Schema is missing. Review and apply Prisma migrations."
        : /authentication failed|password authentication/i.test(message)
          ? "Database credentials were rejected. Check the database password and URL encoding."
          : "Connection or schema check failed. Check project status, URL, network access and migrations.";
    report(false, key, hint);
  } finally {
    await db.$disconnect();
  }
}
console.log(
  "Register the exact callback URLs shown above in Google Cloud and GitHub OAuth app settings. Restart the API after editing .env. No provider consent flow or database writes were performed.",
);
process.exitCode = failed ? 1 : 0;
