'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  BarChart2,
  Activity,
  Users,
  Compass,
  Sparkles,
  Link2,
  CheckSquare,
  FileSearch,
  Columns,
  Link as ChainLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronsUpDown,
  Search as SearchIcon,
  X,
  Plus,
  KeyRound,
  Sliders,
  FolderTree,
  Folder,
  CheckCircle2,
  Files,
  Settings,
  Cpu,
  Wallet,
  LayoutDashboard,
  Store,
  Star,
  MapPin,
  HelpCircle,
  ExternalLink,
  Shield,
  Target,
  Building2,
  PenLine,
  UserCheck,
  User,
  CreditCard,
  Gift,
  DollarSign,
  LogOut,
  Bell,
  Calendar,
  MessageSquare,
  Share2,
  Play,
  ThumbsUp,
  ArrowUpRight,
  Globe,
  FileText,
  Layers,
  Clock,
  Download,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { useAuth } from '@/context/AuthContext';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { ProjectData } from '@/lib/types';
import { ProjectFavicon } from '@/components/ui/ProjectFavicon';
import { getSectionFromPathname } from '@/lib/navigation';
import { getSocialPlatformIcon } from '@/components/ui/SocialPlatformIcons';
function BacklinkCheckerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function BacklinkGapAnalyzerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 16H7a4 4 0 0 1 0-8h2" />
      <path d="M14 8h2a4 4 0 0 1 3.8 2.6" />
      <line x1="8" y1="12" x2="15" y2="12" />
      <line x1="18" y1="14" x2="18" y2="20" strokeWidth="2.2" />
      <line x1="15" y1="17" x2="21" y2="17" strokeWidth="2.2" />
    </svg>
  );
}

