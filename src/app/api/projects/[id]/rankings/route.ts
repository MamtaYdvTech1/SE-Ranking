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
    const timeRange = searchParams.get('timeRange') || 'week'; // week, month, 3months, year
    const engineFilter = searchParams.get('engine') || undefined;
    const groupFilter = searchParams.get('group') || undefined;

    // 2. Query real ranking summary & keywords via ranking service
    const summary = await getRankingSummary(project.id, timeRange, engineFilter, groupFilter);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      primaryDomain: project.domain,
      summary: summary.summary,
      trend: summary.trend,
      keywordDistribution: summary.keywordDistribution,
      keywords: summary.keywords,
    });
  } catch (err: unknown) {
    console.error('Error fetching rankings:', err);
    const msg = err instanceof Error ? err.message : 'Failed to retrieve rankings.';
    return NextResponse.json({ error: msg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
