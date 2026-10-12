import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const keywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
      orderBy: { currentPosition: 'asc' },
    });

    const insights = [];

    // 1. Quick Wins (Keywords ranking 11-20)
    const quickWins = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 11 && k.currentPosition <= 20);
    quickWins.slice(0, 3).forEach((kw, idx) => {
      insights.push({
        id: `ins-qw-${idx}`,
        keyword: kw.keywordText,
        type: 'quick_win',
        typeLabel: 'Quick Win (Rank 11-20)',
        currentRank: kw.currentPosition,
        rankChange: kw.positionChange || 2,
        searchVolume: kw.monthlySearchVolume || 1200,
        searchEngine: `${kw.searchEngine === 'google' ? 'Google' : kw.searchEngine} ${project.country}`,
        targetUrl: kw.rankedUrl || `https://${project.domain}/${kw.keywordText.replace(/\s+/g, '-')}`,
        recommendation: `Add 2-3 internal links from high-authority pages to push this keyword from #${kw.currentPosition} into the Top 10.`,
        impact: 'High',
      });
    });

    // 2. High Potential (Keywords ranking 21-40 with high search volume)
    const highPotentials = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 21 && (k.monthlySearchVolume || 0) >= 1500);
    highPotentials.slice(0, 2).forEach((kw, idx) => {
      insights.push({
        id: `ins-hp-${idx}`,
        keyword: kw.keywordText,
        type: 'opportunity',
        typeLabel: 'High Volume Growth Opportunity',
        currentRank: kw.currentPosition,
        rankChange: kw.positionChange || 1,
        searchVolume: kw.monthlySearchVolume || 3200,
        searchEngine: `${kw.searchEngine === 'google' ? 'Google' : kw.searchEngine} ${project.country}`,
        targetUrl: kw.rankedUrl || `https://${project.domain}`,
        recommendation: `Target this query in a dedicated long-form guide with FAQ schema to capture featured snippets.`,
        impact: 'High',
      });
    });

    // 3. Cannibalization or SERP features
    const topKeywords = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 5);
    if (topKeywords.length > 0) {
      const best = topKeywords[0];
      insights.push({
        id: `ins-sf-1`,
        keyword: best.keywordText,
        type: 'serp_feature',
        typeLabel: 'SERP Feature Dominance',
        currentRank: best.currentPosition,
        rankChange: best.positionChange || 0,
        searchVolume: best.monthlySearchVolume || 5400,
        searchEngine: `Google ${project.country}`,
        targetUrl: best.rankedUrl || `https://${project.domain}`,
        recommendation: `Defend position #${best.currentPosition} by updating year references to 2026 and maintaining fast Core Web Vitals.`,
        impact: 'Medium',
      });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      domain: project.domain,
      insights,
    });
  } catch (err: unknown) {
    console.error('Error fetching insights:', err);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
