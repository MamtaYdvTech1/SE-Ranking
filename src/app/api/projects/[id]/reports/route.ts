import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { listProjectReports, createProjectReport, getProjectReportData } from '@/services/seo/report.service';

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

    const { searchParams } = new URL(req.url);
    const dataOnly = searchParams.get('data') === 'true';

    if (dataOnly) {
      const reportData = await getProjectReportData(project.id);
      return NextResponse.json({ success: true, data: reportData });
    }

    const reports = await listProjectReports(project.id);
    return NextResponse.json({
      success: true,
      projectId: project.id,
      reports,
      total: reports.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve project reports.';
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

    const body = await req.json().catch(() => ({}));
    const reportName = body.name || body.title || `${project.name} SEO Report`;

    const created = await createProjectReport(project.id, {
      name: reportName,
      type: body.type || 'Overview',
      schedule: body.schedule || body.frequency || null,
      format: body.format || body.file_type || 'PDF',
      recipients: body.recipients || body.recipientEmail || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Report created successfully.',
      report: created,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create report.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
