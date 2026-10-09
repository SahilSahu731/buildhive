/** Isolated UI QA. Requires a migrated PostgreSQL *_test database and a web app on :3101, with API_INTERNAL_URL=http://127.0.0.1:5100. */
import { createHmac, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import {
  chromium,
  expect,
} from "../server/node_modules/@playwright/test/index.mjs";
if (
  !process.env.TEST_DATABASE_URL ||
  !new URL(process.env.TEST_DATABASE_URL).pathname.includes("test")
)
  throw new Error("Use an isolated TEST_DATABASE_URL");
Object.assign(process.env, {
  DATABASE_URL: process.env.TEST_DATABASE_URL,
  DIRECT_URL: process.env.TEST_DATABASE_URL,
  NODE_ENV: "test",
  FRONTEND_URL: "http://127.0.0.1:3101",
  SESSION_SECRET: "local-ui-fixture-session-secret-at-least-32-characters",
  SECRETS_ENCRYPTION_KEY: "a".repeat(64),
  GEMINI_API_KEY: "",
  RAZORPAY_KEY_ID: "",
  RAZORPAY_KEY_SECRET: "",
  EMAIL_PASS: "",
  SUPABASE_SERVICE_ROLE_KEY: "",
});
const { app } = await import("../server/src/server.ts");
const { default: db } = await import("../server/src/lib/prisma.ts");
const server = app.listen(5100, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const user = await db.user.create({
  data: {
    email: `ui-${randomUUID()}@example.test`,
    name: "Alex Morgan",
    emailVerified: true,
    skills: [],
    role: "admin",
  },
});
const workspace = await db.hiveWorkspace.create({
  data: { ownerId: user.id, name: "Alex’s workspace" },
});
const sid = randomUUID();
const expires = new Date(Date.now() + 3600000);
await db.hiveSession.create({
  data: {
    id: sid,
    userId: user.id,
    expiresAt: expires,
    data: {
      cookie: {
        originalMaxAge: 3600000,
        expires: expires.toISOString(),
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
      passport: { user: user.id },
    },
  },
});
const signed = `s:${sid}.${createHmac("sha256", process.env.SESSION_SECRET).update(sid).digest("base64").replace(/=+$/, "")}`;
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
await context.addCookies([
  {
    name: "buildhive.sid",
    value: encodeURIComponent(signed),
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (response) => { if (response.status() >= 500 && response.url().includes("/api/")) errors.push(`API ${response.status()} ${new URL(response.url()).pathname}`); });
await mkdir("artifacts/qa", { recursive: true });
async function screenshot(name) {
  await page.screenshot({ path: `artifacts/qa/${name}.png`, fullPage: true });
}
try {
  await page.goto("http://127.0.0.1:3101/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex." }),
  ).toBeVisible();
  await screenshot("dashboard-empty");
  await page.getByRole("link", { name: "New project", exact: true }).click();
  await page.getByLabel("Project name", { exact: true }).fill("Acme Dashboard");
  await page
    .getByLabel("Website URL")
    .fill("https://example.com");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Domain verification", exact: true }),
  ).toBeVisible();
  const project = await db.hiveProject.findFirstOrThrow({
    where: { workspaceId: workspace.id },
  });
  await page.getByLabel("Variable name", { exact: true }).fill("TEST_PASSWORD");
  await page.getByLabel("Secret value", { exact: true }).fill("qa-only-secret");
  await page
    .getByRole("button", { name: "Save variable", exact: true })
    .click();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "Variable stored securely.",
  );
  await page.getByRole("link", { name: "Create test", exact: true }).click();
  await page.getByLabel("Test name", { exact: true }).fill("Homepage heading");
  await page
    .getByLabel("Locator", { exact: true })
    .fill("role=heading|Example Domain");
  await page.getByRole("checkbox", { name: /I approve these actions/ }).check();
  await screenshot("test-editor");
  await page.getByRole("button", { name: "Save test", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Homepage heading/ }).first(),
  ).toBeVisible();
  const test = await db.hiveTest.findFirstOrThrow({
    where: { projectId: project.id },
  });
  await expect(
    page.getByRole("button", { name: "Run test", exact: true }),
  ).toBeDisabled();
  // Test fixture setup is database-only; there is no production verification bypass endpoint.
  await db.hiveProject.update({
    where: { id: project.id },
    data: { status: "active", verifiedAt: new Date() },
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Run test", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Run test", exact: true }).click();
  await expect(
    page.getByText("Waiting for an available worker…"),
  ).toBeVisible();
  const run = await db.hiveRun.findFirstOrThrow({ where: { testId: test.id } });
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Run again", exact: true }),
  ).toBeVisible();
  // Populate an explicitly synthetic failed report to inspect every report section.
  await db.hiveRun.update({
    where: { id: run.id },
    data: {
      status: "failed",
      durationMs: 10124,
      error:
        "Expected the page heading to be visible. The locator did not resolve.",
      steps: {
        create: {
          position: 0,
          action: "assertVisible",
          status: "failed",
          durationMs: 10000,
          expected: "role=heading|Example Domain",
          actual: "https://example.com",
          error: "Locator timeout",
        },
      },
      consoleErrors: ["Synthetic QA console evidence"],
      networkErrors: ["401 https://example.com/api/login"],
    },
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Execution timeline" }),
  ).toBeVisible();
  await screenshot("run-report");
  await page.goto(
    `http://127.0.0.1:3101/dashboard/projects/${project.id}/monitoring`,
  );
  await page.getByLabel("Monitoring enabled").check();
  await page.getByLabel("Timezone", { exact: true }).fill("Asia/Kolkata");
  await page.getByRole("button", { name: "Save schedule" }).click();
  await expect(page.locator(".notice[role=alert]")).toContainText("Schedule saved.");
  await page.goto("http://127.0.0.1:3101/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Acme Dashboard" }),
  ).toBeVisible();
  await screenshot("dashboard-populated");
  for (const path of [
    "/dashboard/activity",
    "/dashboard/usage",
    "/dashboard/settings/profile",
    "/dashboard/settings/notifications",
    "/dashboard/settings/security",
    "/dashboard/settings/billing",
    "/dashboard/settings/feedback",
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/admin/jobs",
    "/dashboard/admin/feedback",
  ]) {
    await page.goto(`http://127.0.0.1:3101${path}`);
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByText("Loading your workspace…")).toHaveCount(0);
  }
  await page.goto("http://127.0.0.1:3101/dashboard/settings/profile");
  await page.getByLabel("Display name").fill("Alex Tester");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "Your profile was saved.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3101/dashboard");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Alex." }),
  ).toBeVisible();
  await screenshot("dashboard-mobile");
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Dashboard horizontal overflow");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Workspace navigation" }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:3101/");
  await screenshot("homepage-mobile");
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Homepage horizontal overflow");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:3101/");
  await screenshot("homepage-desktop");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await screenshot("homepage-dark");
  for (const path of [
    "/features",
    "/how-it-works",
    "/pricing",
    "/docs",
    "/faq",
    "/privacy",
    "/terms",
    "/contact",
    "/demo",
    "/login",
  ]) {
    const response = await page.goto(`http://127.0.0.1:3101${path}`);
    expect(response.status()).toBe(200);
  }
  expect(errors).toEqual([]);
  console.log(
    "UI QA passed: project creation, encrypted variables, test editor, verification gate, queue/cancel, reports, schedules, profile, navigation, public pages, dark mode and mobile layouts.",
  );
} finally {
  await browser.close();
  await db.user.delete({ where: { id: user.id } });
  await db.$disconnect();
  await new Promise((resolve) => server.close(resolve));
}
