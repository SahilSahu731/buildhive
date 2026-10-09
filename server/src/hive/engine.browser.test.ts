import { beforeAll, afterAll, describe, it, expect as check } from "vitest";
import { chromium, Browser, Page } from "@playwright/test";
import { executeStep } from "./runner.js";
const browserTests =
  process.env.RUN_BROWSER_TESTS === "1" ? describe : describe.skip;
browserTests("deterministic Chromium interpreter", () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    });
    page = await browser.newPage();
    page.setDefaultTimeout(500);
    await page.route("https://fixture.example/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<html><head><title>BuildHive fixture</title></head><body><h1>Welcome</h1><label>Email<input aria-label="Email"></label><label>Password<input type="password" aria-label="Password"></label><select aria-label="Country"><option value="IN">India</option></select><input type="checkbox" aria-label="Agree"><button onclick="document.querySelector('h1').textContent='Dashboard'">Sign in</button><div hidden id="hidden">Hidden</div></body></html>`,
      }),
    );
    await page.goto("https://fixture.example/login");
  });
  afterAll(async () => {
    await browser?.close();
  });
  it("fills secret references, selects, checks, presses and clicks", async () => {
    const secrets = { TEST_EMAIL: "qa@example.com" };
    await executeStep(
      page,
      { action: "fill", locator: "label=Email", secret: "TEST_EMAIL" },
      "https://fixture.example",
      secrets,
      500,
    );
    check(await page.getByLabel("Email").inputValue()).toBe("qa@example.com");
    await executeStep(
      page,
      { action: "select", locator: "label=Country", value: "IN" },
      "https://fixture.example",
      {},
      500,
    );
    await executeStep(
      page,
      { action: "check", locator: "label=Agree" },
      "https://fixture.example",
      {},
      500,
    );
    await executeStep(
      page,
      { action: "press", locator: "label=Email", value: "Tab" },
      "https://fixture.example",
      {},
      500,
    );
    await executeStep(
      page,
      { action: "click", locator: "role=button|Sign in" },
      "https://fixture.example",
      {},
      500,
    );
  });
  it("passes the supported meaningful assertions against actual DOM state", async () => {
    for (const step of [
      { action: "assertVisible", locator: "role=heading|Dashboard" },
      { action: "assertText", locator: "h1", value: "Dashboard" },
      { action: "assertUrl", value: "/login" },
      { action: "assertTitle", value: "BuildHive fixture" },
      { action: "assertState", locator: "label=Agree", value: "checked" },
      { action: "assertState", locator: "#hidden", value: "hidden" },
      { action: "waitFor", locator: "h1" },
    ])
      await executeStep(
        page,
        step as Parameters<typeof executeStep>[1],
        "https://fixture.example",
        {},
        500,
      );
  });
  it("fails a broken assertion instead of inventing success", async () => {
    await check(
      executeStep(
        page,
        { action: "assertText", locator: "h1", value: "Not the dashboard" },
        "https://fixture.example",
        {},
        200,
      ),
    ).rejects.toThrow();
  });
  it("does not fill a missing secret or leak it to a different origin", async () => {
    await check(
      executeStep(
        page,
        { action: "fill", locator: "label=Email", secret: "MISSING" },
        "https://fixture.example",
        {},
        200,
      ),
    ).rejects.toThrow("Missing secret");
    await check(
      executeStep(
        page,
        { action: "fill", locator: "label=Email", secret: "TEST_EMAIL" },
        "https://different.example",
        { TEST_EMAIL: "secret" },
        200,
      ),
    ).rejects.toThrow("verified origin");
  });
});
