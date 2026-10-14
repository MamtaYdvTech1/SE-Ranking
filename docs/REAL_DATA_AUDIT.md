# Real-Data Audit (2026-10-14)

Goal: every feature works with real data, no fabricated numbers. UI stays as-is.

**Env status:** DB, YepAPI, Serper, SE Ranking API, OpenAI, SMTP and Google OAuth keys are set. Missing: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and the Cloudflare R2 keys. `NODE_ENV=production` is set in `.env`.
**DB (live):** 4 users, 8 projects, 97 keywords, 10 audit pages, 356 backlinks (mostly seeded fakes), **0 ranking history rows**.

## Already real
- Login, signup, sessions, Google login, password reset email
- Create project (DNS check, YepAPI keyword metrics)
- Keyword Research dashboard (YepAPI)
- Keyword suggestions
- Rank-check pipeline (`/api/projects/[id]/rankings/check` → YepAPI/Serper)
- Rankings summary and history (from the DB)
- Website crawler (`/api/website-audit/scan`)
- Competitor list, add and discovery
- Reports list
- Locations / GBP posts CRUD
- Insights rules
- R2 logo upload

## Fix plan (priority order)

### P0 — Security / data integrity
1. Add auth and project-ownership checks to these routes:
   - `rankings/check`
   - `locations`
   - `ga4/*`
   - `gbp/posts`
   - `agency-pack/*`
   - `smm/*`
   - `users`
   - `admin/activity-logs`
   - `export`
2. Stop writing fake backlinks to the DB:
   - `seedProjectBacklinksIfEmpty` in `backlink.service.ts`, called from `projects/route.ts` and `backlinks/route.ts`
   - Purge the existing seeded rows.
3. Stop saving mock AI Search results as real ones:
   - `lib/seo/provider.ts:89-126`
   - `ai-search/analyze/route.ts`
4. Rank check must report real failures and only update `lastRankingCheckAt` on success.
5. Fix the cron `OR {}` bug that rechecks every project daily.

### P1 — Core SEO modules on real data
6. **Rank Tracker:**
   - Wire the `/api/v1` rankings/check to the real pipeline.
   - Fix the trend query that reads the oldest rows.
   - Replace the projects-list sine-wave chart with RankingHistory.
   - Remove the hardcoded "High-Potential Keywords" list and the overview fallbacks.
7. **Backlinks:**
   - Feed all backlink tabs from YepAPI backlinks, cached in the DB.
   - Delete `mockBacklinkData.ts`.
   - Remove the totals ×12/×8 multipliers.
8. **Site Audit:**
   - Route `/projects/[id]/audit` to the real crawler.
   - Remove the fallback fake audit, link status 200 and fake Core Web Vitals (use the PageSpeed API or show "n/a").
   - Wire On-Page checker to `/api/projects/[id]/on-page`.
9. **Competitors:**
   - Implement the missing `/api/v1` competitor routes.
   - Replace the SERP, Share of Voice, Visibility and Added tabs with data from the DB and rank checks.
   - Replace the Competitive Research length-based metrics with `/api/seo/competitors`.
10. **Keyword tools:** Search Volume Checker, Keyword Grouper and Autocomplete should use YepAPI / Google Suggest.
11. **AI Results Tracker:**
    - Call the existing real POST route (Serper + OpenAI).
    - Feed the Rankings, Competitors and Sources views from the DB.

### P2 — Google integrations (needs Google Cloud setup)
12. **GA4 + Search Console:** real OAuth with the `analytics.readonly` and `webmasters.readonly` scopes, token storage, and Data API / Search Analytics API sync. Remove the formula-generated traffic.
13. **Google Business Profile:** needs Google API access approval. Until then, show "not connected" instead of hardcoded insights and reviews.

### P3 — Remaining
14. AI content draft should actually call OpenAI. Content brief should use real SERP data.
15. Persist to the DB, instead of memory or a public JSON file:
    - Users/admin
    - Activity logs
    - Whitelabel settings
    - Lead widgets
    - Report builder
16. Remove the SMM, report-chart, marketing-plan and export fake data, and the SEO Potential 26/58 fallback.
17. Delete dead code: `lib/audit/crawler.ts`, `seed-project-data.service.ts`, `rankingsRepository.ts`.

Note: public marketing pages (`/keyword-tool`, `/backlink-checker` and others) use demo data by design. They are left as-is unless requested.
