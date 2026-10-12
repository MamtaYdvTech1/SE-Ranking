import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession } from '@/lib/server/auth';

export interface ReportItem {
  id: string;
  projectId?: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  hasSchedule: boolean;
  file_type: string;
}

let myTemplates = [
  {
    id: 'tpl-1',
    name: 'Weekly SEO Performance Digest',
    created: 'Oct 01, 2026',
    desc: 'Automated weekly rankings, competitor movements, and organic traffic snapshot',
  },
  {
    id: 'tpl-2',
    name: 'Monthly Technical Audit & Health Overview',
    created: 'Sep 28, 2026',
    desc: 'Comprehensive technical crawl, core web vitals, and indexation check',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type') || 'all';
    const query = searchParams.get('q') || '';
    const id = searchParams.get('id');

    const whereClause: any = { deletedAt: null };
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const fetched = await prisma.report.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true, domain: true, websiteUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reports: ReportItem[] = fetched.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      title: r.name,
      domain: r.project?.domain || 'my-website.com',
      updated: r.updatedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      sent: r.lastGeneratedAt ? new Date(r.lastGeneratedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '—',
      frequency: r.schedule || 'Every week, on: Wednesday',
      language: 'English',
      period: 'Last 30 Days',
      hasSchedule: Boolean(r.schedule && r.schedule !== 'Without schedule'),
      file_type: (r.format || 'pdf').toLowerCase(),
    }));

    if (id) {
      const single = reports.find((r) => r.id === id);
      if (single) {
        return NextResponse.json({ success: true, report: single });
      }
    }

    let filtered = [...reports];
    if (type === 'scheduled') {
      filtered = filtered.filter((r) => r.hasSchedule);
    } else if (type === 'manual') {
      filtered = filtered.filter((r) => !r.hasSchedule);
    }

    if (query.trim()) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.domain.toLowerCase().includes(query.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      reports: filtered,
      total: filtered.length,
      templates: myTemplates,
      limits: {
        scheduled_reports: { used: reports.filter((r) => r.hasSchedule).length, max: 10 },
        ai_summary: { used: 0, max: 10 },
      },
      system_templates: 12,
    });
  } catch (err: unknown) {
    console.error('Error fetching reports:', err);
    return NextResponse.json({ error: 'Failed to retrieve reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);
    const body = await req.json().catch(() => ({}));

    // Check if this is a template creation request
    if (body.type === 'template' || body.action === 'createTemplate') {
      const newTpl = {
        id: `tpl-${Date.now()}`,
        name: (body.name && body.name.trim()) || 'Untitled template',
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        desc: body.desc || `${body.exportFormat || 'PDF'} template (${body.orientation || 'Vertical'})`,
        exportFormat: body.exportFormat || 'PDF',
        orientation: body.orientation || 'Vertical',
        language: body.language || 'English',
        sections: body.sections || ['Cover page', 'Rankings overview', 'Organic traffic'],
      };
      myTemplates.unshift(newTpl);
      return NextResponse.json({
        success: true,
        message: 'Template created successfully!',
        template: newTpl,
        templates: myTemplates,
      });
    }

    // Determine target project
    let projectId = body.projectId;
    if (!projectId) {
      const firstProj = await prisma.project.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      projectId = firstProj?.id;
    }

    if (!projectId) {
      return NextResponse.json({ error: 'No active project found to create report for.' }, { status: 400 });
    }

    const { title, frequency, format, file_type, recipients } = body;
    const reportTitle = (title && title.trim()) || 'Project SEO Report';

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { domain: true },
    });

    const createdReport = await prisma.report.create({
      data: {
        projectId,
        name: reportTitle,
        type: 'Overview',
        schedule: frequency || 'Every week, on: Wednesday',
        format: (format || file_type || 'PDF').toUpperCase(),
        recipients: recipients || null,
        status: 'Ready',
        lastGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report created successfully!',
      report: {
        id: createdReport.id,
        projectId: createdReport.projectId,
        title: createdReport.name,
        domain: project?.domain || 'my-website.com',
        updated: createdReport.updatedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        sent: '—',
        frequency: createdReport.schedule || 'Every week, on: Wednesday',
        language: 'English',
        period: 'Last 30 Days',
        hasSchedule: Boolean(createdReport.schedule && createdReport.schedule !== 'Without schedule'),
        file_type: createdReport.format.toLowerCase(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error creating report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    if (action === 'rename' && title && title.trim()) {
      const updated = await prisma.report.update({
        where: { id },
        data: { name: title.trim() },
      });
      return NextResponse.json({ success: true, message: 'Report renamed successfully', report: updated });
    }

    if (action === 'toggleSchedule') {
      const existing = await prisma.report.findUnique({ where: { id } });
      if (existing) {
        const nextSchedule = existing.schedule && existing.schedule !== 'Without schedule' ? null : 'Every week, on: Wednesday';
        const updated = await prisma.report.update({
          where: { id },
          data: { schedule: nextSchedule },
        });
        return NextResponse.json({
          success: true,
          message: nextSchedule ? 'Sending schedule activated' : 'Sending schedule stopped',
          report: updated,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Operation completed' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    await prisma.report.delete({
      where: { id },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
