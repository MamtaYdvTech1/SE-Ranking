

# --- PAGE 1 ---

Internal SEO Platform — Developer Technical Plan 
INTERNAL SEO PLATFORM  
Module-wise Technical Development Plan  
SE Ranking-type internal tool | Next.js + TypeScript + PostgreSQL  
 
Developer handoff document • Build brick by brick 
 

# --- PAGE 2 ---

Internal SEO Platform — Developer Technical Plan 
1. Purpose and how to use this document 
This document is a practical implementation specification for a developer who is new to the project. It defines modules, 
responsibilities, data sources, APIs/services, database entities, processing workflows, security controls, phased delivery 
and acceptance criteria. 
Important: this is not a promise to reproduce every proprietary SE Ranking dataset. A production SEO platform requires 
both application engineering and licensed/authorized data sources. Build the portal and crawler in-house; buy or connect 
datasets that cannot be reliably created from a normal website crawl. 
Project principles 
 Keep the existing application where possible. Audit the repository, routes, schema and current data before rebuilding 
anything. 
 Separate UI, API/business logic, background workers and third-party provider adapters. 
 Every metric must show its source, scope (country/device/search engine where relevant), and last-updated timestamp. 
 Keep historical snapshots. Do not overwrite yesterday's rankings, audit results, backlink status or AI runs. 
 Never present estimates from a provider as actual Google Analytics/Search Console data. 
 Start with a single primary provider for each dataset. Add a second vendor only after testing coverage, cost and data 
quality. 
2. Recommended architecture 
Layer Recommended implementation Responsibilities 
Frontend Next.js App Router + TypeScript; Tailwind CSS; shadcn/ui; Recharts Admin and SEO user screens, tables, filters, charts, forms and progress states. 
Application/API Next.js Route Handlers or a separate API service Validation, authorization, business rules, provider orchestration and response formatting. 
Database PostgreSQL + Prisma or Drizzle Users, clients, projects, settings, metrics, histories, reports and job records. 
Queue and workers Redis + BullMQ; separate worker process Long crawls, API syncs, rank checks, AI runs, report generation and retries. 
Crawler HTTP fetch + Cheerio; Playwright only when rendering is required Discover pages, parse HTML, follow links and create technical audit issues. 
Integrations Typed provider adapter per vendor OAuth, API calls, rate limits, normalization, error mapping and usage tracking. 
Storage S3-compatible object storage or approved company storage PDF/CSV reports and permitted raw artifacts. 
Observability Structured logs + Sentry/equivalent + job dashboard Failures, latency, provider errors and operational visibility. 
 
High-level flow 
User action → Next.js API → authentication/authorization → create job record → queue → worker calls crawler/provider → 
normalize and save results → UI reads stored data → charts/reports/alerts. 
3. Roles and access control 
Capability Admin SEO User 
Manage users and roles Yes No 
View all clients/projects Yes No; assigned projects only 
Create client/project Yes Only if explicitly granted 
Assign team members Yes No by default 
Run audit/research on assigned project Yes Yes, within quotas 
Manage global API credentials Yes No 
View platform-wide spend/usage Yes No 
Create project reports Yes Yes, assigned projects 

# --- PAGE 3 ---

Internal SEO Platform — Developer Technical Plan 
Change global settings and job schedules Yes No 
View admin audit logs Yes No by default 
 
Enforce authorization in every server-side endpoint. Hiding a button is not security. Check active account, role, project 
membership and resource ownership before returning or changing data. Consider PostgreSQL Row-Level Security as an 
additional layer. 
4. Module 0 — Existing-codebase audit and project foundation 
Do this before adding new features. The developer should not assume the existing portal is a blank project. 
 Inventory routes/pages, components, server actions/API routes, authentication, database schema and migrations. 
 Identify mock/demo data and label it. Trace every dashboard number to its source. 
 Record current deployment, environment variables, background jobs, error logs and backups. 
 Create a module matrix: Existing / Partial / Missing / Broken / Needs provider. 
 Create a development environment, staging environment and production environment. 
 Add linting, formatting, TypeScript checks, automated tests and a repeatable deployment process. 
