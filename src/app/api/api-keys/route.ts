import { NextRequest, NextResponse } from 'next/server';

// Default Data API key matching screenshot: 12856b00-b1c7-f25b-68b9-294c542738ac
let memoryKeys = [
  {
    id: 'key-default-1',
    name: 'Data API Key',
    key: '12856b00-b1c7-f25b-68b9-294c542738ac',
    created: 'Sep 25, 2026',
    lastUsed: 'Oct 02, 2026',
    status: 'active',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    keys: memoryKeys,
    totalCredits: 100000,
    creditsLeft: 100000,
    expiresAt: 'Oct 07, 2026',
    walletBalance: 0,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name?.trim() || 'New Data API Key';

    const randomUuid = crypto.randomUUID();
    const newKey = {
      id: `key-${Date.now()}`,
      name,
      key: randomUuid,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastUsed: 'Just now',
      status: 'active',
    };

    memoryKeys.unshift(newKey);

    return NextResponse.json({ success: true, key: newKey });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate API key';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      memoryKeys = memoryKeys.filter((k) => k.id !== id);
    }

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete API key';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
