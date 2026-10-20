'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopHeader } from '@/components/layout/TopHeader';
import { LeftRail } from '@/components/sidebar/LeftRail';
import { SecondarySidebar } from '@/components/sidebar/SecondarySidebar';
import { MobileDrawer } from '@/components/sidebar/MobileDrawer';
import { AppFooter } from '@/components/layout/AppFooter';
import { useApp } from '@/components/providers/AppProviders';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasCreatedProject, isAddWebsiteModalOpen, setIsAddWebsiteModalOpen, setActiveProject, projects } = useApp();

  // Auth, public landing pages, and standalone Project Settings Wizard have NO admin header, NO sidebar
  const isAuthOrPublicPage =
    pathname === '/' ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/for-agencies') ||
    pathname.startsWith('/agencies') ||
    pathname.startsWith('/enterprise') ||
    pathname.startsWith('/growing-business') ||
    pathname.startsWith('/small-business') ||
    pathname.startsWith('/keyword-rank-tracker') ||
    pathname.startsWith('/rank-tracker') ||
    pathname.startsWith('/keyword-tool') ||
    pathname.startsWith('/keyword-research') ||
    pathname.startsWith('/on-page-seo-checker') ||
    pathname.startsWith('/website-audit-tool') ||
    pathname.startsWith('/competitor-analysis-tool') ||
    pathname.startsWith('/competitor-analysis') ||
    pathname.startsWith('/backlink-checker') ||
    pathname.startsWith('/backlinks-checker') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/podcast') ||
    pathname.startsWith('/academy') ||
    pathname === '/api-docs/keywords' ||
    pathname === '/api-docs/backlinks' ||
    pathname === '/api-docs/domains' ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/whats-new') ||
    pathname.startsWith('/logout') ||
    pathname.startsWith('/security-check') ||
    pathname.startsWith('/cdn-cgi') ||
    pathname.startsWith('/admin.site.wizard');

  const [isReportEditorActive, setIsReportEditorActive] = useState(false);

  useEffect(() => {
    const updateEditorState = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        const isEditor =
          hash.includes('report/create') ||
          hash.includes('template/create') ||
          hash.includes('report/edit');
        setIsReportEditorActive(isEditor);
      }
    };

    updateEditorState();
    window.addEventListener('hashchange', updateEditorState);
    window.addEventListener('popstate', updateEditorState);
    const handleCustomState = (e: any) => {
      if (typeof e.detail?.active === 'boolean') {
        setIsReportEditorActive(e.detail.active);
      }
    };
    window.addEventListener('seranking_report_editor_state', handleCustomState);

    return () => {
      window.removeEventListener('hashchange', updateEditorState);
      window.removeEventListener('popstate', updateEditorState);
      window.removeEventListener('seranking_report_editor_state', handleCustomState);
    };
  }, [pathname]);

  const isAdminPanel = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminPanel) {
    return <>{children}</>;
  }

  if (isAuthOrPublicPage) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
        {children}
      </div>
    );
  }

  const isStandaloneAdmin =
    pathname === '/reports/print' ||
    pathname.startsWith('/admin.reports.print') ||
    pathname.startsWith('/admin.site.wizard');

  const isReportsPage =
    pathname === '/reports' ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/admin.reports') ||
    isReportEditorActive;

  const isDashboardOrProjects =
    pathname === '/projects' ||
    pathname === '/admin.dashboard.html' ||
    pathname === '/dashboard' ||
    pathname === '/';

  const hideSecondarySidebar =
    pathname === '/reports/print' ||
    pathname.startsWith('/admin.reports.print') ||
    pathname.startsWith('/admin.site.wizard') ||
    isReportEditorActive;

  // When creating a project (modal open or standalone wizard), hide header, sidebar, and footer
  const isProjectCreationActive = isAddWebsiteModalOpen || isStandaloneAdmin;

  const shouldHideTopHeader = isProjectCreationActive;

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#F4F6F9] dark:bg-[#0B0F19] text-gray-900 dark:text-slate-100 transition-colors duration-150">
      {/* Main Top Header */}
      {!shouldHideTopHeader && (
        <div className="w-full shrink-0 z-50">
          <TopHeader />
        </div>
      )}

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden lg:overflow-visible relative">
        {/* Left Icon Rail */}
        {!isProjectCreationActive && (
          <div className="flex shrink-0 z-40">
            <LeftRail />
          </div>
        )}

        {/* Secondary Navigation Sidebar */}
        {!isProjectCreationActive && !hideSecondarySidebar && (
          <div className="flex shrink-0 relative z-30">
            <React.Suspense fallback={null}>
              <SecondarySidebar />
            </React.Suspense>
          </div>
        )}

        {/* Mobile Drawer */}
        {!isProjectCreationActive && <MobileDrawer />}

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#F4F6F9] dark:bg-[#0B0F19] relative transition-colors duration-150">
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
          {/* Universal Sticky App Footer */}
          {!isProjectCreationActive && !isReportEditorActive && <AppFooter />}
        </div>
      </div>

      {/* Global Add Website Modal */}
      {isAddWebsiteModalOpen && (
        <CreateProjectModal
          isOpen={isAddWebsiteModalOpen}
          onClose={() => setIsAddWebsiteModalOpen(false)}
          onCreated={(newProject) => {
            setIsAddWebsiteModalOpen(false);
            if (newProject) {
              setActiveProject(newProject);
            }
          }}
        />
      )}
    </div>
  );
}
