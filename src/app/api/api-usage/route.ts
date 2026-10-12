import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const totalRequests = await prisma.apiUsage.count();
    const sumCredits = await prisma.apiUsage.aggregate({
      _sum: { creditsUsed: true },
    });
    const last = await prisma.apiUsage.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    return NextResponse.json({
      success: true,
      stats: {
        requests: totalRequests,
        creditsUsed: sumCredits._sum.creditsUsed || 0,
        lastRequest: last ? last.createdAt.toISOString() : null,
        currentMonth,
        status: 'active',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch API usage.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
