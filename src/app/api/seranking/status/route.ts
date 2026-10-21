import { NextResponse } from 'next/server';
import { seRankingClient } from '@/lib/seranking/client';

export async function GET() {
  try {
    if (!seRankingClient.isConfigured()) {
      return NextResponse.json({
        configured: false,
        status: 'unconfigured',
        message: 'SE Ranking Data API key is not configured in environment.',
      });
    }

    const sub = await seRankingClient.checkSubscription();
    return NextResponse.json({
      configured: true,
      apiKeyPrefix: seRankingClient.getApiKey() ? `${seRankingClient.getApiKey()!.slice(0, 8)}...` : null,
      subscription: sub.data,
      source: sub.source,
      timestamp: sub.timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error checking SE Ranking Data API status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
