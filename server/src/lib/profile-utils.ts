import { SkillLevel } from "@prisma/client";

export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export function toSkillLevel(value?: string | null): SkillLevel | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  if (SKILL_LEVELS.includes(normalized as (typeof SKILL_LEVELS)[number])) {
    return normalized as SkillLevel;
  }
  return undefined;
}

export function normalizePreferredStack(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeSkills(skills: unknown): string[] | undefined {
  if (!skills) return undefined;

  if (Array.isArray(skills)) {
    const cleaned = skills
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
    return cleaned.length ? cleaned : [];
  }

  if (typeof skills === "string") {
    const cleaned = skills
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return cleaned.length ? cleaned : [];
  }

  return undefined;
}

export function isDeleteConfirmationValid(input?: string | null): boolean {
  return (input || "").trim().toUpperCase() === "DELETE";
}
