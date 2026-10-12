import { NextResponse } from 'next/server';
import { getSeoProvider } from '@/lib/seo/provider';

export async function POST() {
  try {
    const provider = getSeoProvider();
    const result = await provider.testConnection();

    return NextResponse.json(result, { status: result.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to SEO data provider.';
    return NextResponse.json({ success: false, message, status: 500 }, { status: 500 });
  }
}
