import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

function sanitizeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  let str = String(field);
  // Protect against CSV Formula Injection (DDE attacks)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || '';
    const projectId = searchParams.get('projectId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));
    const skip = (page - 1) * pageSize;

    const where: any = { deletedAt: null };
    if (format && format !== 'all') where.format = format;
    if (projectId) where.projectId = projectId;

    const [totalCount, items] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { id: true, name: true, domain: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to list reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status });
    }

    const body = await req.json();
    const { name, type, format = 'CSV', projectId } = body;

    const targetProject = projectId
      ? await prisma.project.findUnique({ where: { id: projectId } })
      : await prisma.project.findFirst({ where: { deletedAt: null } });

    if (!targetProject) {
      return NextResponse.json({ success: false, message: 'No project found to generate report for.' }, { status: 400 });
    }

    const reportName = name?.trim() || `${targetProject.domain} - ${type || 'Executive Summary'} Report`;

    // Fetch real data to construct the exported payload
    let csvContent = '';
    if (type === 'Rankings' || type === 'Keywords') {
      const keywords = await prisma.keyword.findMany({
        where: { projectId: targetProject.id, deletedAt: null },
        take: 500,
        orderBy: { currentPosition: 'asc' },
      });

      const header = ['Keyword', 'Current Position', 'Previous Position', 'Change', 'Search Volume', 'Difficulty', 'Target URL'];
      const rows = keywords.map((k) => [
        sanitizeCsvField(k.keywordText),
        sanitizeCsvField(k.currentPosition ?? 'Not in top 100'),
        sanitizeCsvField(k.previousPosition ?? '-'),
        sanitizeCsvField(k.positionChange ?? 0),
        sanitizeCsvField(k.monthlySearchVolume ?? 0),
        sanitizeCsvField(k.keywordDifficulty ?? 0),
        sanitizeCsvField(k.targetUrl || k.rankedUrl || ''),
      ]);

      csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'Audit') {
      const issues = await prisma.auditIssue.findMany({
        where: { projectId: targetProject.id, deletedAt: null },
        take: 500,
        orderBy: { foundAt: 'desc' },
      });

      const header = ['Severity', 'Category', 'Rule ID', 'Title', 'Affected URL', 'Recommendation'];
      const rows = issues.map((i) => [
        sanitizeCsvField(i.severity),
        sanitizeCsvField(i.category),
        sanitizeCsvField(i.ruleId),
        sanitizeCsvField(i.title),
        sanitizeCsvField(i.url),
        sanitizeCsvField(i.recommendation),
      ]);

      csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      // Platform / Executive Overview
      const [kwCount, issueCount, blCount] = await Promise.all([
        prisma.keyword.count({ where: { projectId: targetProject.id, deletedAt: null } }),
        prisma.auditIssue.count({ where: { projectId: targetProject.id, deletedAt: null } }),
        prisma.backlink.count({ where: { projectId: targetProject.id, deletedAt: null } }),
      ]);

      const header = ['Metric', 'Value', 'Generated At'];
      const rows = [
        ['Project Domain', sanitizeCsvField(targetProject.domain), sanitizeCsvField(new Date().toISOString())],
        ['Tracked Keywords', sanitizeCsvField(kwCount), sanitizeCsvField(new Date().toISOString())],
        ['Audit Issues', sanitizeCsvField(issueCount), sanitizeCsvField(new Date().toISOString())],
        ['Total Backlinks', sanitizeCsvField(blCount), sanitizeCsvField(new Date().toISOString())],
      ];

      csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const report = await prisma.report.create({
      data: {
        projectId: targetProject.id,
        name: reportName,
        type: type || 'Overview',
        format,
        status: 'Ready',
        lastGeneratedAt: new Date(),
        recipients: adminCheck.auth.user.email,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: adminCheck.auth.user.id,
        userName: adminCheck.auth.user.name || adminCheck.auth.user.email,
        action: 'GENERATE_REPORT',
        entityType: 'Report',
        entityId: report.id,
        details: JSON.stringify({ name: reportName, format, type }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        csvPreview: csvContent.slice(0, 1000),
      },
      message: 'Report generated successfully from real database metrics.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to generate report' }, { status: 500 });
  }
}
