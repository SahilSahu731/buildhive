import {
  chromium,
  expect,
  Page,
  Locator,
  BrowserContext,
} from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import prisma from "../lib/prisma.js";
import { definitionSchema, assertTargetPaths, Step } from "./definition.js";
import { decrypt, redact, resolvePublic, safeUrl } from "./security.js";
import { effectivePlan, planFor } from "./config.js";
import { uploadArtifact } from "./storage.js";
export function locate(page: Page, input: string): Locator {
  if (input.startsWith("text="))
    return page.getByText(input.slice(5), { exact: true });
  if (input.startsWith("label="))
    return page.getByLabel(input.slice(6), { exact: true });
  if (input.startsWith("testid=")) return page.getByTestId(input.slice(7));
  if (input.startsWith("role=")) {
    const [role, ...name] = input.slice(5).split("|");
    return page.getByRole(
      role as Parameters<Page["getByRole"]>[0],
      name.length ? { name: name.join("|"), exact: true } : {},
    );
  }
  return page.locator(input);
}
export async function executeStep(
  page: Page,
  step: Step,
  base: string,
  secrets: Record<string, string>,
  timeout: number,
) {
  const loc = step.locator ? locate(page, step.locator) : undefined;
  const value = step.secret ? secrets[step.secret] : step.value;
  if (step.secret && !value) throw new Error(`Missing secret ${step.secret}`);
  if (step.secret && new URL(page.url()).origin !== new URL(base).origin)
    throw new Error("Secrets may only be filled on the verified origin");
  switch (step.action) {
    case "navigate":
      await page.goto(new URL(value!, base).href, {
        waitUntil: "domcontentloaded",
      });
      break;
    case "click":
      await loc!.click();
      break;
    case "fill":
      await loc!.fill(value!);
      break;
    case "select":
      await loc!.selectOption(value!);
      break;
    case "check":
      await loc!.check();
      break;
    case "press":
      await loc!.press(value!);
      break;
    case "assertVisible":
      await expect(loc!).toBeVisible({ timeout });
      break;
    case "assertText":
      await expect(loc!).toContainText(value!, { timeout });
      break;
    case "assertUrl":
      await expect(page).toHaveURL((url) => url.href.includes(value!), {
        timeout,
      });
      break;
    case "assertTitle":
      await expect(page).toHaveTitle(
        new RegExp(value!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        { timeout },
      );
      break;
    case "waitFor":
      await loc!.waitFor({ state: "visible", timeout });
      break;
    case "assertState":
      switch (value) {
        case "enabled":
          await expect(loc!).toBeEnabled({ timeout });
          break;
        case "disabled":
          await expect(loc!).toBeDisabled({ timeout });
          break;
        case "checked":
          await expect(loc!).toBeChecked({ timeout });
          break;
        case "unchecked":
          await expect(loc!).not.toBeChecked({ timeout });
          break;
        case "hidden":
          await expect(loc!).toBeHidden({ timeout });
          break;
        case "editable":
          await expect(loc!).toBeEditable({ timeout });
          break;
      }
      break;
  }
}
export async function executeRun(id: string) {
  const run = await prisma.hiveRun.findUnique({
    where: { id },
    include: {
      version: true,
      project: { include: { workspace: true, secrets: true } },
      test: true,
    },
  });
  if (!run || run.status !== "queued") return;
  const claim = await prisma.hiveRun.updateMany({
    where: { id, status: "queued" },
    data: {
      status: "preparing",
      startedAt: new Date(),
      heartbeatAt: new Date(),
      attempt: { increment: 1 },
    },
  });
  if (!claim.count) return;
  const start = Date.now();
  let status = "infrastructure_error";
  let error: string | undefined;
  let context: BrowserContext | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;
  let timedOut = false;
  let heartbeatBusy = false;
  const logs: string[] = [];
  const network: string[] = [];
  const secrets: Record<string, string> = {};
  let secretValues: string[] = [];
  const dir = await mkdtemp(join(tmpdir(), "buildhive-"));
  let canCapture = false;
  let tracing = false;
  const heartbeat = setInterval(async () => {
    if (heartbeatBusy) return;
    heartbeatBusy = true;
    try {
      const current = await prisma.hiveRun.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current || !["preparing", "running"].includes(current.status)) {
        cancelled = true;
        await context?.close();
      } else
        await prisma.hiveRun.update({
          where: { id },
          data: { heartbeatAt: new Date() },
        });
    } catch {
      cancelled = true;
      await context?.close().catch(() => {});
    } finally {
      heartbeatBusy = false;
    }
  }, 2000);
  try {
    if (
      run.project.status !== "active" ||
      run.project.url !== run.targetUrl ||
      run.test.status !== "active" ||
      !run.project.verifiedAt ||
      run.project.workspace.suspended
    )
      throw new Error("Project or test is no longer eligible for execution");
    const d = definitionSchema.parse(run.version.definition);
    assertTargetPaths(d, run.targetUrl);
    await resolvePublic(new URL(run.targetUrl).hostname);
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.RUNNER_EGRESS_PROXY
    )
      throw new Error("Production runner requires an enforcing egress proxy");
    for (const item of run.project.secrets)
      if (d.steps.some((step) => step.secret === item.name))
        secrets[item.name] = decrypt(item.encryptedValue);
    secretValues = Object.values(secrets);
    // Raw browser traces contain DOM/network credentials. Disable all visual artifacts on secret-bearing tests.
    canCapture = !d.steps.some((s) => s.secret);
    browser = await chromium.launch({
      headless: true,
      channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      env: { PATH: process.env.PATH || "/usr/bin:/bin", LANG: "C.UTF-8" },
      chromiumSandbox: process.env.NODE_ENV === "production",
      proxy: process.env.RUNNER_EGRESS_PROXY
        ? { server: process.env.RUNNER_EGRESS_PROXY, bypass: "<-loopback>" }
        : undefined,
      args: [
        "--disable-quic",
        "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
      ],
    });
    context = await browser.newContext({
      viewport:
        d.viewport === "mobile"
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
      serviceWorkers: "block",
      acceptDownloads: false,
      permissions: [],
      ignoreHTTPSErrors: false,
    });
    context.setDefaultTimeout(d.stepTimeout * 1000);
    context.setDefaultNavigationTimeout(d.stepTimeout * 1000);
    const origin = new URL(run.targetUrl).origin;
    await context.route("**/*", async (route) => {
      try {
        const u = new URL(route.request().url());
        if (
          u.protocol !== "https:" ||
          (u.port && u.port !== "443") ||
          u.username ||
          u.password
        )
          throw new Error("Blocked network destination");
        await resolvePublic(u.hostname);
        if (route.request().isNavigationRequest() && u.origin !== origin)
          throw new Error("Cross-origin navigation blocked");
        if (secretValues.length && u.origin !== origin)
          throw new Error(
            "Secret-bearing tests restrict all requests to the verified origin",
          );
        await route.continue();
      } catch {
        await route.abort("blockedbyclient").catch(() => {});
      }
    });
    await context.routeWebSocket("**/*", (ws) => ws.close());
    if (canCapture) {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: false,
      });
      tracing = true;
    }
    const page = await context.newPage();
    context.on("page", (popup) => {
      if (popup !== page) void popup.close();
    });
    page.on("console", (msg) => {
      if (msg.type() === "error" && logs.length < 30)
        logs.push(redact(msg.text(), secretValues));
    });
    page.on("pageerror", (e) => {
      if (logs.length < 30) logs.push(redact(e.message, secretValues));
    });
    page.on("requestfailed", (req) => {
      if (network.length < 30)
        network.push(`${req.method()} ${redact(safeUrl(req.url()), secretValues)} • request failed`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400 && network.length < 30)
        network.push(`${res.status()} ${redact(safeUrl(res.url()), secretValues)}`);
    });
    timer = setTimeout(() => {
      timedOut = true;
      void context?.close();
    }, d.timeout * 1000);
    const started = await prisma.hiveRun.updateMany({
      where: { id, status: "preparing" },
      data: { status: "running" },
    });
    if (!started.count) {
      cancelled = true;
      throw new Error("Run was cancelled before execution");
    }
    status = "failed";
    await page.goto(new URL(d.startPath, run.targetUrl).href, {
      waitUntil: "domcontentloaded",
    });
    let failed = false;
    for (const [position, step] of d.steps.entries()) {
      if (failed) {
        await prisma.hiveRunStep.create({
          data: { runId: id, position, action: step.action, status: "skipped" },
        });
        continue;
      }
      const stepStart = Date.now();
      let stepError: string | undefined;
      try {
        await executeStep(
          page,
          step,
          run.targetUrl,
          secrets,
          d.stepTimeout * 1000,
        );
      } catch (e) {
        failed = true;
        stepError = redact(
          e instanceof Error ? e.message : "Step failed",
          secretValues,
        );
        error = stepError;
      }
      await prisma.hiveRunStep.create({
        data: {
          runId: id,
          position,
          action: step.action,
          status: stepError ? "failed" : "passed",
          durationMs: Date.now() - stepStart,
          expected: step.secret
            ? `Secret reference: ${step.secret}`
            : redact(step.value || step.locator || "", secretValues),
          actual: redact(safeUrl(page.url()), secretValues),
          error: stepError,
        },
      });
      if ((stepError || position === d.steps.length - 1) && canCapture && !page.isClosed())
        try {
          const filename = stepError ? "failure.png" : "result.png";
          const file = join(dir, filename);
          await page.screenshot({
            path: file,
            fullPage: false,
            mask: [page.locator("input,textarea,[contenteditable]")],
          });
          const path = `${run.project.workspaceId}/${id}/${filename}`;
          const size = await uploadArtifact(path, file, "image/png");
          await prisma.hiveArtifact.create({
            data: {
              runId: id,
              kind: "screenshot",
              path,
              size,
              expiresAt: new Date(
                Date.now() +
                  planFor(effectivePlan(run.project.workspace)).retention *
                    86400000,
              ),
            },
          });
        } catch {
          logs.push(
            "Screenshot could not be stored. Check artifact storage configuration.",
          );
        }
    }
    status = failed ? "failed" : "passed";
  } catch (e) {
    error = redact(
      e instanceof Error ? e.message : "Execution infrastructure failed",
      secretValues,
    );
  } finally {
    clearInterval(heartbeat);
    if (timer) clearTimeout(timer);
    if (tracing && context)
      try {
        const file = join(dir, "trace.zip");
        await context.tracing.stop({ path: file });
        const path = `${run.project.workspaceId}/${id}/trace.zip`;
        const size = await uploadArtifact(path, file, "application/zip");
        await prisma.hiveArtifact.create({
          data: {
            runId: id,
            kind: "trace",
            path,
            size,
            expiresAt: new Date(
              Date.now() +
                planFor(effectivePlan(run.project.workspace)).retention *
                  86400000,
            ),
          },
        });
      } catch {
        logs.push("Trace unavailable.");
      }
    await browser?.close().catch(() => {});
    await rm(dir, { recursive: true, force: true });
    if (cancelled) status = "cancelled";
    else if (timedOut) status = "timed_out";
    const durationMs = Date.now() - start;
    await prisma.hiveRun.updateMany({
      where: { id, status: { in: ["preparing", "running"] } },
      data: {
        status,
        error,
        finishedAt: new Date(),
        durationMs,
        consoleErrors: logs,
        networkErrors: network,
      },
    });
    await prisma.hiveUsage.upsert({
      where: { reference: `duration-${id}` },
      create: {
        workspaceId: run.project.workspaceId,
        kind: "browser_ms",
        units: durationMs,
        reference: `duration-${id}`,
      },
      update: { units: durationMs },
    });
  }
}
