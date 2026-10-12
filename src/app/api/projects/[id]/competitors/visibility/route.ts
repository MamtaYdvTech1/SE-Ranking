import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/server/projectAuth";
import { CompetitorOverviewDto } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 1. Verify project access & ownership
    const authResult = await verifyProjectAccess(req, projectId);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    // 2. Query actual keywords and competitors from database
    const keywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
    });

    const competitors = await prisma.projectCompetitor.findMany({
      where: { projectId: project.id, deletedAt: null },
      include: {
        competitorRankings: {
          orderBy: { checkedAt: "desc" },
          take: 100,
        },
      },
    });

    const totalKeywordsCount = keywords.length;
    const rankedTarget = keywords.filter(
      (k) => k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100
    );

    const targetAvgPos =
      rankedTarget.length > 0
        ? Number(
            (rankedTarget.reduce((acc, k) => acc + k.currentPosition!, 0) / rankedTarget.length).toFixed(1)
          )
        : 0;

    const targetTop3 = rankedTarget.filter((k) => k.currentPosition! <= 3).length;
    const targetTop10 = rankedTarget.filter((k) => k.currentPosition! <= 10).length;
    const targetTop20 = rankedTarget.filter((k) => k.currentPosition! <= 20).length;
    const targetTop100 = rankedTarget.length;
    const targetUnranked = totalKeywordsCount - targetTop100;
    const targetVisibility =
      totalKeywordsCount > 0 ? Number(((targetTop10 / totalKeywordsCount) * 100).toFixed(1)) : 0;

    // Build summaries: first is target domain, followed by added competitors
    const summaries = [
      {
        competitorId: null,
        name: project.brandName || project.name,
        domain: project.domain,
        isTargetDomain: true,
        currentVisibility: targetVisibility,
        currentAveragePosition: targetAvgPos,
        currentRankedCount: targetTop100,
        top20OverlapCount: targetTop20,
        top20OverlapPercentage: 100,
        top3Count: targetTop3,
        top10Count: targetTop10,
        top20Count: targetTop20,
        top100Count: targetTop100,
        unrankedCount: targetUnranked,
      },
      ...competitors.map((comp) => {
        const rankedComp = comp.competitorRankings.filter(
          (r) => r.position != null && r.position > 0 && r.position <= 100
        );
        const compAvg =
          rankedComp.length > 0
            ? Number(
                (rankedComp.reduce((acc, r) => acc + r.position!, 0) / rankedComp.length).toFixed(1)
              )
            : comp.avgPosition || 0;

        const compTop3 = rankedComp.filter((r) => r.position! <= 3).length;
        const compTop10 = rankedComp.filter((r) => r.position! <= 10).length;
        const compTop20 = rankedComp.filter((r) => r.position! <= 20).length;
        const compTop100 = rankedComp.length;
        const compUnranked = Math.max(0, totalKeywordsCount - compTop100);
        const compVisibility =
          totalKeywordsCount > 0
            ? Number(((compTop10 / totalKeywordsCount) * 100).toFixed(1))
            : comp.visibilityScore || 0;

        const overlapCount = rankedComp.filter((r) => {
          const kw = keywords.find((k) => k.id === r.keywordId);
          return kw?.currentPosition && kw.currentPosition <= 20 && r.position! <= 20;
        }).length;
        const overlapPercentage =
          targetTop20 > 0 ? Math.round((overlapCount / targetTop20) * 100) : 0;

        return {
          competitorId: comp.id,
          name: comp.name || comp.domain,
          domain: comp.domain,
          isTargetDomain: false,
          currentVisibility: compVisibility,
          currentAveragePosition: compAvg,
          currentRankedCount: compTop100,
          top20OverlapCount: overlapCount,
          top20OverlapPercentage: overlapPercentage,
          top3Count: compTop3,
          top10Count: compTop10,
          top20Count: compTop20,
          top100Count: compTop100,
          unrankedCount: compUnranked,
        };
      }),
    ];

    const overviewData: CompetitorOverviewDto = {
      totalKeywordsCount,
      isStale: false,
      lastCheckedAt: project.lastRankingCheckAt ? project.lastRankingCheckAt.toISOString() : new Date().toISOString(),
      summaries,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: overviewData,
      projectId: project.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch visibility overview.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
