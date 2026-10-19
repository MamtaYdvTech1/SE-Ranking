import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));
    const skip = (page - 1) * pageSize;

    const [totalRequests, sumCredits, totalCount, items] = await Promise.all([
      prisma.apiUsage.count(),
      prisma.apiUsage.aggregate({ _sum: { creditsUsed: true } }),
      prisma.apiUsage.count(),
      prisma.apiUsage.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRequests,
          totalCreditsUsed: sumCredits._sum.creditsUsed || 0,
        },
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch API usage' }, { status: 500 });
  }
}
