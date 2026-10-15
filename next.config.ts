import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
