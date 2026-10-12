import { PrismaClient } from "@prisma/client";

// Use a global variable to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // API and worker handlers log sanitized error categories. Prisma's raw
    // error messages can contain query arguments and connection details.
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
