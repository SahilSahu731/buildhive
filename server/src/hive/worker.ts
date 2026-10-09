import "dotenv/config";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import prisma from "../lib/prisma.js";
import { executeRun } from "./runner.js";
import { enqueueTest, locked, HttpError } from "./service.js";
import { nextSchedule } from "./scheduling.js";
import { effectivePlan, planFor } from "./config.js";
import { recordAlert, deliverAlerts } from "./notifications.js";
import { removeArtifacts } from "./storage.js";
const connection = new Redis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  { maxRetriesPerRequest: null },
);
connection.on("error", () => console.error("Redis connection unavailable"));
const queue = new Queue("buildhive-runs", { connection });
void queue
  .setGlobalConcurrency(
    Math.max(
      1,
      Math.min(20, Number(process.env.WORKER_GLOBAL_CONCURRENCY) || 4),
    ),
  )
  .catch(() => console.error("Could not configure global concurrency"));
const worker = new Worker(
  "buildhive-runs",
  async (job) => {
    await executeRun(String(job.data.runId));
    await recordAlert(String(job.data.runId));
  },
  {
    connection,
    concurrency: Math.max(
      1,
      Math.min(4, Number(process.env.WORKER_CONCURRENCY) || 2),
    ),
    maxStalledCount: 0,
    lockDuration: 30000,
  },
);
worker.on("failed", async (job) => {
  if (job)
    await prisma.hiveRun
      .updateMany({
        where: {
          id: String(job.data.runId),
          status: { in: ["queued", "preparing", "running"] },
        },
        data: {
          status: "infrastructure_error",
          error: "Worker stopped unexpectedly. Retry this run.",
          finishedAt: new Date(),
        },
      })
      .catch(() => {});
});
worker.on("error", () => console.error("Worker connection error"));
const workerId = `${hostname()}-${randomUUID()}`;
let busy = false;
let ticks = 0;
async function tick() {
  if (busy) return;
  busy = true;
  try {
    const counts = await queue.getJobCounts("waiting", "active", "failed");
    await prisma.hiveServiceHealth.upsert({
      where: { id: workerId },
      create: {
        id: workerId,
        kind: "worker",
        lastSeenAt: new Date(),
        metadata: counts,
      },
      update: { lastSeenAt: new Date(), metadata: counts },
    });
    // Database is the durable outbox. Queue outages cannot lose accepted runs.
    const queued = await prisma.hiveRun.findMany({
      where: { status: "queued" },
      take: 100,
      orderBy: { createdAt: "asc" },
    });
    for (const run of queued)
      await queue.add(
        "run",
        { runId: run.id },
        {
          jobId: run.id,
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      );
    const stale = new Date(Date.now() - 180000);
    await prisma.hiveRun.updateMany({
      where: {
        status: { in: ["preparing", "running"] },
        heartbeatAt: { lt: stale },
      },
      data: {
        status: "infrastructure_error",
        error: "Worker heartbeat expired. No result was assumed.",
        finishedAt: new Date(),
      },
    });
    const schedules = await prisma.hiveSchedule.findMany({
      where: { enabled: true, nextRunAt: { lte: new Date() } },
      take: 50,
      include: {
        test: { include: { project: { include: { workspace: true } } } },
      },
    });
    for (const s of schedules) {
      await locked(s.test.project.workspaceId, async (tx) => {
        const current = await tx.hiveSchedule.findUnique({
          where: { id: s.id },
        });
        if (!current?.enabled || current.nextRunAt > new Date()) return;
        let lastError: string | null = null;
        try {
          if (
            !(
              planFor(effectivePlan(s.test.project.workspace))
                .frequencies as readonly string[]
            ).includes(current.frequency)
          )
            throw new HttpError(402, "Schedule frequency exceeds current plan");
          await enqueueTest(
            s.test.project.workspaceId,
            s.testId,
            "schedule",
            undefined,
            undefined,
            tx,
          );
        } catch (error) {
          if (!(error instanceof HttpError)) throw error;
          lastError = error.message;
        }
        await tx.hiveSchedule.update({
          where: { id: s.id },
          data: {
            nextRunAt: nextSchedule(
              current.frequency,
              current.hour,
              current.timezone,
            ),
            lastError,
          },
        });
      });
    }
    // Recover alerts missed if a worker died after persisting a result.
    const changed = await prisma.hiveRun.findMany({
      where: {
        status: { in: ["passed", "failed", "timed_out"] },
        alertProcessedAt: null,
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    for (const r of changed) await recordAlert(r.id);
    if (++ticks % 12 === 0) {
      await prisma.hiveNotification.updateMany({
        where: {
          status: "sending",
          lastAttemptAt: { lt: new Date(Date.now() - 300000) },
        },
        data: { status: "pending" },
      });
      await deliverAlerts();
      await prisma.hiveServiceHealth.deleteMany({
        where: { lastSeenAt: { lt: new Date(Date.now() - 7 * 86400000) } },
      });
      await prisma.hiveSession.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      const expired = await prisma.hiveArtifact.findMany({
        where: { expiresAt: { lt: new Date() } },
        take: 100,
      });
      if (expired.length) {
        await removeArtifacts(expired.map((a) => a.path));
        await prisma.hiveArtifact.deleteMany({
          where: { id: { in: expired.map((a) => a.id) } },
        });
      }
    }
  } catch {
    console.error("Worker maintenance failed; retrying next tick");
  } finally {
    busy = false;
  }
}
const interval = setInterval(() => void tick(), 5000);
void tick();
async function stop() {
  clearInterval(interval);
  await worker.close();
  await queue.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGTERM", () => void stop());
process.on("SIGINT", () => void stop());
console.log("BuildHive worker started");
