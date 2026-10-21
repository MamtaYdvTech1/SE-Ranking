# SE Ranking Enterprise Platform — Security & Reliability Review

**Status:** Complete  
**Standards Followed:** OWASP Top 10 API Security, CWE Top 25, PDF Section 20 Checklist  

---

## 1. Authentication & Session Security

1. **Password Storage**: Plaintext passwords are NEVER stored. The application uses Argon2id (`@node-rs/argon2`) with memory cost = 19,456 KiB, time cost = 2 iterations, and 32-byte output length. Backward compatibility with legacy SHA-256/scrypt salt:hash formats is maintained safely via constant-time comparison (`timingSafeEqual`).
2. **Session Cookies**: Session cookies (`seranking_session`) are cryptographically HMAC-SHA256 signed. The server validates both the token payload and the HMAC signature. Any tampered or unsigned cookie is rejected with HTTP 401.
3. **Session Revocation Policy**: When an administrator deactivates, suspends, or demotes a user, `invalidateAllSessionsForUser(userId)` is executed:
   - Purges all cached session entries in the high-speed memory cache.
   - Deletes all database records in `prisma.session` where `userId = user.id`.
   - The user's active browser window receives HTTP 401 / 403 on the next API call or page navigation.
4. **Brute Force Protection**: IP and identifier sliding-window rate limiting (`checkAuthRateLimit`) is active on `/api/auth/login` and `/api/auth/register`, returning HTTP 429 with `Retry-After` header when thresholds are exceeded.

---

## 2. Authorization & Multi-Tenant IDOR Defense

1. **Deny-by-Default Architecture**: All project data endpoints use `verifyProjectAccess(req, projectId)`.
2. **Role Boundaries**:
   - `ADMIN` & `SUPERADMIN`: Platform-wide administrative control, global provider credentials, user management, audit logs.
   - `OWNER` / `SEO_USER` / `MEMBER`: Access strictly quarantined to projects they own (`project.userId === user.id`) or where they have been assigned as a member (`ProjectMember`).
   - Guessed IDs or URL tampering across projects immediately return HTTP 403 Forbidden.
3. **Creation Safeguards**:
   - `canCreateProject` and `canCreateClient` flags are checked server-side. SEO Users cannot create new projects unless explicitly granted this capability by an Admin.
   - `CLIENT` / Viewer role accounts have read-only access and are prevented from triggering crawls or quota consumption.
4. **Self-Protection & Last-Admin Invariant**:
   - An administrator cannot demote, suspend, or deactivate their own active account (`assertAdminCanModifyUser`).
   - The last remaining active Administrator in the system cannot be deleted or demoted.

---

## 3. Crawler Security & SSRF Protection

1. **Strict Target Validation**: The site audit HTTP fetcher validates every target hostname and IP before connection.
2. **Blocked IP Ranges**:
   - Loopback: `127.0.0.0/8`, `::1`
   - Private networks (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-local: `169.254.0.0/16`
   - Cloud metadata endpoints: `169.254.169.254`, `metadata.google.internal`
3. **Protocol Restriction**: Only `http:` and `https:` schemes are permitted. File, FTP, Gopher, and internal schemes are rejected.
4. **Redirect Re-Validation**: Followed HTTP redirects re-run the complete IP and hostname security validation to prevent DNS rebinding or redirect-based SSRF.

---

## 4. Secret Protection & Injection Defense

1. **Redacted Secrets**: Provider API keys, OAuth client secrets, and database connection strings are never exposed in JSON responses or console logs. `redactSecret()` outputs only the first and last 4 characters (e.g., `166e...35f4`).
2. **CSV Formula Injection**: CSV export generation escapes leading trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single quotes (`'`) to prevent formula execution in spreadsheet applications.
3. **Database Injection Defense**: All database queries are executed via Prisma ORM parameterized queries or strict type-checked query parameters, preventing SQL injection.
