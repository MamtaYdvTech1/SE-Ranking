# Production Deployment & Operations Runbook

**Platform:** SE Ranking Next.js 16 (Turbopack) / React 19 / Prisma / PostgreSQL  
**Version:** 0.1.0  
**Security Standard:** Zero-Trust Authorization, Argon2id Password Hashing, CSRF/SSRF Protection, Multi-Tenant Isolation

---

## 1. Production Environment Variables

Configure these variables in your secure secret manager (e.g., Vercel Project Environment Variables, AWS Secrets Manager, or Doppler). **Never commit raw production values to Git.**

### 1.1 Database & Storage
| Variable | Type | Required | Description & Format |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Secret | **Yes** | Pooled connection string (PgBouncer port `6543`, `?pgbouncer=true`). Used by runtime queries. |
| `DIRECT_URL` | Secret | **Yes** | Direct connection string (PostgreSQL port `5432`). Required by Prisma CLI for migrations. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Optional | Supabase project endpoint (e.g., `https://<ref>.supabase.co`). |
| `SUPABASE_PROJECT_ID` | Secret | Optional | Supabase reference ID. |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Optional | Cloudflare account ID for R2 storage and edge caching. |
| `CLOUDFLARE_R2_BUCKET_NAME` | Config | Optional | Bucket name for report PDFs, client avatars, and exports. |

### 1.2 Authentication & Security
| Variable | Type | Required | Description & Format |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Secret | **Yes** | Minimum 32-character high-entropy secret for API bearer tokens. |
| `NEXTAUTH_SECRET` | Secret | **Yes** | Session cryptographic signing key. |
| `NEXT_PUBLIC_APP_URL` | Public | **Yes** | Canonical public URL (e.g., `https://app.yourdomain.com`). Prevents redirect poisoning. |
| `NODE_ENV` | Config | **Yes** | Set strictly to `production`. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Secret | Optional | Bot defense secret key for registration & login forms. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Public | Optional | Bot defense site key rendered in frontend widgets. |

