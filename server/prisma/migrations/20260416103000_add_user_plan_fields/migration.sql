-- Ensure Plan enum exists before adding plan column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Plan') THEN
    CREATE TYPE "Plan" AS ENUM ('FREE', 'PREMIUM', 'PRO');
  END IF;
END $$;

-- Add missing subscription columns expected by Prisma schema
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "plan" "Plan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "razorpayCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "razorpaySubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