function SubItem({
  href,
  label,
  isActive,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  isActive?: boolean;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between py-2 pl-5 pr-3 rounded-lg transition-all duration-150 text-[13px] font-medium cursor-pointer select-none ${
        isActive
          ? 'bg-[#2E3C4F] text-white font-bold shadow-xs border border-[#0062FF]/70'
          : 'text-[#CBD5E1] hover:text-white hover:bg-[#283547]'
      }`}
    >
      <div className="flex items-center gap-2 truncate min-w-0">
        <span
          className={`font-bold text-base select-none shrink-0 leading-none transition-colors ${
            isActive ? 'text-[#0062FF]' : 'text-gray-400 group-hover:text-white'
          }`}
        >
          ·
        </span>
        <span className="truncate">{label}</span>
      </div>
      {badge}
    </Link>
  );
}

function SecondarySidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get('tab') || '';
  const [manualTab, setManualTab] = useState('');

  // Reset manualTab when pathname changes
  useEffect(() => {
    setManualTab('');
  }, [pathname]);

  const { user, logout } = useAuth();
  const [localEmail, setLocalEmail] = useState('');
  const [localName, setLocalName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');
      if (email) setLocalEmail(email);
      if (name) setLocalName(name);
    }
  }, []);

  const effectiveEmail = user?.email || localEmail || 'admin@seranking.com';
  const effectiveName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (localName || effectiveEmail.split('@')[0]));
  const effectiveInitials = (effectiveName || 'UR')
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'UR';

  const [currentTab, setCurrentTab] = useState('');
  const effectiveTab = urlTab || manualTab || currentTab;
  const {
    activeRail,
    activeProject,
    setActiveProject,
    projects,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useApp();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectFlyoutOpen, setIsProjectFlyoutOpen] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const handleLocation = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        setCurrentHash(hash);
        const params = new URLSearchParams(window.location.search);
        let tab = params.get('tab') || '';
        if (!tab && hash) {
          if (hash.includes('seo-potential') || hash.includes('potential')) {
            tab = 'potential';
          } else if (hash.includes('snippets')) {
            tab = 'snippets';
          } else if (hash.includes('traffic')) {
            tab = 'traffic';
          } else if (hash.includes('gsc')) {
            tab = 'gsc';
          }
        }
        setCurrentTab(tab);
      }
    };
    handleLocation();
    window.addEventListener('hashchange', handleLocation);
    window.addEventListener('popstate', handleLocation);
    return () => {
      window.removeEventListener('hashchange', handleLocation);
      window.removeEventListener('popstate', handleLocation);
    };
  }, [pathname]);

  const projectDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
        setIsProjectFlyoutOpen(false);
        setHoveredSubmenu(null);
      }
    }
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  // Static initial sections so SSR and initial client DOM match perfectly (fixes hydration mismatch)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rankings: true,
    analytics: true,
    competitors: true,
    ai_tracker: true,
    audit: true,
    backlink_monitor: true,
    white_label: true,
    lead_generator: false,
    competitive_research: true,
    keyword_research: true,
    keyword_grouper: true,
    search_volume: true,
    index_status: true,
    content_ideas: true,
    content_editor: true,
    ai_writer: true,
    local_listings: true,
    local_gbp: true,
    local_reviews: true,
    my_reports: true,
    report_templates: true,
    custom_branding: true,
    backlink_checker: true,
    backlink_gap: true,
    ai_research: true,
    api_endpoints: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_ranking_sidebar_sections');
      if (saved) {
        setExpandedSections(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('se_ranking_sidebar_sections', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const mergedProjectList: ProjectData[] = React.useMemo(() => {
    if (projects && projects.length > 0) return projects;
    if (activeProject) return [activeProject];
    return [];
  }, [projects, activeProject]);

  const displayProjects = mergedProjectList.filter(
    (p) =>
      p.name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.domain.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Starred / Favorite projects matching user prompt
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_ranking_starred_projects');
      if (saved) setStarredProjectIds(JSON.parse(saved));
    } catch {}
  }, []);

  const handleToggleStarProject = (e: React.MouseEvent, pid: string) => {
    e.preventDefault();
    e.stopPropagation();
    const next = starredProjectIds.includes(pid)
      ? starredProjectIds.filter((id) => id !== pid)
      : [...starredProjectIds, pid];
    setStarredProjectIds(next);
    try {
      localStorage.setItem('se_ranking_starred_projects', JSON.stringify(next));
    } catch {}
  };

  // Groups state matching user screenshot
  const [projectGroups, setProjectGroups] = useState<Array<{ id: string; name: string; projectIds: string[] }>>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadGroups = () => {
      try {
        const saved = localStorage.getItem('se_ranking_project_groups');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProjectGroups(parsed);
            return;
          }
        }
      } catch {}
    };

    loadGroups();

    const handleGroupsUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProjectGroups(e.detail);
      } else {
        loadGroups();
      }
    };

    window.addEventListener('se_ranking_groups_updated', handleGroupsUpdate);
    window.addEventListener('storage', handleGroupsUpdate);
    return () => {
      window.removeEventListener('se_ranking_groups_updated', handleGroupsUpdate);
      window.removeEventListener('storage', handleGroupsUpdate);
    };
  }, [isProjectDropdownOpen]);

  if (isSidebarCollapsed) {
    return (
      <aside className="w-10 bg-[#222D3B] text-gray-400 flex flex-col items-center py-3 border-r border-[#2C3646] select-none transition-all">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  // Determine active section accurately from current pathname
  const currentSection = getSectionFromPathname(pathname);
  const effectiveSection: string = currentSection === 'local' ? 'local-marketing' : currentSection;

  const getSectionTitle = () => {
    switch (effectiveSection) {
      case 'smm':
        return 'Social Media (SMM)';
      case 'content':
        return 'Content Marketing';
      case 'agency':
        return 'Agency Pack';
      case 'local-marketing':
        return 'Local Marketing';
      case 'api':
        return 'API';
      case 'backlinks':
        return 'Backlinks';
      case 'audit':
        return 'Audit';
      case 'reports':
        return 'Report Builder';
      case 'settings':
        return 'Profile & Preferences';
      case 'projects':
        return 'Projects';
      case 'research':
        return 'Research';
      case 'ai-search':
        return 'AI Search';
      default:
        return 'Projects';
    }
  };

  const renderProjectFlyout = (p: ProjectData) => {
    return (
      <div
        className="absolute left-[calc(100%+6px)] top-0 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 text-xs py-1.5 animate-in fade-in duration-100"
        onMouseEnter={() => setIsProjectFlyoutOpen(true)}
        onMouseLeave={() => {
          setIsProjectFlyoutOpen(false);
          setHoveredSubmenu(null);
        }}
      >
        {/* Project Header Banner with Real Favicon */}
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 bg-[#FAF5FF] rounded-t-xl mb-1">
          <ProjectFavicon
            domain={p.domain || p.name}
            name={p.name}
            size={18}
            className="w-4.5 h-4.5 rounded-[4px] shrink-0 object-contain shadow-2xs"
          />
          <span className="font-semibold text-gray-800 truncate text-[12px]">
            {(p.domain || p.name || 'project.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </span>
        </div>

        {/* 1. Project Overview */}
        <Link
          href="/project-overview"
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          onMouseEnter={() => setHoveredSubmenu(null)}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
        >
          <LayoutGrid className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-[13px]">Project Overview</span>
        </Link>

        {/* 2. Rankings with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('rankings')}
        >
          <Link
            href="/rankings"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'rankings'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">Rankings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'rankings' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/rankings?tab=detailed"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Detailed</span>
              </Link>
              <Link
                href="/rankings?tab=overall"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Overall</span>
              </Link>
              <Link
                href="/rankings?tab=historical"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Historical Data</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. Analytics & Traffic with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('analytics')}
        >
          <Link
            href="/analytics"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'analytics'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">Analytics &amp; Traffic</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'analytics' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/analytics?tab=overview"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Overview</span>
              </Link>
              <Link
                href="/analytics?tab=traffic"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Traffic</span>
              </Link>
              <Link
                href="/analytics?tab=snippets"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Snippets</span>
              </Link>
            </div>
          )}
        </div>

        {/* 4. My Competitors with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('competitors')}
        >
          <Link
            href="/competitors"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'competitors'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">My Competitors</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'competitors' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/competitors?tab=added"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Added Competitors</span>
              </Link>
              <Link
                href="/competitors?tab=serp"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>SERP Competitors</span>
              </Link>
              <Link
                href="/competitors?tab=visibility"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Visibility Rating</span>
              </Link>
            </div>
          )}
        </div>

        {/* 5. AI Search Tracker with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('ai_tracker')}
        >
          <Link
            href="/ai-tracker"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'ai_tracker'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">AI Search Tracker</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'ai_tracker' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/ai-tracker?tab=results"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Results</span>
              </Link>
              <Link
                href="/ai-tracker?tab=overview"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Overview</span>
              </Link>
              <Link
                href="/ai-tracker?tab=prompts"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Prompts</span>
              </Link>
            </div>
          )}
        </div>

        {/* 6. Backlink Checker */}
        <Link
          href="/backlink-checker"
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          onMouseEnter={() => setHoveredSubmenu(null)}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
        >
          <ChainLink className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-[13px]">Backlink Checker</span>
        </Link>

        {/* 7. Marketing Plan */}
        <Link
          href="/marketing-plan"
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          onMouseEnter={() => setHoveredSubmenu(null)}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
        >
          <CheckSquare className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-[13px]">Marketing Plan</span>
        </Link>

        {/* 8. Website Audit with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('audit')}
        >
          <Link
            href="/website-audit"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'audit'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSearch className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">Website Audit</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'audit' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/website-audit?tab=overview"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Overview</span>
              </Link>
              <Link
                href="/website-audit?tab=issue-report"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Issue Report</span>
              </Link>
              <Link
                href="/website-audit?tab=crawled-pages"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Crawled Pages</span>
              </Link>
              <Link
                href="/website-audit?tab=found-links"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Found Links</span>
              </Link>
            </div>
          )}
        </div>

        {/* 9. Page Changes Monitor */}
        <Link
          href="/page-changes"
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          onMouseEnter={() => setHoveredSubmenu(null)}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
        >
          <Columns className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-[13px]">Page Changes Monitor</span>
        </Link>

        {/* 10. Backlink Monitor with submenu */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredSubmenu('backlink_monitor')}
        >
          <Link
            href="/backlinks-monitor"
            onClick={() => {
              setActiveProject(p);
              setIsProjectDropdownOpen(false);
              setIsProjectFlyoutOpen(false);
              setHoveredProject(null);
            }}
            className={`flex items-center justify-between px-3 py-2 font-medium transition-colors ${
              hoveredSubmenu === 'backlink_monitor'
                ? 'bg-[#F5F3FF] text-[#7C3AED]'
                : 'text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ChainLink className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[13px]">Backlink Monitor</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>

          {hoveredSubmenu === 'backlink_monitor' && (
            <div className="absolute left-[calc(100%+4px)] top-0 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-100">
              <Link
                href="/backlinks-monitor?tab=new-lost"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>New / Lost Backlinks</span>
              </Link>
              <Link
                href="/backlinks-monitor?tab=all"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>All Backlinks</span>
              </Link>
              <Link
                href="/backlinks-monitor?tab=domains"
                onClick={() => {
                  setActiveProject(p);
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                }}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
              >
                <span>Referring Domains</span>
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* 11. Project Settings */}
        <Link
          href="/settings"
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          onMouseEnter={() => setHoveredSubmenu(null)}
          className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-medium transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-[13px]">Project settings</span>
        </Link>
      </div>
    );
  };

  const renderDropdownProjectItem = (p: ProjectData, isInsideGroup: boolean = false) => {
    const cleanDomain = (p.domain || p.name || 'project.com')
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase();
    const isSelected =
      activeProject?.id === p.id ||
      (Boolean(activeProject?.domain) && Boolean(p.domain) && activeProject!.domain.toLowerCase().includes(cleanDomain));
    const isHovered = hoveredProject === p.id;

    return (
      <div
        key={p.id}
        className={`relative mb-0.5 ${isInsideGroup ? 'pl-2' : ''}`}
        onMouseEnter={() => {
          setHoveredProject(p.id);
          setIsProjectFlyoutOpen(true);
        }}
      >
        <div
          onClick={() => {
            setActiveProject(p);
            setIsProjectDropdownOpen(false);
            setIsProjectFlyoutOpen(false);
            setHoveredProject(null);
          }}
          className={`relative w-full px-2.5 py-2 flex items-center justify-between rounded-lg cursor-pointer transition-colors text-left group ${
            isSelected
              ? 'bg-[#F5F3FF] text-[#7C3AED]'
              : isHovered
              ? 'bg-gray-50 text-gray-900'
              : 'text-gray-800 hover:bg-gray-50'
          }`}
        >
          {/* Active indicator bar matching screenshot */}
          {isSelected && (
            <span className="absolute left-1 top-1.5 bottom-1.5 w-[3.5px] bg-[#7C3AED] rounded-full" />
          )}

          <div className={`flex items-center gap-2 truncate flex-1 ${isSelected ? 'pl-2' : ''}`}>
            <ProjectFavicon
              domain={p.domain || p.name || cleanDomain}
              name={p.name}
              size={18}
              className="w-4.5 h-4.5 rounded-[4px] shrink-0 object-contain shadow-2xs"
            />
            <span className={`truncate text-xs font-semibold leading-tight ${isSelected ? 'text-[#7C3AED]' : 'text-gray-800 group-hover:text-gray-900'}`}>
              {cleanDomain}
            </span>
          </div>

          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected || isHovered ? 'text-[#7C3AED]' : 'text-gray-400 group-hover:text-gray-600'}`} />
        </div>
      </div>
    );
  };

  // Active route flags
  const isAllProjectsActive =
    pathname === '/projects' ||
    pathname === '/' ||
    pathname === '/admin.dashboard.html' ||
    pathname.startsWith('/admin.dashboard');

  const isProjectOverviewActive =
    pathname === '/project-overview' ||
    pathname.includes('admin.site.overview');

  const isRankingsPath =
    pathname.startsWith('/rankings') ||
    pathname.includes('admin.site.rankings');

  const isAnalyticsPath =
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/traffic') ||
    pathname.includes('admin.analytics') ||
    pathname.includes('admin.traffic') ||
    pathname.includes('admin.snippets') ||
    pathname.includes('admin.gsc') ||
    pathname.includes('admin.potential');

  const isCompetitorsPath =
    pathname.startsWith('/competitors') ||
    pathname.includes('admin.site.competitors');

  const isAiTrackerPath =
    pathname.startsWith('/ai-results-tracker') ||
    pathname.startsWith('/ai-search') ||
    pathname.includes('admin.ai');

  const isInsightsActive =
    pathname.startsWith('/insights') ||
    pathname.includes('admin.insights');

  const isBacklinkCheckerActive =
    (pathname.startsWith('/backlinks') && !pathname.startsWith('/backlinks-monitor')) ||
    pathname.includes('admin.backlink-checker');

  const isMarketingPlanActive =
    pathname.startsWith('/marketing-plan') ||
    pathname.includes('admin.marketing-plan');

  const isAuditPath =
    pathname.startsWith('/website-audit') ||
    pathname.includes('admin.audit');

  const isPageChangesActive =
    pathname.startsWith('/page-changes') ||
    pathname.includes('admin.page-changes');

  const isBacklinkMonitorPath =
    pathname.startsWith('/backlinks-monitor') ||
    pathname.includes('admin.backlink-monitor');

  // Subitem active states for Analytics & Traffic
  const isAnalyticsTrafficActive =
    effectiveTab === 'traffic' ||
    pathname.startsWith('/traffic') ||
    pathname.includes('admin.traffic');

  const isAnalyticsSnippetsActive =
    effectiveTab === 'snippets' ||
    pathname.startsWith('/snippets') ||
    pathname.includes('admin.snippets');

  const isAnalyticsGscActive =
    effectiveTab === 'gsc' ||
    effectiveTab === 'google-search-console' ||
    pathname.includes('admin.gsc');

  const isAnalyticsPotentialActive =
    effectiveTab === 'potential' ||
    effectiveTab === 'seo-potential' ||
    pathname.includes('admin.potential');

  const isAnalyticsOverviewActive =
    isAnalyticsPath &&
    !isAnalyticsTrafficActive &&
    !isAnalyticsSnippetsActive &&
    !isAnalyticsGscActive &&
    !isAnalyticsPotentialActive;

  // Subitem active states for Rankings
  const isRankingsSummaryActive =
    isRankingsPath && effectiveTab === 'summary';

  const isRankingsHistoricalActive =
    isRankingsPath && (effectiveTab === 'historical' || effectiveTab === 'history');

  const isRankingsDetailedActive =
    isRankingsPath && !isRankingsSummaryActive && !isRankingsHistoricalActive;

  // Subitem active states for Competitors
  const isCompetitorsSerpActive =
    isCompetitorsPath && effectiveTab === 'serp';

  const isCompetitorsSovActive =
    isCompetitorsPath && (effectiveTab === 'sov' || effectiveTab === 'share-of-voice');

  const isCompetitorsVisibilityActive =
    isCompetitorsPath && (effectiveTab === 'visibility' || effectiveTab === 'visibility-rating');

  const isCompetitorsAddedActive =
    isCompetitorsPath && !isCompetitorsSerpActive && !isCompetitorsSovActive && !isCompetitorsVisibilityActive;

  // Subitem active states for AI Results Tracker
  const isAiTrackerCompetitorsActive =
    isAiTrackerPath && effectiveTab === 'competitors';

  const isAiTrackerSourcesActive =
    isAiTrackerPath && effectiveTab === 'sources';

  const isAiTrackerRankingsActive =
    isAiTrackerPath && !isAiTrackerCompetitorsActive && !isAiTrackerSourcesActive;

  // Subitem active states for Website Audit
  const isAuditIssuesActive =
    isAuditPath && (effectiveTab === 'issues' || effectiveTab === 'issue-report');

  const isAuditPagesActive =
    isAuditPath && (effectiveTab === 'pages' || effectiveTab === 'crawled-pages');

  const isAuditResourcesActive =
    isAuditPath && effectiveTab === 'resources';

  const isAuditLinksActive =
    isAuditPath && effectiveTab === 'links';

  const isAuditComparisonActive =
    isAuditPath && effectiveTab === 'comparison';

  const isAuditOverviewActive =
    isAuditPath &&
    !isAuditIssuesActive &&
    !isAuditPagesActive &&
    !isAuditResourcesActive &&
    !isAuditLinksActive &&
    !isAuditComparisonActive;

  // Subitem active states for Backlink Monitor
  const isBacklinksDomainsActive =
    isBacklinkMonitorPath && effectiveTab === 'domains';

  const isBacklinksAnchorsActive =
    isBacklinkMonitorPath && (effectiveTab === 'anchor-texts' || effectiveTab === 'anchors');

  const isBacklinksPagesActive =
    isBacklinkMonitorPath && effectiveTab === 'pages';

  const isBacklinksIpsActive =
    isBacklinkMonitorPath && (effectiveTab === 'ips-subnets' || effectiveTab === 'ips');

  const isBacklinksDisavowActive =
    isBacklinkMonitorPath && effectiveTab === 'disavow';

  const isBacklinksListActive =
    isBacklinkMonitorPath &&
    !isBacklinksDomainsActive &&
    !isBacklinksAnchorsActive &&
    !isBacklinksPagesActive &&
    !isBacklinksIpsActive &&
    !isBacklinksDisavowActive;

  useEffect(() => {
    if (isAnalyticsPath) {
      setExpandedSections((prev) => ({ ...prev, analytics: true }));
    } else if (isRankingsPath) {
      setExpandedSections((prev) => ({ ...prev, rankings: true }));
    } else if (isCompetitorsPath) {
      setExpandedSections((prev) => ({ ...prev, competitors: true }));
    } else if (isAiTrackerPath) {
      setExpandedSections((prev) => ({ ...prev, ai_tracker: true }));
    } else if (isAuditPath) {
      setExpandedSections((prev) => ({ ...prev, audit: true }));
    } else if (isBacklinkMonitorPath) {
      setExpandedSections((prev) => ({ ...prev, backlink_monitor: true }));
    }
  }, [
    isAnalyticsPath,
    isRankingsPath,
    isCompetitorsPath,
    isAiTrackerPath,
    isAuditPath,
    isBacklinkMonitorPath,
  ]);

  return (
    <>
      <aside className="w-[245px] bg-[#222D3B] text-[#E2E8F0] flex flex-col justify-between border-r border-[#2C3848] select-none shrink-0 text-[14px] z-30 relative overflow-visible">
        <div className="flex flex-col h-full">
          {/* Header row matching screenshot */}
          <div className="h-11 px-3.5 flex items-center justify-between border-b border-[#2C3848] text-white bg-[#222D3B]">
            <span className="text-[15px] font-bold text-white tracking-wide">
              {getSectionTitle()}
            </span>
            <button
              onClick={() => {
                if (effectiveSection === 'backlinks') {
                  router.push('/projects');
                } else {
                  setIsSidebarCollapsed(true);
                }
              }}
              className="w-6 h-6 rounded-full bg-[#182230] text-[#CBD5E1] hover:text-white hover:bg-[#2C3848] flex items-center justify-center border border-[#38465B] transition-colors cursor-pointer"
              title={effectiveSection === 'backlinks' ? 'Close Backlinks' : 'Collapse navigation'}
            >
              {effectiveSection === 'backlinks' ? (
                <X className="w-3.5 h-3.5 text-white" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Project Selector Card (Visible ONLY on Projects mode matching screenshot) */}
          {effectiveSection === 'projects' && (
            (pathname === '/projects' || pathname === '/admin.dashboard.html' || pathname.startsWith('/admin.dashboard') || pathname === '/' || projects.length === 0) ? (
              <div className="p-2.5 border-b border-[#2C3848]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full bg-white hover:bg-gray-50 text-[#0062FF] rounded-lg px-3 py-2 flex items-center justify-center gap-2 font-bold text-xs shadow-xs transition-colors cursor-pointer uppercase tracking-wider border border-transparent"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3] text-[#0062FF]" />
                  <span>CREATE PROJECT</span>
                </button>
              </div>
            ) : (
            <div ref={projectDropdownRef} className="p-2.5 relative border-b border-[#2C3848] overflow-visible z-40">
              <div
                onClick={() => {
                  const nextState = !isProjectDropdownOpen;
                  setIsProjectDropdownOpen(nextState);
                  if (!nextState) {
                    setIsProjectFlyoutOpen(false);
                    setHoveredProject(null);
                    setHoveredSubmenu(null);
                  }
                }}
                className="w-full bg-[#20183B] hover:bg-[#2B2150] text-white rounded-lg px-2.5 py-2 flex items-center justify-between shadow-xs transition-colors border border-[#3E2E66] cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                  <ProjectFavicon
                    domain={activeProject?.domain || activeProject?.name || ''}
                    name={activeProject?.name}
                    size={20}
                    className="w-5 h-5 rounded-[4px] shrink-0 object-contain shadow-xs border border-white/10"
                  />
                  <span className="text-[13px] font-semibold text-white truncate group-hover:text-white transition-colors">
                    {activeProject?.domain
                      ? (activeProject.domain.startsWith('http') ? activeProject.domain : `https://${activeProject.domain}`)
                      : '+ Add Website / Project'}
                  </span>
                </div>
                <div className="flex items-center gap-1 pl-1">
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#A78BFA] group-hover:text-white shrink-0 transition-transform duration-200 ${
                      isProjectDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

            {/* Click-away backdrop */}
            {isProjectDropdownOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => {
                  setIsProjectDropdownOpen(false);
                  setIsProjectFlyoutOpen(false);
                  setHoveredProject(null);
                  setHoveredSubmenu(null);
                }}
              />
            )}

            {/* Project Dropdown Modal with Real Dynamic Projects List & Flyout (Matching exact user screenshot) */}
            {isProjectDropdownOpen && (
              <div className="absolute left-2.5 top-[68px] w-[225px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                {/* Search Box matching screenshot */}
                <div className="p-2 border-b border-gray-100 flex items-center justify-between gap-1.5 bg-white rounded-t-xl">
                  <div className="flex items-center gap-2 flex-1 border border-[#7C3AED] rounded-lg px-2.5 py-1.5 bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#7C3AED]/20">
                    <SearchIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search project"
                      className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-xs"
                      autoFocus
                    />
                    {projectSearch ? (
                      <button
                        type="button"
                        onClick={() => setProjectSearch('')}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0 cursor-pointer" />
                    )}
                  </div>
                </div>

                {/* Dynamic Groups & Projects List matching screenshot */}
                <div className="p-1 max-h-[340px] overflow-y-auto overflow-x-hidden">
                  {/* 1. Groups */}
                  {projectGroups.map((group) => {
                    const groupProjects = displayProjects.filter((p) => {
                      return (
                        group.projectIds.includes(p.id) ||
                        group.projectIds.includes(p.domain)
                      );
                    });

                    // Search filter
                    if (
                      projectSearch.trim() &&
                      !group.name.toLowerCase().includes(projectSearch.toLowerCase()) &&
                      groupProjects.length === 0
                    ) {
                      return null;
                    }

                    const isCollapsed = collapsedGroups[group.id];

                    return (
                      <div key={group.id} className="mb-1">
                        {/* Group Folder Row matching Screenshot */}
                        <div
                          onClick={() => {
                            setCollapsedGroups((prev) => ({
                              ...prev,
                              [group.id]: !prev[group.id],
                            }));
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 text-gray-900 font-semibold text-[13px] hover:bg-gray-50 rounded-md cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Folder className="w-4 h-4 text-[#2A3749] fill-[#2A3749] shrink-0" />
                            <span className="truncate text-xs font-semibold">{group.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
                              {groupProjects.length}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                isCollapsed ? '-rotate-90' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Projects inside Group */}
                        {!isCollapsed && (
                          <div className="space-y-0.5 ml-1 mt-0.5">
                            {groupProjects.map((p) => renderDropdownProjectItem(p, true))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 2. Ungrouped Projects */}
                  {(() => {
                    const ungrouped = displayProjects.filter((p) => {
                      return !projectGroups.some(
                        (g) =>
                          g.projectIds.includes(p.id) ||
                          g.projectIds.includes(p.domain)
                      );
                    });

                    if (ungrouped.length === 0 && projectGroups.length > 0) return null;
                    return (
                      <div className="space-y-0.5">
                        {ungrouped.map((p) => renderDropdownProjectItem(p, false))}
                      </div>
                    );
                  })()}
                </div>

                {/* Create Project Button matching screenshot */}
                <div className="p-1 border-t border-gray-100 bg-white rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsProjectFlyoutOpen(false);
                      setHoveredProject(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full px-2.5 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-[#7C3AED] font-medium transition-colors cursor-pointer rounded-lg text-xs group"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#7C3AED] shrink-0" strokeWidth={2.5} />
                    <span className="text-[#7C3AED] font-semibold text-xs">Create project</span>
                  </button>
                </div>

                {/* Sleek Flyout Menu to the right of the dropdown (Positioned outside the scroll container so NO clipping or horizontal scrollbar) */}
                {isProjectFlyoutOpen && hoveredProject && (() => {
                  const p = displayProjects.find((x) => x.id === hoveredProject) || activeProject;
                  if (!p) return null;
                  return renderProjectFlyout(p);
                })()}
              </div>
            )}
          </div>
            )
          )}
          {effectiveSection === 'reports' && (
            <div className="p-2.5 border-b border-[#2C374A]/60">
              <Link
                href="/reports?action=create"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 font-bold text-xs shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>CREATE REPORT</span>
              </Link>
            </div>
          )}

          {effectiveSection === 'backlinks' && (
            <div className="p-2.5 border-b border-[#2C374A]/60">
              <div className="text-[11px] font-bold text-[#8C98A9] px-0.5 mb-1.5 uppercase tracking-wider">
                Target Domain
              </div>
              <div className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs border border-transparent">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-900 truncate">
                    {activeProject?.domain ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'teams.com'}
                  </span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </div>
            </div>
          )}

          {effectiveSection === 'content' && (
            <div className="p-2.5 border-b border-[#2C374A]/60">
              <div className="text-[11px] font-bold text-[#8C98A9] px-0.5 mb-1.5 uppercase tracking-wider">
                Content Domain
              </div>
              <div className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs border border-transparent">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-900 truncate">
                    {activeProject?.domain ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'teams.com'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                  Live
                </span>
              </div>
            </div>
          )}

          {effectiveSection === 'local-marketing' && (
            <div className="p-2.5 border-b border-[#2C374A]/60">
              <div className="text-[11px] font-bold text-[#8C98A9] px-0.5 mb-1.5 uppercase tracking-wider">
                Business Profile
              </div>
              <div className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs border border-transparent">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-900 truncate">
                    {activeProject?.domain ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'teams.com'}
                  </span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </div>
            </div>
          )}

          {effectiveSection === 'audit' && (
            <div className="p-2.5 border-b border-[#2C374A]/60">
              <div className="text-[11px] font-bold text-[#8C98A9] px-0.5 mb-1.5 uppercase tracking-wider">
                Audited Website
              </div>
              <div className="w-full bg-white text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs border border-transparent">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-900 truncate">
                    {activeProject?.domain ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'teams.com'}
                  </span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </div>
            </div>
          )}

          {/* Navigation Links List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
            {effectiveSection === 'smm' ? (
              /* SMM (Social Media Management / Planable Suite) */
              <div className="space-y-3">
                {/* Brand / Active Workspace Card */}
                <div className="p-3 bg-[#1C2534] border border-[#2B3545] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-[#8C98A9] uppercase tracking-wider">Planable Workspace</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E9D5FF] text-[#6B21A8]">
                      -20% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      P
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-white truncate leading-tight">
                        Social Workspace
                      </div>
                      <div className="text-[11px] text-[#8C98A9] truncate mt-0.5">
                        9 Social Channels Active
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMM Navigation Links */}
                <div className="space-y-0.5 text-[13.5px]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 pt-1 pb-1">
                    PUBLISHING &amp; PLANNING
                  </div>

                  {/* 1. Content Calendar */}
                  <Link
                    href="/smm#calendar"
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      currentHash === '#calendar' || currentTab === 'calendar'
                        ? 'bg-[#313c4e] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                      <span>Content Calendar</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-semibold border border-blue-500/30">
                      Live
                    </span>
                  </Link>

                  {/* 2. Feed & Grid Planner */}
                  <Link
                    href="/smm#feed"
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                      currentHash === '#feed' || currentTab === 'feed'
                        ? 'bg-[#313c4e] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                    <span>Feed &amp; Grid Planner</span>
                  </Link>

                  {/* 3. Approvals & Review Workflows */}
                  <Link
                    href="/smm#approvals"
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      currentHash === '#approvals' || currentTab === 'approvals'
                        ? 'bg-[#313c4e] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                      <span>Approvals &amp; Review</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                      1 Pending
                    </span>
                  </Link>

                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 pt-3 pb-1">
                    ANALYTICS &amp; ENGAGEMENT
                  </div>

                  {/* 4. Social Analytics */}
                  <Link
                    href="/smm#analytics"
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      currentHash === '#analytics' || currentTab === 'analytics'
                        ? 'bg-[#313c4e] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                      <span>Social Analytics</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      +34.8%
                    </span>
                  </Link>

                  {/* 5. Team Comments & Inbox */}
                  <Link
                    href="/smm#comments"
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all ${
                      currentHash === '#comments' || currentTab === 'comments'
                        ? 'bg-[#313c4e] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                    <span>Real-time Comments</span>
                  </Link>

                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 pt-3 pb-1">
                    CONNECTED CHANNELS
                  </div>

                  {/* 6. Platforms Collapsible (Exact 9 platforms) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection('smm_platforms')}
                      className="w-full flex items-center justify-between px-3 py-2 text-[#C4C9D3] hover:text-white hover:bg-white/10 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Share2 className="w-4 h-4 text-[#8C98A9]" />
                        <span>9 Platforms</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections['smm_platforms'] !== false ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedSections['smm_platforms'] !== false && (
                      <div className="space-y-1 mt-1 text-[12.5px] pl-4">
                        {[
                          'Facebook',
                          'Instagram',
                          'LinkedIn',
                          'YouTube',
                          'X (Twitter)',
                          'TikTok',
                          'Pinterest',
                          'Threads',
                          'Google Business Profile',
                        ].map((platName) => (
                          <Link
                            key={platName}
                            href="/smm#platforms"
                            className="flex items-center gap-2.5 px-3 py-1 rounded text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors group"
                          >
                            <span className="shrink-0 transition-transform group-hover:scale-110 drop-shadow-xs">
                              {getSocialPlatformIcon(platName, 'w-4 h-4 rounded-xs')}
                            </span>
                            <span className="truncate font-medium">{platName}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 7. Interactive Tour & Partner CTA */}
                  <div className="pt-3 border-t border-[#2C384A]/60 space-y-2">
                    <a
                      href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Play className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors" />
                        <span>Interactive Demo Tour</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>

                    <a
                      href="https://app.planable.io/onboarding/details"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <span>Start Planning (-20%)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : effectiveSection === 'backlinks' ? (
              /* Backlinks Mode Menu - Exactly matching User Screenshot */
              <div className="space-y-1 py-1">
                <Link
                  href="/backlinks"
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname === '/backlinks' || pathname.startsWith('/admin.backlink_checker')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Backlink Checker</span>
                </Link>

                <Link
                  href="/admin.backlinks.builder.html#/"
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/admin.backlinks') || pathname.startsWith('/backlinks/gap-analyzer')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <BacklinkGapAnalyzerIcon className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Backlink Gap Analyzer</span>
                </Link>
              </div>
            ) : effectiveSection === 'api' ? (
              /* API Mode Menu matching SE Ranking Developer Suite */
              (() => {
                const isWalletActive = pathname.includes('/wallet') || currentTab === 'wallet' || currentHash.includes('wallet');
                const isMcpActive = pathname.includes('/mcp') || currentTab === 'mcp' || currentHash.includes('mcp');
                const isDashboardActive = !isWalletActive && !isMcpActive;

                const isHtmlMode = pathname.includes('admin.api.html');
                const dashboardHref = isHtmlMode ? '/admin.api.html#/' : '/api-docs';
                const walletHref = isHtmlMode ? '/admin.api.html#/wallet' : '/api-docs/wallet';
                const mcpHref = isHtmlMode ? '/admin.api.html#/mcp' : '/api-docs/mcp';

                return (
                  <div className="space-y-0.5">
                    <Link
                      href={dashboardHref}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                        isDashboardActive
                          ? 'bg-[#394757] text-white font-semibold shadow-xs'
                          : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                      }`}
                    >
                      <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? 'text-white' : 'text-[#8C98A9]'}`} />
                      <span>Dashboard & Overview</span>
                    </Link>

                    <Link
                      href={walletHref}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                        isWalletActive
                          ? 'bg-[#394757] text-white font-semibold shadow-xs'
                          : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                      }`}
                    >
                      <Wallet className={`w-4 h-4 ${isWalletActive ? 'text-white' : 'text-[#8C98A9]'}`} />
                      <span>Wallet & Balance</span>
                    </Link>

                    <Link
                      href={mcpHref}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                        isMcpActive
                          ? 'bg-[#394757] text-white font-semibold shadow-xs'
                          : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                      }`}
                    >
                      <Cpu className={`w-4 h-4 shrink-0 ${isMcpActive ? 'text-white' : 'text-[#8C98A9]'}`} />
                      <span>MCP Server</span>
                    </Link>

                    {/* API Endpoints Reference Accordion */}
                    <div>
                      <div
                        onClick={(e) => toggleSection('api_endpoints', e)}
                        className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                      >
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="w-4 h-4 text-[#8C98A9]" />
                          <span>API Reference</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            expandedSections.api_endpoints !== false ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </div>
                      {expandedSections.api_endpoints !== false && (
                        <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                          <SubItem href="/api-docs#projects" label="Projects API" />
                          <SubItem href="/api-docs#rankings" label="Rankings API" />
                          <SubItem href="/api-docs#backlinks" label="Backlinks API" />
                          <SubItem href="/api-docs#audit" label="Website Audit API" />
                          <SubItem href="/api-docs#keywords" label="Keywords API" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : effectiveSection === 'content' ? (
              /* Content Marketing Mode Menu - Complete SE Ranking Content Suite */
              <div className="space-y-0.5">
                {/* 1. Content Idea Finder (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('content_ideas', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      currentTab === 'idea-finder' || currentTab === 'clusters' || currentTab === 'questions' || currentTab === 'headlines'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/content-marketing?tab=idea-finder"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Sparkles className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Content Idea Finder</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('content_ideas', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.content_ideas !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.content_ideas !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/content-marketing?tab=idea-finder"
                        label="Overview & Mind Map"
                        isActive={currentTab === 'idea-finder'}
                      />
                      <SubItem
                        href="/content-marketing?tab=clusters"
                        label="Topic Clusters"
                        isActive={currentTab === 'clusters'}
                      />
                      <SubItem
                        href="/content-marketing?tab=questions"
                        label="Questions Finder"
                        isActive={currentTab === 'questions'}
                      />
                      <SubItem
                        href="/content-marketing?tab=headlines"
                        label="Trending Headlines"
                        isActive={currentTab === 'headlines'}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Content Editor (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('content_editor', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname === '/content-marketing' && currentTab !== 'idea-finder' && currentTab !== 'clusters' && currentTab !== 'questions' && currentTab !== 'headlines' && !currentTab.startsWith('ai-')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/content-marketing?tab=editor"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Files className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Content Editor</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('content_editor', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.content_editor !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.content_editor !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/content-marketing?tab=editor"
                        label="All Articles"
                        isActive={currentTab === 'editor' || (!currentTab && pathname === '/content-marketing')}
                      />
                      <SubItem
                        href="/content-marketing?tab=drafts"
                        label="Drafts & In-Progress"
                        isActive={currentTab === 'drafts'}
                      />
                      <SubItem
                        href="/content-marketing?tab=score"
                        label="SEO Content Score"
                        isActive={currentTab === 'score'}
                      />
                      <SubItem
                        href="/content-marketing?tab=keywords"
                        label="Keyword Coverage"
                        isActive={currentTab === 'keywords'}
                      />
                    </div>
                  )}
                </div>

                {/* 3. AI Article Writer (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('ai_writer', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      currentTab.startsWith('ai-')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">AI Article Writer</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold uppercase tracking-wider border border-emerald-500/30">
                        NEW
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('ai_writer', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.ai_writer !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.ai_writer !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/content-marketing?tab=ai-outlines"
                        label="AI Outline Builder"
                        isActive={currentTab === 'ai-outlines'}
                      />
                      <SubItem
                        href="/content-marketing?tab=ai-draft"
                        label="Long-form Generator"
                        isActive={currentTab === 'ai-draft'}
                      />
                      <SubItem
                        href="/content-marketing?tab=ai-tone"
                        label="Tone & Rewriter"
                        isActive={currentTab === 'ai-tone'}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Content Briefs */}
                <Link
                  href="/content-marketing?tab=briefs"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    currentTab === 'briefs'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Content Briefs</span>
                </Link>
              </div>
            ) : effectiveSection === 'local-marketing' ? (
              /* Local Marketing Mode Menu (Exact match to Screenshots 1, 2, 5, 6) */
              <>
                <Link
                  href="/local-marketing?tab=all-locations"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.includes('admin.local_marketing.html') ||
                    currentTab === 'all-locations' ||
                    (pathname === '/local-marketing' && !currentTab)
                      ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>All Locations</span>
                </Link>

                <Link
                  href="/local-marketing?tab=overview"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-4 h-4 text-gray-400" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/local-marketing?tab=rankings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'rankings'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-gray-400" />
                  <span>Local Rankings</span>
                </Link>

                <Link
                  href="/local-marketing?tab=audit"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'audit' || pathname.startsWith('/local-marketing/audit')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  <span>Local Marketing Audit</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('gbp')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span>Google Business Profile</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.gbp ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.gbp && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/local-marketing?tab=gbp-insights"
                        label="GBP Insights"
                        isActive={currentTab === 'gbp-insights'}
                      />
                      <SubItem
                        href="/local-marketing?tab=gbp-posts"
                        label="GBP Posts"
                        isActive={currentTab === 'gbp-posts'}
                      />
                    </div>
                  )}
                </div>

                <Link
                  href="/local-marketing?tab=listings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'listings' || pathname.startsWith('/local-marketing/business-listings')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Files className="w-4 h-4 text-gray-300" />
                  <span>Business Listings</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('reviews')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>Reviews</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.reviews === false ? '' : 'rotate-180'}`} />
                  </button>
                  {expandedSections.reviews !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/local-marketing?tab=reviews"
                        label="Review List"
                        isActive={currentTab === 'reviews' || pathname.includes('/review-list')}
                      />
                      <SubItem
                        href="/local-marketing?tab=analytics"
                        label="Analytics"
                        isActive={currentTab === 'analytics' || pathname.includes('/analytics')}
                      />
                      <SubItem
                        href="/local-marketing?tab=insights"
                        label="Insights"
                        isActive={currentTab === 'insights'}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : effectiveSection === 'agency' ? (
              /* Agency Pack Menu (Exact match to SE Ranking White Label screenshot) */
              (() => {
                const isWhiteLabelHtml = pathname.includes('whitelabel');
                const isPersonalDomainActive = currentTab === 'personal-domain-names' || currentHash.includes('personal-domain-names');
                const isLoginPageActive = currentTab === 'login-page' || currentHash.includes('login-page');
                const isEmailSettingsActive = currentTab === 'email-settings' || currentHash.includes('email-settings');
                const isReportBuilderActive = currentTab === 'report-builder' || currentHash.includes('reports') || currentHash.includes('report-builder');
                const isInterfaceActive = !isPersonalDomainActive && !isLoginPageActive && !isEmailSettingsActive && !isReportBuilderActive;

                const interfaceHref = isWhiteLabelHtml ? '/admin.user.whitelabel.html#/' : '/agency-pack?tab=interface-customization';
                const domainHref = isWhiteLabelHtml ? '/admin.user.whitelabel.html#/personal-domain-names' : '/agency-pack?tab=personal-domain-names';
                const loginHref = isWhiteLabelHtml ? '/admin.user.whitelabel.html#/login-page' : '/agency-pack?tab=login-page';
                const emailHref = isWhiteLabelHtml ? '/admin.user.whitelabel.html#/email-settings' : '/agency-pack?tab=email-settings';
                const reportHref = isWhiteLabelHtml ? '/admin.user.whitelabel.html#/reports' : '/agency-pack?tab=report-builder';

                return (
                  <>
                    {/* 1. White Label Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={(e) => toggleSection('white_label', e)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M3 9h18" />
                            <path d="M9 21V9" />
                          </svg>
                          <span>White Label</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            expandedSections.white_label ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>

                      {expandedSections.white_label && (
                        <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                          <SubItem
                            href={interfaceHref}
                            label="Interface customization"
                            isActive={isInterfaceActive}
                          />
                          <SubItem
                            href={domainHref}
                            label="Personal domain names"
                            isActive={isPersonalDomainActive}
                          />
                          <SubItem
                            href={loginHref}
                            label="Login page"
                            isActive={isLoginPageActive}
                          />
                          <SubItem
                            href={emailHref}
                            label="Email settings"
                            isActive={isEmailSettingsActive}
                          />
                          <SubItem
                            href={reportHref}
                            label="Report Builder"
                            isActive={isReportBuilderActive}
                          />
                        </div>
                      )}
                    </div>

                {/* 2. Lead Generator Accordion */}
                {(() => {
                  const isLeadHtml = pathname.includes('lead_generator');
                  const isLeadsActive = currentTab === 'lead-leads' || currentHash.includes('leads');
                  const isWidgetsActive =
                    currentTab === 'lead-widgets' ||
                    currentTab === 'widgets' ||
                    currentHash.includes('widgets') ||
                    currentHash.includes('widget');
                  const isSettingsActive = currentTab === 'lead-settings' || currentHash.includes('settings');

                  const leadsHref = isLeadHtml ? '/admin.lead_generator.html#/leads' : '/agency-pack?tab=lead-leads';
                  const widgetsHref = isLeadHtml ? '/admin.lead_generator.html#/widgets' : '/agency-pack?tab=lead-widgets';
                  const settingsHref = isLeadHtml ? '/admin.lead_generator.html#/settings' : '/agency-pack?tab=lead-settings';

                  return (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => toggleSection('lead_generator', e)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Lead Generator</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            expandedSections.lead_generator ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>

                      {expandedSections.lead_generator && (
                        <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                          <SubItem
                            href={leadsHref}
                            label="Leads"
                            isActive={isLeadsActive}
                          />
                          <SubItem
                            href={widgetsHref}
                            label="Widget"
                            isActive={isWidgetsActive}
                          />
                          <SubItem
                            href={settingsHref}
                            label="Settings"
                            isActive={isSettingsActive}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Users External Link */}
                <Link
                  href="/users"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Users</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {/* 4. Report Builder External Link */}
                <Link
                  href="/reports"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <span>Report Builder</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </>
            );
          })()
        ) : effectiveSection === 'projects' ? (
              /* Projects Mode Menu (Exact 1:1 match to uploaded SE Ranking screenshot) */
              <div className="space-y-0.5">
                {/* 1. All Projects */}
                <Link
                  href="/projects"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isAllProjectsActive
                      ? 'bg-[#283547] text-white font-bold shadow-xs border-l-2 border-[#0062FF]'
                      : 'text-[#E2E8F0] hover:text-white hover:bg-[#283547]'
                  }`}
                >
                  <Home className={`w-4 h-4 shrink-0 transition-colors ${isAllProjectsActive ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                  <span className="truncate">All Projects</span>
                </Link>

                {/* Other project tools - all real and working */}
                <div className="space-y-0.5">
                {/* 2. Project Overview */}
                <Link
                  href="/project-overview"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isProjectOverviewActive
                      ? 'bg-[#283547] text-white font-bold shadow-xs border-l-2 border-[#0062FF]'
                      : 'text-[#E2E8F0] hover:text-white hover:bg-[#283547]'
                  }`}
                >
                  <LayoutGrid className={`w-4 h-4 shrink-0 transition-colors ${isProjectOverviewActive ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                  <span className="truncate">Project Overview</span>
                </Link>

                {/* 3. Rankings (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('rankings', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isRankingsPath
                        ? 'bg-[#283547] text-white font-bold shadow-xs'
                        : 'text-[#E2E8F0] hover:text-white hover:bg-[#283547]'
                    }`}
                  >
                    <Link
                      href="/rankings"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('detailed');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <BarChart2 className={`w-4 h-4 shrink-0 transition-colors ${isRankingsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate font-semibold">Rankings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('rankings', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isRankingsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle Rankings menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.rankings ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.rankings && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/rankings?tab=summary"
                        label="Summary"
                        isActive={isRankingsSummaryActive}
                        onClick={() => setManualTab('summary')}
                      />
                      <SubItem
                        href="/rankings?tab=detailed"
                        label="Detailed"
                        isActive={isRankingsDetailedActive}
                        onClick={() => setManualTab('detailed')}
                      />
                      <SubItem
                        href="/rankings?tab=historical"
                        label="Historical data"
                        isActive={isRankingsHistoricalActive}
                        onClick={() => setManualTab('historical')}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Analytics & Traffic (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('analytics', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isAnalyticsPath
                        ? 'bg-[#283547] text-white font-bold shadow-xs'
                        : 'text-[#E2E8F0] hover:text-white hover:bg-[#283547]'
                    }`}
                  >
                    <Link
                      href="/analytics"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('overview');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Activity className={`w-4 h-4 shrink-0 transition-colors ${isAnalyticsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate font-semibold">Analytics &amp; Traffic</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('analytics', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isAnalyticsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle Analytics & Traffic menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.analytics ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.analytics && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/analytics?tab=overview"
                        label="Overview"
                        isActive={isAnalyticsOverviewActive}
                        onClick={() => setManualTab('overview')}
                      />
                      <SubItem
                        href="/analytics?tab=traffic"
                        label="Traffic"
                        isActive={isAnalyticsTrafficActive}
                        onClick={() => setManualTab('traffic')}
                      />
                      <SubItem
                        href="/analytics?tab=snippets"
                        label="Snippets"
                        isActive={isAnalyticsSnippetsActive}
                        onClick={() => setManualTab('snippets')}
                      />
                      <SubItem
                        href="/analytics?tab=gsc"
                        label="Google Search Console Data"
                        isActive={isAnalyticsGscActive}
                        onClick={() => setManualTab('gsc')}
                      />
                      <SubItem
                        href="/analytics?tab=potential"
                        label="SEO potential"
                        isActive={isAnalyticsPotentialActive}
                        onClick={() => setManualTab('potential')}
                      />
                    </div>
                  )}
                </div>

                {/* 5. My Competitors (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('competitors', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isCompetitorsPath
                        ? 'bg-[#283547] text-white font-bold shadow-xs'
                        : 'text-[#E2E8F0] hover:text-white hover:bg-[#283547]'
                    }`}
                  >
                    <Link
                      href="/competitors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('added');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Users className={`w-4 h-4 shrink-0 transition-colors ${isCompetitorsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate font-semibold">My Competitors</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('competitors', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isCompetitorsPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle My Competitors menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.competitors ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.competitors && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/competitors?tab=added"
                        label="Added Competitors"
                        isActive={isCompetitorsAddedActive}
                        onClick={() => setManualTab('added')}
                      />
                      <SubItem
                        href="/competitors?tab=serp"
                        label="SERP Competitors"
                        isActive={isCompetitorsSerpActive}
                        onClick={() => setManualTab('serp')}
                      />
                      <SubItem
                        href="/competitors?tab=sov"
                        label="Share of Voice"
                        isActive={isCompetitorsSovActive}
                        onClick={() => setManualTab('sov')}
                      />
                      <SubItem
                        href="/competitors?tab=visibility"
                        label="Visibility Rating"
                        isActive={isCompetitorsVisibilityActive}
                        onClick={() => setManualTab('visibility')}
                      />
                    </div>
                  )}
                </div>

                {/* 6. AI Results Tracker (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('ai_tracker', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isAiTrackerPath
                        ? 'bg-[#283547] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                    }`}
                  >
                    <Link
                      href="/ai-results-tracker"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('rankings');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Compass className={`w-4 h-4 shrink-0 transition-colors ${isAiTrackerPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate">AI Results Tracker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('ai_tracker', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isAiTrackerPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle AI Results Tracker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.ai_tracker ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.ai_tracker && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/ai-results-tracker?tab=rankings"
                        label="Rankings"
                        isActive={isAiTrackerRankingsActive}
                        onClick={() => setManualTab('rankings')}
                      />
                      <SubItem
                        href="/ai-results-tracker?tab=competitors"
                        label="Competitors"
                        isActive={isAiTrackerCompetitorsActive}
                        onClick={() => setManualTab('competitors')}
                      />
                      <SubItem
                        href="/ai-results-tracker?tab=sources"
                        label="Sources"
                        isActive={isAiTrackerSourcesActive}
                        onClick={() => setManualTab('sources')}
                      />
                    </div>
                  )}
                </div>

                {/* 7. Insights */}
                <Link
                  href="/insights"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isInsightsActive
                      ? 'bg-[#283547] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 shrink-0 transition-colors ${isInsightsActive ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                  <span className="truncate">Insights</span>
                </Link>


                {/* 9. Marketing Plan */}
                <Link
                  href="/marketing-plan"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isMarketingPlanActive
                      ? 'bg-[#283547] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                  }`}
                >
                  <CheckSquare className={`w-4 h-4 shrink-0 transition-colors ${isMarketingPlanActive ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                  <span className="truncate">Marketing Plan</span>
                </Link>

                {/* 10. Website Audit (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('audit', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isAuditPath
                        ? 'bg-[#283547] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                    }`}
                  >
                    <Link
                      href="/website-audit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('overview');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FileSearch className={`w-4 h-4 shrink-0 transition-colors ${isAuditPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate">Website Audit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('audit', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isAuditPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle Website Audit menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.audit ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.audit && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/website-audit?tab=overview"
                        label="Overview"
                        isActive={isAuditOverviewActive}
                        onClick={() => setManualTab('overview')}
                      />
                      <SubItem
                        href="/website-audit?tab=issues"
                        label="Issue Report"
                        isActive={isAuditIssuesActive}
                        onClick={() => setManualTab('issues')}
                      />
                      <SubItem
                        href="/website-audit?tab=pages"
                        label="Crawled Pages"
                        isActive={isAuditPagesActive}
                        onClick={() => setManualTab('pages')}
                      />
                      <SubItem
                        href="/website-audit?tab=resources"
                        label="Found Resources"
                        isActive={isAuditResourcesActive}
                        onClick={() => setManualTab('resources')}
                      />
                      <SubItem
                        href="/website-audit?tab=links"
                        label="Found Links"
                        isActive={isAuditLinksActive}
                        onClick={() => setManualTab('links')}
                      />
                      <SubItem
                        href="/website-audit?tab=comparison"
                        label="Crawl Comparison"
                        isActive={isAuditComparisonActive}
                        onClick={() => setManualTab('comparison')}
                      />
                    </div>
                  )}
                </div>

                {/* 11. Page Changes Monitor */}
                <Link
                  href="/page-changes"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    isPageChangesActive
                      ? 'bg-[#283547] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                  }`}
                >
                  <Columns className={`w-4 h-4 shrink-0 transition-colors ${isPageChangesActive ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                  <span className="truncate">Page Changes Monitor</span>
                </Link>

                {/* 12. Backlink Monitor (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('backlink_monitor', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      isBacklinkMonitorPath
                        ? 'bg-[#283547] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#253040]'
                    }`}
                  >
                    <Link
                      href="/backlinks-monitor"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualTab('backlinks');
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <ChainLink className={`w-4 h-4 shrink-0 transition-colors ${isBacklinkMonitorPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'}`} />
                      <span className="truncate">Backlink Monitor</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('backlink_monitor', e)}
                      className={`p-1 rounded hover:bg-white/10 transition-all cursor-pointer shrink-0 ml-1 ${
                        isBacklinkMonitorPath ? 'text-white' : 'text-[#8C98A9] group-hover:text-white'
                      }`}
                      title="Toggle Backlink Monitor menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.backlink_monitor ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.backlink_monitor && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/backlinks-monitor?tab=backlinks"
                        label="Backlinks"
                        isActive={isBacklinksListActive}
                        onClick={() => setManualTab('backlinks')}
                      />
                      <SubItem
                        href="/backlinks-monitor?tab=domains"
                        label="Domains"
                        isActive={isBacklinksDomainsActive}
                        onClick={() => setManualTab('domains')}
                      />
                      <SubItem
                        href="/backlinks-monitor?tab=anchor-texts"
                        label="Anchor Texts"
                        isActive={isBacklinksAnchorsActive}
                        onClick={() => setManualTab('anchor-texts')}
                      />
                      <SubItem
                        href="/backlinks-monitor?tab=pages"
                        label="Pages"
                        isActive={isBacklinksPagesActive}
                        onClick={() => setManualTab('pages')}
                      />
                      <SubItem
                        href="/backlinks-monitor?tab=ips-subnets"
                        label="IPs/Subnets"
                        isActive={isBacklinksIpsActive}
                        onClick={() => setManualTab('ips-subnets')}
                      />
                      <SubItem
                        href="/backlinks-monitor?tab=disavow"
                        label="Disavow"
                        isActive={isBacklinksDisavowActive}
                        onClick={() => setManualTab('disavow')}
                      />
                    </div>
                  )}
                </div>
                </div>
              </div>
            ) : effectiveSection === 'audit' ? (
              /* Audit Submenu (Exact 1:1 match to screenshot) */
              <div className="space-y-0.5">
                {/* 1. Website Audit Dropdown */}
                <div>
                  <div
                    onClick={(e) => toggleSection('audit', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Link
                      href="/website-audit"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <Globe className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Website Audit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('audit', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Website Audit menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.audit ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>

                  {expandedSections.audit && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/website-audit"
                        label="All reports"
                        isActive={(pathname === '/website-audit' || pathname === '/audit') && (!currentTab || currentTab === 'all-reports')}
                        badge={<span className="bg-[#1E293B] text-white text-[10px] px-1.5 py-0.2 rounded font-bold">1</span>}
                      />
                      <SubItem
                        href="/website-audit?tab=overview"
                        label="Overview"
                        isActive={currentTab === 'overview'}
                      />
                      <SubItem
                        href="/website-audit?tab=issues"
                        label="Issue Report"
                        isActive={currentTab === 'issues'}
                      />
                      <SubItem
                        href="/website-audit?tab=pages"
                        label="Crawled Pages"
                        isActive={currentTab === 'pages'}
                      />
                      <SubItem
                        href="/website-audit?tab=resources"
                        label="Found Resources"
                        isActive={currentTab === 'resources'}
                      />
                      <SubItem
                        href="/website-audit?tab=links"
                        label="Found Links"
                        isActive={currentTab === 'links'}
                      />
                      <SubItem
                        href="/website-audit?tab=comparison"
                        label="Crawl Comparison"
                        isActive={currentTab === 'comparison'}
                      />
                    </div>
                  )}
                </div>

                {/* 2. On-Page SEO Checker Dropdown */}
                <div>
                  <div
                    onClick={(e) => toggleSection('on_page_checker', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A] cursor-pointer select-none"
                  >
                    <Link
                      href="/website-audit/on-page"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FileSearch className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">On-Page SEO Checker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('on_page_checker', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.on_page_checker !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.on_page_checker !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/website-audit/on-page"
                        label="All Reports"
                        isActive={pathname === '/website-audit/on-page' && !currentTab}
                      />
                      <SubItem
                        href="/website-audit/on-page?tab=audit"
                        label="On-Page SEO Audit"
                        isActive={currentTab === 'audit'}
                      />
                      <SubItem
                        href="/website-audit/on-page?tab=comparison"
                        label="Competitive Comparison"
                        isActive={currentTab === 'comparison'}
                      />
                      <SubItem
                        href="/website-audit/on-page?tab=tasks"
                        label="SEO Tasks"
                        isActive={currentTab === 'tasks'}
                      />
                    </div>
                  )}
                </div>

                {/* 3. SERP Analyzer Dropdown */}
                <div>
                  <div
                    onClick={(e) => toggleSection('serp_analyzer', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A] cursor-pointer select-none"
                  >
                    <Link
                      href="/website-audit/serp-analyzer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <BarChart2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">SERP Analyzer</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('serp_analyzer', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.serp_analyzer ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.serp_analyzer && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/website-audit/serp-analyzer"
                        label="All Reports"
                        isActive={pathname === '/website-audit/serp-analyzer' && !currentTab}
                      />
                      <SubItem
                        href="/website-audit/serp-analyzer?tab=report"
                        label="SERP Report"
                        isActive={currentTab === 'report'}
                      />
                      <SubItem
                        href="/website-audit/serp-analyzer?tab=comparison"
                        label="Competitive Comparison"
                        isActive={currentTab === 'comparison'}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : effectiveSection === 'reports' ? (
              /* Report Builder Mode Menu - Complete SE Ranking Report Suite */
              <div className="space-y-0.5">
                {/* 1. My Reports (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('my_reports', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname === '/reports' && (!currentTab || currentTab === 'all' || currentTab === 'scheduled' || currentTab === 'drafts' || currentTab === 'archived')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/reports"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FileText className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">My Reports</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('my_reports', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.my_reports !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.my_reports !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/reports?tab=all"
                        label="All Reports"
                        isActive={currentTab === 'all' || (!currentTab && pathname === '/reports')}
                      />
                      <SubItem
                        href="/reports?tab=scheduled"
                        label="Scheduled Reports"
                        isActive={currentTab === 'scheduled'}
                      />
                      <SubItem
                        href="/reports?tab=drafts"
                        label="Drafts"
                        isActive={currentTab === 'drafts'}
                      />
                      <SubItem
                        href="/reports?tab=archived"
                        label="Archived"
                        isActive={currentTab === 'archived'}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Report Templates (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('report_templates', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.includes('template') || currentTab === 'templates'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/reports?tab=templates"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Layers className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Report Templates</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('report_templates', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.report_templates !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.report_templates !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/reports?template=seo-audit"
                        label="Full SEO Audit"
                        isActive={currentTab === 'templates' && pathname.includes('seo-audit')}
                      />
                      <SubItem
                        href="/reports?template=rankings"
                        label="Rankings Progress"
                        isActive={pathname.includes('rankings')}
                      />
                      <SubItem
                        href="/reports?template=competitors"
                        label="Competitor Benchmarking"
                        isActive={pathname.includes('competitors')}
                      />
                      <SubItem
                        href="/reports?template=executive"
                        label="Executive Summary"
                        isActive={pathname.includes('executive')}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Custom Branding (Collapsible) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('custom_branding', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Link
                      href="/reports?tab=branding"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Building2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Custom Branding</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('custom_branding', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.custom_branding !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.custom_branding !== false && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/agency-pack?tab=interface-customization"
                        label="White Label Settings"
                        isActive={pathname.includes('agency-pack')}
                      />
                      <SubItem
                        href="/reports?tab=logo"
                        label="Custom Header & Logo"
                        isActive={currentTab === 'logo'}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Automated Schedules */}
                <Link
                  href="/reports?tab=schedules"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    currentTab === 'schedules'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Email Schedules</span>
                </Link>

                {/* 5. Export History */}
                <Link
                  href="/reports?tab=exports"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    currentTab === 'exports'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Download className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Export History</span>
                </Link>
              </div>
            ) : (effectiveSection as string) === 'settings' ? (
              /* Settings & Profile Menu */
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="p-3 bg-[#1C2534] border border-[#2B3545] rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    {effectiveInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-white truncate leading-tight">
                      {effectiveName}
                    </div>
                    <div className="text-[11px] text-[#8C98A9] truncate leading-tight mt-0.5" title={effectiveEmail}>
                      {effectiveEmail}
                    </div>
                  </div>
                </div>

                {/* Settings Navigation */}
                <div className="space-y-0.5 text-[13.5px]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 pt-1 pb-1">
                    SETTINGS
                  </div>

                  <Link
                    href="/admin.user.settings.html"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/admin.user.settings.html' || pathname === '/settings'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#8C98A9]" />
                    <span>General</span>
                  </Link>

                  <Link
                    href="/admin.user.settings.do-profile.html"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/admin.user.settings.do-profile.html'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#8C98A9]" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/admin.user.settings.do-notifications.html"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/admin.user.settings.do-notifications.html'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-[#8C98A9]" />
                    <span>Notifications</span>
                  </Link>

                  <Link
                    href="/admin.session.lock.html"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/admin.session.lock.html'
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#8C98A9]" />
                    <span>Active Sessions</span>
                  </Link>

                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 pt-3 pb-1">
                    TEAM &amp; BILLING
                  </div>

                  <Link
                    href="/users"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/users' || pathname.startsWith('/admin.users')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#8C98A9]" />
                      <span>Users</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-500/30">
                      Seats
                    </span>
                  </Link>

                  <Link
                    href="/agency-pack?tab=interface-customization"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Building2 className="w-4 h-4 text-[#8C98A9]" />
                    <span>White Label</span>
                  </Link>

                  <Link
                    href="/pricing"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <CreditCard className="w-4 h-4 text-[#8C98A9]" />
                    <span>Billing &amp; Subscription</span>
                  </Link>

                  <Link
                    href="/bonus-offers"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Gift className="w-4 h-4 text-[#8C98A9]" />
                    <span>Bonus Offers</span>
                  </Link>

                  <Link
                    href="/affiliate"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <DollarSign className="w-4 h-4 text-[#8C98A9]" />
                    <span>Affiliate Program</span>
                  </Link>

                  <div className="pt-2 border-t border-[#2B3545]">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await logout();
                        } catch {}
                        router.push('/');
                        if (typeof window !== 'undefined') {
                          window.location.href = '/';
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : effectiveSection === 'ai-search' ? (
              /* AI Search Secondary Sidebar matching user screenshot media_1791177820948.png 1:1 */
              <div className="space-y-4">
                {/* Section 1: Projects */}
                <div>
                  <div className="text-[12px] font-bold text-white uppercase tracking-wider px-2 mb-2">
                    Projects
                  </div>
                  {/* Project Selector pill */}
                  <div className="bg-white text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs border border-gray-200">
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-4 h-4 text-[#8C98A9] shrink-0" />
                      <span className="font-semibold text-[13px] text-[#1E293B] truncate">
                        {activeProject?.domain || 'No project selected'}
                      </span>
                    </div>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                  </div>

                  {/* AI Results Tracker Group */}
                  <div className="mt-3">
                    <div
                      onClick={(e) => toggleSection('ai_tracker', e)}
                      className="flex items-center justify-between text-white font-medium text-[13.5px] px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded-lg select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8C98A9]" />
                        <span>AI Results Tracker</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#8C98A9] transition-transform duration-200 ${
                          expandedSections.ai_tracker !== false ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </div>

                    {expandedSections.ai_tracker !== false && (
                      <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                        <SubItem
                          href="/projects/teams.com/ai-results-tracker/rankings"
                          label="Rankings"
                          isActive={pathname.includes('/rankings')}
                          badge={<ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />}
                        />
                        <SubItem
                          href="/projects/teams.com/ai-results-tracker/competitors"
                          label="Competitors"
                          isActive={pathname.includes('/competitors')}
                          badge={<ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />}
                        />
                        <SubItem
                          href="/projects/teams.com/ai-results-tracker/sources"
                          label="Sources"
                          isActive={pathname.includes('/sources')}
                          badge={<ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Research */}
                <div className="pt-2">
                  <div className="text-[12px] font-bold text-white uppercase tracking-wider px-2 mb-2">
                    Research
                  </div>
                  <Link
                    href="/research/ai-search"
                    className={`flex items-center justify-between px-2.5 py-2 text-[#C4C9D3] hover:text-white hover:bg-white/5 rounded-lg text-[13px] transition-colors ${
                      pathname === '/research/ai-search' ? 'bg-[#394757] text-white font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SearchIcon className="w-4 h-4 text-[#8C98A9]" />
                      <span>Competitive Research for AI</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              </div>
            ) : effectiveSection === 'research' ? (
              /* Research Mode Menu (Exact 1:1 match to uploaded Research screenshot) */
              <div className="space-y-0.5">
                {/* 1. Competitive Research (Dropdown matching Screenshot 1, 2 & 3) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('competitive_research', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Link
                      href="/research/competitive-research"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Compass className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Competitive Research</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('competitive_research', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Competitive Research menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.competitive_research ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.competitive_research && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      {/* Google Search subitem matching Screenshot 1 */}
                      <SubItem
                        href="/research/competitive-research"
                        label="Google Search"
                        isActive={pathname === '/research' || pathname === '/research/competitive-research'}
                      />

                      {/* AI Search subitem matching Screenshot 2 */}
                      <SubItem
                        href="/research/ai-search"
                        label="AI Search"
                        isActive={pathname.startsWith('/research/ai-search')}
                        badge={
                          <span className="text-[10px] bg-[#145EA8]/50 text-[#8ec5fc] px-1.5 py-0.2 rounded font-semibold border border-[#145EA8]/60">
                            Beta
                          </span>
                        }
                      />

                      {/* Database Expansion subitem matching Screenshot 3 */}
                      <SubItem
                        href="/research/database-expansion"
                        label="Database Expansion"
                        isActive={pathname === '/research/database-expansion'}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Keyword Research (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('keyword_research', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/research/keyword')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/research/keyword-research"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <KeyRound className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Keyword Research</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('keyword_research', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Keyword Research menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.keyword_research ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.keyword_research && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/research/keyword-research?tab=overview"
                        label="Overview"
                        isActive={currentTab === 'overview' || (pathname === '/research/keyword-research' && !currentTab)}
                      />
                      <SubItem
                        href="/research/keyword-research/suggestions"
                        label="Keyword Suggestions"
                        isActive={pathname.includes('suggestions') || currentTab === 'suggestions'}
                      />
                      <SubItem
                        href="/research/keyword-research/serp"
                        label="SERP Overview"
                        isActive={pathname.includes('serp') || currentTab === 'serp'}
                      />
                      <SubItem
                        href="/research/keyword-research?tab=organic-serp-history"
                        label="Organic SERP History"
                        isActive={currentTab === 'organic-serp-history'}
                      />
                      <SubItem
                        href="/research/keyword-research?tab=ads-history"
                        label="Ads History"
                        isActive={currentTab === 'ads-history'}
                      />
                      <SubItem
                        href="/research/keyword-research?tab=database-expansion"
                        label="Database Expansion"
                        isActive={currentTab === 'database-expansion'}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Keyword Manager */}
                <Link
                  href="/keyword-manager"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/keyword-manager')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Keyword Manager</span>
                </Link>

                {/* 4. Keyword Grouper (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('keyword_grouper', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/keyword-grouper')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/keyword-grouper"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FolderTree className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Keyword Grouper</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('keyword_grouper', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Keyword Grouper menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.keyword_grouper ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.keyword_grouper && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/keyword-grouper?tab=results"
                        label="Results"
                        isActive={currentTab === 'results' || pathname === '/keyword-grouper'}
                      />
                    </div>
                  )}
                </div>

                {/* 5. Search Engine Autocomplete */}
                <Link
                  href="/search-autocomplete"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/search-autocomplete')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <PenLine className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Search Engine Autocomplete</span>
                </Link>

                {/* 6. Search Volume Checker (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('search_volume', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/search-volume-checker')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/search-volume-checker"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <BarChart2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Search Volume Checker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('search_volume', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Search Volume Checker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.search_volume ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.search_volume && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/search-volume-checker?tab=results"
                        label="Results"
                        isActive={currentTab === 'results' || pathname === '/search-volume-checker'}
                      />
                    </div>
                  )}
                </div>

                {/* 7. Index Status Checker (Dropdown - Active highlight matching screenshot) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('index_status', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/index-status-checker')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/index-status-checker"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Index Status Checker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('index_status', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Index Status Checker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.index_status ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.index_status && (
                    <div className="space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <SubItem
                        href="/index-status-checker?tab=results"
                        label="Results"
                        isActive={currentTab === 'results' || pathname === '/index-status-checker'}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

export function SecondarySidebar() {
  return (
    <React.Suspense fallback={<div className="w-[230px] shrink-0 bg-[#1E2633] h-full" />}>
      <SecondarySidebarInner />
    </React.Suspense>
  );
}

export default SecondarySidebar;
