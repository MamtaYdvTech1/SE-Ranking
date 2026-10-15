import { NextRequest, NextResponse } from 'next/server';

export interface WhiteLabelConfig {
  headerName: string;
  headerLogo: string | null;
  companyName: string;
  selectedColor: string;
  customColor: string;
  footerLogo: string | null;
  footerName: string;
  showFooterLinks: boolean;
  useCustomLinks: boolean;
  customLinks: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  favicon: string | null;
  loginLogoUrl: string | null;
  showCompanyNameOnLogin: boolean;
  loginColorScheme: 'dark' | 'light';
  showLiveHelpWidgets: boolean;
  loginPageLanguage: string;
  smtpHost: string;
  smtpPort: string;
  smtpSenderName: string;
  smtpSenderEmail: string;
  smtpPassword: string;
  useCustomEmailTemplate: boolean;
  updatedAt: string;
}

// In-memory default matching screenshots
const DEFAULT_CONFIG: WhiteLabelConfig = {
  headerName: 'SE Ranking',
  headerLogo: null,
  companyName: 'SE Ranking',
  selectedColor: '#1976D2',
  customColor: '1976D2',
  footerLogo: 'default_se_ranking_icon',
  footerName: 'SE Ranking',
  showFooterLinks: true,
  useCustomLinks: false,
  customLinks: [
    { id: '1', label: 'Report a bug', url: '' },
    { id: '2', label: 'Affiliates', url: 'https://seranking.com/affiliate.html' },
    { id: '3', label: 'API', url: 'https://seranking.com/api.html' },
    { id: '4', label: "What's new", url: 'https://seranking.com/whats-new.html' },
    { id: '5', label: 'Help', url: '' },
  ],
  favicon: null,
  loginLogoUrl: null,
  showCompanyNameOnLogin: true,
  loginColorScheme: 'dark',
  showLiveHelpWidgets: true,
  loginPageLanguage: 'English',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpSenderName: 'SE Ranking Reports',
  smtpSenderEmail: 'reports@seranking.com',
  smtpPassword: '',
  useCustomEmailTemplate: true,
  updatedAt: new Date().toISOString(),
};

let currentConfig: WhiteLabelConfig = { ...DEFAULT_CONFIG };

/** Config as returned to clients: the SMTP password is never sent back, only whether one is set. */
function publicConfig(config: WhiteLabelConfig) {
  const { smtpPassword, ...rest } = config;
  return { ...rest, smtpPassword: '', smtpPasswordSet: Boolean(smtpPassword) };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: publicConfig(currentConfig),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Merge updates; an empty password field keeps the stored one
    const { smtpPassword, ...updates } = body as Partial<WhiteLabelConfig>;
    currentConfig = {
      ...currentConfig,
      ...updates,
      ...(smtpPassword ? { smtpPassword } : {}),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'White label settings successfully applied!',
      data: publicConfig(currentConfig),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT() {
  currentConfig = {
    ...DEFAULT_CONFIG,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    message: 'White label settings reset to default.',
    data: publicConfig(currentConfig),
  });
}
