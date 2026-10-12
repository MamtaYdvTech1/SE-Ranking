"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { CompetitorDto } from "@/lib/types";
import { GuestLinkModal } from "./GuestLinkModal";
import { CalendarYearDropdown } from "./CalendarYearDropdown";

export interface ShareOfVoiceUrlItem {
  id: string;
  url: string;
  keywordsInTop20: number;
  shareOfVoice: number;
  shareOfVoiceDisplay: string;
  trafficForecast: number;
  trafficForecastDisplay: string;
}

export interface ShareOfVoiceDomainItem {
  id: string;
  rank: number;
  domain: string;
  isTargetDomain?: boolean;
  urlsInTop20: number;
  keywordsInTop20: number;
  shareOfVoice: number;
  shareOfVoiceDisplay: string;
  deltaSov: string;
  deltaSovType: "up" | "down";
  trafficForecast: number;
  trafficForecastDisplay: string;
  deltaTraffic: string;
  deltaTrafficType: "up" | "down";
  urls: ShareOfVoiceUrlItem[];
}

export interface SovKeywordItem {
  id: string;
  keyword: string;
  searchVolume: number;
  group: string;
  tags: string[];
}

export const SOV_KEYWORDS: SovKeywordItem[] = [
  { id: "kw-1", keyword: "work composer download", searchVolume: 210, group: "Brand", tags: ["core", "branded", "download"] },
  { id: "kw-2", keyword: "work composer", searchVolume: 590, group: "General", tags: ["core", "branded"] },
  { id: "kw-3", keyword: "work composer hack", searchVolume: 10, group: "Brand", tags: ["high-intent"] },
  { id: "kw-4", keyword: "workpuls idle time", searchVolume: 10, group: "Competitor", tags: ["idle-time"] },
  { id: "kw-5", keyword: "idle time tracker", searchVolume: 10, group: "Features", tags: ["idle-time", "tracking"] },
  { id: "kw-6", keyword: "idle time tracking", searchVolume: 10, group: "Features", tags: ["idle-time", "tracking"] },
  { id: "kw-7", keyword: "idle time tracking software", searchVolume: 10, group: "Features", tags: ["software", "high-intent"] },
  { id: "kw-8", keyword: "composer download", searchVolume: 1900, group: "Brand", tags: ["download"] },
  { id: "kw-9", keyword: "working track", searchVolume: 480, group: "General", tags: ["tracking"] },
  { id: "kw-10", keyword: "screenshot time tracking", searchVolume: 110, group: "Features", tags: ["tracking", "screenshot"] },
];

export const SOV_TAGS = [
  "core",
  "branded",
  "high-intent",
  "idle-time",
  "tracking",
  "software",
  "download",
  "screenshot",
];

