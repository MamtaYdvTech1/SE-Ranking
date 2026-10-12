import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/server/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: 'ws-main',
        name: 'SE Ranking Production Workspace',
        plan: 'Enterprise Pro',
        seatsUsed: members.length,
        maxSeats: 10,
        members,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name ? name.trim() : email.split('@')[0],
        passwordHash: 'pending_invitation',
        role: role || 'MEMBER',
        status: 'active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, member: newUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
