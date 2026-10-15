import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { extractSources, hostOf, recordTrackerAnswer, type AnswerSource } from '@/services/seo/ai-tracker.service';

const CheckAiSearchSchema = z.object({
  query: z.string().min(2).max(500),
  engine: z.enum(['google-ai-overview', 'chatgpt', 'google-ai-mode']),
});

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

    const { searchParams } = new URL(req.url);
    const engineFilter = searchParams.get('engine');

    const records = await prisma.aiSearchRecord.findMany({
      where: {
        projectId: project.id,
        ...(engineFilter ? { engine: engineFilter } : {}),
      },
      orderBy: { checkedAt: 'desc' },
      take: 100,
    });

    const totalChecks = records.length;
    const mentionedCount = records.filter((r) => r.mentioned).length;
    const citedCount = records.filter((r) => Boolean(r.citedUrl)).length;
    const visibilityScore =
      totalChecks > 0 ? Number(((mentionedCount / totalChecks) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      projectId: project.id,
      domain: project.domain,
      summary: {
        totalChecks,
        mentionedCount,
        citedCount,
        visibilityScore,
      },
      records: records.map((r) => ({
        id: r.id,
        query: r.query,
        engine: r.engine,
        domain: r.domain,
        mentioned: r.mentioned,
        citedUrl: r.citedUrl,
        citationPosition: r.citationPosition,
        mentionStatus: r.mentionStatus,
        visibilityScore: r.visibilityScore,
        snippet: r.snippet,
        checkedAt: r.checkedAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI search visibility.';
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

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = CheckAiSearchSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid AI search check payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { query, engine } = parseResult.data;
    const cleanDomain = project.domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();

    // 1. Google AI Overviews Check
    if (engine === 'google-ai-overview') {
      const serperKey = process.env.SERPER_API_KEY;
      const serpApiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;

      if (!serperKey && !serpApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PROVIDER_UNCONFIGURED',
              message: 'Google AI Overviews tracking requires SERPER_API_KEY or SERPAPI_API_KEY. Engine is unconfigured.',
              engine,
            },
          },
          { status: 400 }
        );
      }

      let mentioned = false;
      let citedUrl: string | null = null;
      let citationPosition: number | null = null;
      let snippet: string | null = null;
      let mentionStatus = 'Not Mentioned';

      let answerText = '';
      let sources: AnswerSource[] = [];

      if (serperKey) {
        const resp = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            gl: project.countryCode || 'us',
            num: 10,
          }),
        });

        if (!resp.ok) {
          return NextResponse.json(
            { success: false, error: { code: 'API_ERROR', message: `Serper returned status ${resp.status}`, engine } },
            { status: 502 }
          );
        }

        const data = await resp.json();
        const answerBox = data.answerBox || {};
        const aiOverview = data.aiOverview || data.ai_overview || null;
        const aiText: string =
          (aiOverview && (aiOverview.text || aiOverview.snippet)) || answerBox.snippet || answerBox.answer || '';
        answerText = aiText;
        snippet = aiText || null;

        const refs: Array<{ link?: string; url?: string }> = [
          ...((aiOverview?.references || aiOverview?.sources || []) as Array<{ link?: string; url?: string }>),
          ...(answerBox.link ? [{ link: answerBox.link }] : []),
        ];
        sources = refs
          .map((r) => r.link || r.url || '')
          .filter(Boolean)
          .map((url) => ({ url, domain: hostOf(url) }))
          .filter((src) => src.domain);

        const ownIdx = sources.findIndex((src) => src.domain === cleanDomain || src.domain.endsWith(`.${cleanDomain}`));
        if (ownIdx >= 0) {
          citedUrl = sources[ownIdx].url;
          citationPosition = ownIdx + 1;
        }
        mentioned = Boolean(citedUrl) || aiText.toLowerCase().includes(cleanDomain);
        mentionStatus = citedUrl ? 'Cited' : mentioned ? 'Mentioned' : 'Not Mentioned';
      } else if (serpApiKey) {
        // Query SerpApi with generative AI overview extraction
        const resp = await fetch(
          `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&gl=${project.countryCode || 'us'}&api_key=${serpApiKey}`
        );

        if (!resp.ok) {
          return NextResponse.json(
            { error: `SerpApi error: ${resp.statusText}`, code: 'API_ERROR' },
            { status: resp.status }
          );
        }

        const data = await resp.json();
        const aiOverview = data.ai_overview || data.generative_ai;

        if (aiOverview) {
          const fullText = (aiOverview.text || aiOverview.snippet || JSON.stringify(aiOverview)).toLowerCase();
          mentioned = fullText.includes(cleanDomain);

          const references = aiOverview.references || aiOverview.citations || [];
          answerText = aiOverview.text || aiOverview.snippet || '';
          sources = references
            .map((r: { link?: string; url?: string }) => r.link || r.url || '')
            .filter(Boolean)
            .map((url: string) => ({ url, domain: hostOf(url) }))
            .filter((src: AnswerSource) => src.domain);
          for (let i = 0; i < references.length; i++) {
            const refLink = (references[i].link || references[i].url || '').toLowerCase();
            if (refLink.includes(cleanDomain)) {
              citedUrl = references[i].link || references[i].url;
              citationPosition = i + 1;
              mentioned = true;
              break;
            }
          }

          mentionStatus = citedUrl ? 'Cited' : mentioned ? 'Mentioned' : 'Not Mentioned';
          snippet = aiOverview.text?.slice(0, 300) || null;
        }
      }

      const record = await prisma.aiSearchRecord.create({
        data: {
          projectId: project.id,
          query,
          engine,
          domain: cleanDomain,
          mentioned,
          citedUrl,
          citationPosition,
          mentionStatus,
          visibilityScore: citedUrl ? 100 : mentioned ? 50 : 0,
          snippet,
          checkedAt: new Date(),
        },
      });
      await recordTrackerAnswer({
        projectId: project.id,
        projectDomain: cleanDomain,
        query,
        engine,
        answer: answerText,
        sources,
        mentioned,
        linked: Boolean(citedUrl),
      });

      return NextResponse.json({
        success: true,
        record,
        aiAnswerFound: Boolean(answerText),
      });
    }

    // 2. ChatGPT Live Search Check
    if (engine === 'chatgpt') {
      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey || openAiKey.trim() === '' || openAiKey.includes('placeholder')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ENGINE_UNCONFIGURED',
              message: 'ChatGPT tracking requires OPENAI_API_KEY environment variable. Engine is unconfigured.',
              engine,
            },
          },
          { status: 400 }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a search assistant. Answer the user search query concisely and list relevant websites with markdown links.',
            },
            { role: 'user', content: query },
          ],
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'API_ERROR',
              message: errBody?.error?.message || `OpenAI returned status ${response.status}`,
              engine,
            },
          },
          { status: 502 }
        );
      }
      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content || '';
      const sources = extractSources(content);

      const lower = content.toLowerCase();
      const mentioned = lower.includes(cleanDomain);

      // Extract cited URL if markdown link contains domain
      const linkMatch = content.match(new RegExp(`\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\)]*${cleanDomain}[^\\)]*)\\)`, 'i'));
      const citedUrl = linkMatch ? linkMatch[2] : null;

      const record = await prisma.aiSearchRecord.create({
        data: {
          projectId: project.id,
          query,
          engine,
          domain: cleanDomain,
          mentioned,
          citedUrl,
          citationPosition: citedUrl ? 1 : null,
          mentionStatus: citedUrl ? 'Cited' : mentioned ? 'Mentioned' : 'Not Mentioned',
          visibilityScore: citedUrl ? 100 : mentioned ? 50 : 0,
          snippet: content.slice(0, 300),
          checkedAt: new Date(),
        },
      });
      await recordTrackerAnswer({
        projectId: project.id,
        projectDomain: cleanDomain,
        query,
        engine,
        answer: content,
        sources,
        mentioned,
        linked: Boolean(citedUrl),
      });

      return NextResponse.json({ success: true, record });
    }

    // 3. Google AI Mode Check
    if (engine === 'google-ai-mode') {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey || geminiKey.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ENGINE_UNCONFIGURED',
              message: 'Google AI Mode tracking requires GEMINI_API_KEY environment variable. Engine is unconfigured.',
              engine,
            },
          },
          { status: 400 }
        );
      }

      // Query Gemini Google Search grounding
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }],
            tools: [{ google_search: {} }],
          }),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: `Gemini API returned status ${response.status}`, code: 'API_ERROR' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const grounding = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Grounding URIs are redirect links; the source domain is in web.title
      const sources: AnswerSource[] = (grounding as Array<{ web?: { uri?: string; title?: string } }>)
        .map((g) => ({
          url: g.web?.uri || '',
          domain: (g.web?.title || hostOf(g.web?.uri || '')).replace(/^www\./i, '').toLowerCase(),
        }))
        .filter((src) => src.url && src.domain);

      let citedUrl: string | null = null;
      let citationPosition: number | null = null;
      const ownIdx = sources.findIndex((src) => src.domain === cleanDomain || src.domain.endsWith(`.${cleanDomain}`));
      if (ownIdx >= 0) {
        citedUrl = sources[ownIdx].url;
        citationPosition = ownIdx + 1;
      }

      const mentioned = text.toLowerCase().includes(cleanDomain) || Boolean(citedUrl);

      const record = await prisma.aiSearchRecord.create({
        data: {
          projectId: project.id,
          query,
          engine,
          domain: cleanDomain,
          mentioned,
          citedUrl,
          citationPosition,
          mentionStatus: citedUrl ? 'Cited' : mentioned ? 'Mentioned' : 'Not Mentioned',
          visibilityScore: citedUrl ? 100 : mentioned ? 50 : 0,
          snippet: text.slice(0, 300),
          checkedAt: new Date(),
        },
      });
      await recordTrackerAnswer({
        projectId: project.id,
        projectDomain: cleanDomain,
        query,
        engine,
        answer: text,
        sources,
        mentioned,
        linked: Boolean(citedUrl),
      });

      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ error: 'Unsupported AI engine' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI search check failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
