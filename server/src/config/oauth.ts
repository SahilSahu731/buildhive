import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

export type Provider = "google" | "github";
export class OAuthError extends Error {
  constructor(public code: "account" | "email" | "configuration") {
    super(`OAuth ${code}`);
    this.name = "OAuthError";
  }
}
export function providerConfigured(provider: Provider) {
  const credentials = ["CLIENT_ID", "CLIENT_SECRET"].every((suffix) => {
    const value = process.env[`${provider.toUpperCase()}_${suffix}`];
    return value && !/placeholder|your[_-]|replace[_-]/i.test(value);
  });
  try {
    const front = new URL(process.env.FRONTEND_URL || "http://localhost:3000");
    const callback = new URL(
      process.env[`${provider.toUpperCase()}_CALLBACK_URL`] ||
        `/api/auth/${provider}/callback`,
      front,
    );
    return (
      credentials &&
      callback.hostname === front.hostname &&
      callback.pathname === `/api/auth/${provider}/callback` &&
      (process.env.NODE_ENV !== "production" ||
        (front.protocol === "https:" && callback.protocol === "https:"))
    );
  } catch {
    return false;
  }
}
export function oauthErrorCode(error: unknown) {
  if (error instanceof OAuthError) return error.code;
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  )
    return "database";
  return "provider";
}
export async function resolveOAuthUser(identity: {
  provider: Provider;
  id: string;
  email?: string;
  verified: boolean;
  name?: string;
  image?: string;
  githubUsername?: string;
  githubUrl?: string;
  bio?: string;
}) {
  const field = identity.provider === "google" ? "googleId" : "githubId";
  const linked = await prisma.user.findFirst({
    where: { [field]: identity.id },
  });
  if (linked) return linked;
  const email = identity.email?.trim().toLowerCase();
  if (!email || !identity.verified) throw new OAuthError("email");
  const matches = await prisma.user.findMany({
    where: { email: { equals: email, mode: "insensitive" } },
    take: 2,
  });
  const existing = matches[0];
  if (
    matches.length > 1 ||
    (existing && (!existing.emailVerified || existing[field]))
  )
    throw new OAuthError("account");
  const profile =
    identity.provider === "github"
      ? {
          githubUsername: identity.githubUsername,
          githubUrl: identity.githubUrl,
        }
      : {};
  if (existing) {
    // Conditional update prevents two concurrent callbacks replacing an identity.
    const updated = await prisma.user.updateMany({
      where: { id: existing.id, [field]: null, emailVerified: true },
      data: {
        [field]: identity.id,
        ...profile,
        image: existing.image || identity.image,
      },
    });
    if (!updated.count) throw new OAuthError("account");
    return prisma.user.findUniqueOrThrow({ where: { id: existing.id } });
  }
  try {
    return await prisma.user.create({
      data: {
        [field]: identity.id,
        email,
        emailVerified: true,
        name: identity.name,
        image: identity.image,
        bio: identity.bio,
        skills: [],
        ...profile,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const concurrent = await prisma.user.findFirst({
        where: { [field]: identity.id },
      });
      if (concurrent) return concurrent;
      throw new OAuthError("account");
    }
    throw error;
  }
}
