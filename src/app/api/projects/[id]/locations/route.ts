import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LocationCreateSchema } from '@/lib/validation/schemas';
import { getAuthSession } from '@/lib/server/auth';
import { getCountryInfo } from '@/lib/countryUtils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const locations = await prisma.location.findMany({
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

    const formatted = locations.map((loc) => {
      const cInfo = getCountryInfo(loc.countryCode);
      return {
        id: loc.id,
        name: loc.name,
        country: cInfo?.name || loc.countryCode,
        countryCode: loc.countryCode.toLowerCase(),
        region: loc.region,
        city: loc.city,
        postalCode: loc.postalCode,
        address: loc.address,
        phone: loc.phone,
        category: loc.category || 'Business',
        isGbpConnected: loc.isGbpConnected,
        rating: loc.rating || null,
        reviewsCount: loc._count.reviews || loc.reviewsCount || 0,
        postsCount: loc._count.posts || 0,
        status: loc.status,
        createdAt: loc.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      locations: formatted,
      totalCount: formatted.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve locations.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthSession(req);
    const body = await req.json();

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const result = LocationCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid location data' },
        { status: 400 }
      );
    }

    const { name, countryCode, city, region, postalCode, address, phone, category, language, timezone } =
      result.data;

    const location = await prisma.location.create({
      data: {
        projectId: project.id,
        userId: auth?.user?.id || null,
        name,
        countryCode: countryCode.toLowerCase(),
        region: region || null,
        city,
        postalCode: postalCode || null,
        address,
        phone: phone || null,
        category: category || 'Business',
        language: language || 'en',
        timezone: timezone || 'UTC',
        status: 'Active',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Location added successfully!',
      location,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add location.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const auth = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('id') || (await req.json().catch(() => ({}))).id;

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    await prisma.location.update({
      where: { id: locationId },
      data: {
        deletedAt: new Date(),
        deletedBy: auth?.user?.email || 'admin',
      },
    });

    return NextResponse.json({ success: true, message: 'Location deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete location.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
