import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';

export const runtime = 'nodejs';

export interface ReportBuilderConfig {
  headerLogo: string | null;
  companyName: string;
  headerColor: string;
  customHeaderColor: string;
  headerTextColor: string;
  coverPageLogo: string | null;
  coverPageBackground: string | null;
  coverPageTextColor: string;
  orientation: 'portrait' | 'landscape';
  updatedAt: string;
}

const DEFAULT_CONFIG: ReportBuilderConfig = {
  headerLogo: null,
  companyName: 'SE Ranking',
  headerColor: '#1976D2',
  customHeaderColor: '1976D2',
  headerTextColor: 'FFFFFF',
  coverPageLogo: 'default_se_ranking',
  coverPageBackground: null,
  coverPageTextColor: '232A32',
  orientation: 'landscape',
  updatedAt: new Date().toISOString(),
};

function getConfigPath(userId: string): string {
  const dir = path.join(process.cwd(), 'data', 'reports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'default';
  return path.join(dir, `report_builder_${safeId}.json`);
}

function readConfig(userId: string): ReportBuilderConfig {
  try {
    const configPath = getConfigPath(userId);
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading report builder config file:', err);
  }
  return { ...DEFAULT_CONFIG };
}

function writeConfig(userId: string, cfg: ReportBuilderConfig): void {
  try {
    const configPath = getConfigPath(userId);
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing report builder config file:', err);
  }
}

export async function GET(req: NextRequest) {
  const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
  if (!auth?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
  }

  const config = readConfig(auth.user.id);
  return NextResponse.json({
    success: true,
    data: config,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const existing = readConfig(auth.user.id);
    const updated: ReportBuilderConfig = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeConfig(auth.user.id, updated);

    return NextResponse.json({
      success: true,
      message: 'Report Builder settings successfully applied!',
      data: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
  if (!auth?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required. Please sign in.' }, { status: 401 });
  }

  const resetConfig: ReportBuilderConfig = {
    ...DEFAULT_CONFIG,
    updatedAt: new Date().toISOString(),
  };

  writeConfig(auth.user.id, resetConfig);

  return NextResponse.json({
    success: true,
    message: 'Report Builder settings reset to default.',
    data: resetConfig,
  });
}
