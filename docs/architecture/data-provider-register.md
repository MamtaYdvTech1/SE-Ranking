# SE Ranking Enterprise Platform — Data Provider Register

**Audit Date:** October 2026  
**Reference:** Technical Specification Page 11 & Section 16 (Integration Registry)  

---

## 1. Provider Inventory & Operational Status

| Provider | Purpose | Environment Key | Status | Rate Limits & Quotas | Licensing & Storage Policy |
|---|---|---|---|---|---|
| **Serper.dev** | Live Google SERP rankings, URL detection, position tracking | `SERPER_API_KEY` | `ACTIVE & HEALTHY` | 10 req/s · 2,500 monthly queries | Permitted to store historical keyword position snapshots. |
| **Google PageSpeed Insights v5** | Lighthouse lab metrics, Core Web Vitals (LCP, CLS, INP, TTFB, FCP) | `GOOGLE_PAGESPEED_API_KEY` (or public) | `ACTIVE & HEALTHY` | 25,000 queries / day with API key | Permitted to store diagnostics for audited pages. |
| **OpenAI API** | AI search brand presence, GEO citations, structured content ideation | `OPENAI_API_KEY` | `ACTIVE & HEALTHY` | Standard Organization RPM / TPM | Permitted to store prompt responses and brand citation URLs. |
| **YepAPI / DataForSEO** | Keyword volume, CPC, backlink graph, competitor discovery | `YEPAPI_KEY` / `DATAFORSEO_API_KEY` | `BLOCKED_CREDITS (HTTP 402)` | Pay-per-query credits | Account balance is $0.00. Top up at `yepapi.com` or `dataforseo.com` to refresh index. |
| **Gmail SMTP** | Password resets, user invitations, audit report email notifications | `SMTP_USER`, `SMTP_PASS` | `CONFIGURED` | Gmail SMTP daily send quota | Sender address: `SE Ranking Studio <itsurya9930@gmail.com>`. |
| **Cloudflare R2** | Private PDF/CSV reports, white-label client logos, exported files | `CLOUDFLARE_R2_*` | `CONFIGURED` | S3-compatible API | Private bucket `seranking` with signed expiring URLs. |
| **Supabase PostgreSQL** | Primary relational database, session store, audit logs, rankings | `DATABASE_URL`, `DIRECT_URL` | `ACTIVE & HEALTHY` | PgBouncer pooler (Port 6543) | Schema: `seranking`. 37 core tables. |

---

## 2. Connection Test Endpoints

Admins can trigger safe, low-cost connection health tests via:
- `GET /api/admin/providers` — Returns connection health, masked keys, latency, and telemetry for all registered providers.
- `GET /api/admin/system-health` — Real-time ping for database, memory, and runtime uptime.

---

## 3. Quota & Fallback Handling Rules

1. **No Spoofed Fallbacks**: If a third-party provider fails or returns HTTP 402/429/500, the system returns a genuine error with actionable guidance. It NEVER manufactures fake numbers.
2. **Telemetry Tracking**: In-memory telemetry (`src/lib/server/providerTelemetry.ts`) tracks:
   - Total requests
   - Success count
   - Error count
   - Average latency (ms)
   - Last error code and timestamp