export const INITIAL_SOV_DOMAINS: ShareOfVoiceDomainItem[] = [
  {
    id: "domain-1",
    rank: 1,
    domain: "getcomposer.org",
    urlsInTop20: 8,
    keywordsInTop20: 3,
    shareOfVoice: 41.52,
    shareOfVoiceDisplay: "41.52%",
    deltaSov: "▼ 0.09%",
    deltaSovType: "down",
    trafficForecast: 1142,
    trafficForecastDisplay: "1.1K",
    deltaTraffic: "▲ 44.8",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-1-1",
        url: "https://getcomposer.org/download/",
        keywordsInTop20: 2,
        shareOfVoice: 24.85,
        shareOfVoiceDisplay: "24.85%",
        trafficForecast: 682.6,
        trafficForecastDisplay: "682.6",
      },
      {
        id: "url-1-2",
        url: "https://getcomposer.org/doc/00-intro.md",
        keywordsInTop20: 1,
        shareOfVoice: 16.67,
        shareOfVoiceDisplay: "16.67%",
        trafficForecast: 459.4,
        trafficForecastDisplay: "459.4",
      },
    ],
  },
  {
    id: "domain-2",
    rank: 2,
    domain: "workcomposer.com",
    isTargetDomain: true,
    urlsInTop20: 3,
    keywordsInTop20: 9,
    shareOfVoice: 12.74,
    shareOfVoiceDisplay: "12.74%",
    deltaSov: "▼ 0.19%",
    deltaSovType: "down",
    trafficForecast: 350.1,
    trafficForecastDisplay: "350.1",
    deltaTraffic: "▲ 9.6",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-2-1",
        url: "https://workcomposer.com/",
        keywordsInTop20: 6,
        shareOfVoice: 8.2,
        shareOfVoiceDisplay: "8.20%",
        trafficForecast: 225.4,
        trafficForecastDisplay: "225.4",
      },
      {
        id: "url-2-2",
        url: "https://workcomposer.com/features/idle-time-tracker",
        keywordsInTop20: 3,
        shareOfVoice: 4.54,
        shareOfVoiceDisplay: "4.54%",
        trafficForecast: 124.7,
        trafficForecastDisplay: "124.7",
      },
    ],
  },
  {
    id: "domain-3",
    rank: 3,
    domain: "insightful.io",
    urlsInTop20: 4,
    keywordsInTop20: 7,
    shareOfVoice: 10.82,
    shareOfVoiceDisplay: "10.82%",
    deltaSov: "▲ 0.35%",
    deltaSovType: "up",
    trafficForecast: 297.2,
    trafficForecastDisplay: "297.2",
    deltaTraffic: "▲ 12.1",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-3-1",
        url: "https://insightful.io/features/employee-monitoring",
        keywordsInTop20: 4,
        shareOfVoice: 6.72,
        shareOfVoiceDisplay: "6.72%",
        trafficForecast: 184.8,
        trafficForecastDisplay: "184.8",
      },
      {
        id: "url-3-2",
        url: "https://insightful.io/blog/idle-time-tracking",
        keywordsInTop20: 3,
        shareOfVoice: 4.1,
        shareOfVoiceDisplay: "4.10%",
        trafficForecast: 112.4,
        trafficForecastDisplay: "112.4",
      },
    ],
  },
  {
    id: "domain-4",
    rank: 4,
    domain: "timedoctor.com",
    urlsInTop20: 5,
    keywordsInTop20: 6,
    shareOfVoice: 8.65,
    shareOfVoiceDisplay: "8.65%",
    deltaSov: "▼ 0.12%",
    deltaSovType: "down",
    trafficForecast: 237.8,
    trafficForecastDisplay: "237.8",
    deltaTraffic: "▼ 3.4",
    deltaTrafficType: "down",
    urls: [
      {
        id: "url-4-1",
        url: "https://www.timedoctor.com/features.html",
        keywordsInTop20: 3,
        shareOfVoice: 5.15,
        shareOfVoiceDisplay: "5.15%",
        trafficForecast: 141.6,
        trafficForecastDisplay: "141.6",
      },
      {
        id: "url-4-2",
        url: "https://www.timedoctor.com/download",
        keywordsInTop20: 3,
        shareOfVoice: 3.5,
        shareOfVoiceDisplay: "3.50%",
        trafficForecast: 96.2,
        trafficForecastDisplay: "96.2",
      },
    ],
  },
  {
    id: "domain-5",
    rank: 5,
    domain: "hubstaff.com",
    urlsInTop20: 3,
    keywordsInTop20: 5,
    shareOfVoice: 7.41,
    shareOfVoiceDisplay: "7.41%",
    deltaSov: "▲ 0.22%",
    deltaSovType: "up",
    trafficForecast: 203.7,
    trafficForecastDisplay: "203.7",
    deltaTraffic: "▲ 5.8",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-5-1",
        url: "https://hubstaff.com/features/time-tracking-software",
        keywordsInTop20: 5,
        shareOfVoice: 7.41,
        shareOfVoiceDisplay: "7.41%",
        trafficForecast: 203.7,
        trafficForecastDisplay: "203.7",
      },
    ],
  },
  {
    id: "domain-6",
    rank: 6,
    domain: "clockify.me",
    urlsInTop20: 4,
    keywordsInTop20: 4,
    shareOfVoice: 5.18,
    shareOfVoiceDisplay: "5.18%",
    deltaSov: "▲ 0.15%",
    deltaSovType: "up",
    trafficForecast: 142.4,
    trafficForecastDisplay: "142.4",
    deltaTraffic: "▲ 4.2",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-6-1",
        url: "https://clockify.me/tracker",
        keywordsInTop20: 4,
        shareOfVoice: 5.18,
        shareOfVoiceDisplay: "5.18%",
        trafficForecast: 142.4,
        trafficForecastDisplay: "142.4",
      },
    ],
  },
  {
    id: "domain-7",
    rank: 7,
    domain: "activtrak.com",
    urlsInTop20: 2,
    keywordsInTop20: 3,
    shareOfVoice: 3.9,
    shareOfVoiceDisplay: "3.90%",
    deltaSov: "▼ 0.05%",
    deltaSovType: "down",
    trafficForecast: 107.2,
    trafficForecastDisplay: "107.2",
    deltaTraffic: "▼ 1.3",
    deltaTrafficType: "down",
    urls: [
      {
        id: "url-7-1",
        url: "https://www.activtrak.com/features/workforce-analytics",
        keywordsInTop20: 3,
        shareOfVoice: 3.9,
        shareOfVoiceDisplay: "3.90%",
        trafficForecast: 107.2,
        trafficForecastDisplay: "107.2",
      },
    ],
  },
  {
    id: "domain-8",
    rank: 8,
    domain: "github.com",
    urlsInTop20: 3,
    keywordsInTop20: 2,
    shareOfVoice: 2.6,
    shareOfVoiceDisplay: "2.60%",
    deltaSov: "▲ 0.08%",
    deltaSovType: "up",
    trafficForecast: 71.5,
    trafficForecastDisplay: "71.5",
    deltaTraffic: "▲ 2.1",
    deltaTrafficType: "up",
    urls: [
      {
        id: "url-8-1",
        url: "https://github.com/composer/composer",
        keywordsInTop20: 2,
        shareOfVoice: 2.6,
        shareOfVoiceDisplay: "2.60%",
        trafficForecast: 71.5,
        trafficForecastDisplay: "71.5",
      },
    ],
  },
];

export interface ShareOfVoiceViewProps {
  projectId: string;
  projectDomain?: string;
  competitors?: CompetitorDto[];
}

const CAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CAL_FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatComparisonDate(d: Date): string {
  const day = d.getDate();
  const mon = CAL_MONTHS[d.getMonth()];
  const yr = d.getFullYear();
  return `${day} ${mon} ${yr}`;
}

