import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const searchParams = req.nextUrl.searchParams;
    const moduleType = searchParams.get('module') || 'audits'; // audits, rankings, keywords, competitors, backlinks, ai-search
    const search = searchParams.get('search') || '';
    const projectId = searchParams.get('projectId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));
    const skip = (page - 1) * pageSize;

    let items: any[] = [];
    let totalCount = 0;

    if (moduleType === 'audits') {
      const where: any = {};
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.OR = [
          { url: { contains: search.trim() } },
          { title: { contains: search.trim() } },
        ];
      }

      [totalCount, items] = await Promise.all([
        prisma.auditPage.count({ where }),
        prisma.auditPage.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { crawledAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
          },
        }),
      ]);
    } else if (moduleType === 'rankings') {
      const where: any = {};
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.OR = [
          { keyword: { keywordText: { contains: search.trim() } } },
          { url: { contains: search.trim() } },
        ];
      }

      [totalCount, items] = await Promise.all([
        prisma.rankingHistory.count({ where }),
        prisma.rankingHistory.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { checkedAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
            keyword: { select: { id: true, keywordText: true, currentPosition: true, monthlySearchVolume: true } },
          },
        }),
      ]);
    } else if (moduleType === 'keywords') {
      const where: any = { deletedAt: null };
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.keywordText = { contains: search.trim() };
      }

      [totalCount, items] = await Promise.all([
        prisma.keyword.count({ where }),
        prisma.keyword.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
          },
        }),
      ]);
    } else if (moduleType === 'competitors') {
      const where: any = { deletedAt: null };
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.OR = [
          { name: { contains: search.trim() } },
          { domain: { contains: search.trim() } },
        ];
      }

      [totalCount, items] = await Promise.all([
        prisma.projectCompetitor.count({ where }),
        prisma.projectCompetitor.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
          },
        }),
      ]);
    } else if (moduleType === 'backlinks') {
      const where: any = { deletedAt: null };
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.OR = [
          { sourceUrl: { contains: search.trim() } },
          { targetUrl: { contains: search.trim() } },
          { anchorText: { contains: search.trim() } },
        ];
      }

      [totalCount, items] = await Promise.all([
        prisma.backlink.count({ where }),
        prisma.backlink.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
          },
        }),
      ]);
    } else if (moduleType === 'ai-search') {
      const where: any = {};
      if (projectId) where.projectId = projectId;
      if (search.trim()) {
        where.OR = [
          { query: { contains: search.trim() } },
          { domain: { contains: search.trim() } },
          { citedUrl: { contains: search.trim() } },
        ];
      }

      [totalCount, items] = await Promise.all([
        prisma.aiSearchRecord.count({ where }),
        prisma.aiSearchRecord.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { checkedAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, domain: true } },
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        module: moduleType,
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to query SEO explorer' }, { status: 500 });
  }
}
