-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "skillLevel" "SkillLevel",
  ADD COLUMN "goal" TEXT,
  ADD COLUMN "preferredStack" TEXT,
  ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Workflow" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "useCase" TEXT NOT NULL,
  "difficulty" "SkillLevel" NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Workflow_slug_key" ON "Workflow"("slug");
CREATE INDEX "Workflow_category_idx" ON "Workflow"("category");
CREATE INDEX "Workflow_difficulty_idx" ON "Workflow"("difficulty");
CREATE INDEX "Workflow_isPublished_idx" ON "Workflow"("isPublished");

-- CreateTable
CREATE TABLE "WorkflowStep" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "stepOrder" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "promptHint" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkflowStep_workflowId_stepOrder_key" ON "WorkflowStep"("workflowId", "stepOrder");
CREATE INDEX "WorkflowStep_workflowId_idx" ON "WorkflowStep"("workflowId");

-- CreateTable
CREATE TABLE "PromptPack" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "targetTool" TEXT NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "workflowId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromptPack_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromptPack_slug_key" ON "PromptPack"("slug");
CREATE INDEX "PromptPack_targetTool_idx" ON "PromptPack"("targetTool");
CREATE INDEX "PromptPack_isPublished_idx" ON "PromptPack"("isPublished");

-- CreateTable
CREATE TABLE "PromptTemplate" (
  "id" TEXT NOT NULL,
  "promptPackId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT NOT NULL,
  "variables" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromptTemplate_promptPackId_idx" ON "PromptTemplate"("promptPackId");

-- CreateTable
CREATE TABLE "Roadmap" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workflowId" TEXT,
  "title" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Roadmap_userId_idx" ON "Roadmap"("userId");
CREATE INDEX "Roadmap_isActive_idx" ON "Roadmap"("isActive");

-- CreateTable
CREATE TABLE "RoadmapWeek" (
  "id" TEXT NOT NULL,
  "roadmapId" TEXT NOT NULL,
  "weekNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapWeek_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoadmapWeek_roadmapId_weekNumber_key" ON "RoadmapWeek"("roadmapId", "weekNumber");
CREATE INDEX "RoadmapWeek_roadmapId_idx" ON "RoadmapWeek"("roadmapId");

-- CreateTable
CREATE TABLE "RoadmapTask" (
  "id" TEXT NOT NULL,
  "roadmapWeekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RoadmapTask_roadmapWeekId_idx" ON "RoadmapTask"("roadmapWeekId");
CREATE INDEX "RoadmapTask_isCompleted_idx" ON "RoadmapTask"("isCompleted");

-- CreateTable
CREATE TABLE "ProgressEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "workflowId" TEXT,
  "promptPackId" TEXT,
  "roadmapId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProgressEvent_userId_idx" ON "ProgressEvent"("userId");
CREATE INDEX "ProgressEvent_eventType_idx" ON "ProgressEvent"("eventType");
CREATE INDEX "ProgressEvent_createdAt_idx" ON "ProgressEvent"("createdAt");

-- CreateTable
CREATE TABLE "UsageQuota" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "quotaDate" TIMESTAMP(3) NOT NULL,
  "actionType" TEXT NOT NULL,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "limitCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsageQuota_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UsageQuota_userId_quotaDate_actionType_key" ON "UsageQuota"("userId", "quotaDate", "actionType");
CREATE INDEX "UsageQuota_userId_idx" ON "UsageQuota"("userId");
CREATE INDEX "UsageQuota_quotaDate_idx" ON "UsageQuota"("quotaDate");

-- AddForeignKey
ALTER TABLE "WorkflowStep"
  ADD CONSTRAINT "WorkflowStep_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptPack"
  ADD CONSTRAINT "PromptPack_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PromptTemplate"
  ADD CONSTRAINT "PromptTemplate_promptPackId_fkey"
  FOREIGN KEY ("promptPackId") REFERENCES "PromptPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Roadmap"
  ADD CONSTRAINT "Roadmap_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Roadmap"
  ADD CONSTRAINT "Roadmap_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RoadmapWeek"
  ADD CONSTRAINT "RoadmapWeek_roadmapId_fkey"
  FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoadmapTask"
  ADD CONSTRAINT "RoadmapTask_roadmapWeekId_fkey"
  FOREIGN KEY ("roadmapWeekId") REFERENCES "RoadmapWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgressEvent"
  ADD CONSTRAINT "ProgressEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgressEvent"
  ADD CONSTRAINT "ProgressEvent_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProgressEvent"
  ADD CONSTRAINT "ProgressEvent_promptPackId_fkey"
  FOREIGN KEY ("promptPackId") REFERENCES "PromptPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProgressEvent"
  ADD CONSTRAINT "ProgressEvent_roadmapId_fkey"
  FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UsageQuota"
  ADD CONSTRAINT "UsageQuota_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
