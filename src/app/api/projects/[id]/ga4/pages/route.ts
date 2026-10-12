import { NextRequest, NextResponse } from 'next/server';
import { Ga4PageRowDto, PaginatedList } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const integration = await prisma.projectIntegration.findFirst({
      where: { projectId: id, provider: 'ga4', status: 'connected' },
    });

    let pages: Ga4PageRowDto[] = [];
    if (integration && integration.config) {
      try {
        const config = JSON.parse(integration.config);
        if (Array.isArray(config.pages)) {
          pages = config.pages;
        }
      } catch {}
    }

    if (search) {
      pages = pages.filter((p) => p.landingPage.toLowerCase().includes(search));
    }

    const data: PaginatedList<Ga4PageRowDto> = {
      items: pages,
      totalCount: pages.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
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
        message: error?.message || 'Failed to fetch GA4 pages',
      },
      { status: 500 }
    );
  }
}
