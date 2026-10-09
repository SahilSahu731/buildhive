import { describe, it, expect } from "vitest";
import { definitionSchema, assertTargetPaths } from "./definition.js";
const valid = () =>
  definitionSchema.parse({
    steps: [
      { action: "navigate", value: "/login" },
      { action: "assertVisible", locator: "role=heading|Welcome" },
    ],
  });
describe("approved test definition", () => {
  it("requires an assertion, not just navigation", () => {
    expect(() =>
      definitionSchema.parse({ steps: [{ action: "navigate", value: "/" }] }),
    ).toThrow("assertion");
  });
  it("accepts explicit supported actions and applies bounded defaults", () => {
    const d = valid();
    expect(d.timeout).toBe(60);
    expect(d.viewport).toBe("desktop");
  });
  it("rejects arbitrary code, unknown actions and unexpected properties", () => {
    for (const action of ["evaluate", "execute", "fetch"])
      expect(() =>
        definitionSchema.parse({ steps: [{ action, value: "alert(1)" }] }),
      ).toThrow();
    expect(() =>
      definitionSchema.parse({ ...valid(), script: "alert(1)" }),
    ).toThrow();
  });
  it("rejects external, protocol relative and credential-bearing navigation", () => {
    for (const value of [
      "https://attacker.example/a",
      "//attacker.example",
      "javascript:alert(1)",
      "https://user:password@app.example",
    ]) {
      const d = valid();
      d.steps[0].value = value;
      expect(() => assertTargetPaths(d, "https://app.example")).toThrow();
    }
  });
  it("allows relative paths on the exact verified origin", () =>
    expect(() =>
      assertTargetPaths(valid(), "https://app.example"),
    ).not.toThrow());
  it("bounds steps, step time and total runtime", () => {
    expect(() =>
      definitionSchema.parse({ ...valid(), timeout: 121 }),
    ).toThrow();
    expect(() =>
      definitionSchema.parse({
        ...valid(),
        steps: Array(41).fill({ action: "assertVisible", locator: "h1" }),
      }),
    ).toThrow();
  });
  it("keeps secret references out of unsupported actions", () => {
    expect(() =>
      definitionSchema.parse({
        steps: [
          { action: "click", locator: "button", secret: "PASSWORD" },
          { action: "assertVisible", locator: "h1" },
        ],
      }),
    ).toThrow();
  });
  it("rejects empty assertions and invalid element states", () => {
    expect(() =>
      definitionSchema.parse({
        steps: [{ action: "assertText", locator: "h1", value: " " }],
      }),
    ).toThrow();
    expect(() =>
      definitionSchema.parse({
        steps: [{ action: "assertState", locator: "button", value: "green" }],
      }),
    ).toThrow();
  });
});
