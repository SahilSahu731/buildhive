import { describe, expect, it } from "vitest";
import {
  isDeleteConfirmationValid,
  normalizePreferredStack,
  normalizeSkills,
  toSkillLevel,
} from "./profile-utils.js";

describe("profile-utils", () => {
  it("parses valid skill levels", () => {
    expect(toSkillLevel("beginner")).toBe("BEGINNER");
    expect(toSkillLevel("INTERMEDIATE")).toBe("INTERMEDIATE");
    expect(toSkillLevel(" advanced ")).toBe("ADVANCED");
  });

  it("rejects invalid skill levels", () => {
    expect(toSkillLevel("expert")).toBeUndefined();
    expect(toSkillLevel(undefined)).toBeUndefined();
  });

  it("normalizes preferred stack", () => {
    expect(normalizePreferredStack("  Next.js + Node  ")).toBe("Next.js + Node");
    expect(normalizePreferredStack("   ")).toBeUndefined();
  });

  it("normalizes skills from comma string", () => {
    expect(normalizeSkills("React, TypeScript,  API Design")).toEqual([
      "React",
      "TypeScript",
      "API Design",
    ]);
  });

  it("normalizes skills from array", () => {
    expect(normalizeSkills(["React ", "  ", "Node"])).toEqual(["React", "Node"]);
  });

  it("validates account delete confirmation", () => {
    expect(isDeleteConfirmationValid("DELETE")).toBe(true);
    expect(isDeleteConfirmationValid(" delete ")).toBe(true);
    expect(isDeleteConfirmationValid("REMOVE")).toBe(false);
  });
});
