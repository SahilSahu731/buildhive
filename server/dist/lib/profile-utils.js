export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
export function toSkillLevel(value) {
    if (!value)
        return undefined;
    const normalized = value.trim().toUpperCase();
    if (SKILL_LEVELS.includes(normalized)) {
        return normalized;
    }
    return undefined;
}
export function normalizePreferredStack(value) {
    if (!value)
        return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
}
export function normalizeSkills(skills) {
    if (!skills)
        return undefined;
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
export function isDeleteConfirmationValid(input) {
    return (input || "").trim().toUpperCase() === "DELETE";
}