### 1.3 SEO Data Providers & Telemetry
| Variable | Type | Required | Current Verified Status |
| :--- | :--- | :--- | :--- |
| `SERPER_API_KEY` | Secret | Optional | **VERIFIED ACTIVE (HTTP 200)** · Live Google SERP tracking & rankings. |
| `YEPAPI_KEY` | Secret | Optional | **CONFIGURED / BLOCKED (HTTP 402)** · Requires credit top-up at [yepapi.com/billing](https://yepapi.com/billing). |
| `OPENAI_API_KEY` | Secret | Optional | **VERIFIED ACTIVE (HTTP 200)** · AI Search presence & brand citation tracking (33 models). |
| `GEMINI_API_KEY` | Secret | Optional | **UNCONFIGURED** · Optional for Google AI Mode tracking. Returns clean `ENGINE_UNCONFIGURED`. |
| `GOOGLE_PAGESPEED_API_KEY` | Secret | Optional | **VERIFIED ACTIVE (HTTP 200)** · Technical audit lab diagnostics. Operates with public quota if omitted. |

---

## 2. Database Migrations Deployment

The repository uses Prisma ORM connected to PostgreSQL. All schema changes must be applied cleanly without destructive operations on existing data.

### 2.1 Pre-Deployment Verification
```bash
# 1. Validate the Prisma schema syntax
npx prisma validate

# 2. Check migration status against the target production database
npx prisma migrate status
```

### 2.2 Production Migration Execution
In your deployment pipeline (or via secure runner), apply migrations using the direct database connection:
```bash
# Apply all pending migrations safely to PostgreSQL
npx prisma migrate deploy

# Generate the type-safe Prisma Client bundle
npx prisma generate
```

> [!IMPORTANT]
> Always execute `npx prisma migrate deploy` using `DIRECT_URL` (port 5432), not the PgBouncer pooler (port 6543), as connection poolers can terminate long-running migration transactions prematurely.

---

## 3. Secure Super-Admin Bootstrap

Admin accounts are strictly guarded and cannot be self-registered via public forms. To bootstrap or rotate an initial platform superadmin, execute the hardened bootstrap script:

```bash
# Pass explicit target credentials via CLI
npx tsx scripts/bootstrap-superadmin.ts "admin@yourdomain.com" "YourStrongPassword123!" "Platform Lead"

# Or configure temporary environment variables in your secure execution container:
SUPERADMIN_EMAIL="admin@yourdomain.com" \
SUPERADMIN_PASSWORD="YourStrongPassword123!" \
npx tsx scripts/bootstrap-superadmin.ts
```

### 3.1 Bootstrap Security Guardrails
1. **Argon2id Hashing:** Password hashes use `$argon2id$v=19$m=19456,t=2,p=1` memory-hard parameters. Plaintext passwords are never logged or stored.
2. **Minimum Complexity:** Passwords shorter than 12 characters are immediately rejected.
3. **Non-Default Credentials:** Script terminates with an error if credentials are omitted.
4. **Approval Invariant:** Bootstrap user is created with `role: "SUPERADMIN"`, `status: "approved"`, and enterprise tool access.

---

## 4. Backup, Point-In-Time Recovery & Rollback Strategy

### 4.1 Automated Database Snapshots (Supabase)
- **Daily Full Backups:** Supabase automatically creates daily snapshots retained for 7 to 30 days depending on plan tier.
- **Point-In-Time Recovery (PITR):** Enable WAL (Write-Ahead Log) archiving in the Supabase Dashboard under `Database -> Backups` to allow rolling back to any specific minute.

### 4.2 Manual Logical Backups (Pre-Release Snapshot)
Before deploying significant schema or data structure releases, capture a full logical backup:
```bash
# Dump full database to compressed custom format
pg_dump "$DIRECT_URL" -F c -b -v -f "backup_$(date +%Y%m%d_%H%M%S).dump"
```

### 4.3 Database Restoration Procedure
In the event of an unintended migration failure:
```bash
# Restore specific tables or entire database from compressed archive
pg_restore -d "$DIRECT_URL" --clean --if-exists -v "backup_20261019_120000.dump"
```

### 4.4 Application Rollback
- **Vercel / Edge Host:** Revert instantly to the previous deployment SHA via `Vercel Dashboard -> Deployments -> Instant Rollback`.
- **Database Schema Compatibility:** Ensure all schema modifications follow the **Expand/Contract** pattern (never drop active columns until the new code has been deployed and verified).

---

## 5. SEO Integrations Telemetry & Runbook

Inspect and test all external SEO data providers via the protected admin console at:
`https://app.yourdomain.com/admin/providers`

### 5.1 Provider Operating Status Summary

| Provider | Telemetry Status | Live Test Endpoint | Action to Restore / Maintain |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Pool** | 🟢 `HEALTHY` (15-40ms) | `SELECT 1` ping | Monitored automatically via Prisma ORM pool. |
| **Serper.dev** | 🟢 `HEALTHY` | `POST https://google.serper.dev/search` | Active. Tracks live positions for project keywords. |
| **YepAPI** | 🔴 `BLOCKED_CREDITS` | `POST https://api.yepapi.com/v1/keywords` | Balance $0.00. Recharge credits at [yepapi.com/billing](https://yepapi.com/billing). |
| **Google PageSpeed** | 🟢 `HEALTHY` | `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed` | Active. Runs technical Lighthouse audits. |
| **OpenAI** | 🟢 `HEALTHY` | `GET https://api.openai.com/v1/models` | Active. Authenticated with 33 models. |
| **Google Gemini** | ⚪ `NOT_CONFIGURED` | Google Generative Language API | Optional. Add `GEMINI_API_KEY` to enable Google AI Mode. |

---

## 6. Production Build & Deployment Checklist

Execute these checks before promoting code to production:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint check
npx eslint src/lib/server/auth.ts src/lib/server/projectAuth.ts src/app/admin/providers/page.tsx

# 3. Unit & Integration test suite (509 tests)
npm run test

# 4. Production build bundle
npm run build

# 5. Playwright real browser verification (Google Chrome)
npx tsx scripts/real-browser-test-suite.ts
```

All 5 commands must return exit code `0` before deployment.
