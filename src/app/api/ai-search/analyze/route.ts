import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/validation/schemas';
import { getSeoProvider } from '@/lib/seo/provider';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = AnalyzeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid request parameters.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const input = validationResult.data;
    const provider = getSeoProvider();

    // Call SEO provider
    const analysisData = await provider.analyze(input);

    // Save in database
    const savedAnalysis = await prisma.analysis.create({
      data: {
        projectId: input.projectId || null,
        domain: input.domain,
        scope: input.scope,
        brandName: input.brandName || null,
        country: input.country,
        countryCode: input.countryCode,
        searchType: input.searchType,
        aiPresence: analysisData.aiPresence,
        brandPresence: analysisData.brandPresence,
        domainPresence: analysisData.domainPresence,
        avgPosition: analysisData.avgPosition,
        traffic: analysisData.traffic,
        mentions: analysisData.mentions,
        links: analysisData.links,
        citationShare: analysisData.citationShare,
        status: 'completed',
        engines: {
          create: analysisData.engines.map((e) => ({
            engineId: e.engineId,
            name: e.name,
            mentions: e.mentions,
            linkPresence: e.linkPresence,
            presence: e.presence,
            status: e.status,
          })),
        },
        prompts: {
          create: analysisData.prompts.map((p) => ({
            prompt: p.prompt,
            topic: p.topic,
            engine: p.engine,
            mention: p.mention,
            link: p.link,
            ads: p.ads,
            competitors: JSON.stringify(p.competitors),
            fullAnswer: p.fullAnswer || null,
            answerDate: p.answerDate ? new Date(p.answerDate) : null,
            visibility: p.visibility,
          })),
        },
        citations: {
          create: analysisData.citations.map((c) => ({
            domain: c.domain,
            url: c.url,
            citationShare: c.citationShare,
            visibility: c.visibility,
            topics: c.topics,
            domainTrust: c.domainTrust,
            pageTrust: c.pageTrust,
            organicTraffic: c.organicTraffic,
          })),
        },
        competitors: {
          create: analysisData.competitors.map((cp) => ({
            domain: cp.domain,
            brandName: cp.brandName || null,
            aiPresence: cp.aiPresence,
            domainPresence: cp.domainPresence,
            brandPresence: cp.brandPresence,
            avgPosition: cp.avgPosition,
            shareOfVoice: cp.shareOfVoice,
          })),
        },
      },
    });

    // Record API usage
    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/ai-search/analyze',
        creditsUsed: 1,
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      analysisId: savedAnalysis.id,
      data: {
        ...analysisData,
        id: savedAnalysis.id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to retrieve SEO data. Please try again.';
    const status = message.includes('credentials')
      ? 401
      : message.includes('limit')
      ? 429
      : message.includes('valid')
      ? 400
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
