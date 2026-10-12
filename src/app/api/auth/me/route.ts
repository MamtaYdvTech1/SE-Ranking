import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, clearSessionCookie } from '@/lib/server/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);

    if (!auth || !auth.user) {
      const response = NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        session: null,
      });
      return clearSessionCookie(response);
    }

    const userObj = auth.user as any;
    const projectsCount = userObj._count?.projects ?? 0;

    return NextResponse.json({
      success: true,
      user: {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name || userObj.email.split('@')[0],
        firstName: userObj.firstName || '',
        lastName: userObj.lastName || '',
        avatarUrl: userObj.avatarUrl || null,
        role: userObj.role || 'OWNER',
        status: userObj.status || 'active',
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
        lastLoginAt: userObj.lastLoginAt,
        projectsCount,
      },
      session: {
        id: auth.session.id,
        expiresAt: auth.session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
