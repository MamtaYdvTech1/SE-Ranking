-- ==============================================================================
-- Migration: 20261021_enable_rls_and_protect_sensitive_columns.sql
-- Resolves Supabase Security Advisor issues:
--   1. rls_disabled_in_public (Enables RLS on all 49 public tables + 37 seranking tables)
--   2. sensitive_columns_exposed (Revokes public/anon access to credentials, tokens, hashes)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: ENABLE ROW LEVEL SECURITY (RLS) ON ALL 49 PUBLIC SCHEMA TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS "public"."AiGeneration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."AnalyticsSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."AuthSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContactRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ContentCalendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Draft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."EmailVerificationOTP" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."IdempotencyRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."MonitorKeyword" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."OAuthState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PostMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PricingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ProviderCapabilitySnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PublishingAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."PublishingQueue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SavedReply" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ScheduledPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialAction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialAnalytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialEngagementSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialMonitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialPostTarget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SocialToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."SyncJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."TeamInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."WebhookEvent" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PART 2: ENABLE ROW LEVEL SECURITY (RLS) ON ALL 37 SERANKING SCHEMA TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS "seranking"."ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."AiSearchRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Analysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."AnalysisEngine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ApiUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."AuditIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."AuditPage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Backlink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Citation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Competitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."CompetitorRanking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ContentBrief" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."GbpPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."GoogleAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."JobLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Keyword" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."NotificationPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."OnpageIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."OnpagePage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProjectCompetitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProjectDomain" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProjectGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProjectIntegration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProjectMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Prompt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."ProviderConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."RankingHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."SearchEngineConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."SocialBrand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."SocialPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "seranking"."UserRole" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PART 3: REVOKE DIRECT ANON ACCESS TO SENSITIVE CREDENTIAL & TOKEN TABLES
-- ------------------------------------------------------------------------------

-- Prevent anonymous or unprivileged API calls from accessing sensitive auth tokens & secrets
REVOKE ALL ON TABLE "public"."AuthSession" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."PasswordResetToken" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."EmailVerificationOTP" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."SocialToken" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."OAuthState" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."IdempotencyRecord" FROM anon, authenticated;
REVOKE ALL ON TABLE "public"."SyncJob" FROM anon, authenticated;

REVOKE ALL ON TABLE "seranking"."Session" FROM anon, authenticated;
REVOKE ALL ON TABLE "seranking"."GoogleAccount" FROM anon, authenticated;
REVOKE ALL ON TABLE "seranking"."Invitation" FROM anon;

-- Protect sensitive columns in User tables: Never allow SELECT on passwordHash via PostgREST
REVOKE SELECT ("passwordHash") ON "public"."User" FROM anon, authenticated;
REVOKE SELECT ("passwordHash") ON "seranking"."User" FROM anon, authenticated;

-- Ensure service_role and postgres retain full programmatic access for server-side Prisma operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA seranking TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA seranking TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- PART 4: LEAST-PRIVILEGE RLS POLICIES FOR PUBLIC SCHEMA
-- ------------------------------------------------------------------------------

-- Public Informational Tables (Read-only for all, write restricted to service_role)
DROP POLICY IF EXISTS "public_read_blogs" ON "public"."BlogPost";
CREATE POLICY "public_read_blogs" ON "public"."BlogPost"
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_categories" ON "public"."Category";
CREATE POLICY "public_read_categories" ON "public"."Category"
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_pricing" ON "public"."PricingPlan";
CREATE POLICY "public_read_pricing" ON "public"."PricingPlan"
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_tags" ON "public"."Tag";
CREATE POLICY "public_read_tags" ON "public"."Tag"
  FOR SELECT TO anon, authenticated USING (true);

-- User Profiles: Authenticated users can only read their own profile; cannot alter role/status
DROP POLICY IF EXISTS "user_select_own" ON "public"."User";
CREATE POLICY "user_select_own" ON "public"."User"
  FOR SELECT TO authenticated
  USING ("id" = auth.uid()::text);

-- Feedback & Contact Requests: Anyone can submit feedback/contact, but cannot read others' feedback
DROP POLICY IF EXISTS "public_submit_feedback" ON "public"."Feedback";
CREATE POLICY "public_submit_feedback" ON "public"."Feedback"
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_submit_contact" ON "public"."ContactRequest";
CREATE POLICY "public_submit_contact" ON "public"."ContactRequest"
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- PART 5: LEAST-PRIVILEGE RLS POLICIES FOR SERANKING SCHEMA
-- ------------------------------------------------------------------------------