Deliverable Acceptance criterion 
Codebase assessment Documented list of existing modules, data sources, routes and technical debt. 
Schema baseline Database migrations work from a clean database and existing data is backed up. 
Environment setup Secrets are not committed; local/staging configuration is documented. 
Feature status matrix Every requested feature is tagged real data, mock data, partially implemented or missing. 
 
5. Module 1 — Authentication, Admin and project management 
Purpose 
Provide a secure multi-client workspace where Admin controls the company configuration and SEO users only access 
assigned projects. 
Build in-house 
 Login/logout, session expiry, password reset or identity-provider login, account deactivation and invitation flow. 
 Admin pages: users, roles, clients, projects, domains, project assignments, provider settings, quotas and job 
monitoring. 
 SEO user pages: assigned projects, project dashboard, research modules and reports. 
 Project setup wizard: client → domain → country/language → search engine/device → assigned SEO owner → competitors 
→ audit/rank schedule. 
Suggested services 
Need Option Purpose / notes 
Authentication Auth.js or company OIDC provider 
Session and identity. If using Google OAuth 
for Search Console, keep identity login and 
Google property authorization as distinct 
consent/permission flows. 
ORM Prisma or Drizzle Typed DB access and versioned migrations. 
Email Resend or company SMTP Invitations, reset links, alerts and report notifications. 
Audit logging In-house table Track admin changes, permission changes and integration updates. 
 

# --- PAGE 4 ---

Internal SEO Platform — Developer Technical Plan 
Core database tables 
users, roles, user_roles, clients, projects, project_domains, project_members, invitations, sessions/identity records as 
appropriate, audit_logs, notification_preferences. 
Acceptance criteria 
 Admin can create a client and project, add a domain and assign an SEO user. 
 SEO User cannot access an unassigned project by changing an ID in the URL or API request. 
 Deactivated users cannot continue using an active session beyond the defined revocation policy. 
 Administrative changes and permission changes are recorded with actor, action, entity and timestamp. 
6. Module 2 — Site Audit crawler 
Purpose 
Crawl a project website, identify technical SEO issues, save each crawl as a historical run and compare current issues with 
prior runs. 
Self-built components 
 Seed URL from project domain, sitemap.xml and optionally user-supplied URL list. 
 URL normalization: resolve relative links, remove fragments, normalize host and handle query parameters according to 
project policy. 
 Respect robots.txt and configured crawl policy; set a clear user agent, crawl delay and page/concurrency limits. 
 HTTP fetcher with timeouts, retries, redirect tracking, content-type checks, response-size limits and canonical URL 
handling. 
 HTML parser: title, meta description, headings, canonical, robots meta, hreflang, image alt, internal/external links, 
structured data presence. 
 Detect broken internal links, 4xx/5xx, redirect chains/loops, missing titles/descriptions, duplicate titles, 
noindex/canonical conflicts, orphan candidates and excessive click depth where data supports it. 
 Store page-level observations and normalized issue codes. Generate severity and remediation guidance from 
documented rules. 
 Run comparison: new issues, resolved issues, recurring issues and changes in affected URL counts. 
 Optional rendered crawl using Playwright for JavaScript-heavy pages; keep it a separately controlled, higher-cost mode. 
External APIs/services 
Service Purpose Required setup 
No external SEO API required for core crawl Your crawler fetches and analyzes accessible pages. Build crawler and issue rules. 
Google PageSpeed Insights API Lighthouse lab performance diagnostics for selected URLs. Google Cloud project/API key; quotas and timeouts. 
Chrome UX Report (CrUX) API — optional Field performance data where available. API key; handle missing data and origin/URL coverage limitations. 
Google Search Console API — optional 
integration 
Search performance, sitemap information 
and URL inspection for authorized sites. OAuth 2.0 and property permission. 
 
Suggested tables 
crawl_configs, crawl_runs, crawled_urls, page_observations, audit_issues, issue_occurrences, internal_links, 
performance_runs. 
Worker workflow 
1. API validates project access and crawl configuration. 
2. Create crawl_runs row with status queued and enqueue crawl job. 

# --- PAGE 5 ---

