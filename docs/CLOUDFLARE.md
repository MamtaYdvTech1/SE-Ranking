# Cloudflare Integration Suite — SE Ranking

SE Ranking includes complete, production-grade integration with the **Cloudflare Ecosystem**, providing high-performance global CDN edge acceleration, zero-egress fee cloud object storage with Cloudflare R2, privacy-preserving bot detection with Cloudflare Turnstile, Anycast DNS queries via 1.1.1.1 DoH, and instant edge cache purging.

---

## 1. Architecture & Capabilities

```
+-------------------------------------------------------------------------+
|                        SE Ranking Studio Core                           |
+--------------------+---------------------+--------------------+---------+
                     |                     |                    |
        +------------v------------+        |         +----------v----------+
        |   Cloudflare R2 Storage |        |         | Cloudflare Turnstile|
        | - Reports & PDF Exports |        |         | - Login & Signup    |
        | - White Label Logos     |        |         | - Forgot Password   |
        | - S3 API Compatibility  |        |         | - Privacy Bot Shield|
        +-------------------------+        |         +---------------------+
                     |                     |                    |
        +------------v------------+        |         +----------v----------+
        |   1.1.1.1 Anycast DNS   |        |         | Edge Cache Purge    |
        | - Real-time DNS lookups |        |         | - Invalidate URLs   |
        | - CNAME Verification    |        |         | - Zone-wide refresh |
        | - White Label Inspector |        |         | - Anycast Edge CDNs |
        +-------------------------+        |         +---------------------+
                                           |
                                +----------v----------+
                                | Edge Security Audit |
                                | - CF-Ray & Datacenter
                                | - TLS 1.3 & HSTS    |
                                | - Proxy Detection   |
                                +---------------------+
```

---

## 2. Environment Configuration

The following variables configure the Cloudflare Suite in `.env`:

```env
# ==============================================================================
# Cloudflare API & R2 Storage Integration
# ==============================================================================
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Cloudflare R2 Object Storage (S3 API Compatible)
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
CLOUDFLARE_R2_S3_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=seranking
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your_account_id.r2.cloudflarestorage.com/seranking

# Cloudflare Turnstile Bot Defense
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

---

## 3. Features & APIs

### A. Cloudflare R2 Object Storage
- **S3 Client Implementation**: `@aws-sdk/client-s3` connects to Cloudflare R2's S3-compatible API endpoint.
- **Resilient Fallback Mode**: If network connectivity or credentials are temporarily unavailable during offline development, files are transparently persisted to `public/uploads/` so the application never breaks.
- **REST Endpoints**:
  - `GET /api/cloudflare/r2` — List objects in bucket, total count, and storage size.
  - `POST /api/cloudflare/r2/upload` — Direct multipart upload (supports logos, PDF reports, avatars).
  - `DELETE /api/cloudflare/r2?key={key}` — Delete objects from R2.

### B. Cloudflare Turnstile Bot Defense
- **Interactive Component**: `<CloudflareTurnstile onVerify={(token) => ...} />`
- **Official Script**: Dynamically loads `challenges.cloudflare.com/turnstile/v0/api.js`.
- **Integrated Pages**:
  - `/login` — Protects sign-in attempts from brute-force bot assaults.
  - `/forgot` — Protects password reset from automated abuse.
  - `/signup` — Shields registration from bot spam.
- **REST Endpoints**:
  - `POST /api/cloudflare/turnstile` — Validates tokens with Cloudflare Turnstile verification API.
  - `POST /api/auth/verify-captcha` — Unified verification handling both Turnstile and Google reCAPTCHA.

### C. Cloudflare 1.1.1.1 Anycast DNS & White-Label CNAME
- **Global Anycast DNS**: Queries DNS records (A, AAAA, CNAME, TXT, MX, NS) in real-time via Cloudflare 1.1.1.1 DNS-over-HTTPS.
- **White Label Verification**: Validates whether agency custom domains (e.g., `rankings.agency.com`) correctly resolve to `cname.seranking.com`.
- **REST Endpoints**:
  - `GET /api/cloudflare/dns?domain={domain}&type=ALL` — Query all DNS records.
  - `GET /api/cloudflare/dns?domain={domain}&checkWhiteLabel=true` — Validate white label CNAME.
  - `POST /api/cloudflare/dns` — Create/simulate DNS records.

### D. Cloudflare Edge Cache Purge
- **Edge Invalidation**: Clears cached assets across Cloudflare's global Anycast nodes in <150ms.
- **Purge Modes**:
  - Purge Specific URLs (e.g. updated report links, CSS bundles).
  - Purge Everything (Zone-wide edge cache reset).
- **REST Endpoint**:
  - `POST /api/cloudflare/purge` — Trigger edge cache purge.

### E. Cloudflare Edge Security Audit
- **Inspection Engine**: Evaluates any project website for Cloudflare proxy status, edge datacenter IATA code (e.g., BOM, LHR, SFO), SSL/TLS cipher, HSTS, and HTTP/3 support.
- **REST Endpoint**:
  - `GET /api/cloudflare/security?domain={domain}` — Run security and CDN audit.

---

## 4. Cloudflare Management Studio UI

Access the interactive management suite at:
- **Settings Tab**: Navigate to `/settings` and select **Cloudflare Suite** on the sidebar.
- **Direct Route**: Navigate to `/settings/cloudflare` or `/integrations/cloudflare`.
- **Integrations Hub**: In **Settings -> Integrations**, Cloudflare is listed with 1-click management.

---

## 5. Deployment with Cloudflare Pages / Workers

Configuration is provided in [`wrangler.toml`](file:///d:/SE-Ranking-main/SE-Ranking-main/wrangler.toml).

To deploy:
```bash
# Preview build locally with Wrangler
npx wrangler pages dev .next

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=se-ranking-studio
```
