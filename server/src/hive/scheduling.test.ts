import { describe, it, expect } from "vitest";
import { nextSchedule } from "./scheduling.js";
import { effectivePlan, planFor } from "./config.js";
describe("schedules and entitlements", () => {
  it("uses the configured local timezone", () => {
    expect(
      nextSchedule(
        "daily",
        9,
        "Asia/Kolkata",
        new Date("2026-10-09T00:00:00Z"),
      ).toISOString(),
    ).toBe("2026-10-09T03:30:00.000Z");
  });
  it("advances after a missed scheduled time instead of replaying a backlog", () => {
    expect(
      nextSchedule(
        "daily",
        9,
        "UTC",
        new Date("2026-10-09T10:00:00Z"),
      ).toISOString(),
    ).toBe("2026-10-10T09:00:00.000Z");
  });
  it("handles a DST boundary", () => {
    const now = new Date("2026-11-01T05:30:00Z");
    expect(
      nextSchedule("daily", 9, "America/New_York", now).toISOString(),
    ).toBe("2026-11-01T14:00:00.000Z");
  });
  it("falls back to free when access expires or payment fails", () => {
    expect(
      effectivePlan({
        plan: "GROWTH",
        periodEnd: new Date(0),
        subscriptionStatus: "active",
      }),
    ).toBe("FREE");
    expect(
      effectivePlan({
        plan: "GROWTH",
        periodEnd: new Date(Date.now() + 100000),
        subscriptionStatus: "halted",
      }),
    ).toBe("FREE");
  });
  it("preserves paid access through a cancelled prepaid period", () =>
    expect(
      effectivePlan({
        plan: "STARTER",
        periodEnd: new Date(Date.now() + 100000),
        subscriptionStatus: "cancelled",
      }),
    ).toBe("STARTER"));
  it("limits free runs and monitoring independently of UI", () => {
    expect(planFor("FREE").runs).toBe(20);
    expect(planFor("FREE").frequencies).toEqual(["daily"]);
  });
});
