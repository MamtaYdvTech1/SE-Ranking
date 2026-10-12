import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  const projectUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbymsyjjaygipxfkyqxm.supabase.co';
  const projectId = process.env.SUPABASE_PROJECT_ID || 'vbymsyjjaygipxfkyqxm';
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'));

  let restReachable = false;
  let restStatus = 0;
  let errorDetail: string | null = null;

  try {
    const res = await fetch(`${projectUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
          : {}),
      },
    });

    restStatus = res.status;
    // Status 200 or 401 with valid json response confirms Supabase project gateway is alive
    if (res.status === 200 || res.status === 401 || res.status === 400) {
      restReachable = true;
    }
  } catch (err: any) {
    errorDetail = err?.message || 'Network connection failed to Supabase';
  }

  return NextResponse.json({
    success: true,
    supabase: {
      projectId,
      projectUrl,
      restGatewayAlive: restReachable,
      restGatewayStatusCode: restStatus,
      credentialsConfigured: {
        hasAnonKey,
        hasServiceKey,
        hasDatabaseUrl,
      },
      connectionStringHint: `postgresql://postgres.${projectId}:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
      directUrlHint: `postgresql://postgres.${projectId}:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
      dashboardUrl: `https://supabase.com/dashboard/project/${projectId}`,
      errorDetail,
    },
  });
}
