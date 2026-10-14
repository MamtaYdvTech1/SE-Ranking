import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { normalizeDomain } from '@/lib/validation/schemas';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { yepApiClient } from '@/lib/yepapi';

const CreateCompetitorSchema = z.object({
  domain: z.string().min(3).max(255),
  name: z.string().optional(),
  notes: z.string().optional(),
});

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

    // 2. Fetch competitors for this project
    let competitors = await prisma.projectCompetitor.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      include: {
        competitorRankings: {
          take: 100,
          orderBy: { checkedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-discover competitors from YepAPI if none exist
    if (competitors.length === 0 && yepApiClient.isConfigured()) {
      try {
        const cleanDomain = (project.domain || '')
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .split('/')[0]
          .toLowerCase();

        const compRes = await yepApiClient.getCompetitorDomains({ domain: cleanDomain, limit: 10 });
        if (compRes.ok && compRes.data?.competitors && compRes.data.competitors.length > 0) {
          const validComps = compRes.data.competitors
            .filter((c) => c.domain && c.domain.toLowerCase() !== cleanDomain)
            .slice(0, 5);

          for (const item of validComps) {
            try {
              const baseName = item.domain.replace(/^www\./i, '').split('.')[0];
              const displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
              await prisma.projectCompetitor.create({
                data: {
                  projectId: project.id,
                  domain: item.domain,
                  name: displayName,
                  // Visibility and our-keyword average position are filled in by the next rank check
                  avgPosition: item.avgPosition ? Number(item.avgPosition.toFixed(1)) : null,
                  visibilityScore: 0,
                  commonKeywordsCount: item.intersections || 0,
                  totalKeywords: item.organicCount || 0,
                  organicTraffic: item.organicEtv ? `${Math.round(item.organicEtv).toLocaleString()}/mo` : '—',
                },
              });
            } catch {
              // Ignore single duplicate or conflict
            }
          }

          competitors = await prisma.projectCompetitor.findMany({
            where: {
              projectId: project.id,
              deletedAt: null,
            },
            include: {
              competitorRankings: {
                take: 100,
                orderBy: { checkedAt: 'desc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          });
        }
      } catch (e) {
        console.error('Failed to auto-discover competitors:', e);
      }
    }

    // 3. Compute real metrics from database
    const totalProjectKeywords = await prisma.keyword.count({
      where: { projectId: project.id, deletedAt: null },
    });

    const enriched = competitors.map((comp) => {
      const rankedPositions = comp.competitorRankings
        .map((r) => r.position)
        .filter((p): p is number => p != null && p > 0 && p <= 100);

      const avgPosition =
        rankedPositions.length > 0
          ? Number((rankedPositions.reduce((a, b) => a + b, 0) / rankedPositions.length).toFixed(1))
          : comp.avgPosition || 0;

      const top10 = rankedPositions.filter((p) => p <= 10).length;
      const visibilityScore =
        totalProjectKeywords > 0
          ? Number(((top10 / totalProjectKeywords) * 100).toFixed(1))
          : comp.visibilityScore || 0;

      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        notes: comp.notes,
        isActive: comp.isActive,
        avgPosition,
        visibilityScore,
        commonKeywordsCount: rankedPositions.length,
        totalKeywords: totalProjectKeywords,
        organicTraffic: comp.organicTraffic || '—',
        createdAt: comp.createdAt.toISOString(),
        updatedAt: comp.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      totalCount: enriched.length,
      projectId: project.id,
    });
  } catch (err: unknown) {
    console.error('Fetch competitors error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch competitors.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
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

    // 2. Validate payload
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = CreateCompetitorSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid competitor data', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { domain, name, notes } = parseResult.data;
    const cleanDomain = normalizeDomain(domain);

    if (cleanDomain === normalizeDomain(project.domain)) {
      return NextResponse.json(
        { success: false, error: 'Competitor domain cannot be the same as your primary project domain.' },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate active competitor
    const existing = await prisma.projectCompetitor.findFirst({
      where: {
        projectId: project.id,
        domain: cleanDomain,
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Competitor "${cleanDomain}" is already being tracked in this project.` },
        { status: 409 }
      );
    }

    const competitor = await prisma.projectCompetitor.create({
      data: {
        projectId: project.id,
        name: name?.trim() || cleanDomain,
        domain: cleanDomain,
        notes: notes?.trim() || null,
        isActive: true,
        visibilityScore: 0,
        avgPosition: 0,
        commonKeywordsCount: 0,
        totalKeywords: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Competitor added successfully.',
      data: competitor,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Add competitor error:', err);
    const message = err instanceof Error ? err.message : 'Failed to add competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
