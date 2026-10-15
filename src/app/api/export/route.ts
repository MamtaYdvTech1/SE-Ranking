import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get('analysisId');
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'prompts'; // 'prompts' | 'citations' | 'competitors'

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    const analysis: any = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        prompts: true,
        citations: true,
        competitors: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (analysis.projectId) {
      const access = await verifyProjectAccess(req, analysis.projectId);
      if (!access.success) return access.error;
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(analysis, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${analysis.domain}_${type}_export.json"`,
        },
      });
    }

    // Generate CSV
    let csv = '';
    if (type === 'prompts') {
      csv = 'Prompt,Topic,Engine,Mention,Link,Ads,Visibility,Answer Date\n';
      analysis.prompts.forEach((p: any) => {
        const cleanPrompt = `"${p.prompt.replace(/"/g, '""')}"`;
        const cleanTopic = `"${p.topic.replace(/"/g, '""')}"`;
        const date = p.answerDate ? (typeof p.answerDate === 'string' ? p.answerDate : p.answerDate.toISOString().split('T')[0]) : '';
        csv += `${cleanPrompt},${cleanTopic},${p.engine},${p.mention},${p.link},${p.ads},${p.visibility},${date}\n`;
      });
    } else if (type === 'citations') {
      csv = 'Domain,URL,Citation Share,Visibility,Topics,Domain Trust,Page Trust,Organic Traffic\n';
      analysis.citations.forEach((c: any) => {
        const cleanUrl = `"${(c.url || c.sourceUrl || '').replace(/"/g, '""')}"`;
        csv += `${c.domain || c.sourceDomain || ''},${cleanUrl},${c.citationShare ?? ''},${c.visibility ?? ''},"${c.topics ?? ''}",${c.domainTrust ?? ''},${c.pageTrust ?? ''},${c.organicTraffic ?? ''}\n`;
      });
    } else if (type === 'competitors') {
      csv = 'Domain,Brand,AI Presence,Domain Presence,Brand Presence,Avg Position,Share of Voice\n';
      analysis.competitors.forEach((cp: any) => {
        csv += `${cp.domain},${cp.brandName ?? ''},${cp.aiPresence ?? ''},${cp.domainPresence ?? ''},${cp.brandPresence ?? ''},${cp.avgPosition ?? ''},${cp.shareOfVoice ?? ''}\n`;
      });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${analysis.domain}_${type}_export.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