Internal SEO Platform — Developer Technical Plan 
3. Worker marks running, loads crawl limits and seed URLs. 
4. Fetch pages within concurrency and page limits; save URL result and extracted observations. 
5. Run issue rules and save issue occurrences. 
6. Finalize counts, health score (documented formula), timestamps and status. 
7. Send completion/failure notification and make results visible. 
Security: prevent SSRF. Reject localhost/private/reserved IP ranges, re-check DNS and redirect targets, block cloud 
metadata addresses, restrict schemes to HTTP/HTTPS and enforce network egress rules. Do not let users use the crawler 
as a proxy into internal infrastructure. 
Acceptance criteria 
 Audit runs asynchronously and returns a job/run ID immediately. 
 User can see queued/running/completed/failed state and progress. 
 Repeated crawl results remain historical and can be compared. 
 Robots policy, timeouts, maximum pages, concurrency and rate limits are enforced. 
 Tests cover redirect loops, broken links, canonical tags, noindex, duplicate titles and unreachable sites. 
7. Module 3 — Site performance 
Use PageSpeed Insights for lab diagnostics and, where available, CrUX for real-user field metrics. Store mobile and desktop 
runs separately. Do not promise field data for every URL. 
Data/API Purpose Implementation notes 
PageSpeed Insights API v5 Lighthouse scores, opportunities, diagnostics and lab metrics. 
Request URL, strategy (mobile/desktop) and 
relevant categories. Cache results, respect 
quotas, save raw response only where 
appropriate. 
CrUX API (optional) Field metrics such as Core Web Vitals for eligible pages/origins. Separate source and metric type from lab data; store collection period and missing-data state. 
Internal scheduled worker Refresh selected landing pages. 
Run on a controlled cadence; prioritize 
important pages instead of rechecking every 
URL too often. 
 
Suggested table: performance_runs(project_id, url, strategy, source, performance_score, accessibility_score, seo_score, 
LCP, CLS, INP/FID where supplied, FCP, TTFB where supplied, measured_at, status, error_code). Keep source-specific raw 
fields in JSONB only as a supplement to normalized columns. 
Acceptance: user can compare mobile/desktop and historic runs; absent metrics are displayed as unavailable, never as 
zero. 
8. Module 4 — Keyword Overview and Keyword Magic Tool 
Purpose 
Provide keyword discovery, keyword metrics, filtering, grouping, saved lists and country/language-specific research. 
Provider choices 
Provider/API Use Caveats 
Google Ads API — Keyword Planning Keyword ideas, historical search volume, competition and bid estimates. Requires Ads account, developer token, OAuth and access approval. Not a complete organic SEO difficulty or SERP database. 
DataForSEO keyword data endpoints Keyword metrics and suggestions where covered by selected endpoint/product. Check endpoint coverage, locations, language, pricing and credits before choosing. 
Alternative SEO data provider Use if it offers required coverage and acceptable licensing. Build adapter interface so provider can be replaced. 

# --- PAGE 6 ---

Internal SEO Platform — Developer Technical Plan 
 
Build in-house 
 Keyword input: seed term, URL/domain seed where supported, country, language, search network and device if 
provider supports it. 
 Filters: volume range, difficulty range (only if source supplies it), CPC, intent (source-derived or clearly labeled 
inferred), word count and keyword type. 
 Keyword list management: save, tag, group, add/remove terms, bulk import/export CSV and deduplicate. 
 Keyword Magic grouping: broad/phrase/question/related groups based on provider result types or transparent 
string/topic grouping rules. 
 Historical metric snapshots; preserve provider and collection date. 
Suggested tables 
keywords, keyword_lists, keyword_list_items, keyword_groups, keyword_metrics, keyword_discovery_runs, 
provider_usage. 
Acceptance criteria 
 Every result records country, language, provider and retrieval date. 
 Filters and pagination operate server-side for large result sets. 
 Repeated queries are cached according to an explicit cache policy. 
 Provider failure or exhausted quota is visible and does not silently return fake data. 
 Keyword difficulty is never fabricated if the selected source does not supply it. 
