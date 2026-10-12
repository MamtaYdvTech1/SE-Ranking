'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Link2,
  CheckCircle2,
  Sparkles,
  FileEdit,
  MapPin,
  PieChart,
  Building2,
  Boxes,
  ThumbsUp,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useApp, RailSection } from '../providers/AppProviders';
import { useAuth } from '@/context/AuthContext';
import { getSectionFromPathname } from '@/lib/navigation';

export function LeftRail() {
  const pathname = usePathname();
  const { activeRail, setActiveRail, hasCreatedProject, setIsAddWebsiteModalOpen, projects } = useApp();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentSection = getSectionFromPathname(pathname);
  const isNoProjectsState = !hasCreatedProject || projects.length === 0;

  const allRailItems: Array<{
    id: RailSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: string;
    badgeColor?: string;
    hasMarker?: boolean;
    isBoxedIcon?: boolean;
    onClick?: () => void;
  }> = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Home,
      href: '/projects',
      onClick: () => setActiveRail('projects'),
    },
    {
      id: 'research',
      label: 'Research',
      icon: Search,
      href: '/research/competitive-research',
      onClick: () => setActiveRail('research'),
    },
    {
      id: 'backlinks',
      label: 'Backlinks',
      icon: Link2,
      href: '/backlinks',
      onClick: () => setActiveRail('backlinks'),
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: CheckCircle2,
      hasMarker: true,
      href: '/website-audit',
      onClick: () => setActiveRail('audit'),
    },
    {
      id: 'ai-search',
      label: 'AI Search',
      icon: Sparkles,
      badge: 'New',
      badgeColor: 'bg-[#D1F7C4] text-[#0A5C36]',
      href: '/research/ai-search',
      onClick: () => setActiveRail('ai-search'),
    },
    {
      id: 'content',
      label: 'Content Marketing',
      icon: FileEdit,
      href: '/content-marketing',
      onClick: () => setActiveRail('content'),
    },
    {
      id: 'local',
      label: 'Local Marketing',
      icon: MapPin,
      href: '/local-marketing',
      onClick: () => setActiveRail('local'),
    },
    {
      id: 'reports',
      label: 'Report Builder',
      icon: PieChart,
      href: '/reports',
      onClick: () => setActiveRail('reports'),
    },
    {
      id: 'agency',
      label: 'Agency Pack',
      icon: Building2,
      isBoxedIcon: true,
      href: '/agency-pack',
      onClick: () => setActiveRail('agency'),
    },
    {
      id: 'api',
      label: 'API',
      icon: Boxes,
      href: '/api-docs',
      onClick: () => setActiveRail('api'),
    },
    {
      id: 'smm',
      label: 'SMM',
      icon: ThumbsUp,
      badge: '-20%',
      badgeColor: 'bg-[#E9D5FF] text-[#6B21A8]',
      href: '/smm',
      onClick: () => setActiveRail('smm'),
    },
  ];

  const railItems = allRailItems;

  return (
    <aside className="w-[66px] bg-[#130E26] text-[#E2E8F0] flex flex-col justify-between py-2 border-r border-[#261C40] select-none shrink-0 z-30">
      {/* Top Logo when TopHeader is hidden in onboarding/no-projects state */}
      {isNoProjectsState && (
        <div className="flex items-center justify-center pt-1 pb-3 mb-1 border-b border-[#261C40] shrink-0">
          <Link
            href="/admin.dashboard.html"
            className="w-10 h-10 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center text-white shadow-xs transition-all group cursor-pointer"
            title="SE Ranking Home"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </Link>
        </div>
      )}

      {/* Top Navigation Items */}
      <div className="flex flex-col items-center gap-1.5 overflow-y-auto no-scrollbar flex-1">
        {railItems.map((item) => {
          let isActive = false;
          if (item.label === 'AI Search') {
            isActive = pathname.startsWith('/research/ai-search');
          } else if (item.id === 'research') {
            isActive = currentSection === 'research' && !pathname.startsWith('/research/ai-search');
          } else {
            isActive = currentSection === item.id;
          }

          const Icon = item.icon;
          const isMuted = false;

          return (
            <Link
              key={`${item.id}-${item.label}`}
              href={isMuted ? '#' : item.href}
              onClick={(e) => {
                if (isMuted) {
                  e.preventDefault();
                  setIsAddWebsiteModalOpen(true);
                } else if (item.onClick) {
                  item.onClick();
                }
              }}
              title={item.label}
              className={`w-[60px] min-h-[54px] py-1.5 px-0.5 flex flex-col items-center justify-center rounded-xl transition-all duration-150 relative group text-center cursor-pointer ${
                isActive
                  ? 'bg-[#7C3AED] text-white font-bold shadow-md shadow-[#7C3AED]/40'
                  : 'hover:bg-[#7C3AED]/20 hover:text-white text-[#CBD5E1]'
              }`}
            >
              {/* Arrow Notch pointing to secondary sidebar when active */}
              {isMounted &&
                isActive &&
                !isMuted &&
                !pathname.startsWith('/reports') &&
                !pathname.startsWith('/admin.reports') && (
                  <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#181330]" />
                )}

              <div className="relative flex items-center justify-center">
                {item.isBoxedIcon ? (
                  <div
                    className={`p-1 rounded border ${
                      isActive
                        ? 'border-white/60 text-white'
                        : 'border-[#4C3B72] text-[#CBD5E1] group-hover:text-white group-hover:border-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                ) : (
                  <Icon
                    className={`w-[20px] h-[20px] transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-[#CBD5E1] group-hover:text-white'
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[11px] leading-tight px-0.5 mt-1 text-center line-clamp-2 max-w-[58px] tracking-tight transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#CBD5E1] font-medium group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {item.badge && !isMuted && (
                <span
                  className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full tracking-tight ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile / Account */}
      {(() => {
        const isSettingsActive =
          pathname.startsWith('/admin.user.settings') ||
          pathname.startsWith('/admin.users') ||
          pathname.startsWith('/admin.session.lock') ||
          pathname.startsWith('/settings') ||
          pathname.startsWith('/users');

        const userInitials = user?.fullName
          ? user.fullName
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
          : user?.email
          ? user.email.slice(0, 2).toUpperCase()
          : 'SV';

        return (
          <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-[#1a293e]">
            <Link
              href="/admin.user.settings.html"
              title="Profile & Preferences"
              className={`w-[46px] h-[46px] rounded-lg flex items-center justify-center transition-colors relative group cursor-pointer ${
                isSettingsActive ? 'bg-[#313c4e]' : 'hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-md bg-[#2A3B53] text-[#E2E8F0] flex items-center justify-center text-xs font-bold border border-white/10 group-hover:border-white/30 transition-all">
                  {userInitials}
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#1e293b] border border-white/20 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors">
                  <Settings className="w-2 h-2" />
                </span>
              </div>
            </Link>
          </div>
        );
      })()}
    </aside>
  );
}
