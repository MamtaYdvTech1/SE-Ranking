import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie, hashPassword } from '@/lib/server/auth';
import { randomBytes } from 'node:crypto';

export const dynamic = 'force-dynamic';

function mapRoleToAccountType(role: string): 'Owner' | 'Manager' | 'Client' | 'Admin' {
  const normalized = role.toUpperCase();
  if (normalized === 'OWNER' || normalized === 'SUPERADMIN') return 'Owner';
  if (normalized === 'ADMIN') return 'Admin';
  if (normalized === 'CLIENT') return 'Client';
  return 'Manager';
}

function mapAccountTypeToRole(accountType: string): string {
  const normalized = accountType.toUpperCase();
  if (normalized === 'CLIENT') return 'CLIENT';
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'OWNER') return 'OWNER';
  return 'MEMBER';
}

export async function GET(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const dbUsers = await prisma.user.findMany({
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

    const users = dbUsers.map((u) => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      accountType: mapRoleToAccountType(u.role),
      language: 'English',
      createdAt: u.createdAt.toISOString().split('T')[0],
      status: u.status,
    }));

    return NextResponse.json({
      success: true,
      users,
      totalSeats: Math.max(10, users.length + 2),
      usedSeats: users.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const callerRole = auth.user.role.toUpperCase();
    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN' && callerRole !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to add users.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, email, accountType, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || cleanEmail.split('@')[0];
    const userPassword = password || randomBytes(16).toString('hex') + 'A1!';
    const passwordHash = hashPassword(userPassword);
    const assignedRole = mapAccountTypeToRole(accountType || 'MEMBER');

    const created = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: fullName,
        firstName: firstName || null,
        lastName: lastName || null,
        role: assignedRole,
        status: 'active',
        passwordHash,
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

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      accountType: mapRoleToAccountType(u.role),
      language: 'English',
      createdAt: u.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        accountType: mapRoleToAccountType(created.role),
        language: 'English',
        createdAt: created.createdAt.toISOString().split('T')[0],
      },
      users: mappedUsers,
      usedSeats: mappedUsers.length,
      totalSeats: Math.max(10, mappedUsers.length + 2),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const callerRole = auth.user.role.toUpperCase();
    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN' && callerRole !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to edit users.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, firstName, lastName, email, accountType } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || existing.name;
    const assignedRole = accountType ? mapAccountTypeToRole(accountType) : existing.role;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: fullName,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
        role: assignedRole,
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

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      accountType: mapRoleToAccountType(u.role),
      language: 'English',
      createdAt: u.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        accountType: mapRoleToAccountType(updated.role),
        language: 'English',
        createdAt: updated.createdAt.toISOString().split('T')[0],
      },
      users: mappedUsers,
      usedSeats: mappedUsers.length,
      totalSeats: Math.max(10, mappedUsers.length + 2),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const callerRole = auth.user.role.toUpperCase();
    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN' && callerRole !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to delete users.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (id === auth.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    }).catch(async () => {
      // If cascade delete fails, set status to suspended
      await prisma.user.update({
        where: { id },
        data: { status: 'suspended' },
      });
    });

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.name || u.email.split('@')[0],
      email: u.email,
      accountType: mapRoleToAccountType(u.role),
      language: 'English',
      createdAt: u.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({
      success: true,
      users: mappedUsers,
      usedSeats: mappedUsers.length,
      totalSeats: Math.max(10, mappedUsers.length + 2),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

