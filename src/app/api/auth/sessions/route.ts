import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, invalidateAllOtherSessions } from '@/lib/server/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: auth.user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent || 'Unknown Device',
      ipAddress: s.ipAddress || '127.0.0.1',
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === auth.session.id,
    }));

    return NextResponse.json({ success: true, sessions: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list sessions' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, sessionId } = body;

    if (action === 'terminate_all_others') {
      const count = await invalidateAllOtherSessions(auth.user.id, auth.session.sessionToken);
      return NextResponse.json({
        success: true,
        message: `Terminated ${count} other active session(s).`,
      });
    }

    if (sessionId) {
      if (sessionId === auth.session.id) {
        return NextResponse.json(
          { error: 'Cannot terminate current session via this action. Use logout instead.' },
          { status: 400 }
        );
      }

      await prisma.session.deleteMany({
        where: {
          id: sessionId,
          userId: auth.user.id,
        },
      });

      return NextResponse.json({ success: true, message: 'Session terminated.' });
    }

    return NextResponse.json({ error: 'Invalid action or sessionId.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to manage sessions' }, { status: 500 });
  }
}
