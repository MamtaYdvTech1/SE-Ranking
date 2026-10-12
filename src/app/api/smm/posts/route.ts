import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');
    const status = searchParams.get('status');

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    let posts = await (prisma as any).socialPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { brand: true },
    }).catch(() => []);

    if (posts.length === 0) {
      // Find or create default brand to attach initial posts
      let brand = await (prisma as any).socialBrand.findFirst().catch(() => null);
      if (!brand) {
        brand = await (prisma as any).socialBrand.create({
          data: {
            name: 'Juice Tokyo',
            workspaceName: 'Juice Tokyo Workspace',
            platforms: JSON.stringify(['Instagram', 'LinkedIn', 'TikTok', 'X (Twitter)', 'Facebook']),
            workspacesCount: 1,
            postsCount: 3,
            status: 'Active',
          },
        }).catch(() => null);
      }

      if (brand) {
        const seedPosts = [
          {
            brandId: brand.id,
            platform: 'Instagram',
            title: 'Product Launch 🚀',
            caption: 'Discover our next-gen social media workflow powered by Planable & SE Ranking! 🚀✨ #socialmedia #marketing #seranking',
            status: 'Approved',
            scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
            likes: 248,
            comments: 18,
            shares: 34,
          },
          {
            brandId: brand.id,
            platform: 'LinkedIn',
            title: 'Q3 Growth Recap',
            caption: 'Excited to announce our Q3 growth milestones! Team collaboration and unified multi-brand management scaled our client reach by 142%.',
            status: 'InReview',
            scheduledFor: new Date(Date.now() + 172800000), // In 2 days
            likes: 412,
            comments: 46,
            shares: 52,
          },
          {
            brandId: brand.id,
            platform: 'TikTok',
            title: 'Behind the Scenes',
            caption: 'A day in the life of our creative team organizing campaigns in a drag-and-drop calendar! 🎥👀 #agencylife #behindthescenes',
            status: 'Scheduled',
            scheduledFor: new Date(Date.now() + 259200000), // In 3 days
            likes: 1820,
            comments: 94,
            shares: 210,
          },
        ];

        for (const sp of seedPosts) {
          await (prisma as any).socialPost.create({ data: sp }).catch(() => null);
        }

        posts = await (prisma as any).socialPost.findMany({
          orderBy: { createdAt: 'desc' },
          include: { brand: true },
        }).catch(() => []);
      }
    }

    return NextResponse.json({
      success: true,
      posts: posts.map((p: any) => ({
        id: p.id,
        brandId: p.brandId,
        brandName: p.brand?.name || 'Social Brand',
        platform: p.platform,
        title: p.title || 'Untitled Post',
        caption: p.caption,
        mediaUrl: p.mediaUrl,
        status: p.status,
        scheduledFor: p.scheduledFor,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        createdAt: p.createdAt,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve social posts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { brandId, platform, title, caption, scheduledFor, status, mediaUrl } = body;

    if (!brandId) {
      const defaultBrand = await (prisma as any).socialBrand.findFirst();
      brandId = defaultBrand?.id;
    }

    if (!brandId) {
      return NextResponse.json({ error: 'Please create or select a brand workspace first' }, { status: 400 });
    }

    if (!caption || !caption.trim()) {
      return NextResponse.json({ error: 'Post caption is required' }, { status: 400 });
    }

    const newPost = await (prisma as any).socialPost.create({
      data: {
        brandId,
        platform: platform || 'Instagram',
        title: title?.trim() || 'Social Post',
        caption: caption.trim(),
        mediaUrl: mediaUrl || null,
        status: status || 'Scheduled',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 86400000),
        likes: 0,
        comments: 0,
        shares: 0,
      },
      include: { brand: true },
    });

    // Update brand postsCount
    await (prisma as any).socialBrand.update({
      where: { id: brandId },
      data: { postsCount: { increment: 1 } },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        brandId: newPost.brandId,
        brandName: newPost.brand?.name,
        platform: newPost.platform,
        title: newPost.title,
        caption: newPost.caption,
        status: newPost.status,
        scheduledFor: newPost.scheduledFor,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to schedule post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, caption, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (caption) data.caption = caption;
    if (title) data.title = title;

    const updated = await (prisma as any).socialPost.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = req.method === 'DELETE' ? await req.json().catch(() => ({})) : {};
    const postId = id || body.id;

    if (postId) {
      await (prisma as any).socialPost.delete({ where: { id: postId } }).catch(() => null);
    }
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
