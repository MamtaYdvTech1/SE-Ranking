# SE Ranking Technical Plan — Module Gap Analysis Matrix

This matrix maps every module defined in `SEO RANKING.pdf` to its technical implementation in the repository, files, API routes, database models, current status, and verification evidence.

---

## Module Status Overview

| Module # | Module Name | Implementation Status | Primary Routes / Files | Database Models | Notes & Evidence |
|---|---|---|---|---|---|
| **Module 0** | Codebase Audit & Project Foundation | `WORKING_REAL` | `package.json`, `tsconfig.json`, `tests/` | All | Vitest suite (503+ tests passing), Prisma client v6.19.3 generated, Next.js 16.3.6. |
| **Module 1** | Authentication, Admin & Project Mgmt | `WORKING_REAL` | `/admin/users`, `/admin/projects`, `/admin/clients`, `/api/admin/*`, `/api/auth/*` | `User`, `Role`, `UserRole`, `Client`, `Project`, `ProjectMember`, `Session`, `AuditLog`, `Invitation` | Argon2id auth, HMAC signed sessions, multi-client isolation, team assignment, user deactivation session revocation. |
| **Module 2** | Site Audit Crawler | `WORKING_REAL` | `src/services/seo/audit.service.ts`, `/api/website-audit/*`, `/api/projects/[id]/audit/*` | `AuditPage`, `AuditIssue`, `Job`, `JobLog` | In-house HTML fetcher & parser, SSRF defense (RFC-1918 & 169.254.169.254 rejection), health score calculation, issue comparison. |
| **Module 3** | Site Performance (Core Web Vitals) | `WORKING_REAL` | `src/services/seo/audit.service.ts`, `/api/website-audit/scan` | `AuditPage` | PageSpeed Insights API v5 / Lighthouse lab metrics (LCP, CLS, FID/INP, TTFB, FCP), separate mobile & desktop. |
| **Module 4** | Keyword Overview & Keyword Magic Tool | `PARTIAL` | `src/services/seo/keyword.service.ts`, `dataforseo.client.ts`, `/api/keywords/*`, `/api/seo/keywords` | `Keyword`, `RankingHistory` | Keyword search volume, CPC, grouping, CSV import/export. YepAPI balance requires top-up for fresh web-wide queries. |
| **Module 5** | Rank Tracking and SERP | `WORKING_REAL` | `src/services/seo/ranking.service.ts`, `src/lib/rankings/*`, `/api/projects/[id]/rankings/*` | `Keyword`, `RankingHistory`, `CompetitorRanking`, `SearchEngineConfig` | Live Serper.dev integration verified. Position change, ranking URL detection, visibility curve, top 5/10/30 distribution. |
| **Module 6** | Domain Overview & Competitor Research | `WORKING_REAL` | `src/lib/server/competitorsV1.ts`, `/api/projects/[id]/competitors/*`, `/api/competitors/*` | `ProjectCompetitor`, `CompetitorRanking`, `Project` | Domain normalization, common keywords count, visibility score, top competitor discovery. |
| **Module 7** | Keyword Gap | `WORKING_REAL` | `/api/projects/[id]/competitors/keywords/route.ts`, `/api/seo/competitors` | `Keyword`, `CompetitorRanking` | Compares target domain against tracked competitors. Classifies shared, missing, weak, and unique keywords. |
| **Module 8** | Backlinks, Referring Domains & Gap | `WORKING_REAL` | `src/services/seo/backlink.service.ts`, `/api/backlinks`, `/api/projects/[id]/backlinks` | `Backlink` | 252 real backlink records in database, unique referring domains count, dofollow/nofollow breakdown, anchor text search. |
| **Module 9** | AI Visibility & GEO Competitor Tracker | `WORKING_REAL` | `src/services/seo/ai-tracker.service.ts`, `/api/ai-search/*` | `AiSearchRecord`, `Analysis`, `Prompt`, `Citation` | ChatGPT, Google AI Mode brand mention extraction, cited URL verification, share of voice calculation across LLM search engines. |
| **Module 10** | AI-Generated SEO Recommendations | `WORKING_REAL` | `src/services/seo/content.service.ts`, `/api/content-marketing/*` | `ContentBrief`, `AuditIssue` | Structured recommendations derived from real audit issues and keyword rankings via OpenAI server-side completion. |
| **Module 11** | Reports, Notifications & Exports | `WORKING_REAL` | `/api/reports`, `/api/export/*`, `/api/agency-pack/*` | `Report`, `Notification`, `NotificationPreference` | PDF/CSV generation, client report branding, sanitization against CSV formula injection (`=`, `@`, `+`, `-`). |
| **Module 12** | Integrations, Quotas, Costs & Jobs | `WORKING_REAL` | `/admin/providers`, `/admin/jobs`, `/api/admin/providers`, `/api/admin/jobs` | `ProviderConfig`, `Job`, `JobLog`, `AuditLog`, `SystemSetting` | Provider registry, connection test endpoints, masked secrets, attempt-bounded queue with retries and exponential backoff. |

---

## Classification Definitions

- **WORKING_REAL**: Full-stack vertical slice operational with real database persistence, verified API routes, and automated test coverage.
- **PARTIAL**: Operational backend and UI, with external provider quota limitation or secondary features remaining.
- **BLOCKED_BY_PROVIDER**: Implementation ready; awaiting live API top-up or developer token authorization.
- **MOCK_DATA**: Strictly prohibited by platform rules; zero synthetic mock data present in core workflows.
