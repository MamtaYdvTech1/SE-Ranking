import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession } from '@/lib/server/auth';
import { getCountryInfo } from '@/lib/countryUtils';

export interface ReviewItem {
  id: string;
  author: string;
  rating: number | null;
  date: string;
  text: string;
  source?: string;
  sourceIcon?: string;
  avatar?: string;
  reply?: string | null;
  repliedAt?: string | null;
  status?: string;
  language?: string;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthSession(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Find project
    let project = null;
    if (projectId) {
      project = await prisma.project.findFirst({
        where: { OR: [{ id: projectId }, { domain: projectId }] },
      });
    } else {
      project = await prisma.project.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!project) {
      return NextResponse.json({
        success: true,
        data: {
          gbpConnected: false,
          locations: [],
          posts: [],
          reviews: [],
          message: 'No project configured. Please create a project to manage local marketing.',
        },
      });
    }

    // Check if Google Business Profile integration is connected
    const gbpIntegration = await prisma.projectIntegration.findFirst({
      where: {
        projectId: project.id,
        provider: 'gbp',
        status: 'connected',
      },
    });

    const isConnected = Boolean(gbpIntegration);

    // Fetch real locations from database
    const dbLocations = await prisma.location.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            posts: { where: { deletedAt: null } },
            reviews: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch real GBP posts from database
    const dbPosts = await prisma.gbpPost.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      include: {
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch real reviews from database
    const dbReviews = await prisma.review.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedLocations = dbLocations.map((loc) => {
      const cInfo = getCountryInfo(loc.countryCode);
      return {
        id: loc.id,
        name: loc.name || 'Unnamed Location',
        address: loc.address || '',
        city: loc.city || '',
        country: cInfo?.name || loc.countryCode,
        countryCode: loc.countryCode.toLowerCase(),
        phone: loc.phone || '',
        score: loc.rating ? Math.round(loc.rating * 20) : null,
        status: loc.status === 'Active' ? 'Healthy' : 'Needs Attention',
        listingsFound: 0,
        listingsTotal: 0,
        napErrors: 0,
        isDemo: false,
        googleVerified: loc.isGbpConnected,
        rating: loc.rating || null,
        reviewsCount: loc._count.reviews || loc.reviewsCount || 0,
      };
    });

    const formattedPosts = dbPosts.map((p) => ({
      id: p.id,
      title: p.title || 'Post',
      text: p.text,
      fullText: p.text,
      type: p.type,
      status: p.status,
      date: p.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      creator: 'User',
      creatorId: project.id,
      imageUrl: p.mediaUrl,
      ctaText: p.ctaText,
      ctaUrl: p.ctaUrl,
      couponCode: p.couponCode,
      startDate: p.startDate?.toISOString(),
      endDate: p.endDate?.toISOString(),
    }));

    const formattedReviews = dbReviews.map((r) => ({
      id: r.id,
      source: r.source,
      sourceIcon: r.source.slice(0, 1).toUpperCase(),
      rating: r.rating,
      date: r.reviewDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      text: r.text,
      author: r.author,
      status: r.status,
      language: r.language.toUpperCase(),
      reply: r.reply,
    }));

    // Calculate dynamic review stats
    const totalReviews = formattedReviews.length;
    const ratedReviews = formattedReviews.filter((r) => r.rating !== null);
    const avgScore =
      ratedReviews.length > 0
        ? Number((ratedReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedReviews.length).toFixed(1))
        : null;

    return NextResponse.json({
      success: true,
      data: {
        gbpConnected: isConnected,
        locations: formattedLocations,
        posts: formattedPosts,
        reviews: formattedReviews,
        rankingsSummary: null, // Only displayed if real ranking tracker connected
        auditSummary: {
          totalLocations: formattedLocations.length,
          connectedLocations: formattedLocations.filter((l) => l.googleVerified).length,
        },
        reviewsOverview: {
          averageScore: avgScore,
          totalReviews,
          positive: formattedReviews.filter((r) => (r.rating || 0) >= 4).length,
          neutral: formattedReviews.filter((r) => r.rating === 3).length,
          negative: formattedReviews.filter((r) => (r.rating || 0) <= 2 && r.rating !== null).length,
          notRated: formattedReviews.filter((r) => r.rating === null).length,
        },
      },
    });
  } catch (error: any) {
    console.error('Local marketing GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load local marketing data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthSession(request);
    const body = await request.json();
    const { action, projectId } = body;

    let targetProjectId = projectId;
    if (!targetProjectId) {
      const p = await prisma.project.findFirst({ where: { deletedAt: null }, select: { id: true } });
      targetProjectId = p?.id;
    }

    if (!targetProjectId) {
      return NextResponse.json({ error: 'Project is required' }, { status: 400 });
    }

    if (action === 'add_location') {
      const cInfo = getCountryInfo(body.countryCode || body.country);
      const newLoc = await prisma.location.create({
        data: {
          projectId: targetProjectId,
          userId: auth?.user?.id || null,
          name: body.name || 'New Location',
          address: body.address || '',
          city: body.city || '',
          countryCode: cInfo?.flagCode || 'us',
          phone: body.phone || null,
          category: body.category || 'Business',
          status: 'Active',
        },
      });
      return NextResponse.json({ success: true, location: newLoc });
    }

    if (action === 'add_post') {
      const newPost = await prisma.gbpPost.create({
        data: {
          projectId: targetProjectId,
          locationId: body.locationId || null,
          title: body.title || null,
          text: body.text || '',
          type: body.type || 'Update',
          status: body.status || 'Published',
          ctaText: body.ctaText || null,
          ctaUrl: body.ctaUrl || null,
          couponCode: body.couponCode || null,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, post: newPost });
    }

    if (action === 'reply_review') {
      const { reviewId, replyText } = body;
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          reply: replyText,
          status: 'Answered',
        },
      });
      return NextResponse.json({ success: true, review: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Local marketing POST error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