9. Module 5 — Rank Tracking and SERP 
Rank tracking was not explicit in the user's initial list, but it is an essential companion to keyword research and ongoing SEO 
management. Implement it as its own module. 
Source Purpose Implementation 
DataForSEO SERP/rank endpoints or another 
licensed SERP provider 
Collect organic result positions for keyword, 
location, language, device and search engine. 
Confirm endpoint and plan. Store task ID, 
query scope, results and collection 
timestamp. 
Google Search Console API Actual impressions/clicks and average position for authorized sites. Use as a separate data source; average position is not the same as a controlled third-party rank check. 
 
 Allow project keywords to be scheduled daily/weekly depending on cost and operational needs. 
 Record position, result URL, SERP features where supported, device, location and provider. 
 Show position change, ranking URL changes, visibility trends and missing/out-of-range status. 
 Make clear that location/device and measurement source can materially change ranking results. 
Suggested tables: rank_tracking_configs, rank_checks, rank_history, serp_results, serp_features. Use a unique key based 
on keyword, project, source, location, device and measurement timestamp/snapshot. 
Acceptance criteria 
 Scheduled rank checks create jobs and retain history. 
 Duplicate jobs are prevented for the same project/scope/schedule window. 
 Dashboard distinguishes a missing result from a position of zero. 
 Search Console average position is not mislabeled as an exact rank check. 

# --- PAGE 7 ---

Internal SEO Platform — Developer Technical Plan 
10. Module 6 — Domain Overview and Competitor Research 
This module summarizes a target domain and compares it with selected competitors. Organic traffic and domain authority 
metrics are provider estimates unless they originate from an authorized analytics source. 
Source Purpose Notes 
SEO data provider domain/organic endpoints Estimated organic keywords, traffic, top pages and competitor domains, if supported. Confirm endpoint/product coverage and historical depth. 
Google Search Console API Actual site performance for a connected property. Only for properties the company/user is authorized to access. 
Optional GA4 Data API Actual analytics sessions/conversions when the client authorizes access. Separate analytics metrics from provider-estimated traffic; requires GA4 property access. 
 
 Domain input and normalized domain identity. 
 Overview cards, trend charts, top keywords, top landing pages and competitor discovery. 
 Competitor selection, project association and comparison date/scope. 
 Persist report run metadata and cache repeated requests. 
Suggested tables: domain_snapshots, domain_pages, competitor_domains, competitor_snapshots, 
integration_connections. 
Acceptance: all competitor comparisons show source, date, country and metric definition; estimates and actual analytics 
are visually distinct. 
11. Module 7 — Keyword Gap 
Purpose: find keywords where competitors rank or have keyword coverage but the target does not, and classify 
opportunities. 
 Select one target domain and one or more competitors. 
 Fetch compatible keyword datasets for the same country, search engine, device and time scope. 
 Normalize keyword text and join datasets on keyword plus scope. 
 Classify shared, missing, weak and unique terms using documented rules. 
 Allow filters by search volume, difficulty, competitor count and ranking range when data exists. 
 Save report run, comparison domains, provider source, filters and result rows. 
Suggested tables: gap_reports, gap_report_domains, keyword_gap_rows. Do not compare incompatible locations or 
different providers without disclosing the methodology. 
Acceptance: users can reproduce a saved report and see how the categories were calculated. 
12. Module 8 — Backlinks, Referring Domains and Backlink Gap 
Data source 
Use a licensed backlink index provider such as DataForSEO or Ahrefs where the selected plan/API includes the required 
backlink endpoints. Your own crawler cannot discover the full web-wide backlink graph. 
Features 
 Backlinks list: source URL, target URL, anchor text, link attributes, link type and first/last seen where supplied. 
 Referring domains: unique linking domains, backlink counts, provider authority metric if available, and new/lost 
domain trends. 
 Backlink gap: competitor domains with referring domains that do not appear in the target's dataset. 
 Filters: follow/nofollow, domain, target page, anchor, status and first/last seen when available. 
 Export and saved reports with source timestamp and provider usage cost. 

# --- PAGE 8 ---

