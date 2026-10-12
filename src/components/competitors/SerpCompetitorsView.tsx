"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { CompetitorDto } from "@/lib/types";
import { GuestLinkModal } from "./GuestLinkModal";
import { CalendarYearDropdown } from "./CalendarYearDropdown";

export interface SerpCompetitorsViewProps {
  projectId: string;
  projectDomain?: string;
  competitors?: CompetitorDto[];
}

export type SerpDisplayMode = "URL" | "DOMAIN";
export type SerpDepthTier = "TOP 100" | "TOP 50" | "TOP 30" | "TOP 20" | "TOP 10";
export type SerpExportScope = "selected" | "group";

export interface SerpKeywordItem {
  id: string;
  keyword: string;
  searchVolume: number;
  searchVolumeDisplay: string;
  group: string;
  tags?: string[];
}

export const SERP_PROJECT_KEYWORDS: SerpKeywordItem[] = [
  {
    id: "kw-1",
    keyword: "work composer download",
    searchVolume: 210,
    searchVolumeDisplay: "210",
    group: "Brand",
    tags: ["core", "branded"],
  },
  {
    id: "kw-2",
    keyword: "work composer",
    searchVolume: 590,
    searchVolumeDisplay: "590",
    group: "General",
    tags: ["core", "branded"],
  },
  {
    id: "kw-3",
    keyword: "work composer hack",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    group: "Brand",
    tags: ["high-intent"],
  },
  {
    id: "kw-4",
    keyword: "workpuls idle time",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    group: "Competitor",
    tags: ["idle-time"],
  },
  {
    id: "kw-5",
    keyword: "idle time tracker",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    group: "Features",
    tags: ["idle-time", "tracking"],
  },
  {
    id: "kw-6",
    keyword: "idle time tracking",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    group: "Features",
    tags: ["idle-time", "tracking"],
  },
  {
    id: "kw-7",
    keyword: "idle time tracking software",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    group: "Features",
    tags: ["software", "high-intent"],
  },
  {
    id: "kw-8",
    keyword: "composer download",
    searchVolume: 1900,
    searchVolumeDisplay: "1.9K",
    group: "Brand",
    tags: ["download"],
  },
  {
    id: "kw-9",
    keyword: "working track",
    searchVolume: 480,
    searchVolumeDisplay: "480",
    group: "General",
    tags: ["tracking"],
  },
  {
    id: "kw-10",
    keyword: "screenshot time tracking",
    searchVolume: 110,
    searchVolumeDisplay: "110",
    group: "Features",
    tags: ["tracking", "screenshot"],
  },
];

export const ALL_KEYWORD_TAGS = [
  "core",
  "branded",
  "high-intent",
  "idle-time",
  "tracking",
  "software",
  "download",
  "screenshot",
];

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

const formatDisplayDate = (d: Date, uppercase = true) => {
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[d.getMonth()];
  const y = d.getFullYear();
  const str = `${day} ${m} ${y}`;
  return uppercase ? str.toUpperCase() : str;
};

interface SerpRankingEntry {
  rank: number;
  domain: string;
  url: string;
  change?: number;
  snippet?: string;
}

