import { NextRequest, NextResponse } from 'next/server';
import { SearchEngineConfig } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getCountryInfo } from '@/lib/countryUtils';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getActiveEngineCapabilities, getRankingProvider, SearchEngineType } from '@/lib/rankings';

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

    const provider = getRankingProvider();
    const engineCaps = getActiveEngineCapabilities();
    const capMap = new Map(engineCaps.map((c) => [c.engine, c]));

    const searchEngines = (project.searchEngines || []) as SearchEngineConfig[];
    const formatted = searchEngines.map((eng: SearchEngineConfig) => {
      const cInfo = getCountryInfo(eng.countryCode);
      const cap = capMap.get(eng.engine.toLowerCase() as SearchEngineType);
      const isAvailable = cap ? cap.isAvailable : false;

      return {
        id: eng.id,
        engine: eng.engine,
        name: `${eng.engine.toUpperCase()} ${cInfo?.name || eng.country}`,
        country: cInfo?.name || eng.country,
        countryCode: eng.countryCode.toLowerCase(),
        location: eng.location || cInfo?.name || eng.country,
        language: eng.language || 'English',
        languageCode: eng.languageCode || 'en',
        device: eng.device || 'desktop',
        isActive: eng.isActive,
        isAvailable,
        status: isAvailable ? 'active' : 'unconfigured',
        notes: cap?.notes || (isAvailable ? 'Active' : 'Provider configuration required'),
        icon: eng.engine.toLowerCase(),
      };
    });

    return NextResponse.json({
      success: true,
      activeProvider: provider.id,
      isProviderConfigured: provider.isConfigured(),
      capabilities: engineCaps,
      engines: formatted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve search engines.';
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
    const cInfo = getCountryInfo(body.countryCode || body.country);
    const country = cInfo?.name || body.country || 'India';
    const countryCode = (cInfo?.flagCode || body.countryCode || 'in').toLowerCase();
    const location = body.location || country;
    const engine = (body.engine || 'google').toLowerCase();
    const language = body.language || 'English';
    const languageCode = (body.languageCode || 'en').toLowerCase();
    const device = body.device || 'desktop';

    // Verify engine capability
    const engineCaps = getActiveEngineCapabilities();
    const cap = engineCaps.find((c) => c.engine === engine);

    const created = await prisma.searchEngineConfig.create({
      data: {
        projectId: project.id,
        engine,
        country,
        countryCode,
        location,
        language,
        languageCode,
        device,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      engine: {
        id: created.id,
        engine: created.engine,
        name: `${created.engine.toUpperCase()} ${country}`,
        country,
        countryCode,
        location,
        language,
        languageCode,
        device,
        isActive: true,
        isAvailable: cap?.isAvailable ?? false,
        status: cap?.isAvailable ? 'active' : 'unconfigured',
        notes: cap?.notes,
        icon: created.engine.toLowerCase(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add search engine.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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
    const engineId = searchParams.get('id');

    if (!engineId) {
      return NextResponse.json({ error: 'Search engine ID is required' }, { status: 400 });
    }

    const existing = await prisma.searchEngineConfig.findFirst({
      where: { id: engineId, projectId: project.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Search engine not found in this project' }, { status: 404 });
    }

    await prisma.searchEngineConfig.delete({
      where: { id: engineId },
    });

    return NextResponse.json({ success: true, message: 'Search engine removed.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete search engine.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
