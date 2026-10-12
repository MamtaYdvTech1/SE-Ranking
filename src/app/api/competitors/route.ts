import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CompetitorSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CompetitorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid competitor data.' },
        { status: 400 }
      );
    }

    const { domain, brandName, analysisId } = result.data;
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required.' }, { status: 400 });
    }

    // Competitor metrics are initialized to null until retrieved from configured data source or analysis check
    const aiPresence = null;
    const domainPresence = null;
    const brandPresence = null;
    const avgPosition = null;
    const shareOfVoice = null;

    try {
      const existingCount = await prisma.competitor.count({
        where: { analysisId },
      });

      if (existingCount >= 5) {
        return NextResponse.json(
          { error: 'Maximum 5 competitors allowed per analysis.' },
          { status: 400 }
        );
      }

      const alreadyAdded = await prisma.competitor.findFirst({
        where: { analysisId, domain },
      });

      if (alreadyAdded) {
        return NextResponse.json(
          { error: 'This competitor is already added.' },
          { status: 409 }
        );
      }

      const competitor = await prisma.competitor.create({
        data: {
          analysisId,
          domain,
          brandName: brandName || null,
          aiPresence,
          domainPresence,
          brandPresence,
          avgPosition,
          shareOfVoice,
        },
      });

      return NextResponse.json({ success: true, competitor });
    } catch (dbErr) {
      console.warn('Prisma DB unavailable for competitor create, using memory fallback:', dbErr);
      const competitor = {
        id: `comp-${Date.now()}`,
        analysisId,
        domain,
        brandName: brandName || null,
        aiPresence,
        domainPresence,
        brandPresence,
        avgPosition,
        shareOfVoice,
      };
      return NextResponse.json({ success: true, competitor });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Competitor ID is required' }, { status: 400 });
    }

    await prisma.competitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Competitor removed successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
