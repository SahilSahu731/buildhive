-- Add missing rich project fields required by current Prisma schema
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "demoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "repoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'Intermediate',
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Web Development';

-- Ensure optional compatibility with schema expectations for techStack array
ALTER TABLE "Project"
  ALTER COLUMN "techStack" SET DEFAULT ARRAY[]::TEXT[];

-- Backfill null arrays to empty arrays before enforcing not-null
UPDATE "Project"
SET "techStack" = ARRAY[]::TEXT[]
WHERE "techStack" IS NULL;

ALTER TABLE "Project"
  ALTER COLUMN "techStack" SET NOT NULL;

-- Indexes for list filters and sorting
CREATE INDEX IF NOT EXISTS "Project_category_idx" ON "Project"("category");
