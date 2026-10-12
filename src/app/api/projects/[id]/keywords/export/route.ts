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

    const projectWithKeywords = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        keywords: {
          where: { deletedAt: null },
          orderBy: { currentPosition: 'asc' },
        },
      },
    });

    const keywords = projectWithKeywords?.keywords || [];

    const headers = [
      'Keyword',
      'Current Position',
      'Previous Position',
      'Dynamics',
      'Best Position',
      'Search Volume',
      'CPC (USD)',
      'Difficulty',
      'Search Engine',
      'Country',
      'Device',
      'Group',
      'Target URL',
      'Date Checked',
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = keywords.map((k) => [
      escapeCsv(k.keywordText),
      escapeCsv(k.currentPosition ? (k.currentPosition > 100 ? '>100' : k.currentPosition) : '—'),
      escapeCsv(k.previousPosition ? (k.previousPosition > 100 ? '>100' : k.previousPosition) : '—'),
      escapeCsv(k.positionChange != null ? (k.positionChange > 0 ? `+${k.positionChange}` : k.positionChange) : '0'),
      escapeCsv(k.bestPosition ? (k.bestPosition > 100 ? '>100' : k.bestPosition) : '—'),
      escapeCsv(k.monthlySearchVolume || 0),
      escapeCsv(k.cpcUsd ? `$${k.cpcUsd.toFixed(2)}` : '$0.00'),
      escapeCsv(k.keywordDifficulty || 0),
      escapeCsv(k.searchEngine || 'google'),
      escapeCsv(k.countryCode ? k.countryCode.toUpperCase() : 'IN'),
      escapeCsv(k.device || 'desktop'),
      escapeCsv(k.groupName || 'General'),
      escapeCsv(k.rankedUrl || k.targetUrl || `https://${project.domain}`),
      escapeCsv(k.updatedAt ? new Date(k.updatedAt).toISOString().split('T')[0] : '—'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${project.domain}_rankings_export.csv"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to export CSV.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
