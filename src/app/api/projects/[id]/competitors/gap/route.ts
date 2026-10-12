import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/server/projectAuth";
import { CompetitorGapItemDto, CompetitorGapResponseDto } from "@/lib/types";
import { dataForSeoClient } from "@/services/seo/dataforseo.client";

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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const competitorId = searchParams.get("competitorId") || "";
    const sort = searchParams.get("sort") || "opportunityscore";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));

    // 2. Query competitor rankings from DB
    const compRankings = await prisma.competitorRanking.findMany({
      where: {
        projectId: project.id,
        ...(competitorId ? { competitorId } : {}),
      },
      include: {
        competitor: true,
        keyword: true,
      },
      orderBy: { position: "asc" },
    });

    // 3. Build real gap items (keywords where competitor ranks better than target domain)
    const gapMap = new Map<string, CompetitorGapItemDto>();

    for (const r of compRankings) {
      if (!r.keyword || !r.competitor || !r.position || r.position > 100) continue;
      if (search && !r.keyword.keywordText.toLowerCase().includes(search)) continue;

      const kw = r.keyword;
      const targetPos = kw.currentPosition;
      // Only considered a gap if competitor ranks and target is either unranked or ranked worse
      if (targetPos === null || targetPos > r.position) {
        const existing = gapMap.get(kw.id);
        const compPos = r.position;

        if (!existing || compPos < existing.bestCompetitorPosition) {
          const vol = kw.monthlySearchVolume || 0;
          const kd = kw.keywordDifficulty || 50;
          // Opportunity score formula: volume weight vs KD & ranking distance
          const distance = (targetPos || 100) - compPos;
          const opportunityScore = Number(
            Math.min(100, Math.max(10, (distance * 0.5) + (vol > 1000 ? 30 : 10) - (kd * 0.2))).toFixed(1)
          );

          gapMap.set(kw.id, {
            keywordId: kw.id,
            keywordText: kw.keywordText,
            keywordDifficulty: kd,
            cpcUsd: kw.cpcUsd || 0,
            isActive: kw.isActive,
            searchVolume: vol,
            bestCompetitorId: r.competitor.id,
            bestCompetitorName: r.competitor.name,
            bestCompetitorDomain: r.competitor.domain,
            bestCompetitorPosition: compPos,
            targetPosition: targetPos,
            opportunityScore,
          });
        }
      }
    }

    let items = Array.from(gapMap.values());

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case "opportunityscore":
          return b.opportunityScore - a.opportunityScore;
        case "searchvolume":
          return (b.searchVolume || 0) - (a.searchVolume || 0);
        case "bestcompetitorrank":
          return a.bestCompetitorPosition - b.bestCompetitorPosition;
        case "keyword":
          return a.keywordText.localeCompare(b.keywordText);
        default:
          return b.opportunityScore - a.opportunityScore;
      }
    });

    const totalCount = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    const responseData: CompetitorGapResponseDto = {
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      isStale: false,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: responseData,
      providerConfigured: dataForSeoClient.isConfigured(),
      projectId: project.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch gap analysis.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
