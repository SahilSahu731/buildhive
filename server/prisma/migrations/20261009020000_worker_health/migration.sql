CREATE TABLE "HiveServiceHealth" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB NOT NULL,
  CONSTRAINT "HiveServiceHealth_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HiveServiceHealth_kind_lastSeenAt_idx" ON "HiveServiceHealth"("kind", "lastSeenAt");
ALTER TABLE "HiveServiceHealth" ENABLE ROW LEVEL SECURITY;