// Mock SERP database generator for dates and keywords
export function generateSerpData(keyword: string, date: string, targetDomain: string, competitors: string[]): SerpRankingEntry[] {
  const compList = competitors.length > 0 ? competitors : ["insightful.io", "timedoctor.com", "hubstaff.com", "clockify.me", "activtrak.com"];

  const commonDomains = [
    { domain: "getcomposer.org", path: "/download" },
    { domain: "softwarefinder.com", path: "/reviews/time-tracker" },
    { domain: "softwareadvice.com", path: "/p/productivity-tools" },
    { domain: "github.com", path: "/composer/composer" },
    { domain: "capterra.com", path: "/software/workforce-tracker" },
    { domain: "g2.com", path: "/categories/time-tracking" },
    { domain: "trustradius.com", path: "/products/monitoring" },
    { domain: "pcmag.com", path: "/picks/the-best-time-tracking-software" },
    { domain: "techradar.com", path: "/best/best-time-management-apps" },
    { domain: "zdnet.com", path: "/article/best-productivity-apps" },
    { domain: "reddit.com", path: "/r/productivity/comments/best_tools" },
    { domain: "quora.com", path: "/What-is-the-best-time-tracking-software" },
    { domain: "wikipedia.org", path: "/wiki/Time_tracking_software" },
    { domain: "alternativeto.net", path: "/software/time-doctor" },
    { domain: "producthunt.com", path: "/topics/productivity" },
    { domain: "slant.co", path: "/topics/time-trackers" },
    { domain: "sourceforge.net", path: "/directory/productivity" },
    { domain: "forbes.com", path: "/advisor/business/software/best-time-tracking" },
    { domain: "medium.com", path: "/tag/productivity-apps" },
    { domain: "atlassian.com", path: "/software/jira/time-tracking" },
    { domain: "monday.com", path: "/features/time-tracking" },
    { domain: "asana.com", path: "/features/work-management" },
    { domain: "clickup.com", path: "/features/time-estimates" },
    { domain: "toggl.com", path: "/track" },
    { domain: "harvestapp.com", path: "/features" },
    { domain: "everhour.com", path: "/integrations" },
    { domain: "desktime.com", path: "/features" },
    { domain: "rescuetime.com", path: "/tour" },
    { domain: "teramind.co", path: "/product/employee-monitoring" },
    { domain: "monitask.com", path: "/features" },
  ];

  const results: SerpRankingEntry[] = [];

  // Rank 1: Project Target Domain
  results.push({
    rank: 1,
    domain: targetDomain,
    url: `https://${targetDomain}/features/time-tracking`,
    change: 0,
    snippet: `Official website for ${targetDomain} - Comprehensive workforce management and automated tracking.`,
  });

  // Rank 2 to 4: Non-competitor high authority sites
  results.push({
    rank: 2,
    domain: "getcomposer.org",
    url: "https://getcomposer.org/download",
    change: 1,
    snippet: "Composer is a tool for dependency management in PHP. It allows you to declare libraries.",
  });
  results.push({
    rank: 3,
    domain: "softwarefinder.com",
    url: "https://softwarefinder.com/reviews/work-composer",
    change: -1,
    snippet: "Verified reviews, feature analysis, and pricing comparison of top workforce tools.",
  });
  results.push({
    rank: 4,
    domain: "softwareadvice.com",
    url: "https://softwareadvice.com/productivity/time-tracking-guide",
    change: 0,
    snippet: "Buyer guide and user ratings for top-rated corporate monitoring platforms.",
  });

  // Inject known competitors in ranks 5-10
  const compOffsets: Record<string, number> = {
    "SEP-17 2026": 0,
    "SEP-18 2026": 1,
    "SEP-19 2026": -1,
  };
  const offset = compOffsets[date] || 0;

  compList.forEach((cDomain, idx) => {
    const cleanDomain = cDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const rank = 5 + idx;
    results.push({
      rank,
      domain: cleanDomain,
      url: `https://${cleanDomain}/compare/${targetDomain.replace(/\..*$/, "")}`,
      change: ((idx % 3) - 1) + offset,
      snippet: `How ${cleanDomain} compares to other tools in the industry with modern features.`,
    });
  });

  // Fill the remaining entries up to 100
  let currentRank = results.length + 1;
  let cycle = 0;
  while (currentRank <= 100) {
    const template = commonDomains[(currentRank + cycle) % commonDomains.length];
    const pseudoSub = cycle > 0 ? `sub${cycle}.` : "";
    const domain = `${pseudoSub}${template.domain}`;
    results.push({
      rank: currentRank,
      domain,
      url: `https://${domain}${template.path}?q=${encodeURIComponent(keyword)}`,
      change: (currentRank % 5 === 0) ? 2 : (currentRank % 4 === 0) ? -1 : 0,
      snippet: `Explore top tools and solutions for ${keyword} with expert benchmarks and evaluations.`,
    });
    currentRank++;
    if (currentRank % commonDomains.length === 0) cycle++;
  }

  return results;
}

