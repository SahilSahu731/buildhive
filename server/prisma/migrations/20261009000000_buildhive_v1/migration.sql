-- CreateTable
CREATE TABLE "HiveSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveWorkspace" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My workspace',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "recoveryAlerts" BOOLEAN NOT NULL DEFAULT true,
    "customerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "periodEnd" TIMESTAMP(3),
    "billingEventAt" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveProject" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "status" TEXT NOT NULL DEFAULT 'unverified',
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verificationExpiresAt" TIMESTAMP(3) NOT NULL,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiveProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveTest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[],
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "deploymentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alertState" TEXT NOT NULL DEFAULT 'healthy',
    "alertRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiveTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveTestVersion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveTestVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveSecret" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiveSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "trigger" TEXT NOT NULL DEFAULT 'manual',
    "deploymentId" TEXT,
    "retryOf" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "targetUrl" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "heartbeatAt" TIMESTAMP(3),
    "alertProcessedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "error" TEXT,
    "consoleErrors" JSONB NOT NULL DEFAULT '[]',
    "networkErrors" JSONB NOT NULL DEFAULT '[]',
    "explanation" JSONB,

    CONSTRAINT "HiveRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveRunStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "expected" TEXT,
    "actual" TEXT,
    "error" TEXT,

    CONSTRAINT "HiveRunStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveArtifact" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiveArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveSchedule" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "hour" INTEGER NOT NULL DEFAULT 9,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastError" TEXT,

    CONSTRAINT "HiveSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveUsage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveNotification" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveDeployment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveBillingEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveBillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiveAudit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiveAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HiveSession_expiresAt_idx" ON "HiveSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiveWorkspace_ownerId_key" ON "HiveWorkspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "HiveWorkspace_customerId_key" ON "HiveWorkspace"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "HiveWorkspace_subscriptionId_key" ON "HiveWorkspace"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "HiveProject_verificationToken_key" ON "HiveProject"("verificationToken");

-- CreateIndex
CREATE INDEX "HiveProject_workspaceId_createdAt_idx" ON "HiveProject"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "HiveTest_projectId_status_idx" ON "HiveTest"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HiveTestVersion_testId_number_key" ON "HiveTestVersion"("testId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "HiveSecret_projectId_name_key" ON "HiveSecret"("projectId", "name");

-- CreateIndex
CREATE INDEX "HiveRun_projectId_createdAt_idx" ON "HiveRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "HiveRun_testId_status_createdAt_idx" ON "HiveRun"("testId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "HiveRun_status_heartbeatAt_idx" ON "HiveRun"("status", "heartbeatAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiveRunStep_runId_position_key" ON "HiveRunStep"("runId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "HiveArtifact_path_key" ON "HiveArtifact"("path");

-- CreateIndex
CREATE INDEX "HiveArtifact_expiresAt_idx" ON "HiveArtifact"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiveSchedule_testId_key" ON "HiveSchedule"("testId");

-- CreateIndex
CREATE INDEX "HiveSchedule_enabled_nextRunAt_idx" ON "HiveSchedule"("enabled", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiveUsage_reference_key" ON "HiveUsage"("reference");

-- CreateIndex
CREATE INDEX "HiveUsage_workspaceId_kind_createdAt_idx" ON "HiveUsage"("workspaceId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "HiveNotification_status_createdAt_idx" ON "HiveNotification"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiveNotification_runId_kind_key" ON "HiveNotification"("runId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "HiveDeployment_projectId_eventId_key" ON "HiveDeployment"("projectId", "eventId");

-- CreateIndex
CREATE INDEX "HiveAudit_workspaceId_createdAt_idx" ON "HiveAudit"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "HiveSession" ADD CONSTRAINT "HiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveWorkspace" ADD CONSTRAINT "HiveWorkspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveProject" ADD CONSTRAINT "HiveProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "HiveWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveTest" ADD CONSTRAINT "HiveTest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "HiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveTestVersion" ADD CONSTRAINT "HiveTestVersion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "HiveTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveSecret" ADD CONSTRAINT "HiveSecret_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "HiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveRun" ADD CONSTRAINT "HiveRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "HiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveRun" ADD CONSTRAINT "HiveRun_testId_fkey" FOREIGN KEY ("testId") REFERENCES "HiveTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveRun" ADD CONSTRAINT "HiveRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "HiveTestVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveRunStep" ADD CONSTRAINT "HiveRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "HiveRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveArtifact" ADD CONSTRAINT "HiveArtifact_runId_fkey" FOREIGN KEY ("runId") REFERENCES "HiveRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveSchedule" ADD CONSTRAINT "HiveSchedule_testId_fkey" FOREIGN KEY ("testId") REFERENCES "HiveTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveUsage" ADD CONSTRAINT "HiveUsage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "HiveWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveNotification" ADD CONSTRAINT "HiveNotification_runId_fkey" FOREIGN KEY ("runId") REFERENCES "HiveRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveDeployment" ADD CONSTRAINT "HiveDeployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "HiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiveAudit" ADD CONSTRAINT "HiveAudit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "HiveWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

