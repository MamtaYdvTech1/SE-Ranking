import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { GbpPostCreateSchema } from '@/lib/validation/schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const whereClause: any = {
      projectId: project.id,
      deletedAt: null,
    };
    if (locationId) {
      whereClause.locationId = locationId;
    }

    const posts = await prisma.gbpPost.findMany({
      where: whereClause,
      include: {
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if project has GBP integration connected
    const gbpIntegration = await prisma.projectIntegration.findFirst({
      where: {
        projectId: project.id,
        provider: 'gbp',
        status: 'connected',
      },
    });

    return NextResponse.json({
      success: true,
      connected: Boolean(gbpIntegration),
      posts: posts.map((p) => ({
        id: p.id,
        locationId: p.locationId,
        locationName: p.location?.name || 'All Locations',
        title: p.title || 'Post Update',
        text: p.text,
        type: p.type,
        status: p.status,
        ctaText: p.ctaText,
        ctaUrl: p.ctaUrl,
        mediaUrl: p.mediaUrl,
        couponCode: p.couponCode,
        startDate: p.startDate?.toISOString(),
        endDate: p.endDate?.toISOString(),
        scheduledFor: p.scheduledFor?.toISOString(),
        date: p.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      })),
      totalCount: posts.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve GBP posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const result = GbpPostCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid post data' },
        { status: 400 }
      );
    }

    const { title, text, type, status, ctaText, ctaUrl, couponCode, startDate, endDate, locationId } =
      result.data;

    const post = await prisma.gbpPost.create({
      data: {
        projectId: project.id,
        locationId: locationId || null,
        title: title || null,
        text,
        type,
        status,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        couponCode: couponCode || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        publishedAt: status === 'Published' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post created successfully!',
      post,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id') || (await req.json().catch(() => ({}))).id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await prisma.gbpPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete post.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
