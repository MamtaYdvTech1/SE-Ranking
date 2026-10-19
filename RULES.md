# System & Architectural Rules: SE-Ranking Production Platform

## 1. Zero Synthetic / Fake Data Principle
- Every number, table row, graph point, and status in the Admin and internal SaaS modules MUST come from the real PostgreSQL database via Prisma or verified live third-party providers.
- Never write fake rows to the database. Never display fake multipliers or hardcoded fallback metrics.
- Unconfigured integrations or exhausted quotas must be transparently reported as "Unconfigured" or "Quota Blocked (HTTP 402)", never spoofed with artificial data.

## 2. Server-Side Security & Access Control
- Every route handler and API endpoint MUST authenticate using cryptographically signed sessions (`seranking_session`) or Bearer tokens.
- Deactivated or suspended users MUST have their active sessions invalidated immediately in both database and cache.
- Role-based authorization:
  - `OWNER` / `ADMIN` / `SUPERADMIN`: full administrative access, user management, provider credentials, global audit logs.
  - `SEO_USER`: access restricted strictly to explicitly assigned projects. Attempting to view or mutate another project's data via URL tampering or guessed IDs must return 403 Forbidden.
- Rate limiting: protect login and mutation endpoints against brute-force attacks.

## 3. Data Integrity & Safeguards
- **Self-Protection**: An administrator cannot deactivate, suspend, or demote their own account.
- **Last-Admin Safeguard**: The system cannot demote or delete the last remaining active Administrator.
- **Optimistic Locking**: Every mutation on critical records (e.g. Users, Projects) checks version tokens or update timestamps to prevent concurrent edit clobbering.
- **Audit Logging**: Every administrative action (create, update role, toggle status, invite, assign project, force logout, soft delete) must record: `actorId`, `actorEmail`, `action`, `entity`, `entityId`, `beforeJson`, `afterJson`, `ipAddress`, and UTC timestamp.

## 4. UI/UX Design System Standards
- Distinctive, award-level dark/light aesthetics (Obsidian `#090d16` canvas, cyber-emerald `#10b981`, electric-violet `#8b5cf6`, and warning-amber `#f59e0b` accents). No generic boilerplate blue.
- Consistent 8px spacing grid, responsive across 360px to 1920px.
- Accessibility: Focus rings, ARIA labels, semantic HTML, WCAG AA contrast, and `prefers-reduced-motion` compliance.
- 4 Mandatory Screen States: Every data-driven screen must have **Loading** (skeleton loader), **Empty** (clear zero-state), **Error** (clear message + retry button), and **Success** (clean, real data view).
