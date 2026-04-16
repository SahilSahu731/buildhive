import { describe, expect, it } from "vitest";
import {
  calculateUsagePercent,
  normalizeQuotaDate,
  resolvePlanLimit,
} from "./usage-quota.js";

describe("usage-quota", () => {
  it("normalizes date to midnight", () => {
    const date = new Date("2026-04-16T18:42:12.000Z");
    const normalized = normalizeQuotaDate(date);

    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
    expect(normalized.getSeconds()).toBe(0);
  });

  it("calculates usage percent safely", () => {
    expect(calculateUsagePercent(3, 5)).toBe(60);
    expect(calculateUsagePercent(7, 5)).toBe(100);
    expect(calculateUsagePercent(1, 0)).toBe(100);
  });

  it("resolves plan limits", () => {
    expect(resolvePlanLimit("FREE")).toBe(5);
    expect(resolvePlanLimit("PREMIUM")).toBe(50);
    expect(resolvePlanLimit("PRO")).toBe(1000);
    expect(resolvePlanLimit("UNKNOWN")).toBe(5);
  });
});
