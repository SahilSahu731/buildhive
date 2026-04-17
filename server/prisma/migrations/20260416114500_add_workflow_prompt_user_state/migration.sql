-- AlterTable
ALTER TABLE "PromptTemplate"
  ADD COLUMN IF NOT EXISTS "goodExample" TEXT,
  ADD COLUMN IF NOT EXISTS "badExample" TEXT;

-- CreateTable
CREATE TABLE "WorkflowBookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkflowBookmark_userId_workflowId_key" ON "WorkflowBookmark"("userId", "workflowId");
CREATE INDEX "WorkflowBookmark_userId_idx" ON "WorkflowBookmark"("userId");
CREATE INDEX "WorkflowBookmark_workflowId_idx" ON "WorkflowBookmark"("workflowId");

-- CreateTable
CREATE TABLE "WorkflowStepProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "stepId" TEXT NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkflowStepProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkflowStepProgress_userId_stepId_key" ON "WorkflowStepProgress"("userId", "stepId");
CREATE INDEX "WorkflowStepProgress_userId_workflowId_idx" ON "WorkflowStepProgress"("userId", "workflowId");
CREATE INDEX "WorkflowStepProgress_stepId_idx" ON "WorkflowStepProgress"("stepId");

-- CreateTable
CREATE TABLE "PromptTemplateFavorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "promptTemplateId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromptTemplateFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromptTemplateFavorite_userId_promptTemplateId_key" ON "PromptTemplateFavorite"("userId", "promptTemplateId");
CREATE INDEX "PromptTemplateFavorite_userId_idx" ON "PromptTemplateFavorite"("userId");
CREATE INDEX "PromptTemplateFavorite_promptTemplateId_idx" ON "PromptTemplateFavorite"("promptTemplateId");

-- CreateTable
CREATE TABLE "PromptTemplateUsage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "promptTemplateId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromptTemplateUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromptTemplateUsage_userId_idx" ON "PromptTemplateUsage"("userId");
CREATE INDEX "PromptTemplateUsage_promptTemplateId_idx" ON "PromptTemplateUsage"("promptTemplateId");
CREATE INDEX "PromptTemplateUsage_actionType_idx" ON "PromptTemplateUsage"("actionType");

-- AddForeignKey
ALTER TABLE "WorkflowBookmark"
  ADD CONSTRAINT "WorkflowBookmark_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowBookmark"
  ADD CONSTRAINT "WorkflowBookmark_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowStepProgress"
  ADD CONSTRAINT "WorkflowStepProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowStepProgress"
  ADD CONSTRAINT "WorkflowStepProgress_workflowId_fkey"
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowStepProgress"
  ADD CONSTRAINT "WorkflowStepProgress_stepId_fkey"
  FOREIGN KEY ("stepId") REFERENCES "WorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptTemplateFavorite"
  ADD CONSTRAINT "PromptTemplateFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptTemplateFavorite"
  ADD CONSTRAINT "PromptTemplateFavorite_promptTemplateId_fkey"
  FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptTemplateUsage"
  ADD CONSTRAINT "PromptTemplateUsage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptTemplateUsage"
  ADD CONSTRAINT "PromptTemplateUsage_promptTemplateId_fkey"
  FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
