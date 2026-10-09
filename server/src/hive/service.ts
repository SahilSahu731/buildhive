import { Prisma, HiveWorkspace } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { effectivePlan, monthStart, planFor } from "./config.js";
import { definitionSchema, assertTargetPaths } from "./definition.js";
import { HttpError } from "./errors.js";
export { HttpError };
export async function locked<T>(
  workspaceId: string,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${workspaceId}))::text`;
      return work(tx);
    },
    { timeout: 15000 },
  );
}
export async function workspaceFor(userId: string) {
  return prisma.hiveWorkspace.upsert({
    where: { ownerId: userId },
    update: {},
    create: { ownerId: userId },
  });
}
export async function requireProject(workspaceId: string, id: string) {
  const p = await prisma.hiveProject.findFirst({ where: { id, workspaceId } });
  if (!p) throw new HttpError(404, "Project not found");
  return p;
}
export async function requireTest(workspaceId: string, id: string) {
  const t = await prisma.hiveTest.findFirst({
    where: { id, project: { workspaceId } },
    include: {
      project: true,
      versions: { orderBy: { number: "desc" }, take: 1 },
      schedule: true,
    },
  });
  if (!t) throw new HttpError(404, "Test not found");
  return t;
}
export async function usageFor(w: HiveWorkspace) {
  const [projects, tests, events] = await Promise.all([
    prisma.hiveProject.count({
      where: { workspaceId: w.id, status: { not: "archived" } },
    }),
    prisma.hiveTest.count({ where: { project: { workspaceId: w.id } } }),
    prisma.hiveUsage.groupBy({
      by: ["kind"],
      where: { workspaceId: w.id, createdAt: { gte: monthStart() } },
      _sum: { units: true },
    }),
  ]);
  return {
    plan: effectivePlan(w),
    limits: planFor(effectivePlan(w)),
    projects,
    tests,
    runs: events.find((e) => e.kind === "run")?._sum.units || 0,
    ai: events.find((e) => e.kind === "ai")?._sum.units || 0,
    browserMs: events.find((e) => e.kind === "browser_ms")?._sum.units || 0,
    renewsAt:
      w.periodEnd ||
      new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1),
      ),
  };
}
export async function reserveAI(w: HiveWorkspace) {
  await locked(w.id, async (tx) => {
    const count = await tx.hiveUsage.count({
      where: {
        workspaceId: w.id,
        kind: "ai",
        createdAt: { gte: monthStart() },
      },
    });
    if (count >= planFor(effectivePlan(w)).ai)
      throw new HttpError(402, "Monthly AI allowance reached");
    await tx.hiveUsage.create({ data: { workspaceId: w.id, kind: "ai" } });
  });
}
export async function enqueueTest(
  workspaceId: string,
  testId: string,
  trigger = "manual",
  deploymentId?: string,
  retryOf?: string,
  tx?: Prisma.TransactionClient,
): Promise<unknown> {
  const work = async (db: Prisma.TransactionClient) => {
    const w = await db.hiveWorkspace.findUniqueOrThrow({
      where: { id: workspaceId },
    });
    if (w.suspended) throw new HttpError(403, "Workspace is suspended");
    const t = await db.hiveTest.findFirst({
      where: { id: testId, project: { workspaceId } },
      include: {
        project: true,
        versions: { orderBy: { number: "desc" }, take: 1 },
      },
    });
    if (!t) throw new HttpError(404, "Test not found");
    if (
      t.status !== "active" ||
      t.project.status !== "active" ||
      !t.project.verifiedAt
    )
      throw new HttpError(
        409,
        "Activate the test and verify its project before running",
      );
    const active = await db.hiveRun.findFirst({
      where: { testId, status: { in: ["queued", "preparing", "running"] } },
    });
    if (active) throw new HttpError(409, "This test already has an active run");
    const count = await db.hiveUsage.count({
      where: { workspaceId, kind: "run", createdAt: { gte: monthStart() } },
    });
    if (count >= planFor(effectivePlan(w)).runs)
      throw new HttpError(402, "Monthly browser run allowance reached");
    const version = t.versions[0];
    if (!version) throw new HttpError(409, "Save a test version first");
    assertTargetPaths(
      definitionSchema.parse(version.definition),
      t.project.url,
    );
    const run = await db.hiveRun.create({
      data: {
        projectId: t.projectId,
        testId: t.id,
        versionId: version.id,
        targetUrl: t.project.url,
        testName: t.name,
        environment: t.project.environment,
        trigger,
        deploymentId,
        retryOf,
      },
    });
    await db.hiveUsage.create({
      data: { workspaceId, kind: "run", reference: run.id },
    });
    return run;
  };
  return tx ? work(tx) : locked(workspaceId, work);
}
