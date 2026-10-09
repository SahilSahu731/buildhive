import nodemailer from "nodemailer";
import prisma from "../lib/prisma.js";
import { frontend } from "./config.js";
export async function sendMail(to: string, subject: string, text: string) {
  if (
    !process.env.SMTP_HOST &&
    (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
  )
    throw new Error("Transactional email is not configured");
  const smtp = nodemailer.createTransport(
    process.env.SMTP_HOST
      ? {
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        },
  );
  await smtp.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}
export async function recordAlert(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
    const run = await tx.hiveRun.findUnique({
      where: { id },
      include: { test: true, project: { include: { workspace: true } } },
    });
    if (
      !run ||
      run.alertProcessedAt ||
      !["passed", "failed", "timed_out"].includes(run.status)
    )
      return;
    await tx.hiveRun.update({
      where: { id },
      data: { alertProcessedAt: new Date() },
    });
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${run.testId}))::text`;
    const current = await tx.hiveTest.findUniqueOrThrow({
      where: { id: run.testId },
    });
    if (current.alertRunAt && current.alertRunAt >= run.createdAt) return;
    await tx.hiveTest.update({
      where: { id: run.testId },
      data: { alertRunAt: run.createdAt },
    });
    const healthy = run.status === "passed";
    const old = current.alertState;
    if ((healthy && old === "healthy") || (!healthy && old === "failing"))
      return;
    await tx.hiveTest.update({
      where: { id: run.testId },
      data: { alertState: healthy ? "healthy" : "failing" },
    });
    if (
      run.project.workspace.emailAlerts &&
      (!healthy || run.project.workspace.recoveryAlerts)
    )
      await tx.hiveNotification.upsert({
        where: {
          runId_kind: { runId: id, kind: healthy ? "recovery" : "failure" },
        },
        create: { runId: id, kind: healthy ? "recovery" : "failure" },
        update: {},
      });
  });
}
export async function deliverAlerts() {
  const events = await prisma.hiveNotification.findMany({
    where: { status: "pending", attempts: { lt: 3 } },
    take: 10,
    include: {
      run: {
        include: {
          project: { include: { workspace: { include: { owner: true } } } },
        },
      },
    },
  });
  for (const event of events) {
    const claimed = await prisma.hiveNotification.updateMany({
      where: { id: event.id, status: "pending" },
      data: {
        status: "sending",
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
    if (!claimed.count) continue;
    try {
      await sendMail(
        event.run.project.workspace.owner.email,
        `[BuildHive] ${event.kind === "recovery" ? "Recovered" : "Failed"}: ${event.run.testName}`,
        `${event.run.testName} · ${event.run.environment}\n${event.run.error?.slice(0, 500) || "The workflow is passing again."}\n${event.run.createdAt.toISOString()}\nView report: ${frontend()}/dashboard/projects/${event.run.projectId}/runs/${event.runId}`,
      );
      await prisma.hiveNotification.update({
        where: { id: event.id },
        data: { status: "sent" },
      });
    } catch {
      await prisma.hiveNotification.update({
        where: { id: event.id },
        data: {
          status: event.attempts >= 2 ? "failed" : "pending",
          error: "Email provider rejected delivery or is not configured",
        },
      });
    }
  }
}