export function SerpCompetitorsView({
  projectId,
  projectDomain = "workcomposer.com",
  competitors = [],
}: SerpCompetitorsViewProps) {
  // 1. Notice banner dismissal
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // 2. Primary action controls - Group selection
  const [selectedGroup, setSelectedGroup] = useState<string>("All groups");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  const [keywordSearch, setKeywordSearch] = useState("");
  const [highlightCompetitors, setHighlightCompetitors] = useState(false);

  // 3. Keyword list selection
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>("kw-1");

  // 4. Right filter controls
  const [displayMode, setDisplayMode] = useState<SerpDisplayMode>("DOMAIN");
  const [urlFilter, setUrlFilter] = useState("");
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [selectedTagMode, setSelectedTagMode] = useState<"or" | "and">("or");
  const [filterWithoutTags, setFilterWithoutTags] = useState(false);
  const [filterAllTags, setFilterAllTags] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  // 5. Tier & Dual-Calendar date range controls
  const [selectedTier, setSelectedTier] = useState<SerpDepthTier>("TOP 100");

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date>(new Date(2026, 8, 17)); // 17 Sep 2026
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date>(new Date(2026, 8, 19)); // 19 Sep 2026
  const [stagedRangeStart, setStagedRangeStart] = useState<Date>(new Date(2026, 8, 17));
  const [stagedRangeEnd, setStagedRangeEnd] = useState<Date>(new Date(2026, 8, 19));
  const [dateRangeText, setDateRangeText] = useState("17 SEP 2026 - 19 SEP 2026");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August (0-indexed: 7)
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September (0-indexed: 8)
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);
  const [compareByDates, setCompareByDates] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // 6. Expand / Fullscreen Modal
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // 7. Modals, export and toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<SerpExportScope>("selected");
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const scopeDropdownRef = useRef<HTMLDivElement>(null);

  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // 8. Guest Link Modal States
  const [isGuestLinkModalOpen, setIsGuestLinkModalOpen] = useState(false);
  const [hideSearchVolume, setHideSearchVolume] = useState(false);
  const [includeFilterSort, setIncludeFilterSort] = useState(true);
  const [guestModules, setGuestModules] = useState<Record<string, boolean>>({
    overview: false,
    rankings: false,
    analytics: false,
    competitors: true,
    aiResults: false,
    audit: false,
    marketing: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close dropdowns and revert staged dates on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setIsTagsDropdownOpen(false);
      }
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target as Node)) {
        setIsScopeDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsDatePickerOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isLeftYearOpen || isRightYearOpen) {
          setIsLeftYearOpen(false);
          setIsRightYearOpen(false);
          return;
        }
        if (isScopeDropdownOpen) {
          setIsScopeDropdownOpen(false);
          return;
        }
        if (isTagsDropdownOpen) {
          setIsTagsDropdownOpen(false);
          return;
        }
        if (isGuestLinkModalOpen) {
          setIsGuestLinkModalOpen(false);
          return;
        }
        setIsGroupDropdownOpen(false);
        setIsTagsDropdownOpen(false);
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsDatePickerOpen(false);
        setExpandedDate(null);
        setIsExportModalOpen(false);
        setIsAdvancedModalOpen(false);
        setIsFeedbackOpen(false);
        setIsNotesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [appliedRangeStart, appliedRangeEnd, isScopeDropdownOpen, isTagsDropdownOpen]);

  const handleExecuteExport = () => {
    const targetKeywords = exportScope === "selected" ? [activeKeyword] : filteredKeywords;

    const csvHeader = [
      "Keyword",
      "Search Volume",
      "Date",
      "Rank",
      "Domain",
      "URL",
      "Snippet",
      "Change",
    ].join(",");

    const rows: string[] = [];
    targetKeywords.forEach((kw) => {
      dates.forEach((d) => {
        const serpList = generateSerpData(kw.keyword, d, projectDomain, competitorDomainList).slice(0, tierLimit);
        serpList.forEach((entry) => {
          const cleanSnippet = `"${(entry.snippet || "").replace(/"/g, '""')}"`;
          const cleanUrl = `"${(entry.url || "").replace(/"/g, '""')}"`;
          rows.push(`"${kw.keyword}",${kw.searchVolume},"${d}",${entry.rank},"${entry.domain}",${cleanUrl},${cleanSnippet},${entry.change}`);
        });
      });
    });

    const csvContent = [csvHeader, ...rows].join("\n");

    if (typeof window !== "undefined" && typeof window.URL?.createObjectURL === "function") {
      const blob = new Blob([csvContent], {
        type:
          exportFormat === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `serp_competitors_${projectDomain}_${exportFormat === "xlsx" ? "export.xlsx" : "export.csv"}`;
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
    showToast(`Export downloaded: serp_competitors_${projectDomain}_export.${exportFormat}`);
  };

  // Calendar month navigations
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

  // Preset logic
  const applyPreset = (preset: string) => {
    const refDate = new Date(2026, 8, 19); // 19 Sep 2026
    let start = new Date(refDate);
    let end = new Date(refDate);

    switch (preset) {
      case "TODAY":
        start = new Date(refDate);
        end = new Date(refDate);
        break;
      case "YESTERDAY":
        start = new Date(2026, 8, 18);
        end = new Date(2026, 8, 18);
        break;
      case "LAST WEEK":
        start = new Date(2026, 8, 8);
        end = new Date(2026, 8, 15);
        break;
      case "LAST MONTH":
        start = new Date(2026, 7, 1);
        end = new Date(2026, 7, 31);
        break;
      case "PAST 7 DAYS":
        start = new Date(2026, 8, 13);
        end = new Date(2026, 8, 19);
        break;
      case "PAST 30 DAYS":
        start = new Date(2026, 7, 21);
        end = new Date(2026, 8, 19);
        break;
      case "PAST 6 MONTHS":
        start = new Date(2026, 2, 19);
        end = new Date(2026, 8, 19);
        break;
      case "YEAR":
        start = new Date(2026, 0, 1);
        end = new Date(2026, 8, 19);
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
    setDateRangeText(formatted);
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

      let cellStyle = "h-7 w-7 text-xs flex flex-col items-center justify-center transition select-none cursor-pointer relative ";

      if (isStart && isEnd) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs";
      } else if (isStart) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs";
      } else if (isEnd) {
        cellStyle += "border-2 border-blue-600 font-bold relative text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/70 rounded-xs";
      } else if (isInRange) {
        cellStyle += "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded-none font-medium";
      } else {
        cellStyle += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
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
      <div className="w-56 space-y-1">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase mb-1">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells}
        </div>
      </div>
    );
  };

  const isTagFilterActive = filterWithoutTags || filterAllTags || selectedTags.length > 0;

  const tagFilterLabel = useMemo(() => {
    if (filterWithoutTags) return "Without tags";
    if (filterAllTags) return "All tags";
    if (selectedTags.length === 1) return selectedTags[0];
    if (selectedTags.length > 1) return `${selectedTags.length} tags`;
    return "Filter by tags";
  }, [filterWithoutTags, filterAllTags, selectedTags]);

  const filteredTagList = useMemo(() => {
    if (!tagSearchQuery.trim()) return ALL_KEYWORD_TAGS;
    const q = tagSearchQuery.toLowerCase();
    return ALL_KEYWORD_TAGS.filter((t) => t.toLowerCase().includes(q));
  }, [tagSearchQuery]);

  // Filtered keywords list based on group, tag, search
  const filteredKeywords = useMemo(() => {
    return SERP_PROJECT_KEYWORDS.filter((k) => {
      // Group filter
      if (selectedGroup !== "All groups" && selectedGroup !== "all") {
        if (k.group.toLowerCase() !== selectedGroup.toLowerCase()) {
          return false;
        }
      }
      // Tag filter
      if (filterWithoutTags) {
        if (k.tags && k.tags.length > 0) return false;
      } else if (selectedTags.length > 0) {
        if (!k.tags || k.tags.length === 0) return false;
        if (selectedTagMode === "and") {
          if (!selectedTags.every((t) => k.tags?.includes(t))) return false;
        } else {
          if (!selectedTags.some((t) => k.tags?.includes(t))) return false;
        }
      } else if (filterAllTags) {
        if (!k.tags || k.tags.length === 0) return false;
      }
      // Search filter
      if (keywordSearch.trim()) {
        const query = keywordSearch.toLowerCase();
        return k.keyword.toLowerCase().includes(query);
      }
      return true;
    });
  }, [selectedGroup, filterWithoutTags, filterAllTags, selectedTags, selectedTagMode, keywordSearch]);

  const activeKeyword = useMemo(() => {
    const found = filteredKeywords.find((k) => k.id === selectedKeywordId);
    if (found) return found;
    return filteredKeywords[0] || SERP_PROJECT_KEYWORDS[0];
  }, [filteredKeywords, selectedKeywordId]);

  // Extract competitor domain strings for matching
  const competitorDomainList = useMemo(() => {
    if (competitors && competitors.length > 0) {
      return competitors.map((c) => c.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""));
    }
    return ["insightful.io", "timedoctor.com", "hubstaff.com", "clockify.me", "activtrak.com"];
  }, [competitors]);

  // Derive 3 date comparison columns
  const dates = useMemo(() => {
    const list: string[] = [];
    const cur = new Date(appliedRangeStart);
    const end = new Date(appliedRangeEnd);

    while (cur <= end && list.length < 5) {
      const day = String(cur.getDate()).padStart(2, "0");
      const monthStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][cur.getMonth()];
      const year = cur.getFullYear();
      list.push(`${monthStr}-${day} ${year}`);
      cur.setDate(cur.getDate() + 1);
    }
    if (list.length === 0) {
      return ["SEP-17 2026", "SEP-18 2026", "SEP-19 2026"];
    }
    while (list.length < 3) {
      const day = String(cur.getDate()).padStart(2, "0");
      const monthStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][cur.getMonth()];
      const year = cur.getFullYear();
      list.push(`${monthStr}-${day} ${year}`);
      cur.setDate(cur.getDate() + 1);
    }
    return list.slice(0, 3);
  }, [appliedRangeStart, appliedRangeEnd]);

  // Max count determined by tier pill
  const tierLimit = useMemo(() => {
    switch (selectedTier) {
      case "TOP 10":
        return 10;
      case "TOP 20":
        return 20;
      case "TOP 30":
        return 30;
      case "TOP 50":
        return 50;
      case "TOP 100":
      default:
        return 100;
    }
  }, [selectedTier]);

  // Generate SERP rows for each date
  const serpColumns = useMemo(() => {
    return dates.map((date) => {
      const fullList = generateSerpData(activeKeyword.keyword, date, projectDomain, competitorDomainList);
      let sliced = fullList.slice(0, tierLimit);
      if (urlFilter.trim()) {
        const q = urlFilter.toLowerCase();
        sliced = sliced.filter((item) => item.domain.toLowerCase().includes(q) || item.url.toLowerCase().includes(q));
      }
      return {
        date,
        results: sliced,
        totalFound: fullList.length,
      };
    });
  }, [activeKeyword.keyword, projectDomain, competitorDomainList, tierLimit, urlFilter, dates]);

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100" data-testid="serp-competitors-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Notice Alert Banner */}
      {!isNoticeDismissed && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-base text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">ℹ</span>
            <p className="leading-relaxed">
              This section contains brief information on the top 100 websites by each query tracked by you. If you want
              to track any website in more detail, add it to the{" "}
              <Link
                href={`/projects/${projectId}/competitors/added`}
                className="text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-800"
              >
                My Competitors
              </Link>{" "}
              tab.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNoticeDismissed(true)}
            aria-label="Dismiss notice banner"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumb & Utility Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{projectDomain}</span>
          <span>&gt;</span>
          <Link href={`/projects/${projectId}/competitors/added`} className="hover:text-blue-600">
            My Competitors
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">SERP Competitors</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setIsGuestLinkModalOpen(true)}
            className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
            title="Get access to guest links"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Guest link</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Notes (46)</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Action Row - Single Unbroken Action Bar */}
      <div className="flex flex-nowrap items-center justify-between gap-4 w-full py-2 overflow-visible relative z-30">
        {/* Left Controls: Group Selector & Search Keyword */}
        <div className="flex items-center gap-3 shrink-0">
          {/* All groups / General dropdown */}
          <div className="relative z-40" ref={groupDropdownRef}>
            <button
              type="button"
              aria-label="Select keyword group"
              aria-haspopup="listbox"
              aria-expanded={isGroupDropdownOpen}
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold px-3 py-2 flex items-center gap-2 rounded-lg transition shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
            >
              <span className="text-amber-500">📁</span>
              <span>{selectedGroup === "all" ? "All groups" : selectedGroup}</span>
              <span className="text-slate-400 text-[10px]">{isGroupDropdownOpen ? "▲" : "▼"}</span>
            </button>

            {isGroupDropdownOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Option 1: All groups */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedGroup("All groups");
                    setIsGroupDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer ${
                    selectedGroup === "All groups" || selectedGroup === "all"
                      ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="text-amber-500">📁</span>
                  <span>All groups</span>
                </button>

                {/* Option 2: General */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedGroup("General");
                    setIsGroupDropdownOpen(false);
                    setSelectedKeywordId("kw-2"); // automatically activate work composer
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer ${
                    selectedGroup === "General"
                      ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="text-amber-500">📂</span>
                  <span>General</span>
                </button>
              </div>
            )}
          </div>

          {/* Search keyword input */}
          <div className="relative w-52">
            <input
              type="text"
              placeholder="Search keyword 🔍"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md pl-3 pr-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Right Controls: Highlight competitors switch, Advanced SERP Analysis, Export */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Highlight competitors switch */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>Highlight competitors</span>
            <span className="text-slate-400 cursor-help" title="Highlight competitors tracked in your project">ℹ</span>
            <button
              type="button"
              role="switch"
              aria-label="Highlight competitors"
              aria-checked={highlightCompetitors}
              onClick={() => setHighlightCompetitors(!highlightCompetitors)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                highlightCompetitors ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  highlightCompetitors ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Advanced SERP Analysis button */}
          <button
            type="button"
            onClick={() => setIsAdvancedModalOpen(true)}
            className="flex items-center gap-2 border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs px-3.5 py-1.5 rounded-md transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>📊</span>
            <span>ADVANCED SERP ANALYSIS</span>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider">
              NEW
            </span>
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs px-3.5 py-1.5 rounded-md transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span className="text-xs">⬆</span>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* 4. Main 2-Panel Layout: Left Keyword List Selector + Right SERP comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Keyword List Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Keywords ({filteredKeywords.length})
            </span>
            <span className="text-slate-400 text-[11px]">Select to compare</span>
          </div>

          {/* Scrollable keywords list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredKeywords.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No keywords match your search.
              </div>
            ) : (
              filteredKeywords.map((kw) => {
                const isSelected = kw.id === activeKeyword.id;
                return (
                  <button
                    key={kw.id}
                    type="button"
                    onClick={() => setSelectedKeywordId(kw.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-xs"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs leading-snug">{kw.keyword}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Search volume {kw.searchVolumeDisplay}</span>
                        {kw.group && (
                          <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[9px]">
                            {kw.group}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Filters + Tier Pills + 3-Day Column Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Top Filter Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Display switch: URL | DOMAIN */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Display:</span>
              <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setDisplayMode("URL")}
                  className={`px-3 py-1 font-semibold transition cursor-pointer ${
                    displayMode === "URL"
                      ? "bg-[#544f70] text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("DOMAIN")}
                  className={`px-3 py-1 font-semibold transition cursor-pointer ${
                    displayMode === "DOMAIN"
                      ? "bg-[#544f70] text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  DOMAIN
                </button>
              </div>
            </div>

            {/* Filter by URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Insert URL 🔍"
                value={urlFilter}
                onChange={(e) => setUrlFilter(e.target.value)}
                className="w-44 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter by tags */}
            <div className="relative z-30" ref={tagsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                aria-expanded={isTagsDropdownOpen}
                aria-haspopup="true"
                data-testid="serp-filter-by-tags-btn"
                className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold transition cursor-pointer ${
                  isTagFilterActive || isTagsDropdownOpen
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="truncate max-w-[120px]">{tagFilterLabel}</span>
                <span className="text-[10px] text-slate-400">{isTagsDropdownOpen ? "▲" : "▾"}</span>
              </button>

              {isTagsDropdownOpen && (
                <div
                  role="menu"
                  aria-label="Filter by tags options"
                  className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Mode Switcher */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Match:</span>
                    <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedTagMode("or")}
                        className={`px-3 py-1 font-semibold transition cursor-pointer ${
                          selectedTagMode === "or"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        Any (OR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTagMode("and")}
                        className={`px-3 py-1 font-semibold border-l border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                          selectedTagMode === "and"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        All (AND)
                      </button>
                    </div>
                  </div>

                  {/* Search tags input */}
                  <div className="relative mb-2.5">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-7 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
                    {tagSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTagSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5 cursor-pointer"
                        title="Clear tag search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Special filter options */}
                  <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterAllTags}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFilterAllTags(checked);
                            if (checked) {
                              setFilterWithoutTags(false);
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>All tags</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {SERP_PROJECT_KEYWORDS.filter((k) => k.tags && k.tags.length > 0).length}
                      </span>
                    </label>
                    <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filterWithoutTags}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFilterWithoutTags(checked);
                            if (checked) {
                              setFilterAllTags(false);
                              setSelectedTags([]);
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Without tags</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {SERP_PROJECT_KEYWORDS.filter((k) => !k.tags || k.tags.length === 0).length}
                      </span>
                    </label>
                  </div>

                  {/* Tags checklist */}
                  <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
                    {filteredTagList.length === 0 ? (
                      <div className="py-3 text-center text-slate-400 text-xs">
                        No tags found
                      </div>
                    ) : (
                      filteredTagList.map((tag) => {
                        const count = SERP_PROJECT_KEYWORDS.filter((k) => k.tags?.includes(tag)).length;
                        const isChecked = selectedTags.includes(tag);
                        return (
                          <label
                            key={tag}
                            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setFilterWithoutTags(false);
                                  setSelectedTags((prev) =>
                                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                  );
                                }}
                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span className="truncate">{tag}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 ml-2 font-mono">
                              {count}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    {isTagFilterActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTags([]);
                          setFilterWithoutTags(false);
                          setFilterAllTags(false);
                          setSelectedTagMode("or");
                          setTagSearchQuery("");
                        }}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTagsDropdownOpen(false)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tier Filter Pills & Search Engine Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* SERP Depth Tier Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(["TOP 100", "TOP 50", "TOP 30", "TOP 20", "TOP 10"] as SerpDepthTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    selectedTier === tier
                      ? "bg-[#544f70] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Search engine, country, language & Dual-Calendar date display */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
                <span className="font-bold text-[#4285F4]">G</span>
                <span>🇮🇳 India</span>
                <span className="text-slate-400">|</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">EN ▾</span>
              </div>

              {/* Dual-Calendar Date Picker Popover */}
              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDatePickerOpen) {
                      setStagedRangeStart(appliedRangeStart);
                      setStagedRangeEnd(appliedRangeEnd);
                    }
                    setIsDatePickerOpen(!isDatePickerOpen);
                  }}
                  aria-expanded={isDatePickerOpen}
                  aria-haspopup="dialog"
                  aria-label="Select date range"
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                >
                  <span>📅</span>
                  <span>{dateRangeText}</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>

                {isDatePickerOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Date range picker"
                    className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[640px] max-w-[780px] animate-in fade-in zoom-in-95 duration-100 text-xs"
                  >
                    {/* Left & Middle: Dual-Month Side-by-Side Calendar Grids */}
                    <div className="flex-1 space-y-3">
                      {/* Headers row */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
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
                            <span className="sr-only">{CAL_FULL_MONTHS[calendarLeftMonth]}  {calendarLeftYear}</span>
                            <span>{CAL_FULL_MONTHS[calendarLeftMonth]}</span>
                            <CalendarYearDropdown
                              year={calendarLeftYear}
                              onSelectYear={(y) => setCalendarLeftYear(y)}
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
                            <span className="sr-only">{CAL_FULL_MONTHS[calendarRightMonth]}  {calendarRightYear}</span>
                            <span>{CAL_FULL_MONTHS[calendarRightMonth]}</span>
                            <CalendarYearDropdown
                              year={calendarRightYear}
                              onSelectYear={(y) => setCalendarRightYear(y)}
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
                            className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyDateRange}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
                          >
                            APPLY
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Quick Preset Range Buttons & Compare by dates switch */}
                    <div className="w-full md:w-36 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 flex flex-col gap-1.5">
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
                          className={`w-full text-center px-2 py-1 text-xs font-medium rounded-md border transition cursor-pointer ${
                            activePreset === preset
                              ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}

                      {/* Compare by dates switch */}
                      <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Compare by dates
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-label="Compare by dates"
                          aria-checked={compareByDates}
                          onClick={() => setCompareByDates(!compareByDates)}
                          className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            compareByDates ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              compareByDates ? "translate-x-3" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Day SERP Rankings Comparison Cards (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {serpColumns.map((col) => (
              <div
                key={col.date}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-[650px]"
              >
                {/* Card Header */}
                <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-slate-400">#</span>
                    <span>{col.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {col.results.length} results
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedDate(col.date)}
                      title="Expand to fullscreen"
                      aria-label={`Expand ${col.date} column`}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition cursor-pointer"
                    >
                      <span className="text-sm">⛶</span>
                    </button>
                  </div>
                </div>

                {/* Card Body: Scrollable Ranking Rows */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {col.results.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No matching URLs found.</div>
                  ) : (
                    col.results.map((item) => {
                      const isTarget = item.domain.toLowerCase().includes(projectDomain.toLowerCase());
                      const isCompetitor = competitorDomainList.some((comp) =>
                        item.domain.toLowerCase().includes(comp)
                      );

                      let rowClass = "hover:bg-slate-50/80 dark:hover:bg-slate-800/40";
                      if (isTarget) {
                        rowClass =
                          "bg-amber-50 dark:bg-amber-950/30 font-medium border-l-2 border-l-amber-500 text-amber-900 dark:text-amber-200";
                      } else if (highlightCompetitors && isCompetitor) {
                        rowClass =
                          "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 font-semibold border-l-2 border-l-purple-500";
                      }

                      return (
                        <div
                          key={item.rank}
                          className={`px-3 py-2 flex items-center justify-between gap-2 transition ${rowClass}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Rank number */}
                            <span
                              className={`w-6 text-center font-bold text-xs flex-shrink-0 ${
                                item.rank <= 3
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {item.rank}
                            </span>

                            {/* Domain Favicon Placeholder */}
                            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                              {item.domain.charAt(0).toUpperCase()}
                            </div>

                            {/* Domain / URL text */}
                            <div className="min-w-0 flex-1">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate block hover:underline"
                                title={item.url}
                              >
                                {displayMode === "DOMAIN" ? item.domain : item.url.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          </div>

                          {/* Extra badges: Target, Competitor, Rank change */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px]">
                            {isTarget && (
                              <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded text-[9px] font-bold uppercase">
                                Target
                              </span>
                            )}
                            {highlightCompetitors && isCompetitor && (
                              <span className="px-1.5 py-0.2 bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 rounded text-[9px] font-bold uppercase">
                                Competitor
                              </span>
                            )}
                            {item.change !== undefined && item.change !== 0 && (
                              <span
                                className={`text-[10px] font-bold ${
                                  item.change > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {item.change > 0 ? `+${item.change}` : item.change}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Column Modal */}
      {expandedDate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Full SERP Rankings — #{expandedDate}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Query: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeKeyword.keyword}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedDate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {generateSerpData(activeKeyword.keyword, expandedDate, projectDomain, competitorDomainList).map((row) => (
                <div key={row.rank} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-8 font-bold text-slate-500 pt-0.5">{row.rank}.</span>
                    <div>
                      <div className="font-bold text-sm text-blue-600 hover:underline">
                        <a href={row.url} target="_blank" rel="noreferrer">
                          {row.domain}
                        </a>
                      </div>
                      <div className="text-slate-400 truncate max-w-lg">{row.url}</div>
                      {row.snippet && <div className="text-slate-600 dark:text-slate-300 mt-1">{row.snippet}</div>}
                    </div>
                  </div>
                  {row.domain.includes(projectDomain) && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase text-[10px]">
                      Our Site
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setExpandedDate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced SERP Analysis Modal */}
      {isAdvancedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Advanced SERP Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Analyze SERP feature distribution, snippet volatility, and competitor page correlation across multiple dates.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg space-y-2">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Total Tracked URLs in SERP:</span>
                <span>100</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Competitor Presence Rate:</span>
                <span className="text-emerald-600">42% (Top 20)</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>SERP Volatility Index:</span>
                <span className="text-blue-600">Low (0.84)</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAdvancedModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT DATA MODAL DIALOG */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExportModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-xs">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 id="export-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Export data</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                title="Close modal"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Export scope
              </label>
              <div className="relative" ref={scopeDropdownRef}>
                <button
                  type="button"
                  aria-label="Select export scope"
                  aria-haspopup="listbox"
                  aria-expanded={isScopeDropdownOpen}
                  onClick={() => setIsScopeDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-left transition cursor-pointer ${
                    exportScope === "group" && isScopeDropdownOpen
                      ? "bg-slate-200 dark:bg-slate-700/70 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-800 dark:text-slate-100"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium text-slate-800 dark:text-slate-100 shadow-xs"
                  }`}
                >
                  <span>{exportScope === "selected" ? "Selected keyword" : "All keywords from the group"}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{isScopeDropdownOpen ? "^" : "▾"}</span>
                </button>

                {isScopeDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={exportScope === "selected"}
                      onClick={() => {
                        setExportScope("selected");
                        setIsScopeDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 cursor-pointer flex items-center transition text-left ${
                        exportScope === "selected"
                          ? "bg-slate-200/90 dark:bg-slate-700/80 font-medium text-slate-900 dark:text-white"
                          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      Selected keyword
                    </button>

                    <button
                      type="button"
                      role="option"
                      aria-selected={exportScope === "group"}
                      onClick={() => {
                        setExportScope("group");
                        setIsScopeDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 cursor-pointer flex items-center transition text-left ${
                        exportScope === "group"
                          ? "bg-slate-200/90 dark:bg-slate-700/80 font-medium text-slate-900 dark:text-white"
                          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      All keywords from the group
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Format Selection Cards */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Choose the desired file format for downloading your SERP competitor data:
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Excel (.xlsx) Card */}
                <button
                  type="button"
                  onClick={() => setExportFormat("xlsx")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-28 cursor-pointer ${
                    exportFormat === "xlsx"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">📊</span>
                    {exportFormat === "xlsx" && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Excel (.xlsx)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Max. 10K rows</div>
                  </div>
                </button>

                {/* CSV (.csv) Card */}
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-28 cursor-pointer ${
                    exportFormat === "csv"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">📄</span>
                    {exportFormat === "csv" && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">CSV (.csv)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">No limits</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Send Feedback</h3>
              <button type="button" onClick={() => setIsFeedbackOpen(false)} className="text-slate-400 text-sm">✕</button>
            </div>
            <textarea
              placeholder="What can we improve on the SERP Competitors view?"
              rows={3}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  showToast("Thank you for your feedback!");
                }}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notes (46)</h3>
              <button type="button" onClick={() => setIsNotesOpen(false)} className="text-slate-400 text-sm">✕</button>
            </div>
            <p className="text-slate-500">Project internal annotations & algorithm updates noted during this date range.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="font-bold text-slate-700 dark:text-slate-200">18 Sep 2026:</span>
                <p className="text-slate-500 mt-0.5">Google core search update rolled out across tech terms.</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="font-bold text-slate-700 dark:text-slate-200">17 Sep 2026:</span>
                <p className="text-slate-500 mt-0.5">WorkComposer gained rank #1 on download queries.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      <GuestLinkModal
        isOpen={isGuestLinkModalOpen}
        onClose={() => setIsGuestLinkModalOpen(false)}
        projectId={projectId}
        projectDomain={projectDomain}
        hideSearchVolume={hideSearchVolume}
        setHideSearchVolume={setHideSearchVolume}
        includeFilterSort={includeFilterSort}
        setIncludeFilterSort={setIncludeFilterSort}
        guestModules={guestModules}
        setGuestModules={setGuestModules}
        onCopied={() => showToast("Guest link copied to clipboard!")}
      />
    </div>
  );
}