Internal SEO Platform — Developer Technical Plan 
Suggested tables: backlink_snapshots, backlinks, referring_domain_snapshots, backlink_gap_reports, backlink_gap_rows. 
Use provider IDs where available; otherwise define a stable normalized key such as source URL + target URL + 
anchor/attributes, while allowing the same link to change over time. 
Acceptance: new/lost means new/lost in the provider's observed index, not guaranteed proof that a live link was created or 
removed at that exact moment. 
13. Module 9 — AI Visibility and AI Competitor Research 
Purpose: run a repeatable set of prompts, capture permitted AI/search responses, identify brand mentions and citations, 
and compare observed visibility over time. 
Data-source options 
Option Purpose Important limitation 
OpenAI API or another model API 
Generate content recommendations, 
summarize audit findings, classify intent or 
analyze captured responses. 
A general model API does not automatically 
measure brand visibility in live AI search 
results. 
AI search/visibility measurement provider or 
supported search API 
Capture supported AI answers, 
sources/citations and brand presence. 
Verify API availability, permitted storage, 
supported engines, locations and pricing. 
Manual prompt runs for early MVP Validate prompt library and scoring workflow. Label as manual sampling; do not claim exhaustive or continuous visibility. 
 
Build in-house 
 Prompt library with target brand, competitor brands, topic, locale, language and schedule. 
 Run record: provider, model/engine, prompt version, execution time, status and captured answer where allowed. 
 Brand/competitor mention extraction and citation URL normalization. 
 Scoring formula with clear denominator: e.g. share of successful eligible runs that mention the brand. Document that 
the score is an internal measure, not a universal industry standard. 
 Trend charts, competitor comparison, cited-page report and recommended content opportunities. 
 Manual review/edit of detected mentions and citations when automated extraction is uncertain. 
Suggested tables: ai_prompt_sets, ai_prompts, ai_runs, ai_brand_mentions, ai_citations, ai_visibility_snapshots. 
Acceptance: each visibility point can be traced to its run, source and timestamp; failed/ineligible runs are excluded from 
the denominator or handled by an explicitly documented rule. 
14. Module 10 — AI-generated SEO recommendations 
Use an LLM only to assist with interpretation, not as the source of crawl/ranking facts. 
 Input: normalized audit issues, page metadata, Search Console data and approved keyword/competitor findings. 
 Output: proposed explanation, prioritized recommendation, evidence references and suggested next step. 
 Require structured JSON output and validate it against a schema. 
 Show the source evidence that supports each recommendation. 
 Never automatically publish site changes or claim a recommendation guarantees ranking improvements. 
 Store model/provider, prompt version, input references, output, usage and reviewer status. 
Suggested table: seo_recommendations(id, project_id, source_type, source_id, model, prompt_version, 
recommendation_json, review_status, created_at). Keep API credentials server-side. 
15. Module 11 — Reports, notifications and exports 
 Report templates: monthly client report, audit summary, keyword/rank report, competitor gap and backlink summary. 
 Allow date range, project/domain, selected metrics and logo/branding. 

# --- PAGE 9 ---

Internal SEO Platform — Developer Technical Plan 
 Generate PDF/CSV asynchronously; store file in approved object storage and metadata in PostgreSQL. 
 Email notifications for audit completion, critical issues, job failures, scheduled reports and integration errors. 
 Use expiring signed URLs for private files; check user access before generating or downloading. 
 Make report timestamps, provider source and estimate disclaimers visible. 
Service Purpose Notes 
Resend or company SMTP Email delivery 
Verify sender domain, SPF/DKIM/DMARC 
where appropriate, bounce/error handling 
and suppression. 
S3-compatible storage Report files Private bucket, retention rules, signed URLs and access logging. 
PDF/CSV library File generation Test long tables, Unicode, page breaks, formula-injection risk in CSV exports. 
 
Suggested tables: report_templates, reports, report_sections, notifications, notification_preferences, email_delivery_logs. 
16. Module 12 — Integrations, quotas, costs and job operations 
Admin needs a dedicated control panel so the team can see why data is missing or delayed. 
 Integration registry: provider, environment, enabled state, last successful check, scopes, quota/credit model and 
configuration metadata. 
 Secrets stored in environment variables or a managed secret store; database may store a secret reference, never 
plaintext credentials. 
 Connection test button that performs a safe low-cost request. 
 Usage ledger: provider, endpoint/product, project, job, units/credits, estimated cost and timestamp where 
returned/derivable. 
 Job list: type, project, status, queued/running/finished times, attempts, last error and retry action. 
 Dead-letter/failed-job workflow, bounded retries with exponential backoff and jitter, idempotency keys and alerting. 
 Rate limiting per provider and per project; cache expensive repeated requests. 
