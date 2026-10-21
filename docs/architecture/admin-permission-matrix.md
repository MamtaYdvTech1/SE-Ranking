# SE Ranking Enterprise Platform — Role & Permission Access Matrix

**Reference:** Technical Specification Page 2 & Section 3 (Roles and Access Control)  

---

## 1. Role Definitions

- **SUPERADMIN / ADMIN**: Full platform-wide administrative control. Manages company configuration, users, roles, global API credentials, job queues, provider settings, and system-wide audit logs.
- **OWNER**: Account owner of projects they created. Full access to their own projects, team members, and reports. Quarantined from modifying global platform settings or unassigned projects.
- **SEO_USER**: SEO specialist. Access strictly restricted to explicitly assigned projects. Can perform crawls, research, ranking checks, and reports within allocated monthly quotas.
- **CLIENT / VIEWER**: Read-only client access. Can view assigned project dashboards, charts, and generated reports. Cannot initiate crawls or modify project configuration.

---

## 2. Granular Capability Matrix

| Capability / Action | Admin | Account Owner | SEO User | Client | Server Endpoint Enforcement |
|---|:---:|:---:|:---:|:---:|---|
| **Manage Users & Roles** | Yes | No | No | No | `requireAdminAuth` (`/api/admin/users/*`) |
| **View All Projects Platform-Wide** | Yes | No (Own only) | No (Assigned only) | No (Assigned only) | `whereClause` filter in `/api/projects` |
| **Create Client / Project** | Yes | Yes | Only if granted (`canCreateProject`) | No | `canCreateProject` check in `/api/projects` POST |
| **Assign Team Members to Project** | Yes | Yes (Own projects) | No | No | `requireAdminAuth` in `/api/admin/projects/[id]/members` |
| **Run Technical Site Audit** | Yes | Yes | Yes (Within quota) | No | `verifyProjectAccess` + `checkAndIncrementQuota` |
| **Live Keyword & SERP Research** | Yes | Yes | Yes (Within quota) | No | `verifyProjectAccess` + `checkAndIncrementQuota` |
| **Manage Global API Credentials** | Yes | No | No | No | `requireAdminAuth` (`/api/admin/providers`) |
| **View Platform-Wide Spend & Usage** | Yes | No | No | No | `requireAdminAuth` (`/api/admin/api-usage`) |
| **Create & Export Project Reports** | Yes | Yes | Yes (Assigned projects) | No | `verifyProjectAccess` (`/api/reports`) |
| **Change Global Schedules & Jobs** | Yes | No | No | No | `requireAdminAuth` (`/api/admin/jobs`) |
| **View Admin Audit Logs** | Yes | No | No | No | `requireAdminAuth` (`/api/admin/activity-logs`) |
| **Deactivate / Suspend User** | Yes | No | No | No | `assertAdminCanModifyUser` (Self & last-admin protected) |

---

## 3. Server-Side Enforcement Rules

1. **Hiding a Button is NOT Security**: Every route handler checks the active session, account status (`active` / `approved`), user role, and project membership before returning or mutating data.
2. **Immediate Revocation**: Deactivating a user immediately clears their active sessions from cache and database.
3. **Optimistic Locking**: Every mutation on `User` and `Project` records checks the `version` integer to prevent concurrent clobbering.
4. **Audit Trail**: Every administrative action creates an immutable log in `AuditLog` table.
