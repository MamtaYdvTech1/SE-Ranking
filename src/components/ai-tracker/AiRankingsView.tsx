"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Gauge, ChevronDown, ChevronUp, RotateCw, Sparkles } from "lucide-react";
import { CalendarYearDropdown } from "../competitors/CalendarYearDropdown";

const CAL_FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CAL_MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

const formatDisplayDate = (d: Date) => {
  return `${d.getDate()} ${CAL_MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

const AVAILABLE_GROUPS = ["General"];

export const AI_GUEST_MODULE_DEFINITIONS: {
  key: string;
  label: string;
  icon: string;
  description: string;
}[] = [
  { key: "projectOverview", label: "Project Overview", icon: "📊", description: "Summary metrics and project visibility" },
  { key: "rankings", label: "Rankings", icon: "📈", description: "Detailed keyword positions and search engine ranks" },
  { key: "analyticsAndTraffic", label: "Analytics & Traffic", icon: "📉", description: "Traffic share and search trends" },
  { key: "myCompetitors", label: "My Competitors", icon: "⚔️", description: "Added competitors and SERP competitor overlap" },
  { key: "aiResultsTracker", label: "AI Results Tracker", icon: "🤖", description: "AI Overview rankings and citations" },
  { key: "websiteAudit", label: "Website Audit", icon: "🔍", description: "Technical health and crawl issue reports" },
  { key: "marketingPlan", label: "Marketing Plan", icon: "🎯", description: "SEO task checklists and roadmaps" },
];

export interface AiRankingsViewProps {
  projectId: string;
  projectDomain?: string;
}

export type PresenceTab = "mention_link" | "sources";
export type TimelineInterval = "CURRENT" | "7D" | "1M" | "3M" | "6M" | "12M";
export type PresenceScope = "GENERAL" | "TOP 3";

export interface IntervalChartData {
  labels: string[];
  mention: { general: number[]; top3: number[] };
  link: { general: number[]; top3: number[] };
  sources: { general: number[]; top3: number[] };
}

export const PRESENCE_INTERVAL_DATA: Record<TimelineInterval, IntervalChartData> = {
  CURRENT: {
    labels: ["19 Sep", "20 Sep", "21 Sep"],
    mention: { general: [0, 0, 0], top3: [0, 0, 0] },
    link: { general: [0, 0, 0], top3: [0, 0, 0] },
    sources: { general: [100, 60, 20], top3: [100, 60, 20] },
  },
  "7D": {
    labels: ["15 Sep", "16 Sep", "17 Sep", "18 Sep", "19 Sep", "20 Sep", "21 Sep"],
    mention: { general: [0, 0, 0, 0, 0, 0, 0], top3: [0, 0, 0, 0, 0, 0, 0] },
    link: { general: [0, 0, 0, 0, 0, 0, 0], top3: [0, 0, 0, 0, 0, 0, 0] },
    sources: { general: [100, 95, 90, 80, 60, 40, 20], top3: [100, 95, 90, 80, 60, 40, 20] },
  },
  "1M": {
    labels: ["23 Aug", "30 Aug", "6 Sep", "13 Sep", "21 Sep"],
    mention: { general: [15, 12, 8, 5, 0], top3: [10, 8, 5, 0, 0] },
    link: { general: [10, 8, 5, 2, 0], top3: [5, 4, 0, 0, 0] },
    sources: { general: [95, 90, 80, 60, 25], top3: [90, 85, 70, 50, 20] },
  },
  "3M": {
    labels: ["Jul", "Aug", "Sep"],
    mention: { general: [22, 15, 5], top3: [15, 10, 0] },
    link: { general: [15, 10, 2], top3: [10, 5, 0] },
    sources: { general: [90, 70, 25], top3: [85, 60, 20] },
  },
  "6M": {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    mention: { general: [28, 24, 20, 15, 8, 0], top3: [20, 18, 15, 10, 5, 0] },
    link: { general: [18, 15, 12, 8, 4, 0], top3: [12, 10, 8, 5, 0, 0] },
    sources: { general: [100, 95, 90, 80, 60, 25], top3: [95, 90, 85, 75, 50, 20] },
  },
  "12M": {
    labels: ["Oct", "Dec", "Feb", "Apr", "Jun", "Sep"],
    mention: { general: [35, 30, 25, 18, 10, 0], top3: [25, 20, 18, 12, 5, 0] },
    link: { general: [22, 18, 15, 10, 5, 0], top3: [15, 12, 10, 5, 2, 0] },
    sources: { general: [95, 100, 95, 85, 60, 25], top3: [90, 95, 90, 80, 50, 20] },
  },
};

export interface PromptDateResult {
  mentionText: string;
  isMentionListed: boolean;
  linkText: string;
  isLinkListed: boolean;
  sourcesCount: number;
}

export interface AiPromptItem {
  id: string;
  promptText: string;
  targetUrl: string;
  hasUserIcon?: boolean;
  group: string;
  results: {
    "Sep-19 2026": PromptDateResult;
    "Sep-20 2026": PromptDateResult;
    "Sep-21 2026": PromptDateResult;
  };
}

export const INITIAL_RANKINGS_PROMPTS: AiPromptItem[] = [
  {
    id: "p-1",
    promptText: "What are the best tools for enhancing team productivity and collaboration?",
    targetUrl: "workcomposer.com/features/productivity",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-2",
    promptText: "What are some reliable work management tools to help my team stay organized?",
    targetUrl: "workcomposer.com/features/work-management",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-3",
    promptText: "What are the best tools for improving team communication and collaboration?",
    targetUrl: "workcomposer.com/solutions/communication",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-4",
    promptText: "What features should I look for in a project management software for my remote team?",
    targetUrl: "workcomposer.com/features/remote-teams",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-5",
    promptText: "I'm looking for a way to automate our team's workflows; can you recommend a solution?",
    targetUrl: "workcomposer.com/features/workflow-automation",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-6",
    promptText: "Can you recommend a reliable time tracking software for my remote team?",
    targetUrl: "workcomposer.com/features/time-tracking",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-7",
    promptText: "What are the best remote work tools that help with team collaboration?",
    targetUrl: "workcomposer.com/solutions/remote-work",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-8",
    promptText: "What are the best tools for improving employee engagement in our company?",
    targetUrl: "workcomposer.com/solutions/employee-engagement",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-9",
    promptText: "How can I improve resource allocation for my team?",
    targetUrl: "workcomposer.com/features/resource-planning",
    hasUserIcon: true,
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
  {
    id: "p-10",
    promptText: "What are the best tools for streamlining my team's workflow?",
    targetUrl: "workcomposer.com/features/productivity",
    group: "General",
    results: {
      "Sep-19 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-20 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
      "Sep-21 2026": { mentionText: "—", isMentionListed: false, linkText: "—", isLinkListed: false, sourcesCount: 5 },
    },
  },
];

export function AiRankingsView({
  projectId,
  projectDomain = "workcomposer.com",
}: AiRankingsViewProps) {
  const baseHref = `/projects/${projectId}`;
  const router = useRouter();

  // 1. Top Notice Alert Banner
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);

  // 2. Action Toolbar states
  const [selectedEngine, setSelectedEngine] = useState("ChatGPT");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);

  // Date range picker states
  const [dateRange, setDateRange] = useState("19 Sep 2026 - 21 Sep 2026");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [stagedRangeStart, setStagedRangeStart] = useState<Date>(new Date(2026, 8, 19));
  const [stagedRangeEnd, setStagedRangeEnd] = useState<Date>(new Date(2026, 8, 21));
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date>(new Date(2026, 8, 19));
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date>(new Date(2026, 8, 21));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [compareByDates, setCompareByDates] = useState(false);

  // Groups dropdown popover states
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["General"]);
  const [stagedSelectedGroups, setStagedSelectedGroups] = useState<string[]>(["General"]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // Guest Link Modal State
  const [isGuestLinkModalOpen, setIsGuestLinkModalOpen] = useState(false);
  const [hideSearchVolume, setHideSearchVolume] = useState(false);
  const [includeFilteringAndSorting, setIncludeFilteringAndSorting] = useState(true);
  const [enabledGuestModules, setEnabledGuestModules] = useState<Record<string, boolean>>({
    projectOverview: false,
    rankings: false,
    analyticsAndTraffic: false,
    myCompetitors: false,
    aiResultsTracker: true,
    websiteAudit: false,
    marketingPlan: false,
  });
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSearchEngine, setExportSearchEngine] = useState("chatgpt-india");
  const [includeRankingChanges, setIncludeRankingChanges] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Data Studio Dropdown State
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const dataStudioRef = useRef<HTMLDivElement>(null);

  // Prompt Limit Popover State
  const [isPromptLimitModalOpen, setIsPromptLimitModalOpen] = useState(false);
  const promptLimitRef = useRef<HTMLDivElement>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Construct dynamic guest link
  const guestUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.internalseoplatform.com";
    const activeMods = Object.entries(enabledGuestModules)
      .filter(([, active]) => active)
      .map(([key]) => key);

    const params = new URLSearchParams();
    params.set("guest", "true");
    if (activeMods.length > 0) {
      params.set("modules", activeMods.join(","));
    }
    if (hideSearchVolume) {
      params.set("hideSV", "1");
    }
    if (includeFilteringAndSorting) {
      params.set("filterSort", "1");
    }
    params.set("token", `gst_${projectId.replace(/[^a-zA-Z0-9]/g, "")}_${projectDomain.replace(/[^a-zA-Z0-9]/g, "")}`);

    return `${origin}/guest/projects/${projectId}?${params.toString()}`;
  }, [projectId, projectDomain, enabledGuestModules, hideSearchVolume, includeFilteringAndSorting]);

  const handleCopyGuestLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(guestUrl);
    }
    setCopiedGuestLink(true);
    showToast("Link copied to clipboard successfully!");
    setTimeout(() => setCopiedGuestLink(false), 2500);
  };

  const handleSelectAllGuestModules = () => {
    setEnabledGuestModules({
      projectOverview: true,
      rankings: true,
      analyticsAndTraffic: true,
      myCompetitors: true,
      aiResultsTracker: true,
      websiteAudit: true,
      marketingPlan: true,
    });
  };

  const handleClearAllGuestModules = () => {
    setEnabledGuestModules({
      projectOverview: false,
      rankings: false,
      analyticsAndTraffic: false,
      myCompetitors: false,
      aiResultsTracker: false,
      websiteAudit: false,
      marketingPlan: false,
    });
  };

  // Close popovers on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
      }
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setIsGroupDropdownOpen(false);
      }
      if (
        dataStudioRef.current &&
        !dataStudioRef.current.contains(e.target as Node)
      ) {
        setIsDataStudioOpen(false);
      }
      if (
        promptLimitRef.current &&
        !promptLimitRef.current.contains(e.target as Node)
      ) {
        setIsPromptLimitModalOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDatePickerOpen(false);
        setIsGroupDropdownOpen(false);
        setIsMentionDropdownOpen(false);
        setIsLinkDropdownOpen(false);
        setIsEngineDropdownOpen(false);
        setIsViewModeDropdownOpen(false);
        setIsGroupByOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsGuestLinkModalOpen(false);
        setIsExportModalOpen(false);
        setIsDataStudioOpen(false);
        setIsPromptLimitModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePrevMonth = () => {
    setCalendarLeftMonth((prev) => {
      if (prev === 0) {
        setCalendarLeftYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setCalendarRightMonth((prev) => {
      if (prev === 0) {
        setCalendarRightYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarLeftMonth((prev) => {
      if (prev === 11) {
        setCalendarLeftYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setCalendarRightMonth((prev) => {
      if (prev === 11) {
        setCalendarRightYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const applyPreset = (preset: string) => {
    const refDate = new Date(2026, 8, 21);
    let start = new Date(refDate);
    let end = new Date(refDate);

    switch (preset) {
      case "TODAY":
        start = new Date(refDate);
        end = new Date(refDate);
        break;
      case "YESTERDAY":
        start = new Date(2026, 8, 20);
        end = new Date(2026, 8, 20);
        break;
      case "LAST WEEK":
        start = new Date(2026, 8, 7);
        end = new Date(2026, 8, 14);
        break;
      case "LAST MONTH":
        start = new Date(2026, 7, 1);
        end = new Date(2026, 7, 31);
        break;
      case "PAST 7 DAYS":
        start = new Date(2026, 8, 15);
        end = new Date(2026, 8, 21);
        break;
      case "PAST 30 DAYS":
        start = new Date(2026, 7, 23);
        end = new Date(2026, 8, 21);
        break;
      case "PAST 6 MONTHS":
        start = new Date(2026, 2, 21);
        end = new Date(2026, 8, 21);
        break;
      case "YEAR":
        start = new Date(2026, 0, 1);
        end = new Date(2026, 8, 21);
        break;
      default:
        break;
    }

    setStagedRangeStart(start);
    setStagedRangeEnd(end);
    setSelectingEnd(false);
    setActivePreset(preset);

    setCalendarRightYear(end.getFullYear());
    setCalendarRightMonth(end.getMonth());
    const prevM = end.getMonth() === 0 ? 11 : end.getMonth() - 1;
    const prevY = end.getMonth() === 0 ? end.getFullYear() - 1 : end.getFullYear();
    setCalendarLeftYear(prevY);
    setCalendarLeftMonth(prevM);
  };

  const handleDateClick = (date: Date) => {
    if (!selectingEnd) {
      setStagedRangeStart(date);
      setStagedRangeEnd(date);
      setSelectingEnd(true);
      setActivePreset(null);
    } else {
      if (date < stagedRangeStart) {
        setStagedRangeStart(date);
        setStagedRangeEnd(stagedRangeStart);
      } else {
        setStagedRangeEnd(date);
      }
      setSelectingEnd(false);
      setActivePreset(null);
    }
  };

  const handleApplyDateRange = () => {
    const formatted = `${formatDisplayDate(stagedRangeStart)} - ${formatDisplayDate(stagedRangeEnd)}`;
    setDateRange(formatted);
    setAppliedRangeStart(stagedRangeStart);
    setAppliedRangeEnd(stagedRangeEnd);
    setIsDatePickerOpen(false);
  };

  const handleCancelDateRange = () => {
    setStagedRangeStart(appliedRangeStart);
    setStagedRangeEnd(appliedRangeEnd);
    setIsLeftYearOpen(false);
    setIsRightYearOpen(false);
    setIsDatePickerOpen(false);
  };

  const handleExecuteExport = () => {
    if (typeof window !== "undefined") {
      const headers = [
        "Prompt",
        "URL",
        "Group",
        "Sep-19 Mention",
        "Sep-19 Link",
        "Sep-20 Mention",
        "Sep-20 Link",
        "Sep-21 Mention",
        "Sep-21 Link",
      ];
      if (includeRankingChanges) {
        headers.push("Mention Change", "Link Change");
      }

      const rows = filteredPrompts.map((p) => {
        const r19 = p.results["Sep-19 2026"];
        const r20 = p.results["Sep-20 2026"];
        const r21 = p.results["Sep-21 2026"];
        const row = [
          `"${p.promptText.replace(/"/g, '""')}"`,
          `"${p.targetUrl}"`,
          `"${p.group}"`,
          r19.mentionText,
          r19.linkText,
          r20.mentionText,
          r20.linkText,
          r21.mentionText,
          r21.linkText,
        ];
        if (includeRankingChanges) {
          row.push("0", "0");
        }
        return row.join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], {
        type:
          exportFormat === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `ai_rankings_${projectDomain}_${exportSearchEngine}_export.${exportFormat}`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof window.URL?.revokeObjectURL === "function") {
        URL.revokeObjectURL(url);
      }
    }

    setIsExportModalOpen(false);
    showToast(`Export downloaded: ai_rankings_${projectDomain}_export.${exportFormat}`);
  };

  const renderCalendarMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday start: Mon=0, ..., Sun=6
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: React.ReactNode[] = [];

    // Prior month padding dates
    for (let i = offset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push(
        <div
          key={`pad-prev-${year}-${month}-${dayNum}`}
          className="h-7 w-7 text-xs flex items-center justify-center text-slate-300 dark:text-slate-600 select-none pointer-events-none"
        >
          {dayNum}
        </div>
      );
    }

    // Active month dates
    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const isStart = current.toDateString() === stagedRangeStart.toDateString();
      const isEnd = current.toDateString() === stagedRangeEnd.toDateString();
      const isInRange = current > stagedRangeStart && current < stagedRangeEnd;
      const isHistorical = [15, 16, 17, 18].includes(d) && month === 8 && year === 2026;

      let cellStyle =
        "h-7 w-7 text-xs flex flex-col items-center justify-center transition select-none cursor-pointer relative ";

      if (isStart && isEnd) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs";
      } else if (isStart) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-l-xs";
      } else if (isEnd) {
        cellStyle +=
          "border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-r-xs relative pb-1 bg-blue-50/70 dark:bg-blue-950/70";
      } else if (isInRange) {
        cellStyle += "bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-none font-medium";
      } else if (isHistorical) {
        cellStyle += "font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      } else {
        cellStyle += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
          aria-label={`${d} ${CAL_FULL_MONTHS[month]} ${year}`}
          onClick={() => handleDateClick(current)}
          className={cellStyle}
        >
          <span>{d}</span>
          {isEnd && !isStart && (
            <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full absolute bottom-0.5" />
          )}
        </button>
      );
    }

    // Future month padding dates
    const remainder = (7 - ((offset + daysInMonth) % 7)) % 7;
    for (let f = 1; f <= remainder; f++) {
      cells.push(
        <div
          key={`pad-next-${year}-${month}-${f}`}
          className="h-7 w-7 text-xs flex items-center justify-center text-slate-300 dark:text-slate-600 select-none pointer-events-none"
        >
          {f}
        </div>
      );
    }

    return (
      <div className="w-56 select-none">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((day, idx) => (
            <span
              key={idx}
              className="h-6 w-7 text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">{cells}</div>
      </div>
    );
  };

  // Mention position state
  const [isMentionDropdownOpen, setIsMentionDropdownOpen] = useState(false);
  const [mentionFrom, setMentionFrom] = useState("");
  const [mentionTo, setMentionTo] = useState("");
  const [mentionNoMentions, setMentionNoMentions] = useState(false);
  const [mentionNotPresentInLlm, setMentionNotPresentInLlm] = useState(false);

  // Link position state
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkFrom, setLinkFrom] = useState("");
  const [linkTo, setLinkTo] = useState("");
  const [linkNoSources, setLinkNoSources] = useState(false);
  const [linkNotPresentInLlm, setLinkNotPresentInLlm] = useState(false);

  // 3. Collapsible Insights & Recommendations
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(true);
  const [isViewMoreInsights, setIsViewMoreInsights] = useState(false);

  // 4. Chart Views & Timeline Filter
  const [activeTab, setActiveTab] = useState<"mention_link" | "sources">("mention_link");
  const [timelineRange, setTimelineRange] = useState<"CURRENT" | "7D" | "1M" | "3M" | "6M" | "12M">("CURRENT");
  const [groupByOption, setGroupByOption] = useState<"DAYS" | "WEEKS" | "MONTHS">("DAYS");
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);
  const [chartScope, setChartScope] = useState<"GENERAL" | "TOP 3">("TOP 3");
  const [showMentionPresence, setShowMentionPresence] = useState(true);
  const [showLinkPresence, setShowLinkPresence] = useState(true);
  const [showSourcesPresence, setShowSourcesPresence] = useState(true);
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);

  // 5. Prompts Table & View Mode
  const [viewMode, setViewMode] = useState<"list" | "groups">("groups");
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Record<string, boolean>>({});
  const [isMasterChecked, setIsMasterChecked] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  // 6. Add Prompts Modal
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false);
  const [promptsInput, setPromptsInput] = useState("");

  // 7. Interactive Tooltip Hover State for table cells
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    return INITIAL_RANKINGS_PROMPTS.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = p.promptText.toLowerCase().includes(q) || p.targetUrl.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedGroups.length < AVAILABLE_GROUPS.length) {
        if (!selectedGroups.includes(p.group)) return false;
      }

      // Check latest date result
      const latestResult = p.results["Sep-21 2026"];

      // Mention position filtering
      const hasMentionFilter = mentionFrom || mentionTo || mentionNoMentions || mentionNotPresentInLlm;
      if (hasMentionFilter) {
        if (!latestResult.isMentionListed) {
          // If no mentions or not present is selected, it passes; otherwise if only numeric range is set, it fails
          if (!mentionNoMentions && !mentionNotPresentInLlm) return false;
        } else {
          // It has a mention
          if (mentionNoMentions) return false;
          const pos = parseInt(latestResult.mentionText, 10);
          if (!isNaN(pos)) {
            if (mentionFrom && pos < parseInt(mentionFrom, 10)) return false;
            if (mentionTo && pos > parseInt(mentionTo, 10)) return false;
          }
        }
      }

      // Link position filtering
      const hasLinkFilter = linkFrom || linkTo || linkNoSources || linkNotPresentInLlm;
      if (hasLinkFilter) {
        if (!latestResult.isLinkListed) {
          if (!linkNoSources && !linkNotPresentInLlm) return false;
        } else {
          if (linkNoSources) return false;
          const pos = parseInt(latestResult.linkText, 10);
          if (!isNaN(pos)) {
            if (linkFrom && pos < parseInt(linkFrom, 10)) return false;
            if (linkTo && pos > parseInt(linkTo, 10)) return false;
          }
        }
      }

      return true;
    });
  }, [
    searchQuery,
    selectedGroups,
    mentionFrom,
    mentionTo,
    mentionNoMentions,
    mentionNotPresentInLlm,
    linkFrom,
    linkTo,
    linkNoSources,
    linkNotPresentInLlm,
  ]);

  const handleToggleMaster = () => {
    const next = !isMasterChecked;
    setIsMasterChecked(next);
    const updated: Record<string, boolean> = {};
    filteredPrompts.forEach((p) => {
      updated[p.id] = next;
    });
    setSelectedPromptIds(updated);
  };

  const handleToggleRow = (id: string) => {
    setSelectedPromptIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200">
      {/* 1. Top Notice Alert Banner */}
      {isNoticeVisible && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
              ℹ
            </span>
            <p className="leading-relaxed">
              This tool analyzes LLM results for your prompts of interest. In the LLM answers, it tracks your brand&apos;s and website&apos;s presence and positions among mentions and source links. You can also view the content of LLM answers for each date, URLs of sources provided, and more.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setIsNoticeVisible(false)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition p-1 cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs & Right Utility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href={baseHref} className="hover:text-slate-900 dark:hover:text-white font-medium transition">
            {projectDomain}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="hover:text-slate-900 dark:hover:text-white transition">AI Search</span>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <Link
            href={`${baseHref}/ai-results-tracker/rankings`}
            className="hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            AI Results Tracker
          </Link>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="font-semibold text-slate-900 dark:text-white">Rankings</span>
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsGuestLinkModalOpen(true)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <span>Guest link</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            type="button"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <span>Feedback</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Amber gauge button [ ⏱ | ▾ ] and Compact AI Results Tracker limits popover */}
          <div className="relative" ref={promptLimitRef}>
            <button
              type="button"
              aria-label="AI Results Tracker limits"
              title="Speedometer: AI Results Tracker usage & limits"
              onClick={() => setIsPromptLimitModalOpen(!isPromptLimitModalOpen)}
              className="bg-[#fde68a] hover:bg-[#fcd34d] dark:bg-amber-900/60 dark:hover:bg-amber-900 text-slate-900 dark:text-amber-100 rounded-lg flex items-center px-2 py-1 gap-1.5 transition cursor-pointer shadow-2xs select-none"
            >
              <Gauge className="w-4 h-4 text-slate-900 dark:text-amber-100" />
              <ChevronDown className="w-3 h-3 text-slate-800 dark:text-amber-200" />
            </button>

            {/* Compact AI Results Tracker Popover Card */}
            {isPromptLimitModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="AI Results Tracker limits"
                className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* 1. Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
                    <span>AI Results Tracker</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPromptLimitModalOpen(false)}
                    aria-label="Close limits popover"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-0.5"
                  >
                    ✕
                  </button>
                </div>

                {/* 2. "Provided by Plan" Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Provided by Plan</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">10 of 20</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2 mb-1.5">
                    <div className="w-1/2 h-full bg-[#2563eb] rounded-full" />
                  </div>
                  <span className="text-xs font-normal text-[#dc2626] dark:text-red-400 mt-1 mb-5 block">
                    Expires on Sep-29 2026
                  </span>
                </div>

                {/* 3. "Total" Usage Row */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                    <RotateCw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Total</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">10 of 20</span>
                </div>

                {/* 4. Divider & Pricing Callout */}
                <div className="border-t border-slate-100 dark:border-slate-800 my-4" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Prompt limit can be increased by upgrading your{" "}
                  <Link
                    href="/billing/pricing"
                    onClick={() => setIsPromptLimitModalOpen(false)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium underline"
                  >
                    pricing plan
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Title & Progress Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Rankings</h1>
            <span className="text-slate-400 text-sm cursor-help" title="Prompt presence rankings and citation coverage">
              ℹ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              100% progress
            </span>
            <button
              type="button"
              onClick={() => setIsPromptLimitModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full transition cursor-pointer"
              title="View prompt limits & usage"
            >
              10 prompts
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Last update 2026-09-21
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-nowrap shrink-0">
          <Link
            href={`${baseHref}/settings?tab=prompts`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-md shadow-xs transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>+ ADD PROMPTS</span>
          </Link>

          {/* DATA STUDIO DROPDOWN */}
          <div className="relative shrink-0" ref={dataStudioRef}>
            <button
              type="button"
              onClick={() => setIsDataStudioOpen(!isDataStudioOpen)}
              className="bg-[#534b71] hover:bg-[#453d61] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
              title="Connect / Export to Google Looker Studio"
            >
              <svg className="w-4 h-4 shrink-0 text-white fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="14.5" r="4.5" stroke="currentColor" strokeWidth="2.2" />
                <line x1="12" y1="10" x2="12" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="5.5" r="2.2" fill="currentColor" />
                <line x1="9" y1="12" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="7.5" cy="9.5" r="1.6" fill="currentColor" />
              </svg>
              <span>DATA STUDIO</span>
              <span className="text-[10px] text-white/90">▾</span>
            </button>

            {isDataStudioOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-[13px] font-normal text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
              >
                <a
                  href="https://lookerstudio.google.com/reporting/f8159147-2542-4771-88ea-673da52e1c25/page/Nic1"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDataStudioOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Rankings Templates</span>
                </a>

                <a
                  href="https://datastudio.google.com/u/0/reporting/f8159147-2542-4771-88ea-673da52e1c25/page/p_0aymb8zmyd"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDataStudioOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>AI Results Tracker Templates</span>
                </a>

                <a
                  href="https://lookerstudio.google.com/u/0/reporting/eff6ce90-e0cf-4779-888c-e87520e3beaa/page/3g5cD"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDataStudioOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Website Audit Templates</span>
                </a>

                <a
                  href="https://lookerstudio.google.com/u/0/reporting/ab8b99f7-0a05-4892-934d-34b73868e98b/page/Nic1"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDataStudioOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Competitors Templates</span>
                </a>

                <a
                  href="https://lookerstudio.google.com/reporting/9a807c59-2c50-4aa6-8a6c-bfb3c54ec155"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDataStudioOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Backlinks Checker Templates</span>
                </a>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  type="button"
                  onClick={() => {
                    setIsDataStudioOpen(false);
                    showToast("Looker Studio: Connect and visualize your AI tracker rankings in Google Looker Studio.");
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>How it works</span>
                  </div>
                  <span className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                    ?
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase px-3.5 py-2 rounded-md flex items-center gap-1.5 hover:border-slate-400 dark:hover:border-slate-600 transition shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>⬆ EXPORT</span>
          </button>

          <Link
            href={`${baseHref}/settings`}
            aria-label="Settings"
            className="p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md hover:border-slate-400 dark:hover:border-slate-600 transition shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            ⚙
          </Link>
        </div>
      </div>

      {/* 4. Filters Toolbar Row */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-2.5">
        {/* Engine / Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              🌀
            </span>
            <span>ChatGPT</span>
            <span>🇮🇳 India</span>
            <span className="text-slate-400 text-[10px]">▾</span>
          </button>
          {isEngineDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-40 py-1">
              {[
                { engine: "ChatGPT", country: "India", flag: "🇮🇳" },
                { engine: "Google AI Overviews", country: "United States", flag: "🇺🇸" },
                { engine: "Perplexity AI", country: "Global", flag: "🌐" },
                { engine: "Bing Copilot", country: "United States", flag: "🇺🇸" },
              ].map((opt) => (
                <button
                  key={opt.engine + opt.country}
                  type="button"
                  onClick={() => {
                    setSelectedEngine(opt.engine);
                    setSelectedCountry(opt.country);
                    setIsEngineDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                >
                  <span>{opt.flag}</span>
                  <span>{opt.engine}</span>
                  <span className="text-slate-400 text-[11px]">({opt.country})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            aria-label="Date range selector"
            onClick={() => {
              const next = !isDatePickerOpen;
              setIsDatePickerOpen(next);
              if (next) {
                setStagedRangeStart(appliedRangeStart);
                setStagedRangeEnd(appliedRangeEnd);
                setIsGroupDropdownOpen(false);
                setIsMentionDropdownOpen(false);
                setIsLinkDropdownOpen(false);
                setIsEngineDropdownOpen(false);
              }
            }}
            className={`rounded-md px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer shadow-xs transition ${
              isDatePickerOpen
                ? "bg-slate-200 dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 font-medium text-slate-800 dark:text-slate-200"
            }`}
          >
            <span>📅 {dateRange} ▾</span>
          </button>

          {isDatePickerOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Date range picker"
              className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[640px] max-w-[780px] animate-in fade-in zoom-in-95 duration-100 text-xs"
            >
              {/* Left & Middle: Dual-Month Side-by-Side Calendar Grids */}
              <div className="flex-1 space-y-3">
                {/* Headers row */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 relative z-30">
                  {/* Left Month Header */}
                  <div className="flex items-center justify-between w-56">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer"
                      title="Previous month"
                    >
                      ‹
                    </button>
                    <div
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      aria-label={`${CAL_FULL_MONTHS[calendarLeftMonth]} ${calendarLeftYear}`}
                    >
                      <span className="sr-only">
                        {CAL_FULL_MONTHS[calendarLeftMonth]} {calendarLeftYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLeftYearOpen((prev) => !prev);
                          setIsRightYearOpen(false);
                        }}
                        className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer select-none"
                      >
                        {CAL_FULL_MONTHS[calendarLeftMonth]}
                      </button>
                      <CalendarYearDropdown
                        year={calendarLeftYear}
                        onSelectYear={(y) => {
                          setCalendarLeftYear(y);
                          setCalendarRightYear(calendarLeftMonth === 11 ? y + 1 : y);
                        }}
                        isOpen={isLeftYearOpen}
                        onToggle={() => {
                          setIsLeftYearOpen((prev) => !prev);
                          setIsRightYearOpen(false);
                        }}
                        onClose={() => setIsLeftYearOpen(false)}
                        ariaLabel={`Select year for ${CAL_FULL_MONTHS[calendarLeftMonth]}`}
                      />
                    </div>
                    <div className="w-5" />
                  </div>

                  <div className="hidden sm:block border-r border-slate-100 dark:border-slate-800 h-6" />

                  {/* Right Month Header */}
                  <div className="flex items-center justify-between w-56">
                    <div className="w-5" />
                    <div
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      aria-label={`${CAL_FULL_MONTHS[calendarRightMonth]} ${calendarRightYear}`}
                    >
                      <span className="sr-only">
                        {CAL_FULL_MONTHS[calendarRightMonth]} {calendarRightYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRightYearOpen((prev) => !prev);
                          setIsLeftYearOpen(false);
                        }}
                        className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer select-none"
                      >
                        {CAL_FULL_MONTHS[calendarRightMonth]}
                      </button>
                      <CalendarYearDropdown
                        year={calendarRightYear}
                        onSelectYear={(y) => {
                          setCalendarRightYear(y);
                          setCalendarLeftYear(calendarRightMonth === 0 ? y - 1 : y);
                        }}
                        isOpen={isRightYearOpen}
                        onToggle={() => {
                          setIsRightYearOpen((prev) => !prev);
                          setIsLeftYearOpen(false);
                        }}
                        onClose={() => setIsRightYearOpen(false)}
                        ariaLabel={`Select year for ${CAL_FULL_MONTHS[calendarRightMonth]}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer"
                      title="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Calendar Grids side-by-side */}
                <div className="flex items-start gap-5">
                  {renderCalendarMonth(calendarLeftYear, calendarLeftMonth)}
                  <div className="border-r border-slate-100 dark:border-slate-800 h-52 hidden sm:block" />
                  {renderCalendarMonth(calendarRightYear, calendarRightMonth)}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>{formatDisplayDate(stagedRangeStart)}</span>
                    <span className="mx-1.5 text-slate-400">—</span>
                    <span>{formatDisplayDate(stagedRangeEnd)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelDateRange}
                      className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDateRange}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Shortcuts Sidebar (Right Panel) */}
              <div className="w-48 pl-4 space-y-1.5 border-l border-slate-100 dark:border-slate-800 select-none flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Presets
                </span>
                {[
                  "TODAY",
                  "YESTERDAY",
                  "LAST WEEK",
                  "LAST MONTH",
                  "PAST 7 DAYS",
                  "PAST 30 DAYS",
                  "PAST 6 MONTHS",
                  "YEAR",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`w-full border py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition text-center cursor-pointer ${
                      activePreset === preset
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}

                {/* "Compare by dates" Toggle */}
                <div
                  className="flex items-center gap-2.5 pt-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  onClick={() => setCompareByDates(!compareByDates)}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-label="Compare by dates"
                    aria-checked={compareByDates}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCompareByDates(!compareByDates);
                    }}
                    className={`w-8 h-4 rounded-full relative transition cursor-pointer flex-shrink-0 ${
                      compareByDates ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out absolute top-0.5 ${
                        compareByDates ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span className="select-none">Compare by dates</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groups Selector */}
        <div className="relative" ref={groupDropdownRef}>
          <button
            type="button"
            aria-label="Groups"
            onClick={() => {
              const next = !isGroupDropdownOpen;
              setIsGroupDropdownOpen(next);
              if (next) {
                setStagedSelectedGroups([...selectedGroups]);
                setGroupSearchQuery("");
                setIsDatePickerOpen(false);
                setIsMentionDropdownOpen(false);
                setIsLinkDropdownOpen(false);
                setIsEngineDropdownOpen(false);
              }
            }}
            className={`rounded-md px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition ${
              isGroupDropdownOpen
                ? "bg-slate-200 dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 font-medium text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>Groups ▾</span>
          </button>

          {isGroupDropdownOpen && (
            <div
              role="dialog"
              aria-label="Groups filter"
              className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Search Input */}
              <div className="relative border-b border-blue-500 pb-1.5 mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search groups"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-2 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Select All Row */}
              <div
                onClick={() => {
                  if (stagedSelectedGroups.length === AVAILABLE_GROUPS.length) {
                    setStagedSelectedGroups([]);
                  } else {
                    setStagedSelectedGroups([...AVAILABLE_GROUPS]);
                  }
                }}
                className="py-1.5 font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition"
              >
                Select all
              </div>

              {/* Single Checkbox Group Item */}
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {AVAILABLE_GROUPS.filter((g) =>
                  g.toLowerCase().includes(groupSearchQuery.toLowerCase())
                ).map((group) => {
                  const isChecked = stagedSelectedGroups.includes(group);
                  return (
                    <label
                      key={group}
                      className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none group hover:text-blue-600 transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStagedSelectedGroups([...stagedSelectedGroups, group]);
                          } else {
                            setStagedSelectedGroups(
                              stagedSelectedGroups.filter((g) => g !== group)
                            );
                          }
                        }}
                        aria-label={group}
                        className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {group}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Full-width Apply Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedGroups([...stagedSelectedGroups]);
                  setIsGroupDropdownOpen(false);
                }}
                className="w-full bg-[#2b66ff] hover:bg-blue-600 text-white font-semibold py-2 mt-3 rounded-md text-xs shadow-xs transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Mention Position */}
        <div className="relative">
          <button
            type="button"
            aria-label="Mention position"
            onClick={() => {
              setIsMentionDropdownOpen(!isMentionDropdownOpen);
              setIsLinkDropdownOpen(false);
              setIsGroupDropdownOpen(false);
              setIsEngineDropdownOpen(false);
              setIsDatePickerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium shadow-2xs transition cursor-pointer ${
              mentionFrom || mentionTo || mentionNoMentions || mentionNotPresentInLlm
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>
              {mentionFrom || mentionTo
                ? `Mention: ${mentionFrom || "1"}-${mentionTo || "100"} ▾`
                : mentionNoMentions
                ? "Mention: No mentions ▾"
                : mentionNotPresentInLlm
                ? "Mention: Not in LLM ▾"
                : "Mention position ▾"}
            </span>
          </button>
          {isMentionDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Mention position
              </div>

              {/* From - To input range */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">From</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    max="100"
                    value={mentionFrom}
                    onChange={(e) => setMentionFrom(e.target.value)}
                    aria-label="Mention position from"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-slate-400 mt-4">–</span>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">To</label>
                  <input
                    type="number"
                    placeholder="100"
                    min="1"
                    max="100"
                    value={mentionTo}
                    onChange={(e) => setMentionTo(e.target.value)}
                    aria-label="Mention position to"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={mentionNoMentions}
                    onChange={(e) => setMentionNoMentions(e.target.checked)}
                    aria-label="No mentions"
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300">No mentions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={mentionNotPresentInLlm}
                    onChange={(e) => setMentionNotPresentInLlm(e.target.checked)}
                    aria-label="Not present in LLM answer"
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Not present in LLM answer</span>
                </label>
              </div>

              {/* Action buttons: Apply & Reset */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMentionFrom("");
                    setMentionTo("");
                    setMentionNoMentions(false);
                    setMentionNotPresentInLlm(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMentionDropdownOpen(false)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer shadow-xs transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Link Position */}
        <div className="relative">
          <button
            type="button"
            aria-label="Link position"
            onClick={() => {
              setIsLinkDropdownOpen(!isLinkDropdownOpen);
              setIsMentionDropdownOpen(false);
              setIsGroupDropdownOpen(false);
              setIsEngineDropdownOpen(false);
              setIsDatePickerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium shadow-2xs transition cursor-pointer ${
              linkFrom || linkTo || linkNoSources || linkNotPresentInLlm
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>
              {linkFrom || linkTo
                ? `Link: ${linkFrom || "1"}-${linkTo || "100"} ▾`
                : linkNoSources
                ? "Link: No sources ▾"
                : linkNotPresentInLlm
                ? "Link: Not in LLM ▾"
                : "Link position ▾"}
            </span>
          </button>
          {isLinkDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Link position
              </div>

              {/* From - To input range */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">From</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    max="100"
                    value={linkFrom}
                    onChange={(e) => setLinkFrom(e.target.value)}
                    aria-label="Link position from"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-slate-400 mt-4">–</span>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">To</label>
                  <input
                    type="number"
                    placeholder="100"
                    min="1"
                    max="100"
                    value={linkTo}
                    onChange={(e) => setLinkTo(e.target.value)}
                    aria-label="Link position to"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkNoSources}
                    onChange={(e) => setLinkNoSources(e.target.checked)}
                    aria-label="No sources"
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300">No sources</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkNotPresentInLlm}
                    onChange={(e) => setLinkNotPresentInLlm(e.target.checked)}
                    aria-label="Not present in LLM answer"
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Not present in LLM answer</span>
                </label>
              </div>

              {/* Action buttons: Apply & Reset */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLinkFrom("");
                    setLinkTo("");
                    setLinkNoSources(false);
                    setLinkNotPresentInLlm(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsLinkDropdownOpen(false)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer shadow-xs transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Summary KPI Metric Cards (3 side-by-side benchmarking cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: MENTION & LINK PRESENCE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span>MENTION &amp; LINK PRESENCE</span>
              <span className="text-slate-400 cursor-help" title="Overall percentage of LLM answers containing your brand mention or link">
                ℹ
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">0%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Answers with your mention</div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">0%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Answers with your link</div>
            </div>
          </div>
        </div>

        {/* Card 2: TOP 3 PRESENCE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span>TOP 3 PRESENCE</span>
              <span className="text-slate-400 cursor-help" title="Percentage of LLM answers featuring your mention or link in top 3 positions">
                ℹ
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">0%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Answers with your mention in Top 3</div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">0%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Answers with your link in Top 3</div>
            </div>
          </div>
        </div>

        {/* Card 3: SOURCES PRESENCE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span>SOURCES PRESENCE</span>
              <span className="text-slate-400 cursor-help" title="Answers where generative engine surfaced external source links">
                ℹ
              </span>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">20%</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center">
                ▼ 80
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Answers with source links</div>

            {/* Sparkline chart showing historical descent */}
            <div className="pt-2 h-10 w-full">
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M 0 5 L 50 15 L 100 28"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="5" r="2.5" fill="#f43f5e" />
                <circle cx="50" cy="15" r="2.5" fill="#f43f5e" />
                <circle cx="100" cy="28" r="2.5" fill="#f43f5e" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Collapsible "Insights & recommendations" Panel */}
      <div className="bg-[#f8f7ff] dark:bg-slate-900/60 border border-purple-100 dark:border-purple-950/40 rounded-2xl p-5 mb-6 transition-all duration-200">
        <div
          onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="text-sm font-bold text-[#6355d8] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#6355d8]" />
            <span>Insights &amp; recommendations</span>
            <span
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer ml-1"
              title="Opportunities uncovered from search engine AI Overviews"
              onClick={(e) => e.stopPropagation()}
            >
              ℹ
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle insights"
            className="text-slate-600 dark:text-slate-300 p-1 cursor-pointer"
          >
            {isInsightsExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isInsightsExpanded && (
          <div className="mt-4">
            {!isViewMoreInsights ? (
              /* Stacked Deck Preview Mode matching Screenshot 1 */
              <div className="relative">
                {/* Card 1: 19 untracked keywords have AI Overviews */}
                <div className="relative z-10 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    19 untracked keywords have AI Overviews
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    19 keywords in your Rankings have AI Overviews in the SERP, but aren’t tracked as prompts in the AI Results Tracker. We recommend tracking them to improve visibility.{" "}
                    <button
                      type="button"
                      onClick={() => router.push(`${baseHref}/settings?tab=prompts`)}
                      className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline cursor-pointer inline"
                    >
                      Start tracking
                    </button>
                  </p>
                  <div className="flex items-center">
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mr-2 mt-2.5">
                      Opportunities
                    </span>
                    <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mt-2.5">
                      AI Overviews
                    </span>
                  </div>
                </div>

                {/* Stacked Deck Visual Layers */}
                <div className="mx-2 h-2.5 bg-white/80 dark:bg-slate-800/80 border border-t-0 border-slate-200/70 dark:border-slate-700/70 rounded-b-xl -mt-0.5 shadow-xs" />
                <div className="mx-4 h-2 bg-white/50 dark:bg-slate-800/50 border border-t-0 border-slate-200/50 dark:border-slate-700/50 rounded-b-xl -mt-1 shadow-xs" />

                {/* Center Overlapping Action Button */}
                <div className="flex justify-center -mt-2.5 relative z-20">
                  <button
                    type="button"
                    onClick={() => setIsViewMoreInsights(true)}
                    className="bg-[#6355d8] hover:bg-[#5244c4] text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-xs transition cursor-pointer"
                  >
                    View more insights
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded 4-Card Stacked Mode matching Screenshots 2 & 3 */
              <div className="space-y-3.5">
                {/* Card 1: 19 untracked keywords have AI Overviews */}
                <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    19 untracked keywords have AI Overviews
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    19 keywords in your Rankings have AI Overviews in the SERP, but aren’t tracked as prompts in the AI Results Tracker. We recommend tracking them to improve visibility.{" "}
                    <button
                      type="button"
                      onClick={() => router.push(`${baseHref}/settings?tab=prompts`)}
                      className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline cursor-pointer inline"
                    >
                      Start tracking
                    </button>
                  </p>
                  <div className="flex items-center">
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mr-2 mt-2.5">
                      Opportunities
                    </span>
                    <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mt-2.5">
                      AI Overviews
                    </span>
                  </div>
                </div>

                {/* Card 2: 5 sources are boosting tracked competitors */}
                <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    5 sources are boosting tracked competitors
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your tracked competitors appear in 5 sources across 6 AI answers—partnering with them can boost your future visibility.{" "}
                    <Link
                      href={`${baseHref}/ai-results-tracker/sources?sourceType=competitors`}
                      className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline cursor-pointer inline"
                    >
                      View sources
                    </Link>
                  </p>
                  <div className="flex items-center">
                    <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mr-2 mt-2.5">
                      Mentions
                    </span>
                    <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mt-2.5">
                      Competitors
                    </span>
                  </div>
                </div>

                {/* Card 3: 32 sources don’t mention your brand yet (Highlighted Indigo/Purple Border) */}
                <div className="bg-white dark:bg-slate-800/90 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    32 sources don’t mention your brand yet
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    These 32 sources appeared in 45 AI answers without mentioning your brand. Partnering with them may help you get included in future answers.
                  </p>
                  <Link
                    href={`${baseHref}/ai-results-tracker/sources?sourceType=unmentioned`}
                    className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline cursor-pointer block mt-1.5"
                  >
                    View sources
                  </Link>
                  <div className="flex items-center">
                    <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mr-2 mt-2.5">
                      Mentions
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mt-2.5">
                      Opportunities
                    </span>
                  </div>
                </div>

                {/* Card 4: 32 new sources */}
                <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    32 new sources
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    These 32 sources discovered last month didn’t mention your brand—partnering with them could improve future coverage.{" "}
                    <Link
                      href={`${baseHref}/ai-results-tracker/sources?sourceType=new`}
                      className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline cursor-pointer inline"
                    >
                      View sources
                    </Link>
                  </p>
                  <div className="flex items-center">
                    <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mr-2 mt-2.5">
                      Mentions
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block mt-2.5">
                      Opportunities
                    </span>
                  </div>
                </div>

                {/* Footer Centered Collapse Button */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsViewMoreInsights(false)}
                    className="bg-[#6355d8] hover:bg-[#5244c4] text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-xs transition cursor-pointer"
                  >
                    View less insights
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Chart Views & Timeline Filter */}
      {(() => {
        const activeChartData = PRESENCE_INTERVAL_DATA[timelineRange] || PRESENCE_INTERVAL_DATA.CURRENT;
        const scopeKey = chartScope === "TOP 3" ? "top3" : "general";
        const mentionValues = activeChartData.mention[scopeKey];
        const linkValues = activeChartData.link[scopeKey];
        const sourcesValues = activeChartData.sources[scopeKey];
        const len = activeChartData.labels.length;

        // Coordinates calculator for SVG (viewBox 0 0 300 120)
        const calcCoords = (values: number[]) => {
          return values.map((val, idx) => {
            const x = len <= 1 ? 150 : 20 + (idx / (len - 1)) * 260;
            const clamped = Math.max(0, Math.min(100, val));
            const y = 15 + 90 - (clamped / 100) * 90;
            return { x, y, val };
          });
        };

        const mentionCoords = calcCoords(mentionValues);
        const linkCoords = calcCoords(linkValues);
        const sourcesCoords = calcCoords(sourcesValues);

        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-4">
            {/* Primary Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mention_link");
                  setChartHoverIndex(null);
                }}
                className={`pb-2.5 transition cursor-pointer ${
                  activeTab === "mention_link"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                MENTION &amp; LINK PRESENCE
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("sources");
                  setChartHoverIndex(null);
                }}
                className={`pb-2.5 transition cursor-pointer ${
                  activeTab === "sources"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                SOURCES PRESENCE
              </button>
            </div>

            {/* Timeline Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {(["CURRENT", "7D", "1M", "3M", "6M", "12M"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTimelineRange(t);
                      setChartHoverIndex(null);
                    }}
                    className={`font-semibold cursor-pointer pb-0.5 transition ${
                      timelineRange === t
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <span className="text-slate-300 dark:text-slate-700">|</span>

                {/* Group By Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1 font-medium transition"
                    aria-label="Group by"
                  >
                    <span>GROUP BY: {groupByOption}</span>
                    <span className="text-[10px]">▾</span>
                  </button>
                  {isGroupByOpen && (
                    <div className="absolute top-full mt-1.5 left-0 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30 py-1 text-xs">
                      {(["DAYS", "WEEKS", "MONTHS"] as const).map((gb) => (
                        <button
                          key={gb}
                          type="button"
                          onClick={() => {
                            setGroupByOption(gb);
                            setIsGroupByOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer ${
                            groupByOption === gb
                              ? "font-bold text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {gb}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scope buttons */}
              <div className="flex items-center gap-3 font-semibold">
                {(["GENERAL", "TOP 3"] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => {
                      setChartScope(sc);
                      setChartHoverIndex(null);
                    }}
                    className={`cursor-pointer pb-0.5 transition ${
                      chartScope === sc
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Presence Chart Canvas */}
            <div className="pt-2">
              {/* SVG Presence Chart with Y-Axis and X-Axis */}
              <div className="relative h-44 w-full flex items-end">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between h-full pr-3 text-[10px] text-slate-400 font-mono py-1">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Chart Area */}
                <div
                  className="flex-1 h-full relative border-b border-l border-slate-200 dark:border-slate-800"
                  onMouseLeave={() => setChartHoverIndex(null)}
                >
                  {/* Horizontal Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full"></div>
                    <div className="border-b border-dashed border-slate-200 dark:border-slate-700 w-full"></div>
                    <div></div>
                  </div>

                  {/* SVG Curves */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                    {/* Hover vertical guideline */}
                    {chartHoverIndex !== null && chartHoverIndex < len && (
                      <line
                        x1={len <= 1 ? 150 : 20 + (chartHoverIndex / (len - 1)) * 260}
                        y1="0"
                        x2={len <= 1 ? 150 : 20 + (chartHoverIndex / (len - 1)) * 260}
                        y2="120"
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                        className="pointer-events-none"
                      />
                    )}

                    {activeTab === "mention_link" ? (
                      <>
                        {/* Mention presence curve */}
                        {showMentionPresence && (
                          <>
                            <polyline
                              points={mentionCoords.map((c) => `${c.x},${c.y}`).join(" ")}
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {mentionCoords.map((c, idx) => (
                              <circle
                                key={`mc-${idx}`}
                                cx={c.x}
                                cy={c.y}
                                r={chartHoverIndex === idx ? 5 : 3.5}
                                fill="#2563eb"
                                className="transition-all duration-150"
                              />
                            ))}
                          </>
                        )}

                        {/* Link presence curve */}
                        {showLinkPresence && (
                          <>
                            <polyline
                              points={linkCoords.map((c) => `${c.x},${c.y}`).join(" ")}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {linkCoords.map((c, idx) => (
                              <circle
                                key={`lc-${idx}`}
                                cx={c.x}
                                cy={c.y}
                                r={chartHoverIndex === idx ? 5 : 3.5}
                                fill="#10b981"
                                className="transition-all duration-150"
                              />
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Sources presence curve */}
                        {showSourcesPresence && (
                          <>
                            <polyline
                              points={sourcesCoords.map((c) => `${c.x},${c.y}`).join(" ")}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {sourcesCoords.map((c, idx) => (
                              <circle
                                key={`sc-${idx}`}
                                cx={c.x}
                                cy={c.y}
                                r={chartHoverIndex === idx ? 5 : 3.5}
                                fill="#38bdf8"
                                className="transition-all duration-150"
                              />
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {/* Invisible column overlay for hover detection */}
                    {activeChartData.labels.map((_, idx) => {
                      const colWidth = len <= 1 ? 300 : 260 / (len - 1);
                      const colX = len <= 1 ? 0 : Math.max(0, 20 + idx * colWidth - colWidth / 2);
                      return (
                        <rect
                          key={`hover-col-${idx}`}
                          x={colX}
                          y="0"
                          width={colWidth}
                          height="120"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setChartHoverIndex(idx)}
                        />
                      );
                    })}
                  </svg>

                  {/* Tooltip on hover */}
                  {chartHoverIndex !== null && chartHoverIndex < len && (
                    <div
                      className="absolute z-20 pointer-events-none bg-slate-900 dark:bg-slate-950 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap transition-all duration-75"
                      style={{
                        left: `${((len <= 1 ? 150 : 20 + (chartHoverIndex / (len - 1)) * 260) / 300) * 100}%`,
                        top: "10%",
                        transform:
                          chartHoverIndex === 0
                            ? "translate(5%, 0%)"
                            : chartHoverIndex === len - 1
                            ? "translate(-105%, 0%)"
                            : "translate(-50%, 0%)",
                      }}
                    >
                      <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800 text-[10px]">
                        {activeChartData.labels[chartHoverIndex]} 2026
                      </div>
                      {activeTab === "mention_link" ? (
                        <div className="space-y-0.5 pt-1">
                          {showMentionPresence && (
                            <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              <span>Mention: {mentionCoords[chartHoverIndex]?.val}%</span>
                            </div>
                          )}
                          {showLinkPresence && (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Link: {linkCoords[chartHoverIndex]?.val}%</span>
                            </div>
                          )}
                          {!showMentionPresence && !showLinkPresence && (
                            <div className="text-slate-400 text-[10px]">No series selected</div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-1">
                          {showSourcesPresence ? (
                            <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                              <span>Sources: {sourcesCoords[chartHoverIndex]?.val}%</span>
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[10px]">No series selected</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between pl-8 pr-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {activeChartData.labels.map((label, idx) => (
                  <span
                    key={`lbl-${idx}`}
                    className={`transition ${
                      chartHoverIndex === idx ? "text-blue-600 dark:text-blue-400 font-bold" : ""
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Bottom Series Toggle Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {activeTab === "mention_link" ? (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showMentionPresence}
                        onChange={(e) => setShowMentionPresence(e.target.checked)}
                        aria-label="Mention presence"
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <span>• Mention presence</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showLinkPresence}
                        onChange={(e) => setShowLinkPresence(e.target.checked)}
                        aria-label="Link presence"
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>• Link presence</span>
                      </span>
                    </label>
                  </>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showSourcesPresence}
                      onChange={(e) => setShowSourcesPresence(e.target.checked)}
                      aria-label="Sources presence"
                      className="w-3.5 h-3.5 rounded text-sky-500 focus:ring-sky-400 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                      <span>• Sources presence</span>
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 8. Prompts Table with Group/List View Mode & Tooltips */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-2">
        {/* Table Toolbar Header & "View mode" Dropdown */}
        <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {filteredPrompts.length} prompts
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 🔍"
                className="w-48 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs placeholder-slate-400 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <span className="text-[11px] text-slate-400">View mode:</span>
            <button
              type="button"
              onClick={() => setIsViewModeDropdownOpen(!isViewModeDropdownOpen)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{viewMode === "groups" ? "📁 Groups" : ":= List"}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {isViewModeDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("list");
                    setIsViewModeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${
                    viewMode === "list"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>:=</span>
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("groups");
                    setIsViewModeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition ${
                    viewMode === "groups"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📁</span>
                  <span>Groups</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="w-8 px-3 py-2 text-center" rowSpan={2}>
                  <input
                    type="checkbox"
                    checked={isMasterChecked}
                    onChange={handleToggleMaster}
                    aria-label="Select all prompts"
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 min-w-[280px]" rowSpan={2}>Prompt</th>
                <th className="px-3 py-2 min-w-[140px]" rowSpan={2}>URL</th>
                <th className="px-3 py-1 text-center border-l border-slate-200 dark:border-slate-800" colSpan={2}>
                  Sep-19 2026
                </th>
                <th className="px-3 py-1 text-center border-l border-slate-200 dark:border-slate-800" colSpan={2}>
                  Sep-20 2026
                </th>
                <th className="px-3 py-1 text-center border-l border-slate-200 dark:border-slate-800" colSpan={2}>
                  Sep-21 2026
                </th>
              </tr>
              <tr className="border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                <th className="px-2 py-1 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Mention</th>
                <th className="px-2 py-1 text-center font-medium">Link</th>
                <th className="px-2 py-1 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Mention</th>
                <th className="px-2 py-1 text-center font-medium">Link</th>
                <th className="px-2 py-1 text-center border-l border-slate-200 dark:border-slate-800 font-medium">Mention</th>
                <th className="px-2 py-1 text-center font-medium">Link</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Folder Header Row (When in "Groups" view mode) */}
              {viewMode === "groups" && (
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-white">
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setIsFolderExpanded(!isFolderExpanded)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {isFolderExpanded ? "▾" : "▸"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 flex items-center gap-2">
                    <span className="text-amber-500">📁</span>
                    <span>General</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      10
                    </span>
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      Main
                    </span>
                    <button type="button" className="text-slate-400 hover:text-slate-600 px-1 ml-1 cursor-pointer">
                      ⋮
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">—</td>
                  <td className="px-2 py-2.5 text-center border-l border-slate-200 dark:border-slate-800">0%</td>
                  <td className="px-2 py-2.5 text-center">0%</td>
                  <td className="px-2 py-2.5 text-center border-l border-slate-200 dark:border-slate-800">0%</td>
                  <td className="px-2 py-2.5 text-center">0%</td>
                  <td className="px-2 py-2.5 text-center border-l border-slate-200 dark:border-slate-800">0%</td>
                  <td className="px-2 py-2.5 text-center">0%</td>
                </tr>
              )}

              {/* Prompt Rows */}
              {(viewMode === "list" || isFolderExpanded) &&
                filteredPrompts.map((p) => {
                  const isChecked = !!selectedPromptIds[p.id];
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition text-slate-700 dark:text-slate-300 ${
                        isChecked ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(p.id)}
                          aria-label={`Select prompt ${p.id}`}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Prompt Text with User indicator if present */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {p.hasUserIcon && <span className="text-slate-400 text-xs">👥</span>}
                          <span className="font-medium text-slate-900 dark:text-slate-100 max-w-sm sm:max-w-md truncate">
                            {p.promptText}
                          </span>
                          <button
                            type="button"
                            title="Action options"
                            className="text-slate-400 hover:text-slate-600 ml-auto px-1 cursor-pointer opacity-70 hover:opacity-100"
                          >
                            ⋮
                          </button>
                        </div>
                      </td>

                      {/* URL with link icon */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          <span className="text-slate-400">🔗</span>
                          <span className="truncate">{p.targetUrl}</span>
                        </div>
                      </td>

                      {/* Sep-19 */}
                      <td className="px-2 py-2 text-center border-l border-slate-200 dark:border-slate-800 text-slate-400">
                        {p.results["Sep-19 2026"].mentionText}
                      </td>
                      <td
                        data-testid="link-result-cell"
                        onMouseEnter={() => setHoveredCellId(`${p.id}-sep19-link`)}
                        onMouseLeave={() => setHoveredCellId(null)}
                        className="px-2 py-2 text-center text-slate-400 relative cursor-help"
                      >
                        {p.results["Sep-19 2026"].linkText}
                        {hoveredCellId === `${p.id}-sep19-link` && (
                          <div className="absolute right-0 top-full mt-1 bg-[#20252b] text-white text-xs p-2.5 rounded-md shadow-2xl z-50 animate-in fade-in duration-100 w-56 text-left whitespace-normal leading-normal">
                            Website isn’t listed among 5 sources. Click to view details.
                          </div>
                        )}
                      </td>

                      {/* Sep-20 */}
                      <td className="px-2 py-2 text-center border-l border-slate-200 dark:border-slate-800 text-slate-400">
                        {p.results["Sep-20 2026"].mentionText}
                      </td>
                      <td
                        data-testid="link-result-cell"
                        onMouseEnter={() => setHoveredCellId(`${p.id}-sep20-link`)}
                        onMouseLeave={() => setHoveredCellId(null)}
                        className="px-2 py-2 text-center text-slate-400 relative cursor-help"
                      >
                        {p.results["Sep-20 2026"].linkText}
                        {hoveredCellId === `${p.id}-sep20-link` && (
                          <div className="absolute right-0 top-full mt-1 bg-[#20252b] text-white text-xs p-2.5 rounded-md shadow-2xl z-50 animate-in fade-in duration-100 w-56 text-left whitespace-normal leading-normal">
                            Website isn’t listed among 5 sources. Click to view details.
                          </div>
                        )}
                      </td>

                      {/* Sep-21 */}
                      <td className="px-2 py-2 text-center border-l border-slate-200 dark:border-slate-800 text-slate-400">
                        {p.results["Sep-21 2026"].mentionText}
                      </td>
                      <td
                        data-testid="link-result-cell"
                        onMouseEnter={() => setHoveredCellId(`${p.id}-sep21-link`)}
                        onMouseLeave={() => setHoveredCellId(null)}
                        className="px-2 py-2 text-center text-slate-400 relative cursor-help"
                      >
                        {p.results["Sep-21 2026"].linkText}
                        {hoveredCellId === `${p.id}-sep21-link` && (
                          <div className="absolute right-0 top-full mt-1 bg-[#20252b] text-white text-xs p-2.5 rounded-md shadow-2xl z-50 animate-in fade-in duration-100 w-56 text-left whitespace-normal leading-normal">
                            Website isn’t listed among 5 sources. Click to view details.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Page:</span>
            <input
              type="number"
              min={1}
              value={pageNumber}
              onChange={(e) => setPageNumber(parseInt(e.target.value, 10) || 1)}
              className="w-12 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-center text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>Showing 1 - {filteredPrompts.length} of {filteredPrompts.length}</div>
        </div>
      </div>

      {/* Add Prompts Modal */}
      {isAddPromptModalOpen && (
        <div
          role="dialog"
          aria-label="Add Prompts Modal"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✨</span>
                <span>Add Tracked Prompts</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPromptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prompts (one per line)
                </label>
                <textarea
                  rows={4}
                  value={promptsInput}
                  onChange={(e) => setPromptsInput(e.target.value)}
                  placeholder="e.g. What are the best tools for remote team collaboration?"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPromptModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPromptModalOpen(false);
                    setPromptsInput("");
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                >
                  Save Prompts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Guest Link Modal */}
      {isGuestLinkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-link-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGuestLinkModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col text-xs text-slate-800 dark:text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <div>
                  <h2 id="guest-link-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Get access to guest links
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share read-only real-time rankings and competitor data without requiring user accounts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuestLinkModalOpen(false)}
                aria-label="Close guest link modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Guest Link URL bar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Generated Guest Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={guestUrl}
                    aria-label="Generated guest link URL"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 select-all focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyGuestLink}
                    aria-label="Copy link"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition shrink-0 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {copiedGuestLink ? (
                        <path d="M20 6L9 17l-5-5"></path>
                      ) : (
                        <>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </>
                      )}
                    </svg>
                    <span>{copiedGuestLink ? "Copied!" : "Copy link"}</span>
                  </button>
                </div>
                {copiedGuestLink && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Link copied to clipboard successfully!
                  </p>
                )}
              </div>

              {/* Privacy & Filter Toggles */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Display & Filter Settings
                </h3>

                {/* Toggle 1: Hide search volume */}
                <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Hide search volume
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Conceal search volume numbers from guests for confidential keyword targets.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideSearchVolume}
                    onChange={(e) => setHideSearchVolume(e.target.checked)}
                    aria-label="Hide search volume"
                    data-testid="guest-link-hide-sv-toggle"
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                {/* Toggle 2: Include filtering and sorting */}
                <label className="flex items-start justify-between gap-3 cursor-pointer select-none pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Include filters and sorting
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Preserve currently applied position tiers, tags, search queries, and date ranges.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeFilteringAndSorting}
                    onChange={(e) => setIncludeFilteringAndSorting(e.target.checked)}
                    aria-label="Include filters and sorting"
                    data-testid="guest-link-include-filters-toggle"
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Module Access Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Sections Accessible to Guests
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Select which workspace modules can be accessed using this link:
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllGuestModules}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllGuestModules}
                      className="text-slate-500 hover:underline cursor-pointer font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AI_GUEST_MODULE_DEFINITIONS.map((mod) => {
                    const isSelected = !!enabledGuestModules[mod.key];
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100 shadow-xs"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setEnabledGuestModules((prev) => ({
                              ...prev,
                              [mod.key]: !prev[mod.key],
                            }))
                          }
                          aria-label={mod.label}
                          data-testid={`guest-module-${mod.key}`}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{mod.icon}</span>
                            <span className="text-xs font-semibold">{mod.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {mod.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  Link access: <strong>Read-only</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGuestLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={handleCopyGuestLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                >
                  <span>{copiedGuestLink ? "Copied!" : "Copy link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExportModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col text-xs text-slate-800 dark:text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 text-base font-bold">
                  ⬆
                </span>
                <div>
                  <h2 id="export-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Export AI Rankings data
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download tracked prompt positions, presence metrics, and source citations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close export modal"
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Search Engine Selector */}
              <div className="space-y-1.5">
                <label htmlFor="export-search-engine-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Search Engine
                </label>
                <select
                  id="export-search-engine-select"
                  aria-label="Export search engine"
                  value={exportSearchEngine}
                  onChange={(e) => setExportSearchEngine(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="chatgpt-india">ChatGPT (India) 🇮🇳</option>
                  <option value="google-aio-us">Google AI Overviews (United States) 🇺🇸</option>
                  <option value="perplexity-global">Perplexity AI (Global) 🌐</option>
                  <option value="copilot-us">Bing Copilot (United States) 🇺🇸</option>
                </select>
              </div>

              {/* Include Ranking Changes Toggle */}
              <label className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Include ranking changes
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Include position deltas and presence shift calculations compared to prior tracking day.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={includeRankingChanges}
                  onChange={(e) => setIncludeRankingChanges(e.target.checked)}
                  aria-label="Include ranking changes"
                  className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* Format Selection Cards */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  File Format
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Excel (.xlsx) Card */}
                  <button
                    type="button"
                    onClick={() => setExportFormat("xlsx")}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 cursor-pointer ${
                      exportFormat === "xlsx"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">📊</span>
                      {exportFormat === "xlsx" && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Excel (.xlsx)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Max. 10K rows</div>
                    </div>
                  </button>

                  {/* CSV (.csv) Card */}
                  <button
                    type="button"
                    onClick={() => setExportFormat("csv")}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 cursor-pointer ${
                      exportFormat === "csv"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">📄</span>
                      {exportFormat === "csv" && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">CSV (.csv)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Max. 100K rows</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
