-- Migration: 20261019_approval_and_permissions.sql
-- Adds manual approval workflow, per-user tool permissions, and usage limits

ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT,
  ADD COLUMN IF NOT EXISTS "toolPermissions" TEXT,
  ADD COLUMN IF NOT EXISTS "planTier" TEXT NOT NULL DEFAULT 'FREE_TRIAL',
  ADD COLUMN IF NOT EXISTS "usageLimits" TEXT,
  ADD COLUMN IF NOT EXISTS "usageCurrent" TEXT;

-- Create index on status and role for fast admin queries
CREATE INDEX IF NOT EXISTS "idx_user_status_role" ON "User"("status", "role");
