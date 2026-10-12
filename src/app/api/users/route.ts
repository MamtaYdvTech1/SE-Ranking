import { NextRequest, NextResponse } from 'next/server';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  accountType: 'Owner' | 'Manager' | 'Client' | 'Admin';
  language?: string;
  allowManageNotifications?: boolean;
  notifications?: Record<string, boolean>;
  createdAt: string;
}

let usersStore: UserRecord[] = [
  {
    id: '1',
    name: 'Account Owner',
    email: 'owner@seranking.com',
    accountType: 'Owner',
    language: 'English',
    createdAt: '2026-09-01',
  },
];

export async function GET(req: NextRequest) {
  const cookieEmail = req.cookies.get('user_email')?.value;
  const cookieName = req.cookies.get('user_name')?.value;

  if (cookieEmail && usersStore.length > 0) {
    const email = decodeURIComponent(cookieEmail);
    const name = cookieName ? decodeURIComponent(cookieName) : email.split('@')[0];
    usersStore[0].email = email;
    usersStore[0].name = name;
  }

  return NextResponse.json({
    success: true,
    users: usersStore,
    totalSeats: 3,
    usedSeats: usersStore.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, email, accountType, language, allowManageNotifications, notifications } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

    const newUser: UserRecord = {
      id: String(usersStore.length + 1),
      name: fullName,
      email: email.trim(),
      accountType: accountType === 'CLIENT' ? 'Client' : 'Manager',
      language: language || 'English',
      allowManageNotifications: Boolean(allowManageNotifications),
      notifications: notifications || {},
      createdAt: new Date().toISOString().split('T')[0],
    };

    usersStore.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      users: usersStore,
      usedSeats: usersStore.length,
      totalSeats: 3,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, firstName, lastName, email, accountType, language, allowManageNotifications, notifications } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = usersStore[index];
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || existing.name;

    usersStore[index] = {
      ...existing,
      name: fullName,
      email: email ? email.trim() : existing.email,
      accountType: accountType === 'CLIENT' ? 'Client' : accountType === 'MANAGER' ? 'Manager' : existing.accountType,
      language: language || existing.language,
      allowManageNotifications: allowManageNotifications !== undefined ? Boolean(allowManageNotifications) : existing.allowManageNotifications,
      notifications: notifications || existing.notifications,
    };

    return NextResponse.json({
      success: true,
      user: usersStore[index],
      users: usersStore,
      usedSeats: usersStore.length,
      totalSeats: 3,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id && id !== '1') {
      usersStore = usersStore.filter((u) => u.id !== id);
    }

    return NextResponse.json({
      success: true,
      users: usersStore,
      usedSeats: usersStore.length,
      totalSeats: 3,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

