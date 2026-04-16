import { PrismaClient, SkillLevel } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workflow = await prisma.workflow.upsert({
    where: { slug: "ship-nextjs-saas-mvp" },
    update: {
      title: "Ship a Next.js SaaS MVP",
      isPublished: true,
      tags: ["nextjs", "saas", "mvp", "vibe-coding"],
    },
    create: {
      title: "Ship a Next.js SaaS MVP",
      slug: "ship-nextjs-saas-mvp",
      summary: "End-to-end workflow to ship a production-ready SaaS MVP quickly.",
      category: "Web Development",
      useCase: "Build and launch",
      difficulty: SkillLevel.INTERMEDIATE,
      estimatedMinutes: 180,
      tags: ["nextjs", "saas", "mvp", "vibe-coding"],
      isPublished: true,
    },
  });

  const steps = [
    {
      stepOrder: 1,
      title: "Scaffold the project",
      description: "Create app shell, routing, and shared layout components.",
      promptHint: "Generate an app shell with auth, dashboard, and marketing routes.",
    },
    {
      stepOrder: 2,
      title: "Implement auth and profile",
      description: "Add OTP-based auth and initial onboarding profile fields.",
      promptHint: "Create OTP auth flow and profile onboarding forms.",
    },
    {
      stepOrder: 3,
      title: "Wire billing",
      description: "Connect Razorpay subscription plans and billing status UI.",
      promptHint: "Implement subscription status, checkout, and plan gating.",
    },
  ];

  for (const step of steps) {
    await prisma.workflowStep.upsert({
      where: {
        workflowId_stepOrder: {
          workflowId: workflow.id,
          stepOrder: step.stepOrder,
        },
      },
      update: step,
      create: {
        workflowId: workflow.id,
        ...step,
      },
    });
  }

  const promptPack = await prisma.promptPack.upsert({
    where: { slug: "nextjs-vibe-coding-prompts" },
    update: {
      isPublished: true,
      workflowId: workflow.id,
    },
    create: {
      name: "Next.js Vibe Coding Prompt Pack",
      slug: "nextjs-vibe-coding-prompts",
      description: "Prompt templates for planning, coding, testing, and shipping Next.js projects.",
      targetTool: "Copilot",
      tags: ["nextjs", "prompts", "workflow"],
      isPublished: true,
      workflowId: workflow.id,
    },
  });

  const templates = [
    {
      title: "Feature Planning Prompt",
      description: "Convert feature idea into implementation checklist.",
      content:
        "You are a senior engineer. Break this feature into actionable tasks with acceptance criteria: {feature_description}",
      variables: ["feature_description"],
    },
    {
      title: "Refactor Prompt",
      description: "Refactor while preserving behavior and adding tests.",
      content:
        "Refactor this code for readability and maintainability without changing behavior. Add tests for critical paths: {code_snippet}",
      variables: ["code_snippet"],
    },
  ];

  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: {
        id: `${promptPack.id}-${template.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {
        description: template.description,
        content: template.content,
        variables: template.variables,
      },
      create: {
        id: `${promptPack.id}-${template.title.toLowerCase().replace(/\s+/g, "-")}`,
        promptPackId: promptPack.id,
        title: template.title,
        description: template.description,
        content: template.content,
        variables: template.variables,
      },
    });
  }

  console.log("Seed completed: workflows, steps, prompt packs, and templates are up to date.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
