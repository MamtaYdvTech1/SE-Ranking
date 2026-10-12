/**
 * Server-side Project Authentication & Authorization Middleware
 * Verifies authenticated session, project existence, and project ownership
 */

import { NextRequest, NextResponse } from 'next/server';
import { Project, SearchEngineConfig } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from './auth';

export interface VerifiedProjectAccess {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  project: Project & { searchEngines?: SearchEngineConfig[] };
}

export type ProjectAuthResult =
  | { success: true; data: VerifiedProjectAccess; error?: never }
  | { success: false; error: NextResponse; data?: never };

/**
 * Validates request authentication and project ownership.
 * Returns either `{ success: true, data: { user, project } }` or `{ success: false, error: NextResponse }`.
 */
export async function verifyProjectAccess(
  req: NextRequest,
  projectIdOrDomain: string
): Promise<ProjectAuthResult> {
  try {
    // 1. Authenticate user from session cookie or header
    let auth: any = await getAuthSession(req);
    if (!auth) {
      auth = await getSessionFromCookie();
    }

    if (!auth || !auth.user) {
      return {
        success: false,
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
      };
    }

    const user: any = auth.user;

    // 2. Lookup project by ID or domain
    const cleanId = decodeURIComponent(projectIdOrDomain || '').trim();
    if (!cleanId) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PROJECT_ID',
              message: 'Project ID is required.',
            },
          },
          { status: 400 }
        ),
      };
    }

    const project: any = await prisma.project.findFirst({
      where: {
        OR: [{ id: cleanId }, { domain: cleanId }],
        deletedAt: null,
      },
      include: {
        searchEngines: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found.',
            },
          },
          { status: 404 }
        ),
      };
    }

    // 3. Check ownership / IDOR authorization
    // Users can only access projects they own, unless global SUPERADMIN
    if (project.userId && project.userId !== user.id && user.role !== 'SUPERADMIN') {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Forbidden: You do not have permission to access this project.',
            },
          },
          { status: 403 }
        ),
      };
    }

    if (!project.userId && user.role !== 'SUPERADMIN') {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Forbidden: You do not have permission to access this project.',
            },
          },
          { status: 403 }
        ),
      };
    }

    return {
      success: true,
      data: {
        user,
        project,
      },
    };
  } catch (err: unknown) {
    console.error('verifyProjectAccess error:', err);
    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Internal authorization error.',
          },
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verifies that a sub-resource belongs to the specified project ID.
 */
export function verifyResourceBelongsToProject(
  resourceProjectId: string | null | undefined,
  expectedProjectId: string
): boolean {
  if (!resourceProjectId || !expectedProjectId) return false;
  return resourceProjectId === expectedProjectId;
}
