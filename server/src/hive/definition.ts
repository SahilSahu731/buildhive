import { HttpError } from "./errors.js";
import { z } from "zod";
export const actions = [
  "navigate",
  "click",
  "fill",
  "select",
  "check",
  "press",
  "assertVisible",
  "assertText",
  "assertUrl",
  "assertState",
  "assertTitle",
  "waitFor",
] as const;
export const stepSchema = z
  .object({
    action: z.enum(actions),
    locator: z.string().max(500).optional(),
    value: z.string().max(2000).optional(),
    label: z.string().max(150).optional(),
    secret: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]{1,63}$/)
      .optional(),
  })
  .strict()
  .superRefine((step, ctx) => {
    if (
      !["navigate", "assertUrl", "assertTitle"].includes(step.action) &&
      !step.locator?.trim()
    )
      ctx.addIssue({
        code: "custom",
        message: "A locator is required",
        path: ["locator"],
      });
    if (
      [
        "navigate",
        "fill",
        "select",
        "press",
        "assertText",
        "assertUrl",
        "assertTitle",
        "assertState",
      ].includes(step.action) &&
      !step.value?.trim() &&
      !step.secret
    )
      ctx.addIssue({
        code: "custom",
        message: "An expected value or input is required",
        path: ["value"],
      });
    if (step.secret && step.action !== "fill")
      ctx.addIssue({
        code: "custom",
        message: "Secrets may only be used in fill steps",
        path: ["secret"],
      });
    if (step.secret && step.value)
      ctx.addIssue({
        code: "custom",
        message: "Use a secret reference or a literal, not both",
        path: ["value"],
      });
    if (
      step.action === "assertState" &&
      ![
        "enabled",
        "disabled",
        "checked",
        "unchecked",
        "hidden",
        "editable",
      ].includes(step.value || "")
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid element state",
        path: ["value"],
      });
    if (step.locator && /^(xpath=|\/\/|javascript:)/i.test(step.locator))
      ctx.addIssue({
        code: "custom",
        message: "Use CSS, role=, text=, label= or testid= locators",
        path: ["locator"],
      });
  });
export const definitionSchema = z
  .object({
    startPath: z.string().min(1).max(2000).default("/"),
    viewport: z.enum(["desktop", "mobile"]).default("desktop"),
    timeout: z.number().int().min(5).max(120).default(60),
    stepTimeout: z.number().int().min(1).max(30).default(10),
    steps: z.array(stepSchema).min(1).max(40),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (!d.steps.some((s) => s.action.startsWith("assert")))
      ctx.addIssue({
        code: "custom",
        message: "Include at least one meaningful assertion",
        path: ["steps"],
      });
  });
export type Definition = z.infer<typeof definitionSchema>;
export type Step = z.infer<typeof stepSchema>;
export function assertTargetPaths(d: Definition, base: string) {
  for (const path of [
    d.startPath,
    ...d.steps.filter((s) => s.action === "navigate").map((s) => s.value!),
  ]) {
    const url = new URL(path, base);
    if (
      url.origin !== new URL(base).origin ||
      url.username ||
      url.password ||
      url.protocol !== "https:"
    )
      throw new HttpError(
        422,
        "Navigation must stay on the verified HTTPS origin",
      );
  }
}
export const testSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().max(1000).default(""),
    status: z.enum(["draft", "active", "paused"]).default("active"),
    tags: z.array(z.string().max(30)).max(10).default([]),
    deploymentEnabled: z.boolean().default(false),
    definition: definitionSchema,
    expectedVersion: z.number().int().optional(),
  })
  .strict();
