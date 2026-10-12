import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

const CreateKeywordSchema = z.object({
  keywords: z.union([z.array(z.string()), z.string()]).optional(),
  keyword: z.string().optional(),
  group: z.string().optional(),
  groupName: z.string().optional(),
  countryCode: z.string().optional(),
  language: z.string().optional(),
  searchEngine: z.string().optional(),
  device: z.enum(['desktop', 'mobile']).optional(),
  targetUrl: z.string().optional(),
  searchIntent: z.string().optional(),
  tags: z.array(z.string()).optional(),
  monthlySearchVolume: z.number().optional(),
  cpcUsd: z.number().optional(),
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

    // 2. Query parameters for filtering, sorting & pagination
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const group = searchParams.get('group');
    const tag = searchParams.get('tag');
    const engine = searchParams.get('engine');
    const device = searchParams.get('device');
    const positionFilter = searchParams.get('position'); // top1, top3, top5, top10, top30, top100, unranked
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // position, volume, change, difficulty, keywordText, createdAt
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '100', 10)));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.KeywordWhereInput = {
      projectId: project.id,
      deletedAt: null,
    };

    if (group && group !== 'All' && group !== 'All groups') {
      whereClause.groupName = group;
    }

    if (tag) {
      whereClause.tags = { contains: tag };
    }

    if (engine) {
      whereClause.searchEngine = engine;
    }

    if (device) {
      whereClause.device = device;
    }

    if (search.trim()) {
      whereClause.keywordText = { contains: search.trim() };
    }

    if (positionFilter === 'top1') {
      whereClause.currentPosition = 1;
    } else if (positionFilter === 'top3') {
      whereClause.currentPosition = { lte: 3, gte: 1 };
    } else if (positionFilter === 'top5') {
      whereClause.currentPosition = { lte: 5, gte: 1 };
    } else if (positionFilter === 'top10') {
      whereClause.currentPosition = { lte: 10, gte: 1 };
    } else if (positionFilter === 'top30') {
      whereClause.currentPosition = { lte: 30, gte: 1 };
    } else if (positionFilter === 'top100') {
      whereClause.currentPosition = { lte: 100, gte: 1 };
    } else if (positionFilter === 'unranked' || positionFilter === 'over100') {
      whereClause.OR = [{ currentPosition: null }, { currentPosition: { gt: 100 } }];
    }

    // Sort order handling
    let orderBy: Prisma.KeywordOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'position') {
      orderBy = { currentPosition: sortOrder };
    } else if (sortBy === 'volume') {
      orderBy = { monthlySearchVolume: sortOrder };
    } else if (sortBy === 'change') {
      orderBy = { positionChange: sortOrder };
    } else if (sortBy === 'difficulty') {
      orderBy = { keywordDifficulty: sortOrder };
    } else if (sortBy === 'keyword' || sortBy === 'keywordText') {
      orderBy = { keywordText: sortOrder };
    }

    const [totalCount, keywords] = await Promise.all([
      prisma.keyword.count({ where: whereClause }),
      prisma.keyword.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Distinct groups and tags for filter pills
    const allProjectKeywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
      select: { groupName: true, tags: true },
    });

    const groupsSet = new Set<string>();
    const tagsSet = new Set<string>();
    allProjectKeywords.forEach((k) => {
      if (k.groupName) groupsSet.add(k.groupName);
      if (k.tags) {
        try {
          const parsed = JSON.parse(k.tags);
          if (Array.isArray(parsed)) parsed.forEach((t) => tagsSet.add(t));
        } catch {
          // ignore
        }
      }
    });

    return NextResponse.json({
      success: true,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      groups: Array.from(groupsSet),
      tags: Array.from(tagsSet),
      keywords: keywords.map((k) => ({
        id: k.id,
        keyword: k.keywordText,
        keywordText: k.keywordText,
        searchEngine: k.searchEngine || 'google',
        countryCode: k.countryCode || project.countryCode || 'in',
        language: k.language || project.languageCode || 'en',
        device: k.device || 'desktop',
        searchVolume: k.monthlySearchVolume || 0,
        monthlySearchVolume: k.monthlySearchVolume || 0,
        keywordDifficulty: k.keywordDifficulty || 0,
        cpcUsd: k.cpcUsd || 0,
        currentPosition: k.currentPosition || null,
        previousPosition: k.previousPosition || null,
        positionChange: k.positionChange || null,
        bestPosition: k.bestPosition || null,
        worstPosition: k.worstPosition || null,
        rankedUrl: k.rankedUrl || null,
        targetUrl: k.targetUrl || null,
        searchIntent: k.searchIntent || null,
        group: k.groupName || 'General',
        groupName: k.groupName || 'General',
        tags: k.tags
          ? (() => {
              try {
                return JSON.parse(k.tags);
              } catch {
                return [];
              }
            })()
          : [],
        serpFeatures: k.serpFeatures
          ? (() => {
              try {
                return JSON.parse(k.serpFeatures);
              } catch {
                return [];
              }
            })()
          : [],
        isActive: k.isActive,
        lastChecked: k.updatedAt ? k.updatedAt.toISOString() : null,
        createdAt: k.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve keywords.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
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

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = CreateKeywordSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid keyword payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    const keywordsToAdd: string[] = Array.isArray(body.keywords)
      ? body.keywords.map((k: string | Record<string, unknown>) => (typeof k === 'string' ? k.trim() : String(k.keywordText || k.keyword || ''))).filter(Boolean)
      : typeof body.keywords === 'string'
      ? body.keywords.split('\n').map((k: string) => k.trim()).filter(Boolean)
      : body.keyword
      ? [String(body.keyword).trim()]
      : [];

    if (keywordsToAdd.length === 0) {
      return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
    }

    const group = body.group || body.groupName || 'General';
    const countryCode = (body.countryCode || project.countryCode || 'in').toLowerCase();
    const language = body.language || project.languageCode || 'en';
    const searchEngine = body.searchEngine || project.defaultSearchEngine || 'google';
    const device = body.device || project.defaultDevice || 'desktop';
    const tagsString = body.tags && body.tags.length > 0 ? JSON.stringify(body.tags) : null;

    // Check duplicates in this project
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      select: { keywordText: true },
    });

    const existingSet = new Set(existingKeywords.map((k) => k.keywordText.toLowerCase()));
    const uniqueToAdd = Array.from(new Set(keywordsToAdd.filter((k) => !existingSet.has(k.toLowerCase()))));

    if (uniqueToAdd.length > 0) {
      await prisma.keyword.createMany({
        data: uniqueToAdd.map((kw) => ({
          projectId: project.id,
          keywordText: kw,
          searchEngine,
          countryCode,
          language,
          device,
          groupName: group,
          tags: tagsString,
          targetUrl: body.targetUrl || null,
          searchIntent: body.searchIntent || null,
          monthlySearchVolume: body.monthlySearchVolume || null,
          cpcUsd: body.cpcUsd || null,
          isActive: true,
        })),
      });
    }

    const allCount = await prisma.keyword.count({
      where: { projectId: project.id, deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${uniqueToAdd.length} keywords.`,
      addedCount: uniqueToAdd.length,
      skippedCount: keywordsToAdd.length - uniqueToAdd.length,
      totalCount: allCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add keywords.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await req.json().catch(() => ({}));
    const keywordId = body.id || body.keywordId;

    if (!keywordId) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    const existing = await prisma.keyword.findFirst({
      where: { id: keywordId, projectId: project.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found in this project' }, { status: 404 });
    }

    const updated = await prisma.keyword.update({
      where: { id: keywordId },
      data: {
        keywordText: body.keywordText !== undefined ? String(body.keywordText).trim() : undefined,
        groupName: body.groupName !== undefined ? body.groupName : undefined,
        targetUrl: body.targetUrl !== undefined ? body.targetUrl : undefined,
        searchIntent: body.searchIntent !== undefined ? body.searchIntent : undefined,
        tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        monthlySearchVolume: body.monthlySearchVolume !== undefined ? Number(body.monthlySearchVolume) : undefined,
        cpcUsd: body.cpcUsd !== undefined ? parseFloat(body.cpcUsd) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Keyword updated successfully.', keyword: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update keyword.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { user, project } = authResult.data;

    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const keywordId = searchParams.get('id') || body.keywordId || body.id;
    const bulkIds: string[] | undefined = body.keywordIds || body.ids;

    if (bulkIds && Array.isArray(bulkIds) && bulkIds.length > 0) {
      const res = await prisma.keyword.updateMany({
        where: {
          id: { in: bulkIds },
          projectId: project.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: user.email,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${res.count} keywords.`,
        deletedCount: res.count,
      });
    }

    if (!keywordId) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    const existing = await prisma.keyword.findFirst({
      where: { id: keywordId, projectId: project.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found in this project' }, { status: 404 });
    }

    await prisma.keyword.update({
      where: { id: keywordId },
      data: {
        deletedAt: new Date(),
        deletedBy: user.email,
      },
    });

    return NextResponse.json({ success: true, message: 'Keyword removed successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete keyword.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
