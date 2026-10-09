import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { chromium, Browser } from "@playwright/test";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import prisma from "../lib/prisma.js";
import { executeRun } from "./runner.js";
import { enqueueTest } from "./service.js";
import { recordAlert } from "./notifications.js";
vi.mock("./security.js", async () => {
  const actual =
    await vi.importActual<typeof import("./security.js")>("./security.js");
  return {
    ...actual,
    resolvePublic: async () => [{ address: "93.184.215.14", family: 4 }],
  };
});
vi.mock("./storage.js", () => ({ uploadArtifact: async () => 64 }));
const integration =
  process.env.TEST_DATABASE_URL && process.env.RUN_BROWSER_TESTS === "1"
    ? describe
    : describe.skip;
integration("persisted browser runs and background queue", () => {
  let userId: string;
  let workspaceId: string;
  let projectId: string;
  let testId: string;
  let browser: Browser;
  const origin = "https://owned-fixture.example";
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.SECRETS_ENCRYPTION_KEY = "a".repeat(64);
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    });
    const newContext = browser.newContext.bind(browser);
    vi.spyOn(browser, "newContext").mockImplementation(async (options) => {
      const context = await newContext(options);
      const newPage = context.newPage.bind(context);
      vi.spyOn(context, "newPage").mockImplementation(async () => {
        const page = await newPage();
        await page.route(`${origin}/**`, (r) =>
          r.fulfill({
            contentType: "text/html",
            body: "<html><head><title>Fixture</title></head><body><h1>Ready</h1><button onclick=\"document.querySelector('h1').textContent='Done'\">Continue</button></body></html>",
          }),
        );
        return page;
      });
      return context;
    });
    const close = browser.close.bind(browser);
    vi.spyOn(browser, "close").mockImplementation(async () => {});
    vi.spyOn(chromium, "launch").mockResolvedValue(browser);
    (
      globalThis as { fixtureBrowserClose?: () => Promise<void> }
    ).fixtureBrowserClose = close;
    const user = await prisma.user.create({
      data: {
        email: `runner-${randomUUID()}@example.test`,
        name: "Runner fixture",
        skills: [],
      },
    });
    userId = user.id;
    const w = await prisma.hiveWorkspace.create({
      data: {
        ownerId: userId,
        plan: "GROWTH",
        subscriptionStatus: "active",
        periodEnd: new Date(Date.now() + 86400000),
      },
    });
    workspaceId = w.id;
    const p = await prisma.hiveProject.create({
      data: {
        workspaceId,
        name: "Owned fixture",
        url: origin,
        status: "active",
        verificationToken: randomUUID(),
        verificationExpiresAt: new Date(Date.now() + 86400000),
        verifiedAt: new Date(),
      },
    });
    projectId = p.id;
    const t = await prisma.hiveTest.create({
      data: {
        projectId,
        name: "Real browser fixture",
        tags: [],
        versions: {
          create: {
            number: 1,
            definition: {
              startPath: "/",
              viewport: "desktop",
              timeout: 5,
              stepTimeout: 1,
              steps: [
                { action: "click", locator: "role=button|Continue" },
                { action: "assertText", locator: "h1", value: "Done" },
              ],
            },
          },
        },
      },
    });
    testId = t.id;
  });
  afterAll(async () => {
    await (
      globalThis as { fixtureBrowserClose?: () => Promise<void> }
    ).fixtureBrowserClose?.();
    vi.restoreAllMocks();
    if (userId) await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });
  it("persists passing steps and never reexecutes a completed job", async () => {
    const r = (await enqueueTest(workspaceId, testId)) as { id: string };
    await executeRun(r.id);
    let saved = await prisma.hiveRun.findUniqueOrThrow({
      where: { id: r.id },
      include: { steps: true },
    });
    expect(saved.status).toBe("passed");
    expect(saved.steps.map((s) => s.status)).toEqual(["passed", "passed"]);
    expect(saved.durationMs).toBeGreaterThan(0);
    await executeRun(r.id);
    saved = await prisma.hiveRun.findUniqueOrThrow({
      where: { id: r.id },
      include: { steps: true },
    });
    expect(saved.attempt).toBe(1);
    expect(
      await prisma.hiveUsage.count({
        where: { reference: `duration-${r.id}` },
      }),
    ).toBe(1);
    await recordAlert(r.id);
    expect(
      await prisma.hiveNotification.count({ where: { runId: r.id } }),
    ).toBe(0);
  });
  it("records a failed assertion and skipped later steps, with alert deduplication", async () => {
    await prisma.hiveTest.update({
      where: { id: testId },
      data: {
        currentVersion: 2,
        versions: {
          create: {
            number: 2,
            definition: {
              startPath: "/",
              viewport: "desktop",
              timeout: 5,
              stepTimeout: 1,
              steps: [
                { action: "assertText", locator: "h1", value: "Wrong heading" },
                { action: "click", locator: "button" },
              ],
            },
          },
        },
      },
    });
    const r = (await enqueueTest(workspaceId, testId)) as { id: string };
    await executeRun(r.id);
    const saved = await prisma.hiveRun.findUniqueOrThrow({
      where: { id: r.id },
      include: { steps: { orderBy: { position: "asc" } }, artifacts: true },
    });
    expect(saved.status).toBe("failed");
    expect(saved.steps.map((s) => s.status)).toEqual(["failed", "skipped"]);
    expect(saved.error).toContain("Wrong heading");
    expect(saved.artifacts.some((a) => a.kind === "screenshot")).toBe(true);
    await Promise.all([recordAlert(r.id), recordAlert(r.id)]);
    expect(
      await prisma.hiveNotification.count({
        where: { runId: r.id, kind: "failure" },
      }),
    ).toBe(1);
  });
  it("honors cancellation before a worker claims the run", async () => {
    const r = (await enqueueTest(workspaceId, testId)) as { id: string };
    await prisma.hiveRun.update({
      where: { id: r.id },
      data: { status: "cancelled" },
    });
    await executeRun(r.id);
    expect(
      (await prisma.hiveRun.findUniqueOrThrow({ where: { id: r.id } })).attempt,
    ).toBe(0);
  });
  it.skipIf(!process.env.TEST_REDIS_URL)(
    "executes an accepted run through a real Redis/BullMQ worker",
    async () => {
      await prisma.hiveTest.update({
        where: { id: testId },
        data: {
          currentVersion: 3,
          versions: {
            create: {
              number: 3,
              definition: {
                startPath: "/",
                viewport: "desktop",
                timeout: 5,
                stepTimeout: 1,
                steps: [
                  { action: "assertText", locator: "h1", value: "Ready" },
                ],
              },
            },
          },
        },
      });
      const r = (await enqueueTest(workspaceId, testId)) as { id: string };
      const connection = new Redis(process.env.TEST_REDIS_URL!, {
        maxRetriesPerRequest: null,
      });
      const name = `qa-${randomUUID()}`;
      const queue = new Queue(name, { connection });
      const worker = new Worker(name, (job) => executeRun(job.data.runId), {
        connection,
        concurrency: 1,
      });
      try {
        await new Promise<void>(async (resolve, reject) => {
          worker.once("completed", () => resolve());
          worker.once("failed", (_job, error) => reject(error));
          await queue.add("run", { runId: r.id }, { jobId: r.id });
        });
        expect(
          (await prisma.hiveRun.findUniqueOrThrow({ where: { id: r.id } }))
            .status,
        ).toBe("passed");
        await recordAlert(r.id);
        expect(
          await prisma.hiveNotification.count({
            where: { runId: r.id, kind: "recovery" },
          }),
        ).toBe(1);
      } finally {
        await worker.close();
        await queue.obliterate({ force: true });
        await queue.close();
        await connection.quit();
      }
    },
    15000,
  );
});
