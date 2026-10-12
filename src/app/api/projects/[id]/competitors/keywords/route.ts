import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/server/projectAuth";
import { CompetitorKeywordsResponseDto } from "@/lib/types";

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));

    // 2. Fetch project competitors
    const competitors = await prisma.projectCompetitor.findMany({
      where: { projectId: project.id, deletedAt: null },
      select: { id: true, name: true, domain: true },
    });

    // 3. Fetch project keywords with competitor rankings
    const keywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
        ...(search ? { keywordText: { contains: search } } : {}),
      },
      include: {
        competitorRankings: {
          orderBy: { checkedAt: "desc" },
          take: 50,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCount = keywords.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedKeywords = keywords.slice(startIndex, startIndex + pageSize);

    const items = paginatedKeywords.map((kw) => {
      const competitorRanks: Record<string, { position: number; positionChange: number }> = {};
      for (const comp of competitors) {
        const ranking = kw.competitorRankings.find((r) => r.competitorId === comp.id);
        if (ranking && ranking.position) {
          competitorRanks[comp.id] = {
            position: ranking.position,
            positionChange: ranking.positionChange || 0,
          };
        }
      }

      return {
        keywordId: kw.id,
        keywordText: kw.keywordText,
        searchVolume: kw.monthlySearchVolume || 0,
        targetPosition: kw.currentPosition,
        targetPositionChange: kw.positionChange,
        competitorRanks,
      };
    });

    const responseData: CompetitorKeywordsResponseDto = {
      items,
      competitors: competitors.map((c) => ({
        id: c.id,
        name: c.name || c.domain,
        domain: c.domain,
      })),
      totalCount,
      pageNumber: page,
      pageSize,
      isStale: false,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: responseData,
      projectId: project.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch keyword matrix.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