Suggested tables: integration_connections, provider_usage, jobs, job_attempts, job_schedules, system_events. 
Acceptance: admin can identify a failed integration, understand the reason, retry safely and see usage without exposing 
secrets. 
17. Database design baseline 
Use UUID primary keys, foreign keys, NOT NULL constraints where appropriate, UTC timestamps, explicit status enums or 
constrained strings, and indexes that reflect actual query patterns. Keep raw provider JSON only when permitted and 
useful; normalize the fields used for filtering and reporting. 
Domain Suggested core tables 
Identity users, roles, user_roles, invitations, audit_logs 
Clients/projects clients, projects, project_domains, project_members, competitors 
Crawling crawl_configs, crawl_runs, crawled_urls, page_observations, audit_issues, internal_links 
Performance performance_runs 
Keyword research keywords, keyword_metrics, keyword_lists, keyword_list_items, keyword_groups, keyword_discovery_runs 
Rank tracking rank_tracking_configs, rank_checks, rank_history, serp_results 
Domain research domain_snapshots, domain_pages, competitor_snapshots 
Gap analysis gap_reports, gap_report_domains, keyword_gap_rows, backlink_gap_reports, backlink_gap_rows 
Backlinks backlinks, backlink_snapshots, referring_domain_snapshots 
AI visibility ai_prompt_sets, ai_prompts, ai_runs, ai_brand_mentions, ai_citations, ai_visibility_snapshots 
Operations integration_connections, provider_usage, jobs, job_attempts, job_schedules, notifications 
Reports report_templates, reports, report_sections, email_delivery_logs 

# --- PAGE 10 ---

Internal SEO Platform — Developer Technical Plan 
 
Data integrity rules 
 Use a provider/source column and retrieved_at timestamp for every external metric. 
 Define uniqueness using the full scope (project/domain, keyword, location, language, device, provider and 
snapshot/date as applicable). 
 Use transactions for multi-table updates and database constraints to prevent duplicate project membership and 
duplicate job scheduling. 
 Index project_id, measured_at, status, keyword/domain lookup columns and foreign keys. 
 Use pagination for large result sets; do not load thousands of backlinks/URLs into the browser at once. 
 Partition large time-series tables only when actual volume justifies the operational complexity. 
 Write migration and rollback/recovery instructions; back up before destructive migrations. 
18. API conventions and proposed internal routes 
Route Method Purpose 
/api/projects GET/POST List authorized projects; create project (admin). 
/api/projects/:id GET/PATCH Read/update authorized project. 
/api/projects/:id/audits GET/POST List audits or queue new audit. 
/api/audits/:runId GET Read status, progress and summary. 
/api/audits/:runId/issues GET Paginated/filterable issues. 
/api/projects/:id/performance GET/POST Read history or queue performance check. 
/api/keywords/discover POST Queue provider keyword discovery. 
/api/keywords/metrics GET Read normalized keyword metrics. 
/api/rank-tracking/configs GET/POST Configure rank tracking. 
/api/rank-tracking/checks GET/POST Read history or queue check. 
/api/domain-overview GET/POST Read cached overview or queue refresh. 
/api/gaps/keyword POST/GET Create or retrieve keyword gap reports. 
/api/backlinks GET Paginated backlink data. 
/api/gaps/backlink POST/GET Create or retrieve backlink gap reports. 
/api/ai-visibility/runs POST/GET Queue or list prompt runs. 
/api/reports POST/GET Queue report generation or list reports. 
/api/jobs/:id GET Read queue/job status. 
/api/admin/integrations GET/PATCH Admin-only integration settings/health metadata. 
/api/admin/usage GET Admin-only provider usage and cost overview. 
 
These routes are a proposed convention, not existing endpoints. Use a consistent response shape, schema validation, 
authorization, pagination, request IDs and documented error codes. Never accept arbitrary SQL, arbitrary provider URLs or 
unvalidated job parameters from the browser. 
19. Worker, scheduling and reliability rules 
 Every long task runs in a background worker, not inside a page request. 
 Store job status: queued, running, succeeded, failed, cancelled; store progress and timestamps. 
 Make jobs idempotent. Re-running a job should not duplicate the same snapshot or notification unintentionally. 
 Use bounded retries for transient failures; do not endlessly retry invalid credentials or bad input. 
 Respect provider quotas, crawl politeness, concurrency and spend limits. 
 Provide admin pause/resume controls for expensive schedules. 
 Use scheduled syncs based on the business need and provider budget; do not default every module to frequent 
