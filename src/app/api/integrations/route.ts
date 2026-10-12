import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = (await getAuthSession(request)) || (await getSessionFromCookie());
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const integrations = await prisma.projectIntegration.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      integrations,
      availableProviders: [
        {
          id: 'google_search_console',
          name: 'Google Search Console',
          description: 'Sync clicks, impressions, CTR, and keyword rankings directly from Google.',
          connected: integrations.some(
            (i) => (i.provider === 'google_search_console' || i.provider === 'gsc') && i.status === 'connected'
          ),
        },
        {
          id: 'google_analytics_4',
          name: 'Google Analytics 4',
          description: 'Track organic sessions, conversions, bounce rate, and user behavior.',
          connected: integrations.some(
            (i) => (i.provider === 'google_analytics_4' || i.provider === 'ga4') && i.status === 'connected'
          ),
        },
        {
          id: 'matomo',
          name: 'Matomo Analytics',
          description: 'Privacy-focused self-hosted analytics tracking visitors, goals, and events.',
          connected: integrations.some(
            (i) => (i.provider === 'matomo' || i.provider === 'matomo_analytics') && i.status === 'connected'
          ),
        },
        {
          id: 'google_business_profile',
          name: 'Google Business Profile',
          description: 'Manage GBP locations, customer reviews, local ranking visibility, and posts.',
          connected: integrations.some(
            (i) => (i.provider === 'google_business_profile' || i.provider === 'gbp') && i.status === 'connected'
          ),
        },
        {
          id: 'cloudflare',
          name: 'Cloudflare Core & R2 Storage',
          description: 'High-speed Anycast DNS, R2 Cloud Object Storage, Edge Cache Purge, and Turnstile Bot Defense.',
          connected: integrations.some(
            (i) => (i.provider === 'cloudflare' || i.provider === 'cloudflare_r2') && i.status === 'connected'
          ) || !!process.env.CLOUDFLARE_ACCOUNT_ID,
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getAuthSession(request)) || (await getSessionFromCookie());
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, provider, isActive, status, config, accountName } = body;

    if (!projectId || !provider) {
      return NextResponse.json(
        { success: false, message: 'projectId and provider are required' },
        { status: 400 }
      );
    }

    // Normalize provider slug
    let normalizedProvider = provider.toLowerCase().trim();
    if (normalizedProvider === 'google analytics' || normalizedProvider === 'google_analytics_4') {
      normalizedProvider = 'ga4';
    } else if (normalizedProvider === 'google search console' || normalizedProvider === 'google_search_console') {
      normalizedProvider = 'gsc';
    } else if (normalizedProvider === 'matomo analytics') {
      normalizedProvider = 'matomo';
    }

    const targetStatus = status || (isActive ? 'connected' : 'disconnected');

    const existing = await prisma.projectIntegration.findFirst({
      where: {
        projectId,
        OR: [
          { provider: normalizedProvider },
          { provider: provider }
        ]
      },
    });

    let integration;
    if (existing) {
      integration = await prisma.projectIntegration.update({
        where: { id: existing.id },
        data: {
          status: targetStatus,
          provider: normalizedProvider,
          accountName: accountName || existing.accountName,
          lastSyncedAt: targetStatus === 'connected' ? new Date() : existing.lastSyncedAt,
          config: config ? JSON.stringify(config) : existing.config,
        },
      });
    } else {
      integration = await prisma.projectIntegration.create({
        data: {
          projectId,
          provider: normalizedProvider,
          status: targetStatus,
          accountName: accountName || null,
          lastSyncedAt: targetStatus === 'connected' ? new Date() : null,
          config: config ? JSON.stringify(config) : null,
        },
      });
    }

    return NextResponse.json({ success: true, integration });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
