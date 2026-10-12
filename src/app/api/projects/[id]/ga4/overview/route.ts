import { NextRequest, NextResponse } from 'next/server';
import { Ga4OverviewDto } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const integration = await prisma.projectIntegration.findFirst({
      where: { projectId: id, provider: 'ga4', status: 'connected' },
    });

    if (!integration) {
      return NextResponse.json({
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: null,
      });
    }

    let config: any = {};
    try {
      if (integration.config) config = JSON.parse(integration.config);
    } catch {}

    const data: Ga4OverviewDto = {
      totalSessions: config.totalSessions || 0,
      totalActiveUsers: config.totalActiveUsers || 0,
      averageEngagementRate: config.averageEngagementRate || 0,
      totalConversions: config.totalConversions || 0,
      totalRevenue: config.totalRevenue || 0,
      dailySeries: config.dailySeries || [],
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Failed to fetch GA4 overview',
      },
      { status: 500 }
    );
  }
}
