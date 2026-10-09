import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createHmac, randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { PrismaClient } from "@prisma/client";
const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;
integration("authenticated V1 API against PostgreSQL", () => {
  let db: PrismaClient;
  let server: Server;
  let base: string;
  let ownerId: string;
  let otherId: string;
  let workspaceId: string;
  let cookie: string;
  let otherCookie: string;
  let projectId: string;
  let testId: string;
  let runId: string;
  const secret = "buildhive-integration-session-secret-32-characters";
  async function call(
    path: string,
    method = "GET",
    body?: unknown,
    session = cookie,
  ) {
    const r = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...(session ? { Cookie: session } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, data: (await r.json()) as Record<string, any> };
  }
  async function session(userId: string) {
    const sid = randomUUID();
    const expires = new Date(Date.now() + 3600000);
    await db.hiveSession.create({
      data: {
        id: sid,
        userId,
        expiresAt: expires,
        data: {
          cookie: {
            originalMaxAge: 3600000,
            expires: expires.toISOString(),
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          },
          passport: { user: userId },
        },
      },
    });
    return `buildhive.sid=${encodeURIComponent(`s:${sid}.${createHmac("sha256", secret).update(sid).digest("base64").replace(/=+$/, "")}`)}`;
  }
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
    process.env.SESSION_SECRET = secret;
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.SECRETS_ENCRYPTION_KEY = "a".repeat(64);
    const { app } = await import("../server.js");
    db = (await import("../lib/prisma.js")).default;
    const u = await db.user.create({
      data: {
        email: `owner-${randomUUID()}@example.test`,
        name: "QA Developer",
        emailVerified: true,
        skills: [],
      },
    });
    const other = await db.user.create({
      data: {
        email: `other-${randomUUID()}@example.test`,
        name: "Other User",
        emailVerified: true,
        skills: [],
      },
    });
    ownerId = u.id;
    otherId = other.id;
    const w = await db.hiveWorkspace.create({ data: { ownerId } });
    workspaceId = w.id;
    cookie = await session(ownerId);
    otherCookie = await session(otherId);
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  }, 30000);
  afterAll(async () => {
    if (server)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    if (db) {
      await db.user.deleteMany({
        where: { id: { in: [ownerId, otherId].filter(Boolean) } },
      });
      await db.$disconnect();
    }
  });
  it("requires authentication and checks browser origins", async () => {
    expect((await call("/me", "GET", undefined, "")).status).toBe(401);
    const r = await fetch(base + "/projects", {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        Origin: "https://evil.example",
      },
      body: "{}",
    });
    expect(r.status).toBe(403);
  });
  it("creates projects with a real ownership challenge and enforces limits", async () => {
    const r = await call("/projects", "POST", {
      name: "QA fixture",
      url: "https://example.com",
      environment: "staging",
    });
    expect(r.status).toBe(201);
    projectId = r.data.id;
    expect(r.data.status).toBe("unverified");
    expect(r.data.verificationToken.length).toBe(64);
    expect(
      (
        await call("/projects", "POST", {
          name: "Over limit",
          url: "https://example.com",
        })
      ).status,
    ).toBe(402);
  });
  it("denies cross-account reads, writes and secrets", async () => {
    for (const [path, method, body] of [
      [`/projects/${projectId}`, "GET", undefined],
      [`/projects/${projectId}`, "PATCH", { name: "stolen" }],
      [
        `/projects/${projectId}/secrets`,
        "PUT",
        { name: "PASSWORD", value: "abc" },
      ],
    ] as const)
      expect((await call(path, method, body, otherCookie)).status).toBe(404);
  });
  it("validates assertions and stores encrypted secret references", async () => {
    expect(
      (
        await call(`/projects/${projectId}/tests`, "POST", {
          name: "No assertions",
          definition: { steps: [{ action: "navigate", value: "/" }] },
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await call(`/projects/${projectId}/secrets`, "PUT", {
          name: "TEST_PASSWORD",
          value: "private-test-secret",
        })
      ).status,
    ).toBe(200);
    const p = await call(`/projects/${projectId}`);
    expect(JSON.stringify(p.data)).not.toContain("private-test-secret");
    expect(p.data.secrets[0].name).toBe("TEST_PASSWORD");
    const stored = await db.hiveSecret.findFirstOrThrow({
      where: { projectId },
    });
    expect(stored.encryptedValue).not.toContain("private-test-secret");
  });
  it("versions tests and prevents stale edits", async () => {
    const body = {
      name: "Homepage heading",
      definition: { steps: [{ action: "assertVisible", locator: "h1" }] },
    };
    const r = await call(`/projects/${projectId}/tests`, "POST", body);
    expect(r.status).toBe(201);
    testId = r.data.id;
    expect(
      (
        await call(`/tests/${testId}`, "PATCH", {
          ...body,
          name: "Edited heading",
          expectedVersion: 1,
        })
      ).status,
    ).toBe(200);
    expect(
      (await call(`/tests/${testId}`, "PATCH", { ...body, expectedVersion: 1 }))
        .status,
    ).toBe(409);
    expect(await db.hiveTestVersion.count({ where: { testId } })).toBe(2);
  });
  it("blocks unverified runs, serializes overlapping requests and meters accepted runs", async () => {
    expect((await call(`/tests/${testId}/runs`, "POST")).status).toBe(409);
    await db.hiveProject.update({
      where: { id: projectId },
      data: { status: "active", verifiedAt: new Date() },
    });
    const results = await Promise.all([
      call(`/tests/${testId}/runs`, "POST"),
      call(`/tests/${testId}/runs`, "POST"),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([202, 409]);
    runId = results.find((r) => r.status === 202)!.data.id;
    expect((await call("/usage")).data.runs).toBe(1);
    const run = await db.hiveRun.findUniqueOrThrow({
      where: { id: runId },
      include: { version: true },
    });
    expect(run.version.number).toBe(2);
  });
  it("protects reports and permits cancellation", async () => {
    expect(
      (await call(`/runs/${runId}`, "GET", undefined, otherCookie)).status,
    ).toBe(404);
    expect((await call(`/runs/${runId}/cancel`, "POST")).status).toBe(200);
    expect((await call(`/runs/${runId}`)).data.status).toBe("cancelled");
  });
  it("enforces free schedule frequency on the server", async () => {
    const body = {
      enabled: true,
      frequency: "hourly",
      hour: 9,
      timezone: "Asia/Kolkata",
    };
    expect((await call(`/tests/${testId}/schedule`, "PUT", body)).status).toBe(
      402,
    );
    const r = await call(`/tests/${testId}/schedule`, "PUT", {
      ...body,
      frequency: "daily",
    });
    expect(r.status).toBe(200);
    expect(r.data.nextRunAt).toBeTruthy();
  });
  it("rejects invalid webhooks and non-admin requests", async () => {
    expect((await call("/admin/overview")).status).toBe(403);
    expect((await call("/webhooks/billing", "POST", {})).status).toBe(401);
    expect((await call(`/projects/${projectId}/webhook`, "POST")).status).toBe(
      402,
    );
  });
  it("enforces monthly browser quotas independently of queued state", async () => {
    await db.hiveUsage.createMany({
      data: Array.from({ length: 19 }, () => ({ workspaceId, kind: "run" })),
    });
    expect((await call(`/tests/${testId}/runs`, "POST")).status).toBe(402);
  });
  it("exports data without encrypted values or signing credentials", async () => {
    const r = await call("/me/export");
    expect(r.status).toBe(200);
    const text = JSON.stringify(r.data);
    expect(text).not.toContain("encryptedValue");
    expect(text).not.toContain("private-test-secret");
    expect(text).not.toContain("webhookSecret");
  });
  it("handles signed payment events idempotently and prevents older events restoring access", async () => {
    process.env.RAZORPAY_STARTER_PLAN_ID = "plan_qa_starter";
    process.env.RAZORPAY_WEBHOOK_SECRET = "qa-billing-secret";
    await db.hiveWorkspace.update({
      where: { id: workspaceId },
      data: { subscriptionId: "sub_" + workspaceId },
    });
    const now = Math.floor(Date.now() / 1000);
    async function payment(status: string, eventId: string, createdAt: number) {
      const body = JSON.stringify({
        event: "subscription." + status,
        created_at: createdAt,
        payload: {
          subscription: {
            entity: {
              id: "sub_" + workspaceId,
              plan_id: "plan_qa_starter",
              status,
              current_end: now + 86400,
            },
          },
        },
      });
      const r = await fetch(base + "/webhooks/billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Razorpay-Event-Id": eventId,
          "X-Razorpay-Signature": createHmac("sha256", "qa-billing-secret")
            .update(body)
            .digest("hex"),
        },
        body,
      });
      return r.status;
    }
    const eventId = randomUUID();
    expect(
      await Promise.all([
        payment("active", eventId, now),
        payment("active", eventId, now),
      ]),
    ).toEqual([200, 200]);
    expect((await call("/usage")).data.plan).toBe("STARTER");
    expect(await payment("halted", randomUUID(), now + 10)).toBe(200);
    expect((await call("/usage")).data.plan).toBe("FREE");
    expect(await payment("active", randomUUID(), now - 10)).toBe(200);
    expect((await call("/usage")).data.plan).toBe("FREE");
  });
  it("accepts signed deployment events once and rejects replay windows and altered bodies", async () => {
    await db.hiveWorkspace.update({
      where: { id: workspaceId },
      data: {
        plan: "STARTER",
        subscriptionStatus: "active",
        periodEnd: new Date(Date.now() + 86400000),
      },
    });
    await db.hiveTest.update({
      where: { id: testId },
      data: { deploymentEnabled: true },
    });
    const hook = await call(`/projects/${projectId}/webhook`, "POST");
    expect(hook.status).toBe(200);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({
      eventId: randomUUID(),
      label: "QA deployment",
    });
    async function send(time: string, contents: string, signature: string) {
      const r = await fetch(base + `/webhooks/deployment/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BuildHive-Timestamp": time,
          "X-BuildHive-Signature": signature,
        },
        body: contents,
      });
      return {
        status: r.status,
        data: (await r.json()) as Record<string, any>,
      };
    }
    const sign = (time: string) =>
      createHmac("sha256", hook.data.secret)
        .update(`${time}.${body}`)
        .digest("hex");
    const first = await send(timestamp, body, sign(timestamp));
    expect(first.status).toBe(202);
    expect(first.data.runs).toHaveLength(1);
    const replay = await send(timestamp, body, sign(timestamp));
    expect(replay.status).toBe(202);
    expect(replay.data.duplicate).toBe(true);
    expect((await send(timestamp, body + " ", sign(timestamp))).status).toBe(
      401,
    );
    const old = String(Number(timestamp) - 600);
    expect((await send(old, body, sign(old))).status).toBe(401);
    await db.hiveRun.updateMany({
      where: { testId, status: "queued" },
      data: { status: "cancelled" },
    });
  });
});
