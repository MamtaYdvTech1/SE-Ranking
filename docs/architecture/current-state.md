# SE Ranking Enterprise Platform — Current-State Architecture Assessment

**Repository:** `MamtaYdvTech1/SE-Ranking`  
**Current Branch:** `feat/enterprise-admin-rbac` (branched from `origin/main` at `a870261`)  
**Deployment Target:** Next.js 16 (App Router) on Vercel + Supabase Managed PostgreSQL + Redis/BullMQ  
**Assessment Date:** October 2026  
**Auditor:** Principal Enterprise Software Architect & Application Security Lead  

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[Web Browser / User Agent] -->|HTTPS / HMAC Session Cookie| Edge[Next.js Edge Middleware / src/middleware.ts]
    Edge --> Router[Next.js App Router v16.3.6]
    
    subgraph Frontend [Presentation Layer - Tailwind CSS + Lucide + Recharts]
        AdminUI[Super Admin Console /admin/*]
        SeoUI[SEO User Workspace /projects, /rankings, /audit]
        PublicUI[Landing & Marketing Pages]
    end

    subgraph API [Application & API Layer]
        AdminAPI[/api/admin/* - Users, Roles, Clients, Projects, Jobs, Providers]
        ProjectAPI[/api/projects/* - Keywords, SERP, On-Page, Audit, Competitors]
        AuthAPI[/api/auth/* - Login, Signup, Session, Rate Limiting]
    end

    subgraph Security [Centralized Authorization & Guardrails]
        AuthGuard[requireAuth & getAuthSession]
        AdminGuard[requireAdminAuth - ADMIN/SUPERADMIN only]
        ProjectGuard[verifyProjectAccess - IDOR & Membership Validation]
        QuotaGuard[checkAndIncrementQuota - Plan Tiers & Monthly Limits]
    end

    subgraph Persistence [Data Layer - PostgreSQL via Prisma ORM v6.19.3]
        DB[(Supabase PostgreSQL - schema: seranking)]
        UserTable[User & Role & UserRole]
        ProjTable[Project & ProjectMember & Client]
        SeoTables[Keyword, RankingHistory, AuditPage, AuditIssue, Backlink, Prompt, Citation]
        OpsTables[Job, JobLog, AuditLog, ProviderConfig, SystemSetting]
    end

    subgraph Providers [External SEO & AI Data Integrations]
        SerperAPI[Serper.dev - Live Google SERP & Positions]
        PageSpeedAPI[Google PageSpeed Insights v5 / Lighthouse]
        OpenAiAPI[OpenAI API - AI Search Brand Presence & Recommendations]
        DataForSeoAPI[YepAPI / DataForSEO - Keywords & Backlinks]
        SmtpAPI[SMTP / Gmail - Verification & Alerts]
    end

    Router --> Frontend
    Router --> API
    API --> Security
    Security --> Persistence
    API --> Providers
```

---

## 2. Codebase Inventory & Technology Stack

| Layer | Implementation | Verified Status | Notes |
|---|---|---|---|
| **Framework** | Next.js 16.3.6 (App Router + React 19) | Active & Configured | Strict edge middleware with session token validation (`src/middleware.ts`). |
| **Language** | TypeScript 5.9.3 | Strict type checking enabled | Target ES2017 with moduleResolution `bundler`. |
| **Styling** | Tailwind CSS v4 + PostCSS | Configured | Obsidian `#090d16` dark aesthetic, cyber-emerald accents, accessible contrasts. |
| **Database** | PostgreSQL (Supabase pooler + directUrl) | Live & Connected | Schema `seranking` with 37+ production tables. |
| **ORM** | Prisma v6.19.3 | Live Client Generated | Synchronized with `prisma/schema.prisma`. |
| **Authentication** | Argon2id + HMAC signed cookies (`seranking_session`) | Live & Enforced | Sliding rate limiter, immediate session revocation upon deactivation/demotion. |
| **Test Suite** | Vitest 5.0.2 + jsdom + testing-library | 503+ Unit/Integration Tests Passing | Full coverage for auth, multi-project data isolation, SSRF defense, IDOR prevention. |

---

## 3. Database Entities & Persistence State

The real Supabase PostgreSQL database contains verified production records:
- **Users**: 11 real user records (Admin, Owner, SEO User accounts).
- **Projects**: 17 distinct tracked customer domains (e.g., `workcomposer.com`, `flipkart.com`, `meesho.com`, `visualytes.com`).
- **Keywords**: 307 real keywords with search volumes and ranking positions.
- **Ranking History**: 8,683 verified historical SERP snapshots.
- **Site Audit**: 129 technical audit issues across 68 crawled pages.
- **Backlinks**: 252 verified backlink records.
- **Background Jobs**: 82 queued/executed jobs in `Job` table.

---

## 4. Key Strengths & Current Architectural Assets

1. **Zero Synthetic / Fake Data Principle**: The system strictly queries live Prisma database models and verified APIs. Fake hardcoded metric arrays have been eliminated.
2. **SSRF Hardening**: Site Audit crawler validates all URLs against loopback, private RFC-1918 addresses, and AWS/GCP cloud metadata addresses (`169.254.169.254`).
3. **Session Revocation**: User suspension or deactivation purges in-memory session caches and deletes database sessions immediately, locking out unauthorized users.
4. **Idempotency & Auditing**: Every administrative change creates an immutable `AuditLog` row with actor ID, email, action, entity, before/after JSON snapshots, IP address, and timestamp.
