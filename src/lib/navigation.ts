export type NavSection =
  | 'projects'
  | 'research'
  | 'ai-search'
  | 'backlinks'
  | 'audit'
  | 'reports'
  | 'content'
  | 'local'
  | 'agency'
  | 'api'
  | 'smm'
  | 'settings';

/**
 * Returns the exact suite section corresponding to the given pathname.
 * Used across AppProviders, LeftRail, and SecondarySidebar so that the sidebar
 * and navigation rail are ALWAYS 100% synchronized, including when opened
 * in a new browser tab or refreshed.
 */
export function getSectionFromPathname(pathname: string): NavSection {
  if (!pathname) return 'projects';

  // 1. Settings & User Profile
  if (
    pathname.startsWith('/admin.user.settings') ||
    pathname.startsWith('/admin.users') ||
    pathname.startsWith('/admin.session.lock') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings') ||
    pathname === '/users' ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/bonus-offers') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/affiliate')
  ) {
    return 'settings';
  }

  // 2. SMM (Social Media Management)
  if (
    pathname === '/smm' ||
    pathname.startsWith('/smm') ||
    pathname.startsWith('/admin.smm')
  ) {
    return 'smm';
  }

  // 3. Content Marketing
  if (pathname.startsWith('/content-marketing')) {
    return 'content';
  }

  // 4. Local Marketing
  if (
    pathname.startsWith('/local-marketing') ||
    pathname.startsWith('/admin.local_marketing')
  ) {
    return 'local';
  }

  // 5. AI Search
  if (
    pathname.startsWith('/research/ai-search') ||
    pathname.startsWith('/ai-search') ||
    pathname.startsWith('/ai-results-tracker')
  ) {
    return 'ai-search';
  }

  // 6. Website Audit & On-Page Tools
  if (
    pathname.startsWith('/website-audit') ||
    pathname.startsWith('/on-page-seo-checker') ||
    pathname.startsWith('/serp-analyzer') ||
    pathname === '/audit' ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/admin.audit') ||
    pathname.startsWith('/admin.seochecker')
  ) {
    return 'audit';
  }

  // 6. Report Builder
  if (
    pathname.startsWith('/reports') ||
    pathname.startsWith('/admin.reports')
  ) {
    return 'reports';
  }

  // 7. Backlinks Checker Suite (Standalone)
  // Exclude /backlinks-monitor which belongs to Project suite
  if (
    (pathname.startsWith('/backlinks') && !pathname.startsWith('/backlinks-monitor')) ||
    pathname.startsWith('/admin.backlinks') ||
    pathname.startsWith('/backlink-checker')
  ) {
    return 'backlinks';
  }

  // 8. Agency Pack
  if (
    pathname.startsWith('/agency-pack') ||
    pathname.startsWith('/admin.user.whitelabel') ||
    pathname.startsWith('/admin.lead_generator')
  ) {
    return 'agency';
  }

  // 9. API Documentation & Studio
  if (
    pathname.startsWith('/api-docs') ||
    pathname.startsWith('/admin.api') ||
    pathname.startsWith('/api')
  ) {
    return 'api';
  }

  // 10. Research Suite (Competitive Research, Keyword Research, Keyword Manager, Grouper, Volume, Index Checker)
  if (
    pathname.startsWith('/research') ||
    pathname.startsWith('/keyword-research') ||
    pathname.startsWith('/keyword-manager') ||
    pathname.startsWith('/keyword-grouper') ||
    pathname.startsWith('/search-autocomplete') ||
    pathname.startsWith('/search-volume-checker') ||
    pathname.startsWith('/index-status-checker') ||
    pathname.startsWith('/admin.clustering') ||
    pathname.startsWith('/admin.autocomplete') ||
    pathname.startsWith('/admin.keyvolume') ||
    pathname.startsWith('/admin.checkindex')
  ) {
    return 'research';
  }

  // 11. Projects Suite (Default for core project workspace & overview)
  return 'projects';
}
