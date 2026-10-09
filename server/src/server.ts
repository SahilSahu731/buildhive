import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import passport from "./config/passport.js";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import prisma from "./lib/prisma.js";
import { PrismaSessionStore } from "./hive/session.js";
import { api, route } from "./hive/api.js";
import { HttpError, workspaceFor } from "./hive/service.js";
import { frontend } from "./hive/config.js";
export const app = express();
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
  throw new Error("SESSION_SECRET must contain at least 32 characters");
app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 1));
app.use(helmet());
app.use(cors({ origin: frontend(), credentials: true }));
app.use(
  express.json({
    limit: "128kb",
    verify: (req, _res, buf) => {
      (req as Request & { rawBody: Buffer }).rawBody = buf;
    },
  }),
);
app.use(
  rateLimit({
    windowMs: 60000,
    limit: 180,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.use(
  session({
    name: "buildhive.sid",
    store: new PrismaSessionStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 86400000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
// Browser mutations use same-site cookies plus an explicit origin check. Signed webhooks authenticate separately.
app.use((req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    !req.path.startsWith("/api/webhooks/")
  ) {
    if (req.headers.origin !== new URL(frontend()).origin)
      return res.status(403).json({ message: "Request origin not allowed" });
  }
  next();
});
const authLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
for (const provider of ["github", "google"]) {
  app.get(
    `/api/auth/${provider}`,
    authLimiter,
    passport.authenticate(provider, {
      scope: provider === "github" ? ["user:email"] : ["profile", "email"],
    }),
  );
  app.get(
    `/api/auth/${provider}/callback`,
    passport.authenticate(provider, {
      failureRedirect: `${frontend()}/login?error=oauth`,
    }),
    route(async (req, res) => {
      const w = await workspaceFor((req.user as { id: string }).id);
      const count = await prisma.hiveProject.count({
        where: { workspaceId: w.id },
      });
      res.redirect(
        `${frontend()}${count ? "/dashboard" : "/dashboard/projects/new"}`,
      );
    }),
  );
}
app.post("/api/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("buildhive.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.json({ signedOut: true });
    });
  });
});
app.get(
  "/api/health",
  route(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "buildhive-api" });
  }),
);
app.use("/api", api);
app.use((_req, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError)
    return res
      .status(422)
      .json({ message: "Please check your input", issues: error.issues });
  if (error instanceof HttpError)
    return res.status(error.status).json({ message: error.message });
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
    return res
      .status(409)
      .json({ message: "This record already exists. Refresh and try again." });
  console.error(
    JSON.stringify({
      level: "error",
      type: error instanceof Error ? error.name : "UnknownError",
    }),
  );
  return res.status(500).json({
    message:
      "The request could not be completed. Check service configuration and try again.",
  });
});
if (process.env.NODE_ENV !== "test")
  app.listen(Number(process.env.PORT || 5000), "0.0.0.0", () =>
    console.log("BuildHive API listening"),
  );
