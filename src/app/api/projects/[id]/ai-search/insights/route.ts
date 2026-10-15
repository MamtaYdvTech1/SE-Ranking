import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getTrackerInsights } from '@/services/seo/ai-tracker.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/ai-search/insights
 * Competitor domains and cited source pages aggregated from stored AI tracker answers.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await verifyProjectAccess(req, id);
    if (!access.success) return access.error;
    const project = access.data.project;
    const cleanDomain = project.domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();

    const insights = await getTrackerInsights(project.id, cleanDomain);
    return NextResponse.json({ success: true, domain: cleanDomain, ...insights });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load AI tracker insights.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