refresh. 
 Keep worker processes independently deployable from the Next.js frontend. 

# --- PAGE 11 ---

Internal SEO Platform — Developer Technical Plan 
20. Security and privacy checklist 
 Validate all inputs on the server; use parameterized ORM queries. 
 Enforce role and project authorization on every API route and background job. 
 Protect against SSRF in crawler and URL-fetch features, including DNS changes and redirect targets. 
 Keep API keys/OAuth secrets server-side and redact them from logs. 
 Encrypt sensitive tokens at rest or store them in a secret manager; rotate/revoke on staff departure. 
 Use secure session cookies, CSRF protections where applicable, rate limits and brute-force protection. 
 Do not store client Google OAuth tokens unless the client has authorized the connection and retention is justified. 
 Set retention policies for raw responses, prompt outputs and exports; honor provider licensing and deletion 
requirements. 
 Private reports must use authorization checks and expiring signed links. 
 Audit admin actions, role changes, provider configuration changes and exports of sensitive data. 
21. Testing plan 
Test level Required coverage 
Unit tests URL normalization, issue rules, keyword grouping, gap classification, score formulas and response normalizers. 
Integration tests Database migrations, provider clients using mocked fixtures, OAuth callback, queue processing and report generation. 
Authorization tests Admin vs SEO user, assigned vs unassigned project, inactive account, guessed IDs and cross-project access. 
Security tests SSRF/private IP/redirect blocks, input validation, rate limits, secret redaction and file access. 
End-to-end tests Create client → create project → run audit → inspect issues → run keyword query → create report. 
Reliability tests Provider timeout, quota exhaustion, invalid credentials, worker restart, retry and duplicate-job prevention. 
Data quality tests Missing metrics, zero vs null, stale snapshots, source labels, country/device scope and time-zone boundaries. 
 
22. Deployment and environment variables 
Keep local, staging and production environments separate. The exact deployment platform must support a persistent 
worker process or a suitable external job runner; a serverless web deployment alone should not be assumed to run 
continuous workers. 
Variable/configuration Purpose Secret? 
DATABASE_URL PostgreSQL connection string Yes 
REDIS_URL Queue connection Yes 
AUTH_SECRET / OIDC config Session or identity setup Yes 
GOOGLE_CLIENT_ID Google OAuth client Treat as configuration 
GOOGLE_CLIENT_SECRET Google OAuth secret Yes 
GOOGLE_PAGESPEED_API_KEY PageSpeed API key, if used Yes 
GOOGLE_ADS_DEVELOPER_TOKEN Google Ads API access Yes 
GOOGLE_ADS_CLIENT_ID/SECRET Google Ads OAuth Yes 
GOOGLE_ADS_REFRESH_TOKEN Authorized Ads account access Yes 
SEO_PROVIDER credentials Selected provider API access Yes 
OPENAI_API_KEY or chosen AI key AI-assisted recommendations Yes 
EMAIL_PROVIDER_API_KEY / SMTP secrets Email delivery Yes 
OBJECT_STORAGE credentials Private report storage Yes 
SENTRY_DSN Error tracking configuration Treat according to environment policy 
 
 Never commit .env files or credentials to GitHub. 
 Use least-privilege database and storage credentials. 
 Run migrations as a controlled deployment step and back up before production schema changes. 

# --- PAGE 12 ---

Internal SEO Platform — Developer Technical Plan 
 Configure health checks for web, worker, database and Redis. 
 Add structured logs with request/job IDs and redact personal data and secrets. 
 Test restoring a backup, not only creating one. 
