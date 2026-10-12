import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

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

    const contentType = req.headers.get('content-type') || '';
    let rawText = '';
    let targetGroup = 'General';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      rawText = await file.text();
      const groupParam = formData.get('group');
      if (groupParam && typeof groupParam === 'string') targetGroup = groupParam;
    } else {
      const body = await req.json().catch(() => ({}));
      rawText = body.content || body.csvText || '';
      if (body.group) targetGroup = body.group;
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'CSV content is empty' }, { status: 400 });
    }

    // Parse CSV / text lines
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const keywordsToProcess: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        i === 0 &&
        (line.toLowerCase().startsWith('keyword') || line.toLowerCase().includes('search query'))
      ) {
        continue;
      }
      const firstCol = line.split(',')[0].replace(/^["']|["']$/g, '').trim();
      if (firstCol && firstCol.length >= 2) {
        keywordsToProcess.push(firstCol);
      }
    }

    if (keywordsToProcess.length === 0) {
      return NextResponse.json({ error: 'No valid keywords found in CSV file.' }, { status: 400 });
    }

    // Deduplicate against existing active keywords in this project
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      select: { keywordText: true },
    });

    const existingSet = new Set(existingKeywords.map((k) => k.keywordText.toLowerCase()));
    const uniqueKeywords = Array.from(
      new Set(keywordsToProcess.filter((k) => !existingSet.has(k.toLowerCase())))
    );

    const duplicateCount = keywordsToProcess.length - uniqueKeywords.length;

    if (uniqueKeywords.length > 0) {
      await prisma.keyword.createMany({
        data: uniqueKeywords.map((kw) => ({
          projectId: project.id,
          keywordText: kw,
          searchEngine: project.defaultSearchEngine || 'google',
          countryCode: project.countryCode || 'in',
          language: project.languageCode || 'en',
          device: project.defaultDevice || 'desktop',
          groupName: targetGroup,
          isActive: true,
        })),
      });
    }

    const allCount = await prisma.keyword.count({
      where: { projectId: project.id, deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      importedCount: uniqueKeywords.length,
      duplicateCount,
      totalProjectKeywords: allCount,
      message: `Successfully imported ${uniqueKeywords.length} keywords (${duplicateCount} duplicates skipped).`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to import CSV.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