-- seranking.User: Users can only view their own user record
DROP POLICY IF EXISTS "seranking_user_select_own" ON "seranking"."User";
CREATE POLICY "seranking_user_select_own" ON "seranking"."User"
  FOR SELECT TO authenticated
  USING (
    "id" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM "seranking"."User" u 
      WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- seranking.Project: Admins see all; SEO Users and Clients see only owned/assigned projects
DROP POLICY IF EXISTS "seranking_project_select" ON "seranking"."Project";
CREATE POLICY "seranking_project_select" ON "seranking"."Project"
  FOR SELECT TO authenticated
  USING (
    "userId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM "seranking"."ProjectMember" pm 
      WHERE pm."projectId" = "Project"."id" AND pm."userId" = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM "seranking"."User" u 
      WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- seranking.Keyword: Isolated to projects the user is authorized to access
DROP POLICY IF EXISTS "seranking_keyword_select" ON "seranking"."Keyword";
CREATE POLICY "seranking_keyword_select" ON "seranking"."Keyword"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."Project" p
      WHERE p."id" = "Keyword"."projectId"
      AND (
        p."userId" = auth.uid()::text
        OR EXISTS (SELECT 1 FROM "seranking"."ProjectMember" pm WHERE pm."projectId" = p."id" AND pm."userId" = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM "seranking"."User" u WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN'))
      )
    )
  );

-- seranking.AuditPage & AuditIssue: Isolated to authorized project members
DROP POLICY IF EXISTS "seranking_auditpage_select" ON "seranking"."AuditPage";
CREATE POLICY "seranking_auditpage_select" ON "seranking"."AuditPage"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."Project" p
      WHERE p."id" = "AuditPage"."projectId"
      AND (
        p."userId" = auth.uid()::text
        OR EXISTS (SELECT 1 FROM "seranking"."ProjectMember" pm WHERE pm."projectId" = p."id" AND pm."userId" = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM "seranking"."User" u WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN'))
      )
    )
  );

DROP POLICY IF EXISTS "seranking_auditissue_select" ON "seranking"."AuditIssue";
CREATE POLICY "seranking_auditissue_select" ON "seranking"."AuditIssue"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."Project" p
      WHERE p."id" = "AuditIssue"."projectId"
      AND (
        p."userId" = auth.uid()::text
        OR EXISTS (SELECT 1 FROM "seranking"."ProjectMember" pm WHERE pm."projectId" = p."id" AND pm."userId" = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM "seranking"."User" u WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN'))
      )
    )
  );

-- seranking.Backlink: Isolated to authorized project members
DROP POLICY IF EXISTS "seranking_backlink_select" ON "seranking"."Backlink";
CREATE POLICY "seranking_backlink_select" ON "seranking"."Backlink"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."Project" p
      WHERE p."id" = "Backlink"."projectId"
      AND (
        p."userId" = auth.uid()::text
        OR EXISTS (SELECT 1 FROM "seranking"."ProjectMember" pm WHERE pm."projectId" = p."id" AND pm."userId" = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM "seranking"."User" u WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN'))
      )
    )
  );

-- seranking.Report: Isolated to authorized project members
DROP POLICY IF EXISTS "seranking_report_select" ON "seranking"."Report";
CREATE POLICY "seranking_report_select" ON "seranking"."Report"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."Project" p
      WHERE p."id" = "Report"."projectId"
      AND (
        p."userId" = auth.uid()::text
        OR EXISTS (SELECT 1 FROM "seranking"."ProjectMember" pm WHERE pm."projectId" = p."id" AND pm."userId" = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM "seranking"."User" u WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN'))
      )
    )
  );

-- seranking.AuditLog: Accessible only by Administrators
DROP POLICY IF EXISTS "seranking_auditlog_admin" ON "seranking"."AuditLog";
CREATE POLICY "seranking_auditlog_admin" ON "seranking"."AuditLog"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."User" u 
      WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- seranking.SystemSetting & ProviderConfig: Accessible only by Administrators
DROP POLICY IF EXISTS "seranking_settings_admin" ON "seranking"."SystemSetting";
CREATE POLICY "seranking_settings_admin" ON "seranking"."SystemSetting"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."User" u 
      WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN')
    )
  );

DROP POLICY IF EXISTS "seranking_providers_admin" ON "seranking"."ProviderConfig";
CREATE POLICY "seranking_providers_admin" ON "seranking"."ProviderConfig"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "seranking"."User" u 
      WHERE u."id" = auth.uid()::text AND u."role" IN ('ADMIN', 'SUPERADMIN')
    )
  );
