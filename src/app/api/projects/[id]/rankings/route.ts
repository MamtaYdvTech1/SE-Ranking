import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getRankingSummary } from '@/services/seo/ranking.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify project access & ownership
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || searchParams.get('period') || '30D';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const engineFilter = searchParams.get('engine') || searchParams.get('searchEngine') || undefined;
    const groupFilter = searchParams.get('group') || undefined;

    // 2. Query real ranking summary & keywords via ranking service
    const summary = await getRankingSummary(project.id, {
      timeRange,
      startDate,
      endDate,
      engineFilter,
      groupFilter,
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      primaryDomain: project.domain,
      timeRange: summary.timeRange,
      startDate: summary.startDate,
      endDate: summary.endDate,
      summary: summary.summary,
      trend: summary.trend,
      keywordDistribution: summary.keywordDistribution,
      keywords: summary.keywords,
      serpDynamics: summary.serpDynamics,
      competitors: summary.competitors,
      pages: summary.pages,
    });
  } catch (err: unknown) {
    console.error('Error fetching rankings:', err);
    const msg = err instanceof Error ? err.message : 'Failed to retrieve rankings.';
    return NextResponse.json({ error: msg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
