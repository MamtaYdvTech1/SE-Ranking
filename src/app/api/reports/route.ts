import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

type SessionUser = { id: string; role: string };

async function currentUser(req: NextRequest): Promise<SessionUser | null> {
  const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
  return auth?.user ? { id: auth.user.id, role: auth.user.role } : null;
}

/** Reports visible to this user: those on projects they own (SUPERADMIN: all). */
function ownedReportScope(user: SessionUser) {
  return user.role === 'SUPERADMIN' ? {} : { project: { userId: user.id } };
}

const unauthorized = () => NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
const notFound = () => NextResponse.json({ error: 'Report not found' }, { status: 404 });

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

    const user = await currentUser(req);
    if (!user) return unauthorized();

    const whereClause: any = { deletedAt: null, ...ownedReportScope(user) };
    if (projectId) {
      const access = await verifyProjectAccess(req, projectId);
      if (!access.success) return access.error;
      whereClause.projectId = access.data.project.id;
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
    const user = await currentUser(req);
    if (!user) return unauthorized();
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
    let projectId: string | undefined = body.projectId;
    if (projectId) {
      const access = await verifyProjectAccess(req, projectId);
      if (!access.success) return access.error;
      projectId = access.data.project.id;
    } else {
      // Default to the caller's own most recent project
      const ownProject = await prisma.project.findFirst({
        where: { deletedAt: null, ...(user.role === 'SUPERADMIN' ? {} : { userId: user.id }) },
        orderBy: { createdAt: 'desc' },
      });
      projectId = ownProject?.id;
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
    const user = await currentUser(req);
    if (!user) return unauthorized();
    const body = await req.json();
    const { id, action, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const owned = await prisma.report.findFirst({ where: { id, deletedAt: null, ...ownedReportScope(user) } });
    if (!owned) return notFound();

    if (action === 'rename' && title && title.trim()) {
      const updated = await prisma.report.update({
        where: { id },
        data: { name: title.trim() },
      });
      return NextResponse.json({ success: true, message: 'Report renamed successfully', report: updated });
    }

    if (action === 'toggleSchedule') {
      const existing = owned;
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
    const user = await currentUser(req);
    if (!user) return unauthorized();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const deleted = await prisma.report.deleteMany({
      where: { id, ...ownedReportScope(user) },
    });
    if (deleted.count === 0) return notFound();

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
