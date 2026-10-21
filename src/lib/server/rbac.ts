/**
 * Enterprise Role-Based Access Control (RBAC) Engine
 * Strict server-side permission enforcement across all API routes and resources.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, getSessionFromCookie } from './auth';

export type Permission =
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'projects.create'
  | 'projects.read'
  | 'projects.update'
  | 'projects.delete'
  | 'audit.run'
  | 'keywords.manage'
  | 'ranktracking.manage'
  | 'reports.create'
  | 'reports.export'
  | 'integrations.manage'
  | 'settings.manage';

export type EnterpriseRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SEO_MANAGER'
  | 'SEO_USER'
  | 'CLIENT';

export const ROLE_PERMISSIONS: Record<EnterpriseRole, Permission[]> = {
  SUPER_ADMIN: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.delete',
    'audit.run',
    'keywords.manage',
    'ranktracking.manage',
    'reports.create',
    'reports.export',
    'integrations.manage',
    'settings.manage',
  ],
  ADMIN: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.delete',
    'audit.run',
    'keywords.manage',
    'ranktracking.manage',
    'reports.create',
    'reports.export',
    'integrations.manage',
    'settings.manage',
  ],
  SEO_MANAGER: [
    'users.read',
    'projects.create',
    'projects.read',
    'projects.update',
    'audit.run',
    'keywords.manage',
    'ranktracking.manage',
    'reports.create',
    'reports.export',
  ],
  SEO_USER: [
    'projects.read',
    'projects.update',
    'audit.run',
    'keywords.manage',
    'ranktracking.manage',
    'reports.create',
    'reports.export',
  ],
  CLIENT: [
    'projects.read',
    'reports.export',
  ],
};

/**
 * Normalizes system roles to standard enterprise roles
 */
export function normalizeRole(rawRole: string | undefined | null): EnterpriseRole {
  const r = (rawRole || '').toUpperCase().trim();
  if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN' || r === 'OWNER') {
    return 'SUPER_ADMIN';
  }
  if (r === 'ADMIN') {
    return 'ADMIN';
  }
  if (r === 'SEO_MANAGER' || r === 'MANAGER') {
    return 'SEO_MANAGER';
  }
  if (r === 'CLIENT') {
    return 'CLIENT';
  }
  return 'SEO_USER';
}

/**
 * Validates if a role possesses a specific permission
 */
export function hasRolePermission(
  rawRole: string | undefined | null,
  permission: Permission,
  options?: { canCreateProject?: boolean }
): boolean {
  const role = normalizeRole(rawRole);

  // Special grant: SEO_USER with explicit canCreateProject capability
  if (permission === 'projects.create' && role === 'SEO_USER' && options?.canCreateProject) {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export interface RbacAuthResult {
  auth: {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      status: string;
      canCreateProject?: boolean;
      canCreateClient?: boolean;
    };
    session: any;
  } | null;
  error: NextResponse | null;
  status: number;
}

/**
 * Enforces authentication, account status, and specific permission on an incoming request.
 * Returns { auth, error: null, status: 200 } or { auth: null, error: NextResponse, status: 401 | 403 }
 */
export async function requirePermission(
  req: Request | NextRequest,
  permission: Permission
): Promise<RbacAuthResult> {
  // 1. Authenticate session
  let auth = await getAuthSession(req);
  if (!auth) {
    auth = await getSessionFromCookie();
  }

  if (!auth || !auth.user) {
    return {
      auth: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
          },
        },
        { status: 401 }
      ),
      status: 401,
    };
  }

  const user = auth.user;

  // 2. Enforce active account status
  const status = (user.status || '').toLowerCase();
  if (status !== 'active' && status !== 'approved') {
    return {
      auth: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Account ${status}: Access is disabled. Please contact your platform administrator.`,
          },
        },
        { status: 403 }
      ),
      status: 403,
    };
  }

  // 3. Enforce granular permission
  const allowed = hasRolePermission(user.role, permission, {
    canCreateProject: user.canCreateProject,
  });

  if (!allowed) {
    return {
      auth: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Role "${user.role}" does not have "${permission}" permission.`,
          },
        },
        { status: 403 }
      ),
      status: 403,
    };
  }

  return {
    auth,
    error: null,
    status: 200,
  };
}