export function ShareOfVoiceView({
  projectId,
  projectDomain = "workcomposer.com",
  competitors = [],
}: ShareOfVoiceViewProps) {
  // 1. Notice alert banner dismissal
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // 2. Action row states
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("All search engines");
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  // Discrete two-date comparison state
  const [appliedDate1, setAppliedDate1] = useState<Date>(new Date(2026, 8, 18)); // 18 Sep 2026
  const [appliedDate2, setAppliedDate2] = useState<Date>(new Date(2026, 8, 19)); // 19 Sep 2026
  const [stagedDate1, setStagedDate1] = useState<Date>(new Date(2026, 8, 18));
  const [stagedDate2, setStagedDate2] = useState<Date>(new Date(2026, 8, 19));
  const [selectingSlot, setSelectingSlot] = useState<1 | 2>(1);

  // Calendar month navigation
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August (0-indexed: 7)
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September (0-indexed: 8)

  // Year selector dropdown states
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);

  const dateRangeText = `${formatComparisonDate(appliedDate1)}; ${formatComparisonDate(appliedDate2)}`;
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // 3. Collapsible "Keyword selection" filter strip
  const [isKeywordSectionOpen, setIsKeywordSectionOpen] = useState(true);
  const isKeywordSelectionOpen = isKeywordSectionOpen;
  const setIsKeywordSelectionOpen = setIsKeywordSectionOpen;
  const [isKeywordsDropdownOpen, setIsKeywordsDropdownOpen] = useState(false);
  const isKeywordDropdownOpen = isKeywordsDropdownOpen;
  const setIsKeywordDropdownOpen = setIsKeywordsDropdownOpen;
  const [keywordFilterSearch, setKeywordFilterSearch] = useState("");
  const keywordSearchText = keywordFilterSearch;
  const setKeywordSearchText = setKeywordFilterSearch;
  const [selectedGroupScope, setSelectedGroupScope] = useState<string>("all");
  const selectedKeywordGroup = selectedGroupScope;
  const setSelectedKeywordGroup = setSelectedGroupScope;
  const [isGeneralChecked, setIsGeneralChecked] = useState(false);
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);
  const isGeneralFolderExpanded = isGeneralExpanded;
  const setIsGeneralFolderExpanded = setIsGeneralExpanded;
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const isTagsDropdownOpen = isTagsMenuOpen;
  const setIsTagsDropdownOpen = setIsTagsMenuOpen;
  const [tagMatchMode, setTagMatchMode] = useState<"or" | "and">("or");
  const [withoutTagsChecked, setWithoutTagsChecked] = useState(false);
  const [allTagsChecked, setAllTagsChecked] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [appliedKeywordGroup, setAppliedKeywordGroup] = useState<string>("all");
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [appliedTagMatchMode, setAppliedTagMatchMode] = useState<"or" | "and">("or");
  const [appliedWithoutTags, setAppliedWithoutTags] = useState(false);
  const [appliedAllTags, setAppliedAllTags] = useState(false);
  const keywordDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  // 4. Domain search and expansion state
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [expandedDomains, setExpandedDomains] = useState<string[]>(["getcomposer.org"]);

  // 5. Toast & modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [includeKeywordsAndUrls, setIncludeKeywordsAndUrls] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // 6. Guest Link Modal States
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

  // Date selection click handler
  const handleDateClick = (clickedDate: Date) => {
    if (selectingSlot === 1) {
      setStagedDate1(clickedDate);
      setSelectingSlot(2);
    } else {
      if (clickedDate < stagedDate1) {
        setStagedDate2(stagedDate1);
        setStagedDate1(clickedDate);
      } else {
        setStagedDate2(clickedDate);
      }
      setSelectingSlot(1);
    }
  };

  const handleApplyDates = () => {
    let d1 = stagedDate1;
    let d2 = stagedDate2;
    if (d2 < d1) {
      const tmp = d1;
      d1 = d2;
      d2 = tmp;
    }
    setAppliedDate1(d1);
    setAppliedDate2(d2);
    setIsDateDropdownOpen(false);
    showToast(`Comparison dates applied: ${formatComparisonDate(d1)}; ${formatComparisonDate(d2)}`);
  };

  const handleCancelDates = () => {
    setStagedDate1(appliedDate1);
    setStagedDate2(appliedDate2);
    setSelectingSlot(1);
    setIsLeftYearOpen(false);
    setIsRightYearOpen(false);
    setIsDateDropdownOpen(false);
  };

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(event.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setStagedDate1(appliedDate1);
        setStagedDate2(appliedDate2);
        setSelectingSlot(1);
      }
      if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(event.target as Node)) {
        setIsKeywordDropdownOpen(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setIsTagsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isKeywordDropdownOpen || isTagsDropdownOpen) {
          setIsKeywordDropdownOpen(false);
          setIsTagsDropdownOpen(false);
          return;
        }
        if (isLeftYearOpen || isRightYearOpen) {
          setIsLeftYearOpen(false);
          setIsRightYearOpen(false);
          return;
        }
        setIsEngineDropdownOpen(false);
        setIsDateDropdownOpen(false);
        setStagedDate1(appliedDate1);
        setStagedDate2(appliedDate2);
        setSelectingSlot(1);
        setIsFeedbackOpen(false);
        setIsNotesOpen(false);
        setIsGuestLinkModalOpen(false);
        setIsExportModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [appliedDate1, appliedDate2]);

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
      const isBaseline = stagedDate1 && current.toDateString() === stagedDate1.toDateString();
      const isComparison = stagedDate2 && current.toDateString() === stagedDate2.toDateString();

      let cellStyle =
        "h-7 w-7 text-xs flex flex-col items-center justify-center transition select-none cursor-pointer ";

      if (isBaseline && isComparison) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs relative";
      } else if (isBaseline) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs";
      } else if (isComparison) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs relative";
      } else {
        cellStyle += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
          onClick={() => handleDateClick(current)}
          aria-label={`${d} ${CAL_FULL_MONTHS[month]} ${year}`}
          data-date={`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`}
          className={cellStyle}
        >
          <span>{d}</span>
          {isComparison && (
            <span className="w-1 h-1 bg-white rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
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
      <div className="w-[260px] space-y-2">
        {/* Day-of-week header: Monday start */}
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
        <div className="grid grid-cols-7 gap-1 text-center">{cells}</div>
      </div>
    );
  };

  const toggleDomainExpand = (domainName: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainName) ? prev.filter((d) => d !== domainName) : [...prev, domainName]
    );
  };

  const daysDiff = Math.max(
    1,
    Math.round(Math.abs(appliedDate2.getTime() - appliedDate1.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Filter active keywords based on applied keyword group and tags
  const matchingKeywords = useMemo(() => {
    return SOV_KEYWORDS.filter((k) => {
      // Group / keyword filter
      if (appliedKeywordGroup !== "all") {
        const target = appliedKeywordGroup.toLowerCase();
        if (target === "general") {
          if (k.group.toLowerCase() !== "general") return false;
        } else if (
          k.group.toLowerCase() !== target &&
          k.keyword.toLowerCase() !== target
        ) {
          return false;
        }
      }
      // Tags filter
      if (appliedWithoutTags) {
        if (k.tags && k.tags.length > 0) return false;
      } else if (appliedAllTags) {
        if (!k.tags || k.tags.length === 0) return false;
      } else if (appliedTags.length > 0) {
        if (appliedTagMatchMode === "and") {
          if (!appliedTags.every((t) => k.tags && k.tags.includes(t))) {
            return false;
          }
        } else {
          if (!appliedTags.some((t) => k.tags && k.tags.includes(t))) {
            return false;
          }
        }
      }
      return true;
    });
  }, [appliedKeywordGroup, appliedTags, appliedTagMatchMode, appliedWithoutTags, appliedAllTags]);

  const activeMatchingKeywordsCount = matchingKeywords.length;

  const filteredTagList = useMemo(() => {
    if (!tagSearchQuery.trim()) return SOV_TAGS;
    const q = tagSearchQuery.toLowerCase();
    return SOV_TAGS.filter((tag) => tag.toLowerCase().includes(q));
  }, [tagSearchQuery]);

  const isTagFilterActive = selectedTags.length > 0 || withoutTagsChecked || allTagsChecked;
  const keywordsWithTagsCount = SOV_KEYWORDS.filter((k) => k.tags && k.tags.length > 0).length;
  const keywordsWithoutTagsCount = SOV_KEYWORDS.filter((k) => !k.tags || k.tags.length === 0).length;

  const tagButtonLabel = useMemo(() => {
    if (withoutTagsChecked) return "Without tags";
    if (allTagsChecked) return "All tags";
    if (selectedTags.length === 0) return "Select tags";
    if (selectedTags.length === 1) return selectedTags[0];
    return `${selectedTags.length} tags`;
  }, [withoutTagsChecked, allTagsChecked, selectedTags]);

  const handleClearAllFilters = () => {
    setSelectedGroupScope("all");
    setIsGeneralChecked(false);
    setIsGeneralExpanded(false);
    setKeywordFilterSearch("");
    setSelectedTags([]);
    setTagMatchMode("or");
    setWithoutTagsChecked(false);
    setAllTagsChecked(false);
    setTagSearchQuery("");
    setAppliedKeywordGroup("all");
    setAppliedTags([]);
    setAppliedTagMatchMode("or");
    setAppliedWithoutTags(false);
    setAppliedAllTags(false);
    setIsKeywordsDropdownOpen(false);
    setIsTagsMenuOpen(false);
    showToast("Filters reset: Showing all keywords");
  };

  const handleApplyFilters = () => {
    const effectiveGroup = isGeneralChecked ? "General" : selectedGroupScope;
    setAppliedKeywordGroup(effectiveGroup);
    setAppliedTags([...selectedTags]);
    setAppliedTagMatchMode(tagMatchMode);
    setAppliedWithoutTags(withoutTagsChecked);
    setAppliedAllTags(allTagsChecked);
    setIsKeywordsDropdownOpen(false);
    setIsTagsMenuOpen(false);
    const groupName =
      effectiveGroup === "all"
        ? "All keywords"
        : effectiveGroup === "general"
        ? "General"
        : effectiveGroup;
    let tagsSuffix = "";
    if (withoutTagsChecked) {
      tagsSuffix = " (without tags)";
    } else if (allTagsChecked) {
      tagsSuffix = " (all tags)";
    } else if (selectedTags.length > 0) {
      tagsSuffix = ` with ${selectedTags.length} tags`;
    }
    showToast(`Filters applied: ${groupName}${tagsSuffix}`);
  };

  // Filter domains by search query and recalculate delta metrics based on comparison dates
  const filteredDomains = useMemo(() => {
    const base = !domainSearchQuery.trim()
      ? INITIAL_SOV_DOMAINS
      : INITIAL_SOV_DOMAINS.filter(
          (d) =>
            d.domain.toLowerCase().includes(domainSearchQuery.toLowerCase()) ||
            d.urls.some((u) => u.url.toLowerCase().includes(domainSearchQuery.toLowerCase()))
        );

    const keywordRatio = activeMatchingKeywordsCount / 10;

    return base.map((d) => {
      let mapped = { ...d };

      if (keywordRatio < 1) {
        const scaledSov = Number((d.shareOfVoice * keywordRatio).toFixed(2));
        const scaledTraf = Number((d.trafficForecast * keywordRatio).toFixed(1));
        const scaledKws = Math.max(1, Math.round(d.keywordsInTop20 * keywordRatio));
        mapped = {
          ...mapped,
          shareOfVoice: scaledSov,
          shareOfVoiceDisplay: `${scaledSov}%`,
          trafficForecast: scaledTraf,
          trafficForecastDisplay: scaledTraf >= 1000 ? `${(scaledTraf / 1000).toFixed(1)}K` : `${scaledTraf}`,
          keywordsInTop20: scaledKws,
        };
      }

      if (daysDiff === 1) return mapped;
      const mult = Math.min(5, Math.max(0.5, daysDiff));
      const sovNum = (parseFloat(d.deltaSov.replace(/[^0-9.]/g, "")) * mult).toFixed(2);
      const trafNum = (parseFloat(d.deltaTraffic.replace(/[^0-9.]/g, "")) * mult).toFixed(1);
      const sovPrefix = d.deltaSov.includes("▲") ? "▲ " : "▼ ";
      const trafPrefix = d.deltaTraffic.includes("▲") ? "▲ " : "▼ ";
      return {
        ...mapped,
        deltaSov: `${sovPrefix}${sovNum}%`,
        deltaTraffic: `${trafPrefix}${trafNum}`,
      };
    });
  }, [domainSearchQuery, daysDiff, activeMatchingKeywordsCount]);

  const kpiRatio = activeMatchingKeywordsCount / 10;
  const kpiTotalForecast = kpiRatio === 1 ? "2.7K" : `${(2.7 * kpiRatio).toFixed(1)}K`;
  const kpiSovDisplay = kpiRatio === 1 ? "12.74%" : `${(12.74 * kpiRatio).toFixed(2)}%`;
  const kpiTrafficForecastDisplay = kpiRatio === 1 ? "350.1" : `${(350.1 * kpiRatio).toFixed(1)}`;
  const kpiKeywordsCount = activeMatchingKeywordsCount === 10 ? 9 : Math.max(1, Math.round(activeMatchingKeywordsCount * 0.9));

  // Execute client-side export according to selected format and inclusion of nested keywords/URLs
  const handleExecuteExport = () => {
    let csvContent = "";

    if (includeKeywordsAndUrls) {
      const headers = [
        "Rank",
        "Domain",
        "Type",
        "URL / Domain Details",
        "URLs in Top 20",
        "Keywords in Top 20",
        "Share of Voice (%)",
        "Traffic Forecast",
      ].join(",");

      const rows: string[] = [];
      filteredDomains.forEach((d) => {
        rows.push(
          `${d.rank},"${d.domain}","Domain","-",${d.urlsInTop20},${d.keywordsInTop20},${d.shareOfVoice},${d.trafficForecast}`
        );
        d.urls.forEach((u) => {
          rows.push(
            `,"${d.domain}","URL","${u.url}",-,${u.keywordsInTop20},${u.shareOfVoice},${u.trafficForecast}`
          );
        });
      });

      csvContent = [headers, ...rows].join("\n");
    } else {
      const headers = [
        "Rank",
        "Domain",
        "URLs in Top 20",
        "Keywords in Top 20",
        "Share of Voice (%)",
        "Traffic Forecast",
      ].join(",");

      const rows = filteredDomains.map(
        (d) =>
          `${d.rank},"${d.domain}",${d.urlsInTop20},${d.keywordsInTop20},${d.shareOfVoice},${d.trafficForecast}`
      );

      csvContent = [headers, ...rows].join("\n");
    }

    if (typeof window !== "undefined" && typeof window.URL?.createObjectURL === "function") {
      const blob = new Blob([csvContent], {
        type:
          exportFormat === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `share_of_voice_${projectDomain}_${exportFormat === "xlsx" ? "export.xlsx" : "export.csv"}`;
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
    showToast(`Export downloaded: share_of_voice_${projectDomain}_export.${exportFormat}`);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100" data-testid="share-of-voice-view">
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
            <span className="text-blue-600 dark:text-blue-400 text-base leading-none select-none font-bold">
              ℹ
            </span>
            <p className="leading-relaxed">
              This section shows the shares of your site and its competitors in the total organic traffic provided by a particular set of keywords. Traffic calculation is based on every keyword&apos;s top 20 results in Google Desktop search engines.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNoticeDismissed(true)}
            aria-label="Dismiss notice banner"
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs & Header Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{projectDomain}</span>
          <span>&gt;</span>
          <Link href={`/projects/${projectId}/competitors/added`} className="hover:text-blue-600">
            My Competitors
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">Share of Voice</span>
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

      {/* 3. Primary Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Search engines & Date Range */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search engines selector */}
          <div className="relative" ref={engineDropdownRef}>
            <button
              type="button"
              onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              <span className="text-emerald-500 font-bold">✔</span>
              <span>{selectedSearchEngine}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 z-30 text-xs">
                {["All search engines", "Google Desktop (US)", "Google Mobile (US)"].map((engine) => (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => {
                      setSelectedSearchEngine(engine);
                      setIsEngineDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition cursor-pointer flex items-center justify-between ${
                      selectedSearchEngine === engine
                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{engine}</span>
                    {selectedSearchEngine === engine && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date selection button */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (!isDateDropdownOpen) {
                  setStagedDate1(appliedDate1);
                  setStagedDate2(appliedDate2);
                  setSelectingSlot(1);
                }
                setIsDateDropdownOpen(!isDateDropdownOpen);
              }}
              aria-expanded={isDateDropdownOpen}
              aria-haspopup="dialog"
              aria-label="Select comparison dates"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer shadow-xs transition hover:border-slate-400"
            >
              <span>📅</span>
              <span>{dateRangeText}</span>
            </button>

            {isDateDropdownOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Two-date comparison calendar"
                className="absolute left-0 top-full mt-2 w-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
              >
                {/* Header row: Dual months navigation */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  {/* Left Month Header */}
                  <div className="flex items-center justify-between w-[260px]">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
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

                  <div className="border-r border-slate-100 dark:border-slate-800 h-6" />

                  {/* Right Month Header */}
                  <div className="flex items-center justify-between w-[260px]">
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
                      aria-label="Next month"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer"
                      title="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Calendar Grids side-by-side */}
                <div className="flex items-start justify-between py-4">
                  {renderCalendarMonth(calendarLeftYear, calendarLeftMonth)}
                  <div className="border-r border-slate-100 dark:border-slate-800 h-56 self-stretch my-1" />
                  {renderCalendarMonth(calendarRightYear, calendarRightMonth)}
                </div>

                {/* Footer Bar & Helper Note */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span>Select two dates to measure changes between them.</span>
                    <span className="text-slate-400 cursor-help" title="Comparison measures delta between two discrete dates">ℹ</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCancelDates}
                      className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDates}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Export button */}
        <div>
          <button
            type="button"
            onClick={handleExport}
            aria-haspopup="dialog"
            aria-expanded={isExportModalOpen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            <span>⬆</span>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* 4. Collapsible "Keyword selection" Filter Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-3">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Keyword selection
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase ml-2.5 ${
                appliedKeywordGroup === "all" && appliedTags.length === 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
              }`}
            >
              {appliedKeywordGroup === "all" && appliedTags.length === 0
                ? "ALL KEYWORDS"
                : `${appliedKeywordGroup === "all" ? "" : appliedKeywordGroup + " "}${
                    appliedTags.length > 0 ? `(${appliedTags.length} TAGS)` : ""
                  }`.trim()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsKeywordSectionOpen(!isKeywordSectionOpen)}
            aria-expanded={isKeywordSectionOpen}
            aria-label="Toggle keyword selection panel"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer transition"
          >
            {isKeywordSectionOpen ? "▲" : "▾"}
          </button>
        </div>

        {isKeywordSectionOpen && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* Filter controls row */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Searchable "Keywords" dropdown */}
                <div className="relative" ref={keywordDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsKeywordsDropdownOpen(!isKeywordsDropdownOpen);
                      setIsTagsDropdownOpen(false);
                    }}
                    aria-expanded={isKeywordsDropdownOpen}
                    aria-label="Select keywords"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer shadow-2xs"
                  >
                    <span className="text-slate-400">📁</span>
                    <span>
                      {isGeneralChecked || selectedGroupScope === "General" || selectedGroupScope === "general"
                        ? "General (2)"
                        : selectedGroupScope === "all"
                        ? "All keywords (10)"
                        : selectedGroupScope}
                    </span>
                    <span className="text-[10px] text-slate-400">{isKeywordsDropdownOpen ? "▲" : "▾"}</span>
                  </button>

                  {isKeywordsDropdownOpen && (
                    <div
                      role="region"
                      aria-label="Keywords selector menu"
                      className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Search box inside dropdown */}
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={keywordFilterSearch}
                          onChange={(e) => setKeywordFilterSearch(e.target.value)}
                          placeholder="Search keyword..."
                          aria-label="Search keywords in dropdown"
                          className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute left-2 top-1.5 text-slate-400 text-xs pointer-events-none">🔍</span>
                        {keywordFilterSearch && (
                          <button
                            type="button"
                            onClick={() => setKeywordFilterSearch("")}
                            className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Keywords list */}
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {/* Option: All keywords */}
                        {!keywordFilterSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroupScope("all");
                              setIsGeneralChecked(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition cursor-pointer ${
                              selectedGroupScope === "all" && !isGeneralChecked
                                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>📁</span>
                              <span>All keywords (10)</span>
                            </div>
                            {selectedGroupScope === "all" && !isGeneralChecked && <span>✓</span>}
                          </button>
                        )}

                        {/* Folder: General with expansion and checkbox */}
                        {!keywordFilterSearch ? (
                          <div className="space-y-0.5">
                            <div
                              className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition cursor-pointer ${
                                isGeneralChecked || selectedGroupScope === "General" || selectedGroupScope === "general"
                                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                              onClick={() => {
                                const newChecked = !isGeneralChecked;
                                setIsGeneralChecked(newChecked);
                                if (newChecked) {
                                  setSelectedGroupScope("General");
                                } else {
                                  setSelectedGroupScope("all");
                                }
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsGeneralExpanded(!isGeneralExpanded);
                                  }}
                                  aria-label={isGeneralExpanded ? "Collapse General folder" : "Expand General folder"}
                                  className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px]"
                                >
                                  {isGeneralExpanded ? "▼" : "▶"}
                                </button>
                                <input
                                  type="checkbox"
                                  checked={isGeneralChecked || selectedGroupScope === "General" || selectedGroupScope === "general"}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setIsGeneralChecked(e.target.checked);
                                    if (e.target.checked) {
                                      setSelectedGroupScope("General");
                                    } else {
                                      setSelectedGroupScope("all");
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="Select General group"
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>📁</span>
                                <span>General (2)</span>
                              </div>
                              {(isGeneralChecked || selectedGroupScope === "General" || selectedGroupScope === "general") && <span>✓</span>}
                            </div>

                            {/* Expanded items under General */}
                            {isGeneralExpanded && (
                              <div className="pl-6 space-y-0.5 border-l border-slate-200 dark:border-slate-700 ml-3 py-1">
                                {SOV_KEYWORDS.filter((k) => k.group === "General").map((k) => (
                                  <button
                                    key={k.id}
                                    type="button"
                                    onClick={() => setSelectedGroupScope(k.keyword)}
                                    className={`w-full text-left px-2 py-1 rounded text-xs transition cursor-pointer flex items-center justify-between ${
                                      selectedGroupScope === k.keyword
                                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    <span className="truncate">{k.keyword}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">{k.searchVolume}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Other groups: Brand, Features, Competitor */}
                            {["Brand", "Features", "Competitor"].map((groupName) => {
                              const groupKws = SOV_KEYWORDS.filter((k) => k.group === groupName);
                              return (
                                <button
                                  key={groupName}
                                  type="button"
                                  onClick={() => {
                                    setSelectedGroupScope(groupName);
                                    setIsGeneralChecked(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition cursor-pointer ${
                                    selectedGroupScope === groupName
                                      ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 pl-4">
                                    <span>📁</span>
                                    <span>{groupName} ({groupKws.length})</span>
                                  </div>
                                  {selectedGroupScope === groupName && <span>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Search Results */
                          <div className="space-y-0.5">
                            {SOV_KEYWORDS.filter((k) =>
                              k.keyword.toLowerCase().includes(keywordFilterSearch.toLowerCase())
                            ).map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                onClick={() => setSelectedGroupScope(k.keyword)}
                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition cursor-pointer flex items-center justify-between ${
                                  selectedGroupScope === k.keyword
                                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span>{k.keyword}</span>
                                  <span className="text-[10px] text-slate-400">{k.group} • Vol: {k.searchVolume}</span>
                                </div>
                                {selectedGroupScope === k.keyword && <span>✓</span>}
                              </button>
                            ))}
                            {SOV_KEYWORDS.filter((k) =>
                              k.keyword.toLowerCase().includes(keywordFilterSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="p-3 text-center text-slate-400 text-xs">
                                No keywords match &quot;{keywordFilterSearch}&quot;
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. "Tags" dropdown (`Select tags`) */}
                <div className="relative" ref={tagsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTagsMenuOpen(!isTagsMenuOpen);
                      setIsKeywordsDropdownOpen(false);
                    }}
                    aria-expanded={isTagsMenuOpen}
                    aria-label="Select tags"
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs ${
                      isTagFilterActive || isTagsMenuOpen
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="text-slate-400">🏷</span>
                    <span>{tagButtonLabel}</span>
                    <span className="text-[10px] text-slate-400">{isTagsMenuOpen ? "▲" : "▾"}</span>
                  </button>

                  {isTagsMenuOpen && (
                    <div
                      role="region"
                      aria-label="Tags selector menu"
                      className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Match mode switcher: Any (OR) / All (AND) */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Match:</span>
                        <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                          <button
                            type="button"
                            onClick={() => setTagMatchMode("or")}
                            className={`px-3 py-1 font-semibold transition cursor-pointer ${
                              tagMatchMode === "or"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            Any (OR)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTagMatchMode("and")}
                            className={`px-3 py-1 font-semibold border-l border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                              tagMatchMode === "and"
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
                          aria-label="Search tags in dropdown"
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

                      {/* Special filter options: All tags / Without tags */}
                      <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allTagsChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAllTagsChecked(checked);
                                if (checked) {
                                  setWithoutTagsChecked(false);
                                }
                              }}
                              aria-label="All tags"
                              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>All tags</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {keywordsWithTagsCount}
                          </span>
                        </label>
                        <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={withoutTagsChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setWithoutTagsChecked(checked);
                                if (checked) {
                                  setAllTagsChecked(false);
                                  setSelectedTags([]);
                                }
                              }}
                              aria-label="Without tags"
                              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>Without tags</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {keywordsWithoutTagsCount}
                          </span>
                        </label>
                      </div>

                      {/* Tags section header with All | Clear shortcuts */}
                      <div className="flex items-center justify-between pb-1.5 mb-1 px-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Filter by tags</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTags([...SOV_TAGS]);
                              setWithoutTagsChecked(false);
                            }}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            All
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTags([])}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Tags checklist */}
                      <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
                        {filteredTagList.length === 0 ? (
                          <div className="py-3 text-center text-slate-400 text-xs">
                            No tags found
                          </div>
                        ) : (
                          filteredTagList.map((tag) => {
                            const count = SOV_KEYWORDS.filter((k) => k.tags?.includes(tag)).length;
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
                                      setWithoutTagsChecked(false);
                                      setSelectedTags((prev) =>
                                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                      );
                                    }}
                                    aria-label={tag}
                                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                                  />
                                  <span className="truncate capitalize">{tag}</span>
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
                              setWithoutTagsChecked(false);
                              setAllTagsChecked(false);
                              setTagMatchMode("or");
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
                          onClick={() => setIsTagsMenuOpen(false)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition cursor-pointer text-xs"
                  >
                    <span>✕</span>
                    <span>CLEAR ALL</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer text-xs"
                  >
                    <span>✓</span>
                    <span>APPLY FILTERS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Information / Status strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span>
                  Tracked keywords: <strong>{activeMatchingKeywordsCount} keywords</strong>{" "}
                  across {appliedKeywordGroup === "all" ? "all groups" : appliedKeywordGroup}{" "}
                  {appliedTags.length > 0 ? `& tags (${appliedTags.join(", ")})` : "& tags"}.
                </span>
                <span className="ml-2 text-slate-400">• Top 20 organic Google Desktop ranking results analyzed.</span>
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Calculation mode: Top 20 weighted CTR &amp; volume
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. KPI Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Total Traffic Forecast */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>TOTAL TRAFFIC FORECAST</span>
              <span className="text-slate-400 cursor-help" title="Total organic search traffic forecast for top 20 queries">
                ℹ
              </span>
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {kpiTotalForecast}
              </span>
              <span className="text-emerald-600 text-xs font-semibold ml-2">
                ▲ 113.9
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
            Projected monthly organic search visits across all 10 tracked target keywords.
          </p>
        </div>

        {/* Right Card: Multi-Metric Benchmark Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 gap-y-4 sm:gap-y-0">
            {/* Metric 1: SHARE OF VOICE */}
            <div className="px-3 first:pl-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>SHARE OF VOICE</span>
                <span className="text-slate-400 cursor-help" title="Percentage of total organic clicks captured by your domain">
                  ℹ
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {kpiSovDisplay}
                </span>
                <span className="text-rose-600 text-xs font-semibold ml-1.5">
                  ▼ 0.19%
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Target domain</span>
            </div>

            {/* Metric 2: TRAFFIC FORECAST */}
            <div className="px-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>TRAFFIC FORECAST</span>
                <span className="text-slate-400 cursor-help" title="Estimated monthly clicks to workcomposer.com">
                  ℹ
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {kpiTrafficForecastDisplay}
                </span>
                <span className="text-emerald-600 text-xs font-semibold ml-1.5">
                  ▲ 9.6
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Monthly visits</span>
            </div>

            {/* Metric 3: URLS IN THE TOP 20 */}
            <div className="px-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>URLS IN THE TOP 20</span>
                <span className="text-slate-400 cursor-help" title="Number of landing pages ranking in the top 20">
                  ℹ
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-xl font-bold text-blue-600">
                  3
                </span>
                <span className="text-emerald-600 text-xs font-semibold ml-1.5">
                  ▲ 1
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Ranking pages</span>
            </div>

            {/* Metric 4: KEYWORDS IN THE TOP 20 */}
            <div className="px-3 last:pr-0">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                KEYWORDS IN THE TOP 20
              </div>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-2xl font-extrabold text-blue-600">
                  {kpiKeywordsCount}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Out of {activeMatchingKeywordsCount} tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Competitor Share of Voice Table & Nested URLs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search domain 🔍"
            value={domainSearchQuery}
            onChange={(e) => setDomainSearchQuery(e.target.value)}
            className="w-64 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">DOMAIN</th>
                <th className="py-2.5 px-3 text-center">URLS IN THE TOP 20</th>
                <th className="py-2.5 px-3 text-center">KEYWORDS IN THE TOP 20</th>
                <th className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 cursor-pointer">
                    SHARE OF VOICE <span className="text-slate-400">▾</span>
                  </span>
                </th>
                <th className="py-2.5 px-3 text-right">TRAFFIC FORECAST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No domains match your search query &quot;{domainSearchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredDomains.map((item) => {
                  const isExpanded = expandedDomains.includes(item.domain);
                  return (
                    <React.Fragment key={item.id}>
                      {/* Parent Domain Row */}
                      <tr
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                          item.isTargetDomain ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => toggleDomainExpand(item.domain)}
                      >
                        <td className="py-3 px-3 text-center text-slate-400 font-medium">
                          {item.rank}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                              🌐
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.domain}
                            </span>
                            {item.isTargetDomain && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-semibold">
                                Target site
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDomainExpand(item.domain);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200 cursor-pointer font-bold"
                          >
                            <span>{item.urlsInTop20}</span>
                            <span className="text-[10px]">{isExpanded ? "▲" : "▾"}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <span>{item.keywordsInTop20}</span>
                            <span className="text-[10px] text-slate-400">▾</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {item.shareOfVoiceDisplay}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              item.deltaSovType === "down" ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {item.deltaSov}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {item.trafficForecastDisplay}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              item.deltaTrafficType === "down" ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {item.deltaTraffic}
                          </div>
                        </td>
                      </tr>

                      {/* Nested Expandable URLs */}
                      {isExpanded &&
                        item.urls.map((urlItem) => (
                          <tr
                            key={urlItem.id}
                            className="bg-slate-50/60 dark:bg-slate-800/30 border-l-2 border-blue-500"
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 text-[10px]">
                              ↳
                            </td>
                            <td className="py-2.5 px-3 pl-8">
                              <a
                                href={urlItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px]"
                              >
                                <span>↗</span>
                                <span className="truncate max-w-md">{urlItem.url}</span>
                              </a>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-400 text-xs">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                              {urlItem.keywordsInTop20}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                              {urlItem.shareOfVoiceDisplay}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                              {urlItem.trafficForecastDisplay}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Export Modal Dialog */}
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

            {/* Format Selection Cards */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Choose the desired file format for downloading your Share of Voice data:
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

            {/* Checkbox: Include keywords and URLs */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeKeywordsAndUrls}
                  onChange={(e) => setIncludeKeywordsAndUrls(e.target.checked)}
                  aria-label="Include keywords and URLs"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Include keywords and URLs
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Export detailed nested breakdown of top landing page URLs and keyword metrics for each domain.
                  </span>
                </div>
              </label>
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Share of Voice Feedback</h3>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Have suggestions or questions about traffic calculation across top 20 rankings?
            </p>
            <textarea
              rows={3}
              placeholder="Tell us what you think..."
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  showToast("Feedback sent! Thank you.");
                }}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white font-semibold rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Project Notes (46)</h3>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-500">Algorithm notes and SERP volatility during September 2026.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="font-bold text-slate-700 dark:text-slate-200">18 Sep 2026:</span>
                <p className="text-slate-500 mt-0.5">Google core search update rolled out across tech queries.</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="font-bold text-slate-700 dark:text-slate-200">17 Sep 2026:</span>
                <p className="text-slate-500 mt-0.5">WorkComposer gained rank #2 on download queries.</p>
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
    </div>
  );
}