23. Brick-by-brick implementation sequence 
Phase Build order Exit criteria 
0. Audit Inspect current repo, routes, schema, mock data, deployment and credentials. Signed-off gap matrix and baseline backup. 
1. Foundation Auth, roles, clients, projects, domain setup, assignments and audit logs. Role/project access tests pass. 
2. Job engine Redis/BullMQ, job records, worker, retries, usage and admin job monitor. A test job can be queued, processed, failed and retried. 
3. Site Audit Crawler, rules, issue storage, run history and comparison. Audit works on test sites and handles errors safely. 
4. Performance PageSpeed; optional CrUX; history and charts. Mobile/desktop results and unavailable data handled correctly. 
5. Keyword research Choose provider; build adapter, keyword overview, discovery, lists and filters. Real provider data shown with scope/source/time. 
6. Rank tracking SERP provider, scheduler, history and visibility charts. Scheduled rank snapshots work within quotas. 
7. Domain/keyword gap Domain overview, competitor selection and gap engine. Reproducible, scope-matched comparisons. 
8. Backlinks Backlink provider, referring domains and backlink gap. Provider data displayed and history retained. 
9. AI visibility Prompt sets, permitted source, runs, citations, comparison and scoring. Every score traceable to source runs. 
10. Reports/alerts PDF/CSV, email, scheduled reports and alerts. Reports are private, accurate and repeatable. 
11. Hardening Security, performance, monitoring, backup/restore and user acceptance. Acceptance tests pass and runbook is complete. 
 
Do not start every phase simultaneously. Finish the acceptance criteria for each phase before moving to the next. The 
developer should provide a demo, test results, migrations and setup instructions at every milestone. 
24. Required deliverables from the developer 
 Architecture diagram and existing-codebase gap analysis. 
 Database ERD and versioned schema migrations. 
 API route documentation with request/response examples and error codes. 
 Provider integration register with endpoints, credentials, scopes, quotas, pricing model and licensing notes. 
 Admin and SEO User permission matrix. 
 Worker/queue documentation and retry/idempotency strategy. 
 Automated tests and a repeatable staging deployment. 
 Environment setup guide without real credentials. 
 Admin runbook: add user, connect provider, test integration, review job failure, retry job and inspect usage. 
 Known limitations list that clearly separates implemented features, estimates and provider-dependent capabilities. 
25. Provider selection gate — complete before buying 
For each proposed vendor, run a small proof of concept and fill in this checklist before committing budget. 
Question Required answer 
Does the API include the exact endpoint/data needed? Endpoint and sample response recorded. 
Does it support required countries, languages and devices? Coverage matrix documented. 
What is the unit of billing? Credits, rows, requests or subscription allowance documented. 
What are quotas and rate limits? Limits and retry/backoff rules documented. 

# --- PAGE 13 ---

Internal SEO Platform — Developer Technical Plan 
Can data be stored and shown in this internal portal? Contract/license checked. 
Can historical snapshots be retained? Retention/redistribution terms checked. 
What happens on failure or missing data? Fallback/error behavior documented. 
How can the provider be replaced? Adapter contract and normalized schema documented. 
 
26. Official documentation links 
 Google Search Console API: https://developers.google.com/webmaster-tools/v1/api_reference_index 
 Search Console API limits: https://developers.google.com/webmaster-tools/limits 
 PageSpeed Insights API: https://developers.google.com/speed/docs/insights/rest 
 CrUX API: https://developer.chrome.com/docs/crux/api/ 
 Google Ads Keyword Planning: https://developers.google.com/google-ads/api/docs/keyword-planning/overview 
 DataForSEO: https://dataforseo.com/ 
 Ahrefs: https://ahrefs.com/ 
 Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers 
 Prisma + Next.js: https://docs.prisma.io/docs/guides/frameworks/nextjs 
 BullMQ documentation: https://docs.bullmq.io/ 
 Playwright: https://playwright.dev/docs/intro 
 OpenAI API documentation: https://platform.openai.com/docs/ 
 Resend documentation: https://resend.com/docs 
 Sentry documentation: https://docs.sentry.io/ 
Final instruction to the developer 
Do not start by building every dashboard screen with placeholder values. First audit the existing application and identify 
the missing foundation. Then implement authentication/project permissions, the job engine and one complete vertical slice 
(for example, Site Audit) from UI through API, worker, database, history and tests. Once that end-to-end pattern works, 
reuse it module by module. All third-party metrics must be real, source-labelled and timestamped; if a provider has not 
been connected, show “Not connected” or “No data available,” never fabricated metrics. 