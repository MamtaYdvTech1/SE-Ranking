import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@node-rs/argon2'],
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/admin.reports.list.html',
        destination: '/reports',
      },
      {
        source: '/admin.user.whitelabel.html',
        destination: '/agency-pack',
      },
      {
        source: '/admin.lead_generator.html',
        destination: '/agency-pack',
      },
      {
        source: '/project_overview',
        destination: '/project-overview',
      },
      {
        source: '/admin.site.positions.:path*',
        destination: '/rankings',
      },
      {
        source: '/admin.site.positions.html',
        destination: '/rankings',
      },
      {
        source: '/solutions',
        destination: '/for-agencies',
      },
      {
        source: '/tools',
        destination: '/keyword-rank-tracker',
      },
      {
        source: '/resources',
        destination: '/help',
      },
      {
        source: '/competitor-analysis',
        destination: '/competitor-analysis-tool',
      },
      {
        source: '/website-audit/page-changes',
        destination: '/page-changes',
      },
      {
        source: '/research/ai-visibility',
        destination: '/research/ai-search',
      },
      {
        source: '/admin/audit-logs',
        destination: '/admin/activity-logs',
      },
      {
        source: '/admin/usage',
        destination: '/admin/api-usage',
      },
      {
        source: '/admin/integrations',
        destination: '/admin/providers',
      },
    ];
  },
};

export default nextConfig;
