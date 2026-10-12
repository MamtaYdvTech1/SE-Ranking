import { NextRequest, NextResponse } from 'next/server';
import { Ga4ConnectionDto } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const integration = await prisma.projectIntegration.findFirst({
      where: { projectId: id, provider: 'ga4' },
    });

    let config: any = {};
    try {
      if (integration?.config) config = JSON.parse(integration.config);
    } catch {}

    const data: Ga4ConnectionDto = {
      propertyIdentifier: integration && integration.status === 'connected' ? (config.propertyId || integration.accountName || 'Connected') : '',
      syncStatus: integration && integration.status === 'connected' ? 'Active' : 'Disconnected',
      lastSyncedAt: integration?.lastSyncedAt?.toISOString() || null,
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
        message: error?.message || 'Failed to fetch GA4 status',
      },
      { status: 500 }
    );
  }
}
