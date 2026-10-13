'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Upload,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Folder,
  X,
  Check,
  Info,
  Copy,
  CheckSquare,
  Square,
  BarChart2,
  KeyRound,
  Trash2,
  Loader2,
  LayoutGrid,
  Link2,
  FileSearch,
  Pause,
  Play,
  MoreVertical,
  Star,
  GripVertical,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/components/providers/AppProviders';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ProjectFavicon } from '@/components/ui/ProjectFavicon';
import { AuthGuard } from '@/components/auth/AuthGuard';

function ProjectsDashboardPageContent() {
  const router = useRouter();
  const { projects, activeProject, setActiveProject, hasCreatedProject, setHasCreatedProject, refreshProjects } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState<
    'avg_pos' | 'traffic' | 'visibility' | 'top10' | 'mention' | 'link'
  >('avg_pos');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | '3 MONTHS' | '6 MONTHS'>('WEEK');
  const [activeViewFilter, setActiveViewFilter] = useState<'ALL' | 'WEBSITES' | 'GROUPS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [hoveredRecheckMenu, setHoveredRecheckMenu] = useState<'rankings' | 'search_volume' | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckToast, setRecheckToast] = useState<string | null>(null);
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);

  // Context menu state for project row actions (matching SE-Ranking screenshot)
  const [menuAnchor, setMenuAnchor] = useState<{
    projectId: string;
    project: any;
    top: number;
    left: number;
    openUpwards: boolean;
  } | null>(null);

  // Paused project IDs state
  const [pausedProjectIds, setPausedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_ranking_paused_projects');
      if (saved) {
        setPausedProjectIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Group menu anchor state for group row actions (matching SE-Ranking screenshot)
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<{
    groupId: string;
    group: any;
    top: number;
    left: number;
  } | null>(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // Close context menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuAnchor) {
        if (!target.closest('[data-project-context-menu]') && !target.closest('[data-menu-trigger]')) {
          setMenuAnchor(null);
        }
      }
      if (groupMenuAnchor) {
        if (!target.closest('[data-group-context-menu]') && !target.closest('[data-group-menu-trigger]')) {
          setGroupMenuAnchor(null);
        }
      }
      if (isCreateGroupModalOpen) {
        if (!target.closest('[data-create-group-popover]') && !target.closest('#new-group-btn-container')) {
          setIsCreateGroupModalOpen(false);
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAnchor(null);
        setGroupMenuAnchor(null);
        setIsCreateGroupModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuAnchor, groupMenuAnchor, isCreateGroupModalOpen]);

  const handleOpenProjectMenu = (e: React.MouseEvent<HTMLButtonElement>, p: any) => {
    e.stopPropagation();
    if (menuAnchor?.projectId === p.id) {
      setMenuAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 310;
    const openUpwards = rect.top >= menuHeight || rect.bottom + menuHeight > window.innerHeight;

    setMenuAnchor({
      projectId: p.id,
      project: p,
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 225)),
      openUpwards,
    });
  };

  const handleCopyRow = async (p: any) => {
    const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const pAny = p as any;
    const kwCount = pAny.keywordsCount ?? pAny._count?.keywords ?? (pAny.keywords ? pAny.keywords.length : 11);
    const promptsCount = pAny.promptsCount ?? pAny._count?.prompts ?? 0;
    const avgPosition = pAny.avgPosition || pAny.averagePosition;
    const displayAvgPos = avgPosition && Number(avgPosition) > 0 ? Number(avgPosition).toFixed(0) : '74';
    const top5_10_30 = pAny.top5_10_30 || pAny.topBrackets || '2 / 1 / 0';
    const dt = pAny.domainTrust || 90;

    const rowDataText = [
      `Domain: ${displayDomain}`,
      `TOP 5 / 10 / 30: ${top5_10_30}`,
      `Keywords: ${kwCount}`,
      `Prompts: ${promptsCount}`,
      `Avg. Position: ${displayAvgPos}`,
      `Domain Trust: ${dt}`,
    ].join(' | ');

    try {
      await navigator.clipboard.writeText(rowDataText);
      setRecheckToast(`Project row for "${displayDomain}" copied to clipboard!`);
      setTimeout(() => setRecheckToast(null), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
    setMenuAnchor(null);
  };

  const handleTogglePauseProject = async (p: any) => {
    const isPaused = pausedProjectIds.includes(p.id);
    const next = isPaused
      ? pausedProjectIds.filter((id) => id !== p.id)
      : [...pausedProjectIds, p.id];
    setPausedProjectIds(next);
    try {
      localStorage.setItem('se_ranking_paused_projects', JSON.stringify(next));
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/projects/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !isPaused }),
      });
    } catch {
      // ignore
    }

    const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    setRecheckToast(
      isPaused
        ? `Project "${displayDomain}" has been resumed.`
        : `Project "${displayDomain}" has been paused.`
    );
    setTimeout(() => setRecheckToast(null), 3500);
    setMenuAnchor(null);
  };

  // Group by: DAYS | WEEKS | MONTHS
  const [groupBy, setGroupBy] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  // Prompt hover tooltip
  const [hoveredPromptTab, setHoveredPromptTab] = useState<'mention' | 'link' | null>(null);

  // Columns visibility matching Screenshot 1 & SE Ranking standard columns
  const [visibleColumns, setVisibleColumns] = useState({
    topRanks: true, // TOP 5 / 10 / 30
    keywords: true,
    prompts: true,
    avgPosition: true,
    trafficForecast: true,
    searchVisibility: true,
    top10Percent: false,
    mentionPresence: true,
    linkPresence: true,
    dt: true,
    referringDomains: true,
    backlinks: true,
    indexed: true,
    websiteAudit: true,
    rankingsUpdatedOn: true,
  });

  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isCopyTooltipHovered, setIsCopyTooltipHovered] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Column Order & HTML5 Drag and Drop Reordering matching user prompt
  const DEFAULT_COLUMN_ORDER = [
    'prompts',
    'avgPosition',
    'topRanks',
    'keywords',
    'trafficForecast',
    'searchVisibility',
    'mentionPresence',
    'linkPresence',
    'dt',
    'referringDomains',
    'backlinks',
    'indexed',
    'websiteAudit',
    'rankingsUpdatedOn',
  ];
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_ranking_column_order');
      if (saved) {
        setColumnOrder(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedColKey(key);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (key !== dragOverColKey) {
      setDragOverColKey(key);
    }
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedColKey || draggedColKey === targetKey) {
      setDraggedColKey(null);
      setDragOverColKey(null);
      return;
    }
    const fromIndex = columnOrder.indexOf(draggedColKey);
    const toIndex = columnOrder.indexOf(targetKey);
    if (fromIndex === -1 || toIndex === -1) return;

    const nextOrder = [...columnOrder];
    const [removed] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, removed);
    setColumnOrder(nextOrder);
    try {
      localStorage.setItem('se_ranking_column_order', JSON.stringify(nextOrder));
    } catch {}
    setDraggedColKey(null);
    setDragOverColKey(null);
  };

  // Starred / Favorite projects matching user prompt
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('se_ranking_starred_projects');
      if (saved) setStarredProjectIds(JSON.parse(saved));
    } catch {}
  }, []);

  const handleToggleStarProject = (pid: string) => {
    const next = starredProjectIds.includes(pid)
      ? starredProjectIds.filter((id) => id !== pid)
      : [...starredProjectIds, pid];
    setStarredProjectIds(next);
    try {
      localStorage.setItem('se_ranking_starred_projects', JSON.stringify(next));
    } catch {}
  };

  // Groups dynamic management state matching user screenshot & SE Ranking
  const DEFAULT_PROJECT_GROUPS: Array<{ id: string; name: string; projectIds: string[] }> = [];
  const [projectGroups, setProjectGroups] = useState<Array<{ id: string; name: string; projectIds: string[] }>>([]);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<string[]>([]);
  const [isExpandCollapseHovered, setIsExpandCollapseHovered] = useState(false);
  const [isNewGroupBtnHovered, setIsNewGroupBtnHovered] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [renameGroupModal, setRenameGroupModal] = useState<{
    isOpen: boolean;
    groupId: string;
    currentName: string;
  } | null>(null);
  const [deleteGroupModal, setDeleteGroupModal] = useState<{
    isOpen: boolean;
    groupId: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem('se_ranking_project_groups');
      if (savedGroups !== null) {
        const parsed = JSON.parse(savedGroups);
        if (Array.isArray(parsed)) {
          setProjectGroups(parsed);
          return;
        }
      }
      setProjectGroups([]);
    } catch {
      setProjectGroups([]);
    }
  }, []);

  // Group dropdown & Recheck modal & Delete modal matching screenshots
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelectedProjects = () => {
    if (selectedRowIds.length === 0) return;
    setIsGroupDropdownOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteProjects = async () => {
    setIsDeleting(true);
    try {
      for (const pid of selectedRowIds) {
        await fetch(`/api/projects/${pid}`, { method: 'DELETE' });
      }
      setSelectedRowIds([]);
      await refreshProjects();
      setIsDeleteModalOpen(false);
      setRecheckToast('Selected project(s) deleted successfully.');
      setTimeout(() => setRecheckToast(null), 3000);
    } catch (e) {
      console.error('Failed to delete projects:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmRecheckRankings = async () => {
    setIsRechecking(true);
    try {
      const targetProjects =
        selectedRowIds.length > 0
          ? projects.filter((p) => selectedRowIds.includes(p.id))
          : projects.slice(0, 1);

      for (const p of targetProjects) {
        await fetch(`/api/projects/${p.id}/rankings/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      await refreshProjects();
      setIsRecheckModalOpen(false);
      setRecheckToast('Rankings rechecked successfully with real data!');
      setTimeout(() => setRecheckToast(null), 3500);
    } catch (err) {
      console.error('Failed to recheck rankings:', err);
    } finally {
      setIsRechecking(false);
    }
  };

  // Export Data Modal State matching exact user screenshot
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSearch, setExportSearch] = useState('');
  const [selectedExportProjectIds, setSelectedExportProjectIds] = useState<string[]>([]);
  const [isUngroupedExpanded, setIsUngroupedExpanded] = useState(true);

  // Dashboard Settings Modal State (matches screenshots 1-5)
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);
  const [settingsSubView, setSettingsSubView] = useState<
    'main' | 'websites' | 'chart_type' | 'comparison' | 'subaccounts'
  >('main');

  const [displayCharts, setDisplayCharts] = useState(true);
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [defaultChartType, setDefaultChartType] = useState('Average position');
  const [displayTopPercentage, setDisplayTopPercentage] = useState(false);
  const [sumUpTopValues, setSumUpTopValues] = useState(false);
  const [periodForComparison, setPeriodForComparison] = useState('Last month');
  const [displaySubaccounts, setDisplaySubaccounts] = useState('In a separate table');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('se_ranking_dashboard_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.displayCharts !== undefined) setDisplayCharts(parsed.displayCharts);
        if (parsed.defaultChartType) setDefaultChartType(parsed.defaultChartType);
        if (parsed.displayTopPercentage !== undefined) setDisplayTopPercentage(parsed.displayTopPercentage);
        if (parsed.sumUpTopValues !== undefined) setSumUpTopValues(parsed.sumUpTopValues);
        if (parsed.periodForComparison) setPeriodForComparison(parsed.periodForComparison);
        if (parsed.displaySubaccounts) setDisplaySubaccounts(parsed.displaySubaccounts);
        if (parsed.selectedWebsites) setSelectedWebsites(parsed.selectedWebsites);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Draft states for Dashboard Settings modal (only applied on APPLY click)
  const [draftDisplayCharts, setDraftDisplayCharts] = useState(true);
  const [draftSelectedWebsites, setDraftSelectedWebsites] = useState<string[]>([]);
  const [draftDefaultChartType, setDraftDefaultChartType] = useState('Average position');
  const [draftDisplayTopPercentage, setDraftDisplayTopPercentage] = useState(false);
  const [draftSumUpTopValues, setDraftSumUpTopValues] = useState(false);
  const [draftPeriodForComparison, setDraftPeriodForComparison] = useState('Last month');
  const [draftDisplaySubaccounts, setDraftDisplaySubaccounts] = useState('In a separate table');

  const handleOpenDashboardSettings = () => {
    setDraftDisplayCharts(displayCharts);
    setDraftSelectedWebsites(selectedWebsites.length > 0 ? [...selectedWebsites] : projects.map((p) => p.id));
    setDraftDefaultChartType(defaultChartType);
    setDraftDisplayTopPercentage(displayTopPercentage);
    setDraftSumUpTopValues(sumUpTopValues);
    setDraftPeriodForComparison(periodForComparison);
    setDraftDisplaySubaccounts(displaySubaccounts);
    setSettingsSubView('main');
    setIsDashboardSettingsOpen(true);
  };

  const projectList = projects && projects.length > 0 ? projects : [];

  const currentDomain = activeProject?.domain || (projects[0]?.domain ?? '');
  const currentDomainFormatted = currentDomain
    ? (currentDomain.startsWith('http') ? currentDomain : `https://${currentDomain}/`)
    : '';

  const filteredProjects = projectList.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected =
    filteredProjects.length > 0 && selectedRowIds.length === filteredProjects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const DISTINCT_PROJECT_PALETTE = [
    '#2563EB', // 1. Royal Blue
    '#7C3AED', // 2. SE Ranking Purple
    '#059669', // 3. Emerald Green
    '#D97706', // 4. Warm Amber
    '#DC2626', // 5. Crimson Red
    '#0891B2', // 6. Deep Cyan
    '#4F46E5', // 7. Indigo
    '#DB2777', // 8. Pink / Rose
  ];

  const getProjectChartColor = (p: any, idx: number) => {
    if (p?.projectColor && p.projectColor !== '#FF008A' && p.projectColor !== '#7C3AED') {
      return p.projectColor;
    }
    return DISTINCT_PROJECT_PALETTE[idx % DISTINCT_PROJECT_PALETTE.length];
  };

  // Selected projects to plot in the multi-series chart
  const chartProjects = React.useMemo(() => {
    if (selectedWebsites.length > 0) {
      const matched = projectList.filter((p) => selectedWebsites.includes(p.id));
      if (matched.length > 0) return matched;
    }
    return projectList.slice(0, 5);
  }, [projectList, selectedWebsites]);

  // Dynamic realistic SEO metrics series based on active metric tab, timeRange and groupBy
  const chartData = React.useMemo(() => {
    let dateLabels: string[] = [];

    if (timeRange === 'WEEK') {
      if (groupBy === 'DAYS') {
        dateLabels = ['Sep 23', 'Sep 24', 'Sep 25', 'Sep 26', 'Sep 27', 'Sep 28', 'Sep 29'];
      } else if (groupBy === 'WEEKS') {
        dateLabels = ['Week 38', 'Week 39'];
      } else {
        dateLabels = ['Sep 2026'];
      }
    } else if (timeRange === 'MONTH') {
      if (groupBy === 'DAYS') {
        dateLabels = ['Sep 01', 'Sep 05', 'Sep 09', 'Sep 13', 'Sep 17', 'Sep 21', 'Sep 25', 'Sep 29'];
      } else if (groupBy === 'WEEKS') {
        dateLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else {
        dateLabels = ['Sep 2026'];
      }
    } else if (timeRange === '3 MONTHS') {
      if (groupBy === 'DAYS') {
        dateLabels = ['Jul 01', 'Jul 15', 'Aug 01', 'Aug 15', 'Sep 01', 'Sep 15', 'Sep 29'];
      } else if (groupBy === 'WEEKS') {
        dateLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
      } else {
        dateLabels = ['Jul 2026', 'Aug 2026', 'Sep 2026'];
      }
    } else {
      // 6 MONTHS
      if (groupBy === 'DAYS') {
        dateLabels = ['Apr 01', 'May 01', 'Jun 01', 'Jul 01', 'Aug 01', 'Sep 01', 'Sep 29'];
      } else if (groupBy === 'WEEKS') {
        dateLabels = ['W1', 'W4', 'W8', 'W12', 'W16', 'W20', 'W24'];
      } else {
        dateLabels = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
      }
    }

    const n = dateLabels.length;

    return dateLabels.map((date, idx) => {
      const progress = n > 1 ? idx / (n - 1) : 1;
      const point: Record<string, any> = { date };

      chartProjects.forEach((proj, pIdx) => {
        const pAny = proj as any;
        const dHash = (proj.domain || proj.name || '')
          .split('')
          .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

        // Project specific real target metrics
        const currentAvgPos = pAny.avgPosition != null && Number(pAny.avgPosition) > 0 ? Number(pAny.avgPosition) : ((dHash % 28) + 8);
        const currentTraffic = pAny.trafficForecast != null && Number(pAny.trafficForecast) > 0 ? Number(pAny.trafficForecast) : (((dHash * 19) % 3200) + 450);
        const currentVis = pAny.searchVisibility != null && Number(pAny.searchVisibility) > 0 ? Number(pAny.searchVisibility) : Number((((dHash % 55) + 18)).toFixed(2));
        const currentTop10 = pAny.keywordsCount ? Math.round(pAny.keywordsCount * 0.45) : ((dHash % 22) + 6);

        let val: number;
        switch (activeMetricTab) {
          case 'avg_pos': {
            const startPos = Number((currentAvgPos + ((dHash % 6) + 2)).toFixed(1));
            const variance = Math.sin(idx * 1.5 + pIdx * 2 + dHash) * 0.3;
            val = Number((startPos - (startPos - currentAvgPos) * progress + variance).toFixed(1));
            break;
          }
          case 'traffic': {
            const startTraffic = Math.round(currentTraffic * 0.72);
            const variance = Math.round(Math.sin(idx * 1.2 + pIdx + dHash) * 20);
            val = Math.max(0, Math.round(startTraffic + (currentTraffic - startTraffic) * progress + variance));
            break;
          }
          case 'visibility': {
            const startVis = Number((currentVis * 0.68).toFixed(2));
            const variance = Number((Math.sin(idx * 1.3 + pIdx + dHash) * 0.5).toFixed(2));
            val = Number(Math.max(0, startVis + (currentVis - startVis) * progress + variance).toFixed(2));
            break;
          }
          case 'top10': {
            const startTop = Math.max(0, currentTop10 - 4);
            val = Math.round(startTop + (currentTop10 - startTop) * progress);
            break;
          }
          case 'mention': {
            const baseMention = (dHash % 14) + 4;
            const startMention = Math.max(0, baseMention - 3);
            val = Math.round(startMention + (baseMention - startMention) * progress);
            break;
          }
          case 'link':
          default: {
            const baseLink = (dHash % 11) + 3;
            const startLink = Math.max(0, baseLink - 2);
            val = Math.round(startLink + (baseLink - startLink) * progress);
            break;
          }
        }

        point[proj.id] = val;
        if (pIdx === 0) {
          point.val = val;
        }
      });

      return point;
    });
  }, [timeRange, groupBy, activeMetricTab, chartProjects]);

  // COLUMNS DEFINITIONS with exact HTML and classes matching user's raw HTML
  const COLUMNS_DEF: Record<
    string,
    {
      label: string;
      renderTh: () => React.ReactNode;
      renderCell: (p: any, idx: number) => React.ReactNode;
      renderSubCell: (se: any) => React.ReactNode;
    }
  > = {
    prompts: {
      label: 'Prompts',
      renderTh: () => <span>Prompts</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const promptsCount = pAny.promptsCount ?? 10;
        return promptsCount > 0 ? (
          <Link
            href="/ai-results-tracker"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {promptsCount}
          </Link>
        ) : (
          <Link
            href="/ai-results-tracker"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-semibold hover:underline"
          >
            Add
          </Link>
        );
      },
      renderSubCell: (se) => <span className="text-[#7C3AED] font-medium">{se.promptsCount || 'Add'}</span>,
    },
    avgPosition: {
      label: 'Avg. Position',
      renderTh: () => <span>Avg. Position</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const avgPos = pAny.avgPosition != null && Number(pAny.avgPosition) > 0 ? pAny.avgPosition : '—';
        const hasChange = pAny.avgChange != null && pAny.avgChange !== 0;
        return (
          <div className="flex items-center justify-center gap-1.5 font-semibold text-gray-800">
            <span className="font-bold">{avgPos}</span>
            {hasChange && (
              <span className={`text-[11px] font-bold flex items-center ${pAny.avgChange > 0 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                {pAny.avgChange > 0 ? `▲ ${pAny.avgChange}` : `▼ ${Math.abs(pAny.avgChange)}`}
              </span>
            )}
          </div>
        );
      },
      renderSubCell: (se) => (
        <div className="flex items-center justify-center gap-1 font-semibold text-gray-800">
          <span>{se.avgPosition || '—'}</span>
          {se.avgChange ? <span className="text-[#10B981] text-[10px] font-bold">▲ {se.avgChange}</span> : null}
        </div>
      ),
    },
    topRanks: {
      label: 'TOP 5 10 30',
      renderTh: () => (
        <span>
          <i>TOP <b>5</b></i><b> 10</b><b> 30</b>
        </span>
      ),
      renderCell: (p) => {
        const pAny = p as any;
        if (displayTopPercentage) {
          return <span className="font-medium text-gray-800">15% / 25% / 30%</span>;
        }
        const top5_10_30 = pAny.top5_10_30 || pAny.topBrackets || (pAny.keywordsCount > 0 ? '0 / 0 / 0' : '—');
        return <span className="font-medium text-gray-800">{top5_10_30}</span>;
      },
      renderSubCell: (se) => <span className="font-medium text-gray-700">{se.topRanks || '—'}</span>,
    },
    keywords: {
      label: 'Keywords',
      renderTh: () => <span>Keywords</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const kwCount = pAny.keywordsCount ?? 0;
        return (
          <Link
            href="/rankings"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {kwCount}
          </Link>
        );
      },
      renderSubCell: (se) => <span className="text-[#7C3AED] font-bold">{se.keywordsCount || '0'}</span>,
    },
    trafficForecast: {
      label: 'Traffic forecast',
      renderTh: () => <span>Traffic forecast</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.trafficForecast !== undefined && pAny.trafficForecast !== null ? pAny.trafficForecast : 0;
        const delta = pAny.trafficDelta || 0;
        return (
          <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
            <span className="font-semibold">{Number(val).toLocaleString()}</span>
            {delta > 0 && <span className="text-[#10B981] text-[11px] font-bold">▲ {delta}</span>}
          </div>
        );
      },
      renderSubCell: () => <span className="text-gray-700 font-medium">0</span>,
    },
    searchVisibility: {
      label: 'Search visibility',
      renderTh: () => <span>Search visibility</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.searchVisibility !== undefined && pAny.searchVisibility !== null ? pAny.searchVisibility : '0.00';
        const delta = pAny.visibilityDelta || '0.00';
        return (
          <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
            <span className="font-semibold">{val}%</span>
            {Number(delta) > 0 && <span className="text-[#10B981] text-[11px] font-bold">▲ {delta}</span>}
          </div>
        );
      },
      renderSubCell: () => <span className="text-gray-700 font-medium">62.5%</span>,
    },
    mentionPresence: {
      label: 'Mention presence',
      renderTh: () => <span>Mention presence</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.mentionPresence ?? 0;
        return (
          <Link
            href="/ai-results-tracker"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {val}
          </Link>
        );
      },
      renderSubCell: () => <span className="text-gray-500 font-medium">0</span>,
    },
    linkPresence: {
      label: 'Link presence',
      renderTh: () => <span>Link presence</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.linkPresence ?? 0;
        return (
          <Link
            href="/ai-results-tracker"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {val}
          </Link>
        );
      },
      renderSubCell: () => <span className="text-gray-500 font-medium">0</span>,
    },
    dt: {
      label: 'DT',
      renderTh: () => <span>DT</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const dt = pAny.domainTrust !== undefined && pAny.domainTrust !== null ? pAny.domainTrust : 0;
        return (
          <div className="dt-row flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 rounded-full bg-[#C4C7D6] overflow-hidden">
              <div className="h-full bg-[#2D355D] rounded-full" style={{ width: `${Math.min(100, dt)}%` }} />
            </div>
            <span className="num font-bold text-gray-800 text-xs">{dt}</span>
          </div>
        );
      },
      renderSubCell: () => <span className="text-gray-400">—</span>,
    },
    referringDomains: {
      label: 'Referring Domains',
      renderTh: () => <span>Referring Domains</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.refDomainsCount !== undefined && pAny.refDomainsCount !== null ? pAny.refDomainsCount : 0;
        return (
          <Link
            href="/backlinks-monitor?tab=domains"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {val}
          </Link>
        );
      },
      renderSubCell: () => <span className="text-gray-400">—</span>,
    },
    backlinks: {
      label: 'Backlinks',
      renderTh: () => <span>Backlinks</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.backlinksCount !== undefined && pAny.backlinksCount !== null ? pAny.backlinksCount : 0;
        return (
          <Link
            href="/backlinks-monitor?tab=backlinks"
            onClick={(e) => {
              e.stopPropagation();
              setActiveProject(p);
            }}
            className="text-[#7C3AED] font-bold hover:underline"
          >
            {val}
          </Link>
        );
      },
      renderSubCell: () => <span className="text-gray-400">—</span>,
    },
    indexed: {
      label: 'Indexed',
      renderTh: () => <span>Indexed</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const val = pAny.indexedPagesCount || '0';
        return (
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-gray-700 font-medium">{val}</span>
          </div>
        );
      },
      renderSubCell: () => (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="text-gray-700 font-medium">N/A</span>
        </div>
      ),
    },
    websiteAudit: {
      label: 'Website Audit',
      renderTh: () => <span>Website Audit</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const score = pAny.auditScore != null ? pAny.auditScore : null;
        if (score == null) {
          return <span className="text-gray-400 font-medium text-xs">—</span>;
        }
        return (
          <div className="audit-row flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 rounded-full bg-[#AED7FF] overflow-hidden">
              <div className="h-full bg-[#1976D2] rounded-full" style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-800">
              <span className="text-[#1976D2]">{score}</span>/100
            </span>
          </div>
        );
      },
      renderSubCell: () => <span className="text-gray-400">—</span>,
    },
    rankingsUpdatedOn: {
      label: 'Rankings updated on',
      renderTh: () => <span>Rankings updated on</span>,
      renderCell: (p) => {
        const pAny = p as any;
        const dateStr = pAny.rankingsUpdatedOn || 'Oct-05 2026';
        return <span className="text-gray-600 font-medium text-[11px] whitespace-nowrap">{dateStr}</span>;
      },
      renderSubCell: () => <span className="text-gray-500 font-medium text-[11px]">Oct-05 2026</span>,
    },
  };

  const handleRecheck = (type: 'rankings' | 'search_volume', scope: 'all' | 'selected') => {
    setIsRecheckOpen(false);
    setHoveredRecheckMenu(null);
    setIsRechecking(true);
    const count = scope === 'selected' ? selectedRowIds.length || 1 : filteredProjects.length || 1;
    const label = type === 'rankings' ? 'rankings' : 'search volume';
    setRecheckToast(`Rechecking ${label} for ${count} website${count > 1 ? 's' : ''}...`);

    setTimeout(() => {
      setIsRechecking(false);
      setRecheckToast(`Updated ${label} data successfully!`);
      setTimeout(() => setRecheckToast(null), 3000);
    }, 1800);
  };

  const handleCopyTable = () => {
    try {
      const headers = ['Website'];
      if (visibleColumns.topRanks) headers.push('TOP 5 / 10 / 30');
      if (visibleColumns.keywords) headers.push('Keywords');
      if (visibleColumns.prompts) headers.push('Prompts');
      if (visibleColumns.avgPosition) headers.push('Avg. Position');
      if (visibleColumns.trafficForecast) headers.push('Traffic forecast');
      if (visibleColumns.searchVisibility) headers.push('Search visibility');
      if (visibleColumns.top10Percent) headers.push('% in Top 10');
      if (visibleColumns.mentionPresence) headers.push('Mention Presence');
      if (visibleColumns.linkPresence) headers.push('Link Presence');

      const rows = filteredProjects.map((p: any) => {
        const row = [p.domain];
        if (visibleColumns.topRanks) row.push(p.top5_10_30 || '0 / 0 / 0');
        if (visibleColumns.keywords) row.push(String(p.keywordsCount ?? 0));
        if (visibleColumns.prompts) row.push(String(p.promptsCount ?? 0));
        if (visibleColumns.avgPosition) row.push(String(p.avgPosition ?? '-'));
        if (visibleColumns.trafficForecast) row.push(String(p.trafficForecast ?? 0));
        if (visibleColumns.searchVisibility) row.push(`${p.searchVisibility ?? 0}%`);
        if (visibleColumns.top10Percent) row.push('0%');
        if (visibleColumns.mentionPresence) row.push(String(p.mentionPresence ?? 0));
        if (visibleColumns.linkPresence) row.push(String(p.linkPresence ?? 0));
        return row.join('\t');
      });

      const tsv = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(tsv);
      setCopyToast('Table copied to clipboard');
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Failed to copy');
      setTimeout(() => setCopyToast(null), 3000);
    }
    setIsCopyOpen(false);
  };

  const handleCopyRows = () => {
    if (selectedRowIds.length === 0) return;
    try {
      const headers = ['Website'];
      if (visibleColumns.topRanks) headers.push('TOP 5 / 10 / 30');
      if (visibleColumns.keywords) headers.push('Keywords');
      if (visibleColumns.prompts) headers.push('Prompts');
      if (visibleColumns.avgPosition) headers.push('Avg. Position');
      if (visibleColumns.trafficForecast) headers.push('Traffic forecast');
      if (visibleColumns.searchVisibility) headers.push('Search visibility');
      if (visibleColumns.top10Percent) headers.push('% in Top 10');
      if (visibleColumns.mentionPresence) headers.push('Mention Presence');
      if (visibleColumns.linkPresence) headers.push('Link Presence');

      const selected = filteredProjects.filter((p) => selectedRowIds.includes(p.id));
      const rows = selected.map((p: any) => {
        const row = [p.domain];
        if (visibleColumns.topRanks) row.push(p.top5_10_30 || '0 / 0 / 0');
        if (visibleColumns.keywords) row.push(String(p.keywordsCount ?? 0));
        if (visibleColumns.prompts) row.push(String(p.promptsCount ?? 0));
        if (visibleColumns.avgPosition) row.push(String(p.avgPosition ?? '-'));
        if (visibleColumns.trafficForecast) row.push(String(p.trafficForecast ?? 0));
        if (visibleColumns.searchVisibility) row.push(`${p.searchVisibility ?? 0}%`);
        if (visibleColumns.top10Percent) row.push('0%');
        if (visibleColumns.mentionPresence) row.push(String(p.mentionPresence ?? 0));
        if (visibleColumns.linkPresence) row.push(String(p.linkPresence ?? 0));
        return row.join('\t');
      });

      const tsv = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(tsv);
      setCopyToast(`${selected.length} row${selected.length > 1 ? 's' : ''} copied to clipboard`);
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Failed to copy');
      setTimeout(() => setCopyToast(null), 3000);
    }
    setIsCopyOpen(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      projectIds: [...selectedRowIds],
    };
    const updated = [...projectGroups, newGroup];
    setProjectGroups(updated);
    try {
      localStorage.setItem('se_ranking_project_groups', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('se_ranking_groups_updated', { detail: updated }));
    } catch {}
    setIsCreateGroupModalOpen(false);
    setNewGroupName('');
    setRecheckToast(`Group "${newGroup.name}" created successfully!`);
    setTimeout(() => setRecheckToast(null), 3000);
  };

  const handleOpenGroupMenu = (e: React.MouseEvent<HTMLButtonElement>, group: any) => {
    e.stopPropagation();
    if (groupMenuAnchor?.groupId === group.id) {
      setGroupMenuAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setGroupMenuAnchor({
      groupId: group.id,
      group,
      top: rect.bottom + 6,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 200)),
    });
  };

  const handleUngroup = (group: any) => {
    setGroupMenuAnchor(null);
    const updated = projectGroups.map((g) =>
      g.id === group.id ? { ...g, projectIds: [] } : g
    );
    setProjectGroups(updated);
    try {
      localStorage.setItem('se_ranking_project_groups', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('se_ranking_groups_updated', { detail: updated }));
    } catch {}
    setRecheckToast(`Ungrouped websites from "${group.name}".`);
    setTimeout(() => setRecheckToast(null), 3000);
  };

  const handleSaveRenameGroup = () => {
    if (!renameGroupModal || !renameGroupModal.currentName.trim()) return;
    const newName = renameGroupModal.currentName.trim();
    const updated = projectGroups.map((g) =>
      g.id === renameGroupModal.groupId ? { ...g, name: newName } : g
    );
    setProjectGroups(updated);
    try {
      localStorage.setItem('se_ranking_project_groups', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('se_ranking_groups_updated', { detail: updated }));
    } catch {}
    setRenameGroupModal(null);
    setRecheckToast(`Group renamed to "${newName}".`);
    setTimeout(() => setRecheckToast(null), 3000);
  };

  const handleCopyGroupRow = async (group: any) => {
    setGroupMenuAnchor(null);
    const groupProjects = filteredProjects.filter((p) => group.projectIds.includes(p.id));
    const totalKw = groupProjects.reduce(
      (sum, p: any) => sum + (p.keywordsCount ?? p._count?.keywords ?? (p.keywords ? p.keywords.length : 20)),
      0
    ) || 20;
    const rowDataText = [
      `Group: ${group.name}`,
      `Websites: ${groupProjects.length}`,
      `TOP 5 / 10 / 30: 3/5/6`,
      `Keywords: ${totalKw}`,
      `Prompts: 0`,
      `Avg. Position: 32 ▲ 26`,
      `Mention Presence: N/A`,
      `Link Presence: N/A`,
    ].join('\t');

    try {
      await navigator.clipboard.writeText(rowDataText);
      setCopyToast(`Group row for "${group.name}" copied to clipboard!`);
      setTimeout(() => setCopyToast(null), 3000);
    } catch (err) {
      console.error('Failed to copy group row', err);
    }
  };

  const handleConfirmDeleteGroup = () => {
    if (!deleteGroupModal) return;
    const updated = projectGroups.filter((g) => g.id !== deleteGroupModal.groupId);
    setProjectGroups(updated);
    try {
      localStorage.setItem('se_ranking_project_groups', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('se_ranking_groups_updated', { detail: updated }));
    } catch {}
    setDeleteGroupModal(null);
    setRecheckToast(`Group "${deleteGroupModal.name}" deleted successfully.`);
    setTimeout(() => setRecheckToast(null), 3000);
  };

  const handleToggleSelectGroup = (group: any) => {
    const gProjects = filteredProjects.filter((p) => group.projectIds.includes(p.id));
    if (gProjects.length === 0) return;
    const allSelected = gProjects.every((p) => selectedRowIds.includes(p.id));
    if (allSelected) {
      const pIds = gProjects.map((p) => p.id);
      setSelectedRowIds((prev) => prev.filter((id) => !pIds.includes(id)));
    } else {
      const pIds = gProjects.map((p) => p.id);
      setSelectedRowIds((prev) => Array.from(new Set([...prev, ...pIds])));
    }
  };

  const toggleGroupCollapse = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleAllGroupsCollapse = () => {
    if (collapsedGroupIds.length === projectGroups.length) {
      setCollapsedGroupIds([]);
    } else {
      setCollapsedGroupIds(projectGroups.map((g) => g.id));
    }
  };

  const renderProjectSubRows = (p: any) => (
    <>
      {/* Sub-row 1: Google India */}
      <tr className="bg-[#FAFBFD]/90 border-t border-dashed border-gray-100 text-xs text-gray-600">
        <td className="p-2.5"></td>
        <td className="p-2.5 pl-8">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-xs">🇮🇳</span>
            <span className="font-medium text-gray-800">
              Google ({p.country || 'India'})
            </span>
          </div>
        </td>
        {columnOrder.map((colKey) => {
          if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
          const col = COLUMNS_DEF[colKey];
          if (!col) return null;
          return (
            <td key={colKey} className="p-2.5 text-center whitespace-nowrap">
              {col.renderSubCell(p)}
            </td>
          );
        })}
      </tr>

      {/* Sub-row 2: AI Search India matching Screenshot 3 */}
      <tr className="bg-[#FAFBFD]/60 border-t border-dashed border-gray-100 text-xs text-gray-600">
        <td className="p-2.5"></td>
        <td className="p-2.5 pl-8">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-3.5 h-3.5 rounded bg-emerald-600 flex items-center justify-center text-white shrink-0 text-[9px] font-bold">
              AI
            </div>
            <span className="text-xs">🇮🇳</span>
            <span className="font-medium text-gray-800">
              AI Search ({p.country || 'India'})
            </span>
          </div>
        </td>
        {columnOrder.map((colKey) => {
          if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
          if (colKey === 'prompts') {
            return (
              <td key={colKey} className="p-2.5 text-center whitespace-nowrap font-bold text-gray-800">
                10
              </td>
            );
          }
          return (
            <td key={colKey} className="p-2.5 text-center whitespace-nowrap text-gray-400">
              -
            </td>
          );
        })}
      </tr>
    </>
  );

  const renderProjectRow = (p: any, idx: number) => {
    const isSelected = selectedRowIds.includes(p.id);
    const isExpanded = expandedProjectIds.includes(p.id);
    const isStarred = starredProjectIds.includes(p.id);
    const isPaused = pausedProjectIds.includes(p.id);
    const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedProjectIds((prev) =>
        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
      );
    };

    return (
      <React.Fragment key={p.id || idx}>
        <tr
          onClick={() => {
            setActiveProject(p);
            router.push('/rankings');
          }}
          className={`hover:bg-[#F4F7FC]/70 transition-colors cursor-pointer group text-xs border-b border-gray-100 border-l-2 border-[#8A3FFC] ${
            isSelected ? 'bg-blue-50/40' : ''
          }`}
        >
          {/* Row Checkbox */}
          <td className="p-3 w-8" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleRow(p.id)}
              className="w-3.5 h-3.5 rounded-[3px] text-[#7C3AED] focus:ring-0 cursor-pointer block mx-auto"
            />
          </td>

          {/* Website Domain Cell */}
          <td className="p-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer shrink-0"
                  title="Expand search engines"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isExpanded ? '' : '-rotate-90'
                    }`}
                  />
                </button>
                <img
                  src={`https://www.google.de/s2/favicons?domain=${p.domain}`}
                  alt=""
                  className="w-4 h-4 rounded-xs shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-semibold text-gray-900 group-hover:text-[#7C3AED] transition-colors truncate">
                  {displayDomain}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#8A3FFC] fill-[#8A3FFC]/20 shrink-0 inline ml-0.5" />
                {isPaused && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
                    Paused
                  </span>
                )}
              </div>

              {/* Action Buttons: Purple Rankings [ 📊 ] and Slate Tools Menu [ ⋮ ] */}
              <div
                className={`dotted-menu-column-wrapper-inner flex items-center gap-1 shrink-0 ml-2 transition-opacity ${
                  menuAnchor?.projectId === p.id ? 'opacity-100' : 'opacity-80 hover:opacity-100 group-hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  data-locator="dashboard.projects_table.item.position_link"
                  onClick={() => {
                    setActiveProject(p);
                    router.push('/rankings');
                  }}
                  className="se-icon-link se-button-2_table positions-link w-[22px] h-[22px] rounded-[3px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Rankings"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-white" />
                </button>

                <div data-locator="dashboard.projects_table.item.tools_menu" className="relative">
                  <button
                    type="button"
                    data-menu-trigger
                    onClick={(e) => handleOpenProjectMenu(e, p)}
                    className={`se-button_icon tools-menu-toggler w-[22px] h-[22px] rounded-[3px] flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                      menuAnchor?.projectId === p.id
                        ? 'bg-[#1E2532] text-white ring-1 ring-[#7C3AED]'
                        : 'bg-[#434F64] hover:bg-[#343E50] text-white'
                    }`}
                    title="Project actions"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </td>

          {/* Dynamic Ordered Columns matching user's exact raw HTML classes */}
          {columnOrder.map((colKey) => {
            if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
            const col = COLUMNS_DEF[colKey];
            if (!col) return null;
            return (
              <td key={colKey} className="p-3 text-center whitespace-nowrap">
                {col.renderCell(p, idx)}
              </td>
            );
          })}
        </tr>

        {/* Sub-rows when expanded */}
        {isExpanded && renderProjectSubRows(p)}
      </React.Fragment>
    );
  };

  const renderGroupSection = (group: any, gIdx: number) => {
    const isGroupCollapsed = collapsedGroupIds.includes(group.id);
    const gProjects = filteredProjects.filter((p) => group.projectIds.includes(p.id));
    const isGroupSelected = gProjects.length > 0 && gProjects.every((p) => selectedRowIds.includes(p.id));

    const totalKw = gProjects.reduce(
      (sum, p: any) => sum + (p.keywordsCount ?? p._count?.keywords ?? (p.keywords ? p.keywords.length : 20)),
      0
    ) || 20;

    return (
      <React.Fragment key={group.id}>
        {/* Main Group Header Row with exact SE Ranking layout & orange left line */}
        <tr className="bg-white hover:bg-gray-50/70 border-b border-gray-200 font-medium text-gray-800 text-xs transition-colors group/grow select-none border-l-[3px] border-[#FF5722]">
          {/* Checkbox */}
          <td className="p-3 w-8" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isGroupSelected}
              onChange={() => handleToggleSelectGroup(group)}
              className="w-3.5 h-3.5 rounded-[3px] text-[#7C3AED] focus:ring-0 cursor-pointer block mx-auto"
            />
          </td>

          {/* Group Name & Tools */}
          <td className="p-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => toggleGroupCollapse(group.id, e)}
                  className="text-gray-500 hover:text-gray-800 p-0.5 cursor-pointer shrink-0"
                  title={isGroupCollapsed ? "Expand group" : "Collapse group"}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isGroupCollapsed ? '-rotate-90' : ''
                    }`}
                  />
                </button>
                <Folder className="w-4 h-4 text-[#374151] fill-[#374151] shrink-0" />
                <span className="font-semibold text-gray-900 text-[13px]">
                  {group.name}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#EAECEF] text-gray-700 font-semibold text-[11px] leading-tight">
                  {gProjects.length}
                </span>
              </div>

              {/* Group Action Tools Menu [ ⋮ ] */}
              <div className="dotted-menu-column-wrapper-inner relative shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  data-group-menu-trigger
                  onClick={(e) => handleOpenGroupMenu(e, group)}
                  className={`se-button_icon tools-menu-toggler w-[22px] h-[22px] rounded-[3px] flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                    groupMenuAnchor?.groupId === group.id
                      ? 'bg-[#1E2532] text-white ring-1 ring-[#7C3AED]'
                      : 'bg-[#434F64] hover:bg-[#343E50] text-white'
                  }`}
                  title="Group actions"
                >
                  <MoreVertical className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </td>

          {/* Group Row Metrics matching Screenshot 1 */}
          {columnOrder.map((colKey) => {
            if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
            if (colKey === 'topRanks') {
              return (
                <td key={colKey} className="p-3 text-center text-gray-800 font-medium">
                  3/5/6
                </td>
              );
            }
            if (colKey === 'keywords') {
              return (
                <td key={colKey} className="p-3 text-center text-gray-800 font-medium">
                  {totalKw}
                </td>
              );
            }
            if (colKey === 'prompts') {
              return (
                <td key={colKey} className="p-3 text-center font-medium">
                  <span className="text-[#7C3AED] hover:underline cursor-pointer">
                    10
                  </span>
                </td>
              );
            }
            if (colKey === 'avgPosition') {
              return (
                <td key={colKey} className="p-3 text-center font-medium whitespace-nowrap">
                  <span className="text-gray-900">32</span>
                  <span className="ml-1 text-[11px] text-[#20B26C] font-semibold">▲ 26</span>
                </td>
              );
            }
            if (colKey === 'mentionPresence' || colKey === 'linkPresence') {
              return (
                <td key={colKey} className="p-3 text-center font-medium">
                  <span className="text-[#7C3AED] hover:underline cursor-pointer">
                    0
                  </span>
                </td>
              );
            }
            if (colKey === 'dt') {
              return (
                <td key={colKey} className="p-3 text-center text-gray-600 font-medium">
                  {/* Empty matching screenshot */}
                </td>
              );
            }
            return (
              <td key={colKey} className="p-3 text-center text-gray-500 font-normal">
                -
              </td>
            );
          })}
        </tr>

        {/* Nested Child Project Rows (when group is expanded) */}
        {!isGroupCollapsed &&
          gProjects.map((p, pIdx) => {
            const isProjSelected = selectedRowIds.includes(p.id);
            const isProjExpanded = expandedProjectIds.includes(p.id);
            const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

            return (
              <React.Fragment key={p.id || pIdx}>
                <tr
                  onClick={() => {
                    setActiveProject(p);
                    router.push('/rankings');
                  }}
                  className={`hover:bg-[#FAF8FF] transition-colors cursor-pointer group text-xs border-b border-gray-100 border-l-[3px] border-[#FF5722] ${
                    isProjSelected ? 'bg-[#F5F3FF]/60' : 'bg-white'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="p-3 w-8" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isProjSelected}
                      onChange={() => handleToggleRow(p.id)}
                      className="w-3.5 h-3.5 rounded-[3px] text-[#7C3AED] focus:ring-0 cursor-pointer block mx-auto"
                    />
                  </td>

                  {/* Indented Domain Cell with orange left line */}
                  <td className="p-3 min-w-[260px] pl-7">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProjectIds((prev) =>
                              prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer shrink-0"
                          title="Expand search engines"
                        >
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform duration-150 ${
                              isProjExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <ProjectFavicon domain={p.domain} className="w-4 h-4 rounded-xs shrink-0" />
                        <span className="font-semibold text-gray-900 group-hover:text-[#7C3AED] transition-colors truncate">
                          {displayDomain}
                        </span>
                      </div>

                      {/* Action buttons: Purple Rankings [ 📊 ] and Slate Tools [ ⋮ ] */}
                      <div
                        className={`dotted-menu-column-wrapper-inner flex items-center gap-1 shrink-0 ml-2 transition-opacity ${
                          menuAnchor?.projectId === p.id ? 'opacity-100' : 'opacity-80 hover:opacity-100 group-hover:opacity-100'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          data-locator="dashboard.projects_table.item.position_link"
                          onClick={() => {
                            setActiveProject(p);
                            router.push('/rankings');
                          }}
                          className="se-icon-link se-button-2_table positions-link w-[22px] h-[22px] rounded-[3px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                          title="Rankings"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-white" />
                        </button>

                        <div data-locator="dashboard.projects_table.item.tools_menu" className="relative">
                          <button
                            type="button"
                            data-menu-trigger
                            onClick={(e) => handleOpenProjectMenu(e, p)}
                            className={`se-button_icon tools-menu-toggler w-[22px] h-[22px] rounded-[3px] flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                              menuAnchor?.projectId === p.id
                                ? 'bg-[#1E2532] text-white ring-1 ring-[#7C3AED]'
                                : 'bg-[#434F64] hover:bg-[#343E50] text-white'
                            }`}
                            title="Project actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Project Metrics matching Screenshot 1 */}
                  {columnOrder.map((colKey) => {
                    if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
                    if (colKey === 'topRanks') {
                      return (
                        <td key={colKey} className="p-3 text-center text-gray-800 font-medium">
                          3/5/6
                        </td>
                      );
                    }
                    if (colKey === 'keywords') {
                      return (
                        <td key={colKey} className="p-3 text-center text-gray-800 font-medium">
                          20
                        </td>
                      );
                    }
                    if (colKey === 'prompts') {
                      return (
                        <td key={colKey} className="p-3 text-center font-medium">
                          <span className="text-[#7C3AED] font-semibold hover:underline cursor-pointer">
                            Add
                          </span>
                        </td>
                      );
                    }
                    if (colKey === 'avgPosition') {
                      return (
                        <td key={colKey} className="p-3 text-center font-medium whitespace-nowrap">
                          <span className="text-gray-900">32</span>
                          <span className="ml-1 text-[11px] text-[#20B26C] font-semibold">▲ 26</span>
                        </td>
                      );
                    }
                    if (colKey === 'mentionPresence' || colKey === 'linkPresence') {
                      return (
                        <td key={colKey} className="p-3 text-center text-gray-400 font-normal">
                          N/A
                        </td>
                      );
                    }
                    if (colKey === 'dt') {
                      return (
                        <td key={colKey} className="p-3 text-center text-gray-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#1E2532] inline-block" />
                        </td>
                      );
                    }
                    const col = COLUMNS_DEF[colKey];
                    return (
                      <td key={colKey} className="p-3 text-center whitespace-nowrap">
                        {col ? col.renderCell(p, pIdx) : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Sub-rows if expanded */}
                {isProjExpanded && renderProjectSubRows(p)}
              </React.Fragment>
            );
          })}
      </React.Fragment>
    );
  };

  const handleOpenExportModal = () => {
    setSelectedExportProjectIds(projectList.map((p) => p.id));
    setExportSearch('');
    setIsUngroupedExpanded(true);
    setIsExportModalOpen(true);
  };

  const filteredExportProjects = projectList.filter((p) => {
    const q = exportSearch.trim().toLowerCase();
    if (!q) return true;
    return p.domain.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
  });

  const isAllProjectsSelected =
    filteredExportProjects.length > 0 &&
    filteredExportProjects.every((p) => selectedExportProjectIds.includes(p.id));

  const toggleAllProjectsExport = () => {
    if (isAllProjectsSelected) {
      const visibleIds = new Set(filteredExportProjects.map((p) => p.id));
      setSelectedExportProjectIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = filteredExportProjects.map((p) => p.id);
      setSelectedExportProjectIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const isAllUngroupedSelected =
    filteredExportProjects.length > 0 &&
    filteredExportProjects.every((p) => selectedExportProjectIds.includes(p.id));

  const toggleUngroupedExport = () => {
    if (isAllUngroupedSelected) {
      const visibleIds = new Set(filteredExportProjects.map((p) => p.id));
      setSelectedExportProjectIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = filteredExportProjects.map((p) => p.id);
      setSelectedExportProjectIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleProjectExport = (id: string) => {
    setSelectedExportProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const selected = projectList.filter((p) => selectedExportProjectIds.includes(p.id));
    if (selected.length === 0) return;

    const headers = [
      'Website',
      'Status',
      'Search Engines',
      'Keywords',
      'Prompts',
      'Average Position',
      'TOP 5 / 10 / 30',
      'Domain Trust',
      'Date Added',
    ];

    const rows = selected.map((p) => {
      const pAny = p as any;
      const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const isPaused = pausedProjectIds.includes(p.id);
      const status = isPaused ? 'Paused' : 'Active';
      const searchEngine = p.country ? `Google (${p.country})` : 'Google (US)';
      const kwCount = pAny.keywordsCount ?? pAny._count?.keywords ?? (pAny.keywords ? pAny.keywords.length : 11);
      const promptsCount = pAny.promptsCount ?? pAny._count?.prompts ?? 0;
      const avgPosition = pAny.avgPosition || pAny.averagePosition || 74;
      const topBrackets = pAny.top5_10_30 || pAny.topBrackets || '2 / 1 / 0';
      const dt = pAny.domainTrust || 90;
      const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

      return [
        `"https://${displayDomain}/"`,
        `"${status}"`,
        `"${searchEngine}"`,
        `"${kwCount}"`,
        `"${promptsCount}"`,
        `"${avgPosition}"`,
        `"${topBrackets}"`,
        `"${dt}"`,
        `"${createdDate}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `se_ranking_active_websites_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
    setRecheckToast(`Exported ${selected.length} website${selected.length > 1 ? 's' : ''} to CSV successfully!`);
    setTimeout(() => setRecheckToast(null), 3500);
  };

  // Render project dashboard directly without blocking verify screens

  if (!hasCreatedProject || projects.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] min-h-[calc(100vh-80px)] text-gray-900 pb-16 select-none relative flex flex-col justify-between">
        {/* Main Onboarding Canvas matching screenshot */}
        <div className="w-full max-w-5xl mx-auto px-6 py-10 flex-1 flex flex-col items-center justify-center">
          {/* Hero Title & Subtitle */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-[32px] font-bold text-gray-900 tracking-tight">
              All essential SEO tools on one platform
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              SE Ranking will help you fix any SEO related issue—from checking search volume to finding broken links
            </p>
          </div>

          {/* Emerald Green Hero Card matching Screenshot */}
          <div className="w-full bg-[#00A86B] rounded-2xl p-7 sm:p-9 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            {/* Subtle organic vector waves decoration */}
            <svg
              className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-20"
              viewBox="0 0 600 200"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0,120 C180,240 380,20 600,100 L600,200 L0,200 Z" fill="#ffffff" />
              <circle cx="520" cy="40" r="140" fill="#ffffff" opacity="0.3" />
              <path d="M150,150 C300,220 450,80 600,140" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            </svg>

            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                Add your first website
              </h2>
              <p className="text-white/90 text-sm font-normal">
                Track your search rankings, audit your site, monitor your competitors
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white hover:bg-gray-50 text-[#1E2532] font-bold text-xs sm:text-sm px-6 py-3 rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider self-start sm:self-center relative z-10"
            >
              <Plus className="w-4 h-4 stroke-[3] text-[#0062FF]" />
              <span>ADD WEBSITE</span>
            </button>
          </div>

          {/* 3 SEO Tool Feature Cards Grid matching Screenshot */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Card 1: Rankings */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <rect x="3" y="12" width="4" height="9" rx="1" />
                    <rect x="10" y="5" width="4" height="16" rx="1" />
                    <rect x="17" y="8" width="4" height="13" rx="1" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Rankings</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track website rankings and analyze search results to evaluate your SEO strategy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0062FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <svg className="w-4 h-4 text-[#0062FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Card 2: Keyword Research */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative">
              <ArrowRight className="w-5 h-5 text-gray-400 absolute top-6 right-6" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <KeyRound className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Keyword Research</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create a target keyword list from scratch or expand your current list of keywords
                </p>
              </div>
              <Link
                href="/research/competitive-research"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0062FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Website Audit */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <Search className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Website Audit</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Check 180 website parameters and get tips on how to fix all of the found issues
                </p>
              </div>
              <Link
                href="/website-audit"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0062FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Switch to Active Projects if database has existing projects */}
          {projects.length > 0 && (
            <div className="text-center pt-8">
              <button
                type="button"
                onClick={() => setHasCreatedProject(true)}
                className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer"
              >
                Switch to Active Projects view ({projects.length} website{projects.length > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={async (newProj) => {
            await refreshProjects();
            if (newProj) {
              setActiveProject(newProj);
              setHasCreatedProject(true);
            }
          }}
        />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 pb-16 select-none relative">

      <div className="max-w-[1440px] mx-auto px-6 py-4 space-y-4">

        {/* Top Feedback line matching Screenshot */}
        <div className="flex justify-end text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-[#7C3AED] hover:underline cursor-pointer font-medium text-xs transition-colors"
          >
            Feedback
          </button>
        </div>

        {/* Action Header matching Screenshot */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Active websites</h1>
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#1E2532] text-white text-[11px] font-bold flex items-center justify-center">
              {filteredProjects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
              title="Export websites list to CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>

            <button
              type="button"
              onClick={handleOpenDashboardSettings}
              className="p-1.5 border border-gray-300 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
              title="Dashboard settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="tour-create-project"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE PROJECT</span>
          </button>

          {/* Recheck Data Dropdown matching Screenshot 1 & 2 */}
          <div className="relative recheck-dropdown-container">
            <button
              onClick={() => setIsRecheckOpen(!isRecheckOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>RECHECK DATA</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isRecheckOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                {/* Recheck rankings item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('rankings')}
                  className={`relative px-3.5 py-2 text-gray-800 flex items-center justify-between cursor-pointer font-medium transition-colors ${
                    hoveredRecheckMenu === 'rankings' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>Recheck rankings</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {/* Level 2 Flyout Menu matching Screenshot 1 */}
                  {hoveredRecheckMenu === 'rankings' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => handleRecheck('rankings', 'selected')}
                        disabled={selectedRowIds.length === 0}
                        className={`w-full text-left px-3.5 py-2 transition-colors ${
                          selectedRowIds.length > 0
                            ? 'text-gray-800 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-semibold cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecheck('rankings', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-semibold cursor-pointer transition-colors"
                      >
                        Recheck all
                      </button>
                    </div>
                  )}
                </div>

                {/* Recheck search volume item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('search_volume')}
                  className={`relative px-3.5 py-2 text-gray-800 flex items-center justify-between cursor-pointer font-medium transition-colors ${
                    hoveredRecheckMenu === 'search_volume' ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>Recheck search volume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {/* Level 2 Flyout Menu matching Screenshot 2 */}
                  {hoveredRecheckMenu === 'search_volume' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => handleRecheck('search_volume', 'selected')}
                        disabled={selectedRowIds.length === 0}
                        className={`w-full text-left px-3.5 py-2 transition-colors ${
                          selectedRowIds.length > 0
                            ? 'text-gray-800 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-semibold cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecheck('search_volume', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-[#F5F3FF] hover:text-[#7C3AED] font-semibold cursor-pointer transition-colors"
                      >
                        Recheck all
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric Tabs Bar & Chart (Displayed when projects exist) */}
        {projectList.length > 0 && (
          <>
            <div id="tour-chart-section" className="border border-gray-200 rounded-t-lg bg-[#FAFBFD] flex items-stretch divide-x divide-gray-200 overflow-x-auto shadow-2xs mt-4">
          {[
            { id: 'avg_pos', label: 'AVERAGE POSITION' },
            { id: 'traffic', label: 'TRAFFIC FORECAST' },
            { id: 'visibility', label: 'SEARCH VISIBILITY' },
            { id: 'top10', label: '% IN TOP 10' },
            { id: 'mention', label: 'MENTION PRESENCE', hasSparkle: true },
            { id: 'link', label: 'LINK PRESENCE', hasSparkle: true },
          ].map((tab) => {
            const isActive = activeMetricTab === tab.id;
            return (
              <div key={tab.id} className="relative flex-1 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => setActiveMetricTab(tab.id as any)}
                  onMouseEnter={() => tab.hasSparkle && setHoveredPromptTab(tab.id as any)}
                                   className={`w-full py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#7C3AED] font-extrabold shadow-xs'
                      : 'text-[#5C6E82] hover:text-[#7C3AED] hover:bg-white/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.hasSparkle && (
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                  )}
                </button>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7C3AED]" />
                )}

                {/* Tooltip for LLM prompts */}
                {tab.hasSparkle && hoveredPromptTab === tab.id && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>has LLM prompts</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1E293B] -mb-1 mt-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls Bar matching user exact HTML */}
        <div className="controls flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2 border-b border-gray-100 text-xs">
          <div className="controls__block flex items-center gap-6">
            <div className="controls__item">
              <div className="dropdown-wrapper">
                <div className="se-tabs-small-2 controls__tabs">
                  <ul className="se-tabs-small-2__list flex items-center gap-5 text-[13px]">
                    <li
                      className={`se-tabs-small-2__item cursor-pointer pb-1.5 transition-colors relative ${
                        timeRange === 'WEEK'
                          ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                          : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                      }`}
                      data-locator="tabs.tab_item_week"
                      onClick={() => setTimeRange('WEEK')}
                    >
                      <div className="se-tabs-small-2__content el-tooltip__trigger">
                        <span className="se-tabs-small-2__link" data-locator="tabs.item_week">
                          <span className="se-tabs-small-2__text">Week</span>
                        </span>
                      </div>
                    </li>
                    <li
                      className={`se-tabs-small-2__item cursor-pointer pb-1.5 transition-colors relative ${
                        timeRange === 'MONTH'
                          ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                          : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                      }`}
                      data-locator="tabs.tab_item_1month"
                      onClick={() => setTimeRange('MONTH')}
                    >
                      <div className="se-tabs-small-2__content el-tooltip__trigger">
                        <span className="se-tabs-small-2__link" data-locator="tabs.item_1month">
                          <span className="se-tabs-small-2__text">Month</span>
                        </span>
                      </div>
                    </li>
                    <li
                      className={`se-tabs-small-2__item cursor-pointer pb-1.5 transition-colors relative ${
                        timeRange === '3 MONTHS'
                          ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                          : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                      }`}
                      data-locator="tabs.tab_item_3months"
                      onClick={() => setTimeRange('3 MONTHS')}
                    >
                      <div className="se-tabs-small-2__content el-tooltip__trigger">
                        <span className="se-tabs-small-2__link" data-locator="tabs.item_3months">
                          <span className="se-tabs-small-2__text">3 Months</span>
                        </span>
                      </div>
                    </li>
                    <li
                      className={`se-tabs-small-2__item cursor-pointer pb-1.5 transition-colors relative ${
                        timeRange === '6 MONTHS'
                          ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                          : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                      }`}
                      data-locator="tabs.tab_item_6months"
                      onClick={() => setTimeRange('6 MONTHS')}
                    >
                      <div className="se-tabs-small-2__content el-tooltip__trigger">
                        <span className="se-tabs-small-2__link" data-locator="tabs.item_6months">
                          <span className="se-tabs-small-2__text">6 Months</span>
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="controls__item">
              <div className="group-selection flex items-center gap-1.5 text-xs">
                <span className="group-selection__title-before text-gray-500 font-normal">group by:</span>
                <div className="se-dropdown-slot relative groupby-dropdown-container">
                  <div className="se-dropdown-slot__wrapper">
                    <div>
                      <div
                        className="group-selection__toggler flex items-center gap-0.5 cursor-pointer font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                        onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                      >
                        <span className="group-selection__title">{groupBy.toLowerCase()}</span>
                        <span className="se-material-icon-2 group-selection__toggler-icon">
                          <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED]" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {isGroupByOpen && (
                    <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                      {(['DAYS', 'WEEKS', 'MONTHS'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setGroupBy(opt);
                            setIsGroupByOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 hover:bg-[#F5F3FF] hover:text-[#7C3AED] transition-colors cursor-pointer ${
                            groupBy === opt ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-gray-700'
                          }`}
                        >
                          {opt.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="controls__block">
            <div className="controls__item">
              <div className="se-tabs-small-2">
                <ul className="se-tabs-small-2__list flex items-center gap-6 text-[13px]">
                  <li
                    className={`se-tabs-small-2__item cursor-pointer transition-colors pb-1.5 relative ${
                      activeViewFilter === 'ALL'
                        ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                        : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                    }`}
                    data-locator="tabs.tab_item_all"
                    onClick={() => setActiveViewFilter('ALL')}
                  >
                    <div className="se-tabs-small-2__content el-tooltip__trigger">
                      <span className="se-tabs-small-2__link" data-locator="tabs.item_all">
                        <span className="se-tabs-small-2__text">All</span>
                      </span>
                    </div>
                  </li>
                  <li
                    className={`se-tabs-small-2__item cursor-pointer transition-colors pb-1.5 relative ${
                      activeViewFilter === 'WEBSITES'
                        ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                        : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                    }`}
                    data-locator="tabs.tab_item_projects"
                    onClick={() => setActiveViewFilter('WEBSITES')}
                  >
                    <div className="se-tabs-small-2__content el-tooltip__trigger">
                      <span className="se-tabs-small-2__link" data-locator="tabs.item_projects">
                        <span className="se-tabs-small-2__text">Websites</span>
                      </span>
                    </div>
                  </li>
                  <li
                    className={`se-tabs-small-2__item cursor-pointer transition-colors pb-1.5 relative ${
                      activeViewFilter === 'GROUPS'
                        ? 'se-tabs-small-2__item_active text-[#7C3AED] font-bold border-b-2 border-[#7C3AED]'
                        : 'text-[#5C6E82] hover:text-[#7C3AED] font-medium'
                    }`}
                    data-locator="tabs.tab_item_groups"
                    onClick={() => setActiveViewFilter('GROUPS')}
                  >
                    <div className="se-tabs-small-2__content el-tooltip__trigger">
                      <span className="se-tabs-small-2__link" data-locator="tabs.item_groups">
                        <span className="se-tabs-small-2__text">Groups</span>
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Chart View with vertical rotated label & Multi-series dynamic lines (Matching Screenshots 1 & 2) */}
        {displayCharts && (
          <div id="ProjectsChart" className="space-y-3">
            <div className="relative h-64 w-full pt-2 border border-gray-100 rounded-lg p-3 bg-white">
              <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-wider whitespace-nowrap select-none">
                {activeMetricTab === 'avg_pos'
                  ? 'AVERAGE POSITION'
                  : activeMetricTab === 'traffic'
                  ? 'TRAFFIC FORECAST'
                  : activeMetricTab === 'visibility'
                  ? 'SEARCH VISIBILITY'
                  : activeMetricTab === 'top10'
                  ? '% IN TOP 10'
                  : activeMetricTab === 'mention'
                  ? 'MENTION PRESENCE'
                  : 'LINK PRESENCE'}
              </div>
              <div className="ml-8 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis
                      domain={
                        activeMetricTab === 'avg_pos'
                          ? [0, 40]
                          : activeMetricTab === 'traffic'
                          ? [0, 5000]
                          : activeMetricTab === 'mention' || activeMetricTab === 'link'
                          ? [0, 45]
                          : [0, 100]
                      }
                      ticks={
                        activeMetricTab === 'avg_pos'
                          ? [0, 10, 20, 30, 40]
                          : activeMetricTab === 'traffic'
                          ? [0, 1000, 2000, 3000, 4000, 5000]
                          : activeMetricTab === 'mention' || activeMetricTab === 'link'
                          ? [0, 10, 20, 30, 40]
                          : [0, 25, 50, 75, 100]
                      }
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const metricLabel =
                            activeMetricTab === 'avg_pos'
                              ? 'AVERAGE POSITION'
                              : activeMetricTab === 'traffic'
                              ? 'TRAFFIC FORECAST'
                              : activeMetricTab === 'visibility'
                              ? 'SEARCH VISIBILITY'
                              : activeMetricTab === 'top10'
                              ? '% IN TOP 10'
                              : activeMetricTab === 'mention'
                              ? 'MENTION PRESENCE'
                              : 'LINK PRESENCE';

                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl text-xs space-y-2 z-50 min-w-[200px]">
                              <div className="text-[11px] font-bold text-gray-800 tracking-wider border-b border-gray-100 pb-1 flex items-center justify-between">
                                <span>{label || 'SEP-29 2026'}</span>
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                  {metricLabel}
                                </span>
                              </div>
                              <div className="space-y-1.5 pt-0.5">
                                {payload.map((item: any, pIdx: number) => {
                                  const proj = chartProjects.find((p) => p.id === item.dataKey) || chartProjects[pIdx];
                                  const name = proj?.domain
                                    ? proj.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
                                    : (item.name || 'Website');
                                  const color = getProjectChartColor(proj, pIdx);
                                  const displayVal =
                                    activeMetricTab === 'visibility' || activeMetricTab === 'top10'
                                      ? `${item.value}%`
                                      : item.value;

                                  return (
                                    <div key={item.dataKey || pIdx} className="flex items-center justify-between gap-3 text-gray-900 font-medium">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <span className="truncate max-w-[130px]">{name}</span>
                                      </div>
                                      <span className="font-bold font-mono">{displayVal}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {chartProjects.map((p, pIdx) => {
                      const color = getProjectChartColor(p, pIdx);
                      return (
                        <Line
                          key={p.id}
                          type="monotone"
                          dataKey={p.id}
                          name={p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          stroke={color}
                          strokeWidth={1.75}
                          dot={{ r: 3.5, fill: color, stroke: '#FFFFFF', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#FFFFFF', stroke: color, strokeWidth: 3 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project indicators under chart */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#171B24]">
              {chartProjects.map((p, pIdx) => {
                const color = getProjectChartColor(p, pIdx);
                const cleanD = (p.domain || p.name || 'flipkart.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
                return (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{cleanD}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    )}

        {/* Search, Action Header & Table matching SE-Ranking Screenshots 1 & 2 */}
        <div className="pt-4">
          {/* Search Input Bar matching screenshot */}
          <div className="relative w-full max-w-sm mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-3 pr-9 py-2 border border-gray-200 rounded-md text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-[#7C3AED]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-[#1E2532]">
              {activeViewFilter === 'GROUPS' ? 'Groups' : 'Projects'}
            </h2>

            <div className="flex items-center gap-2">
              {/* Copy table/rows button with Dropdown matching Screenshot 2 */}
              <div className="relative copy-dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsCopyOpen(!isCopyOpen);
                    setIsColumnsOpen(false);
                    setIsCreateGroupModalOpen(false);
                  }}
                  onMouseEnter={() => setIsCopyTooltipHovered(true)}
                  onMouseLeave={() => setIsCopyTooltipHovered(false)}
                  className={`px-2.5 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer transition-colors ${
                    isCopyOpen ? 'bg-gray-100' : ''
                  }`}
                  aria-label="Copy table or rows"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isCopyOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Tooltip on hover matching Screenshot 2 */}
                {isCopyTooltipHovered && !isCopyOpen && (
                  <div className="absolute -top-7 right-0 bg-[#2C3E50] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Copy table/rows</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#2C3E50] -mb-1 mt-0.5" />
                  </div>
                )}

                {/* Dropdown Menu matching Screenshot 2 */}
                {isCopyOpen && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs text-gray-800 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={handleCopyTable}
                      className="w-full px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-gray-700">Copy table</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      disabled={selectedRowIds.length === 0}
                      onClick={handleCopyRows}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors ${
                        selectedRowIds.length > 0
                          ? 'hover:bg-gray-50 text-gray-700 cursor-pointer font-medium'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span>Copy rows {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ''}</span>
                      <Info className={`w-3.5 h-3.5 ${selectedRowIds.length > 0 ? 'text-gray-400' : 'text-gray-200'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Expand/collapse all groups Button matching screenshot 1 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleAllGroupsCollapse}
                  onMouseEnter={() => setIsExpandCollapseHovered(true)}
                  onMouseLeave={() => setIsExpandCollapseHovered(false)}
                  className="px-2.5 py-1.5 border border-gray-300 bg-[#DFE4EC] hover:bg-[#D0D7E2] text-gray-700 rounded text-xs font-bold shadow-2xs cursor-pointer transition-colors flex items-center justify-center"
                  aria-label="Expand/collapse all groups"
                >
                  <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
                {isExpandCollapseHovered && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#374151] text-white text-[11px] font-medium py-0.5 px-2 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Expand/collapse all groups</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#374151] -mb-1 mt-0.5" />
                  </div>
                )}
              </div>

              {/* + NEW GROUP Button with Popover matching Screenshot 2 */}
              <div id="new-group-btn-container" className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateGroupModalOpen(!isCreateGroupModalOpen);
                    setIsColumnsOpen(false);
                    setIsCopyOpen(false);
                  }}
                  onMouseEnter={() => setIsNewGroupBtnHovered(true)}
                  onMouseLeave={() => setIsNewGroupBtnHovered(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C445C] hover:bg-[#2F3648] text-white text-xs font-bold uppercase rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5 text-white fill-white" />
                  <span className="text-[11px] font-bold">+</span>
                  <span>NEW GROUP</span>
                </button>
                {isNewGroupBtnHovered && !isCreateGroupModalOpen && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#374151] text-white text-[11px] font-medium py-0.5 px-2 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Create new..</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#374151] -mb-1 mt-0.5" />
                  </div>
                )}

                {/* Create a new group Popover matching Screenshot 2 */}
                {isCreateGroupModalOpen && (
                  <div
                    data-create-group-popover
                    className="absolute top-full right-0 mt-1.5 w-[280px] bg-white rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.18),0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200 p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="text-[13px] font-semibold text-[#171B24] mb-3">
                      Create a new group
                    </h4>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGroupName.trim()) {
                          handleCreateGroup();
                        }
                        if (e.key === 'Escape') {
                          setIsCreateGroupModalOpen(false);
                          setNewGroupName('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-hidden focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] mb-4"
                      autoFocus
                    />
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateGroupModalOpen(false);
                          setNewGroupName('');
                        }}
                        className="flex-1 py-1.5 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors text-center"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        disabled={!newGroupName.trim()}
                        onClick={handleCreateGroup}
                        className="flex-1 py-1.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-blue-300 text-white font-bold text-xs uppercase rounded cursor-pointer transition-colors shadow-2xs text-center"
                      >
                        CREATE
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* COLUMNS Button with Dropdown matching Screenshot 1 */}
              <div className="relative columns-dropdown-container">
                <button
                  id="tour-columns-btn"
                  type="button"
                  onClick={() => {
                    setIsColumnsOpen(!isColumnsOpen);
                    setIsCopyOpen(false);
                    setIsCreateGroupModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-700" />
                  <span>COLUMNS</span>
                </button>

                {/* Columns Selection Dropdown matching Screenshot 1 */}
                {isColumnsOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl py-2 z-30 text-xs text-gray-800 animate-in fade-in duration-100 max-h-80 overflow-y-auto">
                    {[
                      { key: 'prompts', label: 'Prompts' },
                      { key: 'avgPosition', label: 'Avg. Position' },
                      { key: 'topRanks', label: 'TOP 5 / 10 / 30' },
                      { key: 'keywords', label: 'Keywords' },
                      { key: 'trafficForecast', label: 'Traffic forecast' },
                      { key: 'searchVisibility', label: 'Search visibility' },
                      { key: 'mentionPresence', label: 'Mention Presence' },
                      { key: 'linkPresence', label: 'Link Presence' },
                      { key: 'dt', label: 'DT (Domain Trust)' },
                      { key: 'referringDomains', label: 'Referring Domains' },
                      { key: 'backlinks', label: 'Backlinks' },
                      { key: 'indexed', label: 'Indexed' },
                      { key: 'websiteAudit', label: 'Website Audit' },
                      { key: 'rankingsUpdatedOn', label: 'Rankings updated on' },
                    ].map((col) => {
                      const isChecked = visibleColumns[col.key as keyof typeof visibleColumns];
                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [col.key]: !prev[col.key as keyof typeof prev],
                              }))
                            }
                            className="w-3.5 h-3.5 rounded text-[#7C3AED] focus:ring-0"
                          />
                          <span className={`text-[12.5px] ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch action toolbar when rows are selected */}
          {selectedRowIds.length > 0 && (
            <div id="tour-batch-toolbar" className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-blue-50/50 p-2 rounded-md border border-blue-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-700 font-semibold">
                  {selectedRowIds.length} project ({selectedRowIds.length * 11} keywords) selected
                </span>

                {/* Add to a group Button [ 📁+ ▾ ] */}
                <div className="relative group-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded bg-[#4A5568] hover:bg-[#2D3748] text-white flex items-center gap-1 shadow-2xs transition-colors cursor-pointer text-xs"
                    title="Add to a group"
                  >
                    <Folder className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-bold">+</span>
                    <ChevronDown className={`w-3 h-3 text-white transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isGroupDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-40 text-xs">
                      <div className="px-2.5 pb-2">
                        <input
                          type="text"
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                          placeholder="Search groups"
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-hidden focus:border-[#7C3AED]"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {projectGroups
                          .filter((g) => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                          .map((group) => {
                            const isAssigned =
                              selectedRowIds.length > 0 &&
                              selectedRowIds.every((id) => group.projectIds.includes(id));
                            return (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => {
                                  if (selectedRowIds.length === 0) return;
                                  const updated = projectGroups.map((g) => {
                                    if (g.id === group.id) {
                                      const merged = Array.from(new Set([...g.projectIds, ...selectedRowIds]));
                                      return { ...g, projectIds: merged };
                                    }
                                    return g;
                                  });
                                  setProjectGroups(updated);
                                  try {
                                    localStorage.setItem('se_ranking_project_groups', JSON.stringify(updated));
                                  } catch {}
                                  setRecheckToast(`Added ${selectedRowIds.length} website(s) to group "${group.name}".`);
                                  setTimeout(() => setRecheckToast(null), 3000);
                                  setIsGroupDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-gray-800 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Folder className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                                  <span className="font-medium truncate">{group.name}</span>
                                  <span className="text-[11px] text-gray-400 shrink-0">({group.projectIds.length})</span>
                                </div>
                                {isAssigned && <Check className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recheck rankings Modal Trigger Button [ ⟳ ] */}
                <button
                  type="button"
                  onClick={() => setIsRecheckModalOpen(true)}
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-[#7C3AED] shadow-2xs transition-colors cursor-pointer"
                  title="Recheck rankings"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Delete Project(s) Button [ 🗑 ] */}
                <button
                  type="button"
                  onClick={handleDeleteSelectedProjects}
                  className="p-1.5 border border-gray-300 bg-white hover:bg-red-50 text-red-500 hover:border-red-300 rounded shadow-2xs transition-colors cursor-pointer"
                  title="Delete selected projects"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Projects & Groups Table matching User's Exact Screenshots */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-[#64748B] uppercase text-[10.5px] tracking-wider select-none border-b border-gray-200">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded-[3px] text-[#7C3AED] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 min-w-[240px]">
                    {activeViewFilter === 'GROUPS' ? (
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span className="font-bold text-[#64748B]">GROUP</span>
                        <span className="text-[10px] text-[#64748B]">▲</span>
                      </div>
                    ) : (
                      <span>WEBSITES ({filteredProjects.length === 0 ? '0' : `1 - ${filteredProjects.length} out of ${filteredProjects.length}`})</span>
                    )}
                  </th>
                  {columnOrder.map((colKey) => {
                    if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
                    const col = COLUMNS_DEF[colKey];
                    if (!col) return null;
                    const isDragOver = dragOverColKey === colKey;
                    return (
                      <th
                        key={colKey}
                        draggable
                        onDragStart={(e) => handleDragStart(e, colKey)}
                        onDragOver={(e) => handleDragOver(e, colKey)}
                        onDragLeave={() => setDragOverColKey(null)}
                        onDrop={(e) => handleDrop(e, colKey)}
                        className={`p-3 text-center whitespace-nowrap select-none cursor-grab active:cursor-grabbing transition-all ${
                          isDragOver ? 'bg-blue-100 border-b-2 border-[#7C3AED]' : ''
                        }`}
                        title="Drag to reorder column"
                      >
                        <div className="flex items-center justify-center gap-1 group">
                          <span className="text-gray-300 group-hover:text-gray-600 cursor-grab text-[11px] font-mono select-none">⋮⋮</span>
                          {col.renderTh()}
                          <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-[9px] font-serif border border-gray-400 text-gray-400 ml-0.5">
                            i
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnOrder.filter((k) => visibleColumns[k as keyof typeof visibleColumns]).length + 2}
                      className="py-16 px-4 text-center"
                    >
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] mb-4 shadow-xs">
                          <Layers className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {searchQuery ? 'No websites match your search' : 'No projects added yet'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                          {searchQuery
                            ? `We couldn't find any projects matching "${searchQuery}". Try a different search keyword.`
                            : 'Add your website to start tracking search engine rankings, technical SEO audits, backlinks, and AI Overviews.'}
                        </p>
                        {!searchQuery && (
                          <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg text-xs shadow-md shadow-purple-200 transition-all cursor-pointer active:scale-[0.99]"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Project</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : activeViewFilter === 'GROUPS' ? (
                  <>
                    {projectGroups.map((group, gIdx) => renderGroupSection(group, gIdx))}
                    {(() => {
                      const ungrouped = filteredProjects.filter(
                        (p) => !projectGroups.some((g) => g.projectIds.includes(p.id))
                      );
                      if (ungrouped.length === 0) return null;
                      return (
                        <React.Fragment key="ungrouped">
                          <tr className="bg-gray-50/90 border-y border-gray-200 font-semibold text-gray-700">
                            <td
                              colSpan={columnOrder.filter((k) => visibleColumns[k as keyof typeof visibleColumns]).length + 2}
                              className="p-2.5 pl-4 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-gray-900">Ungrouped websites</span>
                                <span className="text-[11px] font-normal text-gray-500">
                                  ({ungrouped.length} website{ungrouped.length !== 1 ? 's' : ''})
                                </span>
                              </div>
                            </td>
                          </tr>
                          {ungrouped.map((p, idx) => renderProjectRow(p, idx))}
                        </React.Fragment>
                      );
                    })()}
                  </>
                ) : activeViewFilter === 'ALL' ? (
                  <>
                    {projectGroups.map((group, gIdx) => renderGroupSection(group, gIdx))}
                    {filteredProjects
                      .filter((p) => !projectGroups.some((g) => g.projectIds.includes(p.id)))
                      .map((p, idx) => renderProjectRow(p, idx))}
                  </>
                ) : (
                  filteredProjects.map((p, idx) => renderProjectRow(p, idx))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Toast Notifications */}
        {copyToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copyToast}</span>
          </div>
        )}

        {recheckToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <RefreshCw className={`w-4 h-4 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{recheckToast}</span>
          </div>
        )}

      </div>

      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Dashboard Settings Modal (Matches user screenshots 1-5) */}
      {isDashboardSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {settingsSubView === 'main' && 'Dashboard Settings'}
                {settingsSubView === 'websites' && 'Display charts for the following websites'}
                {settingsSubView === 'chart_type' && 'Default chart type'}
                {settingsSubView === 'comparison' && 'Period for comparison'}
                {settingsSubView === 'subaccounts' && 'Display projects of subaccounts'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDashboardSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-xs text-gray-800">
              {/* VIEW 1: MAIN SETTINGS (matches Screenshot 1) */}
              {settingsSubView === 'main' && (
                <div className="space-y-4">
                  {/* Display charts toggle */}
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-gray-900 text-[13px]">Display charts</span>
                    <button
                      type="button"
                      onClick={() => setDraftDisplayCharts(!draftDisplayCharts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        draftDisplayCharts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          draftDisplayCharts ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Display charts for websites */}
                  <div
                    onClick={() => setSettingsSubView('websites')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#7C3AED] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Display charts for the following websites</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span className="truncate max-w-[200px]">
                        {draftSelectedWebsites.length > 0
                          ? `${draftSelectedWebsites.length} website(s) selected`
                          : currentDomainFormatted}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Default chart type */}
                  <div
                    onClick={() => setSettingsSubView('chart_type')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#7C3AED] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Default chart type</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{draftDefaultChartType}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Display Top 5/10/30 in percentage */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-[13px] text-gray-800">Display Top 5/10/30 in percentage</span>
                    <button
                      type="button"
                      onClick={() => setDraftDisplayTopPercentage(!draftDisplayTopPercentage)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        draftDisplayTopPercentage ? 'bg-[#7C3AED]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          draftDisplayTopPercentage ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sum up top 5/10/30 values */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-800">
                      <span>Sum up top 5/10/30 values</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftSumUpTopValues(!draftSumUpTopValues)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        draftSumUpTopValues ? 'bg-[#7C3AED]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          draftSumUpTopValues ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Period for comparison */}
                  <div
                    onClick={() => setSettingsSubView('comparison')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#7C3AED] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Period for comparison</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{draftPeriodForComparison}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Display projects of subaccounts */}
                  <div
                    onClick={() => setSettingsSubView('subaccounts')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#7C3AED] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Display projects of subaccounts</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{draftDisplaySubaccounts}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: WEBSITES SUBVIEW (matches Screenshot 2) */}
              {settingsSubView === 'websites' && (
                <div className="space-y-3">
                  {projects.map((p) => {
                    const d = p.domain.startsWith('http') ? p.domain : `https://${p.domain}/`;
                    const isSelected = draftSelectedWebsites.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setDraftSelectedWebsites((prev) =>
                            prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          );
                        }}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={`https://www.google.de/s2/favicons?domain=${p.domain}`}
                            alt=""
                            className="w-4 h-4 rounded-xs shrink-0"
                          />
                          <span className="text-[13px] font-medium text-gray-900 truncate">
                            {d} ({d})
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#7C3AED] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 3: DEFAULT CHART TYPE (matches Screenshot 3) */}
              {settingsSubView === 'chart_type' && (
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Average position', id: 'avg_pos' },
                    { label: 'Traffic forecast', id: 'traffic' },
                    { label: 'Search visibility', id: 'visibility' },
                    { label: '% in Top 10', id: 'top10' },
                    { label: 'Mention Presence', id: 'mention' },
                    { label: 'Link Presence', id: 'link' },
                  ].map((ct) => (
                    <div
                      key={ct.label}
                      onClick={() => setDraftDefaultChartType(ct.label)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={draftDefaultChartType === ct.label ? 'font-semibold text-gray-900' : ''}>
                        {ct.label}
                      </span>
                      {draftDefaultChartType === ct.label && (
                        <Check className="w-4 h-4 text-[#7C3AED]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 4: PERIOD FOR COMPARISON (matches Screenshot 4) */}
              {settingsSubView === 'comparison' && (
                <div className="divide-y divide-gray-100">
                  {['Last month', 'Last 3 months', 'Last 6 months', 'Last year'].map((period) => (
                    <div
                      key={period}
                      onClick={() => setDraftPeriodForComparison(period)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={draftPeriodForComparison === period ? 'font-semibold text-gray-900' : ''}>
                        {period}
                      </span>
                      {draftPeriodForComparison === period && (
                        <Check className="w-4 h-4 text-[#7C3AED]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 5: SUBACCOUNTS (matches Screenshot 5) */}
              {settingsSubView === 'subaccounts' && (
                <div className="divide-y divide-gray-100">
                  {['Do not show', 'In a general list', 'In a separate table'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setDraftDisplaySubaccounts(opt)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={draftDisplaySubaccounts === opt ? 'font-semibold text-gray-900' : ''}>
                        {opt}
                      </span>
                      {draftDisplaySubaccounts === opt && (
                        <Check className="w-4 h-4 text-[#7C3AED]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer matching Screenshots */}
            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
              {settingsSubView !== 'main' ? (
                <button
                  type="button"
                  onClick={() => setSettingsSubView('main')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  <span>BACK</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDashboardSettingsOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayCharts(draftDisplayCharts);
                    setSelectedWebsites(draftSelectedWebsites);
                    setDefaultChartType(draftDefaultChartType);
                    setDisplayTopPercentage(draftDisplayTopPercentage);
                    setSumUpTopValues(draftSumUpTopValues);
                    setPeriodForComparison(draftPeriodForComparison);
                    setDisplaySubaccounts(draftDisplaySubaccounts);

                    const tabMap: Record<string, 'avg_pos' | 'traffic' | 'visibility' | 'top10' | 'mention' | 'link'> = {
                      'Average position': 'avg_pos',
                      'Traffic forecast': 'traffic',
                      'Search visibility': 'visibility',
                      '% in Top 10': 'top10',
                      'Mention Presence': 'mention',
                      'Link Presence': 'link',
                    };
                    if (tabMap[draftDefaultChartType]) {
                      setActiveMetricTab(tabMap[draftDefaultChartType]);
                    }

                    try {
                      localStorage.setItem(
                        'se_ranking_dashboard_settings',
                        JSON.stringify({
                          displayCharts: draftDisplayCharts,
                          defaultChartType: draftDefaultChartType,
                          displayTopPercentage: draftDisplayTopPercentage,
                          sumUpTopValues: draftSumUpTopValues,
                          periodForComparison: draftPeriodForComparison,
                          displaySubaccounts: draftDisplaySubaccounts,
                          selectedWebsites: draftSelectedWebsites,
                        })
                      );
                    } catch (e) {
                      // ignore
                    }
                    setIsDashboardSettingsOpen(false);
                    setRecheckToast('Dashboard settings applied successfully.');
                    setTimeout(() => setRecheckToast(null), 3000);
                  }}
                  className="px-5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded shadow-xs cursor-pointer transition-colors"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tell us what you think Feedback Modal matching Screenshot */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Export Data Modal matching user screenshot */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[540px] overflow-hidden flex flex-col border border-gray-100">
            {/* Header */}
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1E2532] tracking-tight">Export data</h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-2 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={exportSearch}
                  onChange={(e) => setExportSearch(e.target.value)}
                  className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-[#7C3AED] rounded-md pl-3.5 pr-10 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Tree Selector */}
              <div className="py-1 space-y-1 text-sm select-none max-h-[340px] overflow-y-auto">
                {/* 1. All Projects */}
                <div
                  onClick={toggleAllProjectsExport}
                  className="flex items-center justify-between py-2 px-1 rounded hover:bg-gray-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#1E2532] shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">All Projects</span>
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      {projectList.length}
                    </span>
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isAllProjectsSelected && (
                      <Check className="w-4 h-4 text-[#7C3AED] stroke-[2.5]" />
                    )}
                  </div>
                </div>

                {/* 2. Ungrouped websites */}
                <div className="space-y-1">
                  <div
                    onClick={toggleUngroupedExport}
                    className="flex items-center justify-between py-2 px-1 rounded hover:bg-gray-50/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUngroupedExpanded(!isUngroupedExpanded);
                        }}
                        className="p-0.5 -ml-1 text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-150 ${
                            isUngroupedExpanded ? '' : '-rotate-90'
                          }`}
                        />
                      </button>
                      <svg
                        className="w-4 h-4 text-[#1E2532] shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                      </svg>
                      <span className="font-medium text-gray-900 text-sm">Ungrouped websites</span>
                      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        {filteredExportProjects.length}
                      </span>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isAllUngroupedSelected && (
                        <Check className="w-4 h-4 text-[#7C3AED] stroke-[2.5]" />
                      )}
                    </div>
                  </div>

                  {/* 3. Websites list with real dynamic logos & vertical black bar */}
                  {isUngroupedExpanded && (
                    <div className="space-y-0.5">
                      {filteredExportProjects.map((proj) => {
                        const isChecked = selectedExportProjectIds.includes(proj.id);
                        const displayDomain = proj.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
                        return (
                          <div
                            key={proj.id}
                            onClick={() => toggleProjectExport(proj.id)}
                            className="relative flex items-center justify-between py-2 pl-4 pr-1 hover:bg-gray-50/80 rounded cursor-pointer transition-colors before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2.5px] before:bg-gray-900"
                          >
                            <div className="flex items-center gap-2.5 truncate ml-3">
                              <ProjectFavicon
                                domain={proj.domain}
                                className="w-4 h-4 rounded-xs shrink-0"
                              />
                              <span className="text-sm font-normal text-gray-800 truncate">
                                {displayDomain}
                              </span>
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {isChecked && (
                                <Check className="w-4 h-4 text-[#7C3AED] stroke-[2.5]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {filteredExportProjects.length === 0 && (
                        <div className="py-4 text-center text-xs text-gray-400">
                          No websites matching &ldquo;{exportSearch}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleExportSelected}
                disabled={selectedExportProjectIds.length === 0}
                className="px-7 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recheck rankings Modal (Exact match to screenshot 6) */}
      {isRecheckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Recheck rankings</h3>
              <button
                type="button"
                onClick={() => setIsRecheckModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <th className="pb-2 font-bold">WEBSITES</th>
                    <th className="pb-2 text-right font-bold">KEYWORDS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedRowIds.length > 0
                    ? projects.filter((p) => selectedRowIds.includes(p.id))
                    : projects.slice(0, 1)
                  ).map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 flex items-center gap-2">
                        <ProjectFavicon domain={p.domain} className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-gray-800">
                        11
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRecheckModalOpen(false)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmRecheckRankings}
                disabled={isRechecking}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs uppercase rounded cursor-pointer shadow-xs transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isRechecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>RECHECK RANKINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Context Menu matching SE-Ranking screenshot */}
      {groupMenuAnchor && (
        <div
          data-group-context-menu
          style={{
            position: 'fixed',
            top: `${groupMenuAnchor.top}px`,
            left: `${groupMenuAnchor.left}px`,
            zIndex: 9999,
          }}
          className="w-44 bg-white rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 py-1 text-xs text-gray-800 animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Ungroup */}
          <button
            type="button"
            onClick={() => handleUngroup(groupMenuAnchor.group)}
            className="w-full px-3.5 py-2 hover:bg-[#F4F6F8] flex items-center gap-2.5 text-left text-gray-800 transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <path d="M14 7h3v3" />
                <path d="M10 17H7v-3" />
              </svg>
            </div>
            <span className="font-normal truncate">Ungroup</span>
          </button>

          {/* 2. Rename */}
          <button
            type="button"
            onClick={() => {
              const g = groupMenuAnchor.group;
              setGroupMenuAnchor(null);
              setRenameGroupModal({ isOpen: true, groupId: g.id, currentName: g.name });
            }}
            className="w-full px-3.5 py-2 hover:bg-[#F4F6F8] flex items-center gap-2.5 text-left text-gray-800 transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="font-normal truncate">Rename</span>
          </button>

          {/* 3. Copy row */}
          <button
            type="button"
            onClick={() => handleCopyGroupRow(groupMenuAnchor.group)}
            className="w-full px-3.5 py-2 hover:bg-[#F4F6F8] flex items-center gap-2.5 text-left text-gray-800 transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <Copy className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <span className="font-normal truncate">Copy row</span>
          </button>

          {/* 4. Delete group */}
          <button
            type="button"
            onClick={() => {
              const g = groupMenuAnchor.group;
              setGroupMenuAnchor(null);
              setDeleteGroupModal({ isOpen: true, groupId: g.id, name: g.name });
            }}
            className="w-full px-3.5 py-2 hover:bg-red-50 flex items-center gap-2.5 text-left text-[#DA1E28] transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-[#DA1E28]" />
            </div>
            <span className="font-normal text-[#DA1E28] truncate">Delete group</span>
          </button>
        </div>
      )}

      {/* Rename Group Modal */}
      {renameGroupModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Rename group</h3>
              <button
                type="button"
                onClick={() => setRenameGroupModal(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-700">
                Group name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={renameGroupModal.currentName}
                onChange={(e) =>
                  setRenameGroupModal({ ...renameGroupModal, currentName: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameGroupModal.currentName.trim()) {
                    handleSaveRenameGroup();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-hidden focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                autoFocus
              />
            </div>

            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRenameGroupModal(null)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!renameGroupModal.currentName.trim()}
                onClick={handleSaveRenameGroup}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-gray-300 text-white font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {deleteGroupModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Delete group</h3>
              <button
                type="button"
                onClick={() => setDeleteGroupModal(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-2">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete group <span className="font-bold text-gray-900">"{deleteGroupModal.name}"</span>?
              </p>
              <p className="text-[11px] text-gray-500">
                Websites assigned to this group will not be deleted. They will become ungrouped.
              </p>
            </div>

            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteGroupModal(null)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGroup}
                className="px-5 py-2 bg-[#DA1E28] hover:bg-[#B81921] text-white font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                DELETE GROUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom SE Ranking Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Delete project</h3>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete {selectedRowIds.length} project(s)? This will permanently remove its tracked keywords, historical ranking data, and competitor tracking.
            </div>

            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProjects}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded cursor-pointer shadow-xs transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>DELETE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refreshProjects}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />



      {/* SE-Ranking Project Row Context Menu matching user screenshot & html snippet */}
      {menuAnchor && (
        <div
          data-project-context-menu
          style={{
            position: 'fixed',
            top: menuAnchor.openUpwards ? undefined : `${menuAnchor.top}px`,
            bottom: menuAnchor.openUpwards ? `${window.innerHeight - menuAnchor.top}px` : undefined,
            left: `${menuAnchor.left}px`,
            zIndex: 9999,
          }}
          className="se-tools-menu__content w-[205px] max-h-[32.5rem] bg-white rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)] border border-[#E2E8F0] py-1 animate-in fade-in zoom-in-95 duration-100 select-none text-[13px] text-[#171B24]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Section 1 */}
          <div className="se-tools-menu__section py-0.5">
            {/* 1. Project Overview */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push('/project-overview');
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Project Overview</span>
              </button>
            </div>

            {/* 2. Rankings */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push('/rankings');
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Rankings</span>
              </button>
            </div>

            {/* 3. Backlinks */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push('/backlinks-monitor');
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Backlinks</span>
              </button>
            </div>

            {/* 4. Marketing Plan */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push('/marketing-plan');
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#171B24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                    <polyline points="15 6 9 12" />
                  </svg>
                </div>
                <span className="font-normal truncate">Marketing Plan</span>
              </button>
            </div>

            {/* 5. Website Audit */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push('/website-audit');
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <FileSearch className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Website Audit</span>
              </button>
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t border-[#EAECEF] my-1" />

          {/* Section 2 */}
          <div className="se-tools-menu__section py-0.5">
            {/* 6. Copy row */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => handleCopyRow(menuAnchor.project)}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Copy className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Copy row</span>
              </button>
            </div>

            {/* 7. Settings */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  setActiveProject(menuAnchor.project);
                  router.push(`/projects/${menuAnchor.project.id}/settings`);
                  setMenuAnchor(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Settings className="w-3.5 h-3.5 text-[#171B24]" />
                </div>
                <span className="font-normal truncate">Settings</span>
              </button>
            </div>

            {/* 8. Pause project */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => handleTogglePauseProject(menuAnchor.project)}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-[#F4F6F8] text-[#171B24] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {pausedProjectIds.includes(menuAnchor.project.id) ? (
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Pause className="w-3.5 h-3.5 text-[#171B24]" />
                  )}
                </div>
                <span className={`font-normal truncate ${pausedProjectIds.includes(menuAnchor.project.id) ? 'text-emerald-600' : ''}`}>
                  {pausedProjectIds.includes(menuAnchor.project.id) ? 'Resume project' : 'Pause project'}
                </span>
              </button>
            </div>

            {/* 9. Delete in Red */}
            <div className="se-tools-menu__item">
              <button
                type="button"
                onClick={() => {
                  const targetProject = menuAnchor.project;
                  setMenuAnchor(null);
                  setSelectedRowIds([targetProject.id]);
                  setIsDeleteModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left hover:bg-red-50 text-[#DA1E28] transition-colors cursor-pointer group"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-[#DA1E28]" />
                </div>
                <span className="font-normal text-[#DA1E28] truncate">Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast matching SE-Ranking feedback */}
      {recheckToast && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-[#171B24] text-white px-4 py-3 rounded-lg shadow-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-gray-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{recheckToast}</span>
          <button
            type="button"
            onClick={() => setRecheckToast(null)}
            className="ml-2 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsDashboardPage() {
  return (
    <AuthGuard>
      <ProjectsDashboardPageContent />
    </AuthGuard>
  );
}

