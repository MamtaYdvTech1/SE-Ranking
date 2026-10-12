"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Input, Skeleton } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { ProjectDetailDto } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";

export type AnalyticsSubTab = "overview" | "traffic" | "snippets" | "gsc" | "potential";

export interface AnalyticsWorkspaceProps {
  projectId: string;
  initialTab?: AnalyticsSubTab;
}

export interface SnippetKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  url: string;
  title: string;
  boldTerms: string;
  descriptionPrefix: string;
  descriptionSuffix: string;
  history: {
    dates: string[];
    positions: number[];
    traffic: number[];
    visibility: number[];
  };
}

export const SNIPPET_KEYWORDS: SnippetKeyword[] = [
  {
    id: "work-composer-hack",
    keyword: "work composer hack",
    searchVolume: 10,
    url: "https://www.workcomposer.com › blog › work-composer-hack",
    title: "Work Composer Hacks & Productivity Tips | WorkComposer",
    boldTerms: "work composer hacks",
    descriptionPrefix: "Discover expert ",
    descriptionSuffix: " and workflow automation strategies that streamline time tracking, employee productivity, and task management without friction.",
    history: {
      dates: ["Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17"],
      positions: [95, 92, 88, 80, 72, 45, 42],
      traffic: [2, 3, 4, 6, 8, 12, 14],
      visibility: [12, 14, 16, 22, 28, 52, 56],
    },
  },
  {
    id: "work-idle",
    keyword: "work idle",
    searchVolume: 10,
    url: "https://www.workcomposer.com › idle-time-tracking-so...",
    title: "Idle Time Tracking Software — Auto-Pause When Idle",
    boldTerms: "intelligent idle time detection",
    descriptionPrefix: "WorkComposer's ",
    descriptionSuffix: " automatically identifies periods of inactivity and pauses tracking after a configurable duration, ensuring that recorded hours remain 100% accurate and productive.",
    history: {
      dates: ["Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17"],
      positions: [100, 100, 100, 100, 100, 36, 35],
      traffic: [1, 1, 2, 2, 3, 18, 20],
      visibility: [5, 5, 6, 6, 8, 64, 66],
    },
  },
  {
    id: "work-tracks",
    keyword: "work tracks",
    searchVolume: 480,
    url: "https://www.workcomposer.com › work-tracks-monitoring",
    title: "Automated Work Tracking & Activity Monitoring Software | WorkComposer",
    boldTerms: "work tracks",
    descriptionPrefix: "Accurately monitor team progress with automated ",
    descriptionSuffix: ", real-time application metrics, and productivity scorecards built for modern remote and distributed enterprises.",
    history: {
      dates: ["Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17"],
      positions: [42, 38, 35, 30, 28, 24, 21],
      traffic: [85, 95, 110, 140, 160, 210, 240],
      visibility: [38, 42, 48, 55, 60, 72, 78],
    },
  },
  {
    id: "working-track",
    keyword: "working track",
    searchVolume: 480,
    url: "https://www.workcomposer.com › working-track-analytics",
    title: "Real-Time Working Track & Employee Activity Analytics",
    boldTerms: "working track analytics",
    descriptionPrefix: "Empower hybrid organizations with transparent ",
    descriptionSuffix: ", automated timesheets, smart URL categorization, and actionable team engagement dashboards.",
    history: {
      dates: ["Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17"],
      positions: [45, 40, 38, 34, 32, 29, 26],
      traffic: [70, 82, 95, 120, 135, 175, 205],
      visibility: [32, 36, 40, 49, 54, 65, 71],
    },
  },
  {
    id: "workpuls-idle-time",
    keyword: "workpuls idle time",
    searchVolume: 10,
    url: "https://www.workcomposer.com › compare › workpuls-idle-time",
    title: "Workpuls vs WorkComposer: Idle Time & Activity Compared",
    boldTerms: "workpuls idle time",
    descriptionPrefix: "In-depth comparison of ",
    descriptionSuffix: " rules against WorkComposer's automated timeout triggers, keystroke privacy safeguards, and customizable idle thresholds.",
    history: {
      dates: ["Sep 11", "Sep 12", "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17"],
      positions: [68, 62, 58, 52, 48, 40, 38],
      traffic: [2, 3, 4, 7, 9, 14, 16],
      visibility: [18, 22, 26, 32, 38, 48, 52],
    },
  },
];

export function AnalyticsWorkspace({ projectId, initialTab = "overview" }: AnalyticsWorkspaceProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AnalyticsSubTab>(initialTab);
  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Connection states
  const [gaConnection, setGaConnection] = useState<{
    connected: boolean;
    propertyId?: string;
    accountEmail?: string;
  }>({ connected: false });
  const [gscConnection, setGscConnection] = useState<{
    connected: boolean;
    siteUrl?: string;
    accountEmail?: string;
  }>({ connected: false });
  const [matomoConnection, setMatomoConnection] = useState<{
    connected: boolean;
    serverUrl?: string;
    siteId?: string;
    authToken?: string;
  }>({ connected: false });

  // Modal states
  const [activeModal, setActiveModal] = useState<"googleOAuth" | "matomo" | null>(null);
  const [googleOAuthTarget, setGoogleOAuthTarget] = useState<"ga" | "gsc" | null>(null);
  const [isUsingCustomGoogleAccount, setIsUsingCustomGoogleAccount] = useState(false);
  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState("");

  // Matomo modal inputs
  const [matomoServerUrlInput, setMatomoServerUrlInput] = useState("");
  const [matomoAuthTokenInput, setMatomoAuthTokenInput] = useState("");
  const [matomoSiteIdInput, setMatomoSiteIdInput] = useState("");

  // Traffic view timeframe
  const [timeframe, setTimeframe] = useState<"7d" | "28d" | "90d">("28d");
  // Snippet preview device
  const [snippetDevice, setSnippetDevice] = useState<"desktop" | "mobile">("desktop");

  // Snippets sub-tab interactive states
  const [isSnippetsBannerDismissed, setIsSnippetsBannerDismissed] = useState(false);
  const [selectedSnippetKeywordId, setSelectedSnippetKeywordId] = useState("work-idle");
  const [snippetKeywordSearch, setSnippetKeywordSearch] = useState("");
  const [snippetGroupFilter, setSnippetGroupFilter] = useState("ALL KEYWORDS");
  const [snippetMetric, setSnippetMetric] = useState<"AVERAGE POSITION" | "TRAFFIC FORECAST" | "SEARCH VISIBILITY">("AVERAGE POSITION");
  const [snippetTimeframe, setSnippetTimeframe] = useState<"LAST WEEK" | "MONTH" | "3 MONTHS" | "6 MONTHS">("LAST WEEK");
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  // Snippets Date Range Picker states
  const [snippetDateRangeText, setSnippetDateRangeText] = useState("17 Sep 2026 - 17 Sep 2026");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [stagedRangeStart, setStagedRangeStart] = useState<Date>(new Date(2026, 8, 17));
  const [stagedRangeEnd, setStagedRangeEnd] = useState<Date>(new Date(2026, 8, 17));
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date>(new Date(2026, 8, 17));
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date>(new Date(2026, 8, 17));
  const [activePreset, setActivePreset] = useState<string | null>("TODAY");
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August (0-indexed: 7)
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September (0-indexed: 8)
  const [selectingEnd, setSelectingEnd] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // SEO potential sub-tab interactive states
  const [isPotentialBannerDismissed, setIsPotentialBannerDismissed] = useState(false);
  const [isSeoPotentialGuideOpen, setIsSeoPotentialGuideOpen] = useState(false);
  const [conversionDenominator, setConversionDenominator] = useState(100);
  const [avgRevenuePerCustomer, setAvgRevenuePerCustomer] = useState(50);
  const [estimatedTop, setEstimatedTop] = useState(10);
  const [isEditingConversion, setIsEditingConversion] = useState(false);
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [exampleConversion, setExampleConversion] = useState(50);
  const [exampleIncome, setExampleIncome] = useState(5);
  const [isEditingExampleConversion, setIsEditingExampleConversion] = useState(false);
  const [isEditingExampleIncome, setIsEditingExampleIncome] = useState(false);

  // Click outside and Escape key handling for date picker popover
  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsDatePickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatePickerOpen, appliedRangeStart, appliedRangeEnd]);

  // Escape key handling for SEO potential guide modal
  useEffect(() => {
    if (!isSeoPotentialGuideOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSeoPotentialGuideOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSeoPotentialGuideOpen]);

  // Calendar constants and helpers
  const CAL_SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const CAL_FULL_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formatDisplayDate = (d: Date) => {
    return `${d.getDate()} ${CAL_SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const applyPreset = (preset: string) => {
    const today = new Date(2026, 8, 17); // 17 Sep 2026
    let start = new Date(today);
    let end = new Date(today);

    switch (preset) {
      case "TODAY":
        start = new Date(today);
        end = new Date(today);
        break;
      case "YESTERDAY":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        end = new Date(start);
        break;
      case "LAST WEEK":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        end = new Date(today);
        break;
      case "LAST MONTH":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "PAST 7 DAYS":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        end = new Date(today);
        break;
      case "PAST 30 DAYS":
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        end = new Date(today);
        break;
      case "PAST 6 MONTHS":
        start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        end = new Date(today);
        break;
      case "YEAR":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today);
        break;
      default:
        break;
    }

    setStagedRangeStart(start);
    setStagedRangeEnd(end);
    setSelectingEnd(false);
    setActivePreset(preset);

    // Adjust visible calendar months to show the range
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

  const handleApplyDateRange = () => {
    const formatted = `${formatDisplayDate(stagedRangeStart)} - ${formatDisplayDate(stagedRangeEnd)}`;
    setSnippetDateRangeText(formatted);
    setAppliedRangeStart(stagedRangeStart);
    setAppliedRangeEnd(stagedRangeEnd);
    setIsDatePickerOpen(false);
  };

  const handleCancelDateRange = () => {
    setStagedRangeStart(appliedRangeStart);
    setStagedRangeEnd(appliedRangeEnd);
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
        cellStyle += "border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-950/70 rounded-md";
      } else if (isStart) {
        cellStyle += "border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-950/70 rounded-l-md";
      } else if (isEnd) {
        cellStyle += "border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-950/70 rounded-r-md";
      } else if (isInRange) {
        cellStyle += "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-none";
      } else {
        cellStyle += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
          onClick={() => handleDateClick(current)}
          className={cellStyle}
        >
          <span>{d}</span>
          {(isStart || isEnd) && (
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
        <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-slate-400 mb-1 text-center">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells}
        </div>
      </div>
    );
  };

  // Load project details
  useEffect(() => {
    let ignore = false;
    api.projects
      .get(projectId)
      .then((res) => {
        if (!ignore && res.data) {
          setProject(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load project in AnalyticsWorkspace:", err);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [projectId]);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Google Accounts for OAuth Picker matching exact user screenshot
  const googleAccounts = useMemo(() => {
    const list = [
      {
        name: "Bittumk12 Ydv",
        email: "bittumkydv12@gmail.com",
        avatarLetter: "B",
        color: "bg-[#D81B60]",
        signedOut: false,
      },
      {
        name: "Mamta",
        email: "itsmamta1ydv@gmail.com",
        avatarLetter: "M",
        color: "bg-[#EF6C00]",
        signedOut: true,
      },
      {
        name: "bittu1 ydv",
        email: "bittu1ydv@gmail.com",
        avatarLetter: "b",
        color: "bg-[#3949AB]",
        signedOut: false,
      },
      {
        name: "Suraj Vishwakarma",
        email: "itxsuraj9930@gmail.com",
        avatarLetter: "S",
        color: "bg-[#7B1FA2]",
        signedOut: false,
      },
      {
        name: "SE Ranking Marketing",
        email: "marketing@seranking.com",
        avatarLetter: "M",
        color: "bg-purple-600",
        signedOut: false,
      },
    ];
    if (user?.email && !list.some((a) => a.email.toLowerCase() === user.email.toLowerCase())) {
      list.unshift({
        name: user.fullName || user.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        email: user.email,
        avatarLetter: (user.email[0] || "U").toUpperCase(),
        color: "bg-teal-600",
        signedOut: false,
      });
    }
    return list;
  }, [user]);

  const handleSelectGoogleAccount = (selectedEmail: string) => {
    if (googleOAuthTarget === "ga") {
      setGaConnection({
        connected: true,
        propertyId: "G-DEMO123456",
        accountEmail: selectedEmail,
      });
    } else if (googleOAuthTarget === "gsc") {
      setGscConnection({
        connected: true,
        siteUrl: project?.primaryDomain ? `https://${project.primaryDomain}/` : "https://example.com/",
        accountEmail: selectedEmail,
      });
    }
    setActiveModal(null);
    setGoogleOAuthTarget(null);
  };

  const hasAnyServiceConnected =
    gaConnection.connected || gscConnection.connected || matomoConnection.connected;

  const domainName = project?.primaryDomain || "example.com";

  const getSubTabLabel = (tab: AnalyticsSubTab): string => {
    switch (tab) {
      case "overview":
        return "Overview";
      case "traffic":
        return "Traffic";
      case "snippets":
        return "Snippets";
      case "gsc":
        return "Google Search Console Data";
      case "potential":
        return "SEO potential";
    }
  };

  const handleTabClick = (tab: AnalyticsSubTab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      router.push(`/projects/${projectId}/analytics`);
    } else {
      router.push(`/projects/${projectId}/analytics/${tab}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-12">
      {/* Top Header Bar with Breadcrumbs and Utility Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href={`/projects/${projectId}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            {domainName}
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link
            href={`/projects/${projectId}/analytics`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Analytics &amp; Traffic
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {getSubTabLabel(activeTab)}
          </span>
        </div>

        {/* Top-Right Utility Links */}
        <div className="flex items-center gap-6 text-sm text-blue-600 dark:text-blue-400 font-normal">
          <button
            type="button"
            className="hover:underline cursor-pointer flex items-center gap-1.5 transition"
          >
            <span>🔗</span>
            <span>Guest link</span>
          </button>
          <button
            type="button"
            className="hover:underline cursor-pointer flex items-center gap-1.5 transition"
          >
            <span>💬</span>
            <span>Feedback</span>
          </button>
          <button
            type="button"
            className="hover:underline cursor-pointer flex items-center gap-1.5 transition"
          >
            <span>📝</span>
            <span>Notes (46)</span>
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "traffic", label: "Traffic" },
            { id: "snippets", label: "Snippets" },
            { id: "gsc", label: "Google Search Console Data" },
            { id: "potential", label: "SEO potential" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabClick(t.id)}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
              activeTab === t.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: Overview */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden relative">
          {/* Top Accent Line */}
          <div className="h-1 w-full bg-blue-600" />

          <div className="p-8 sm:p-12">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white text-center mb-2">
                Analytics and statistics services
              </h2>
              <p className="max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mx-auto mb-6">
                Connect Google Analytics and statistics services to get detailed information about your
                website without switching between browser tabs. It will only take a few minutes.
              </p>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-800 w-full max-w-2xl mx-auto mb-8" />

              {/* Connected Notice Banner if any service is connected */}
              {hasAnyServiceConnected && (
                <div className="w-full mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎉</span>
                    <div>
                      <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Analytics Services Connected
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Telemetry data is synchronized. Click CONTINUE &gt; to view traffic reports.
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTabClick("traffic")}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    View Reports &gt;
                  </Button>
                </div>
              )}

              {/* Integration Buttons Grid */}
              <div className="w-full max-w-2xl mx-auto space-y-4">
                {/* Row 1: 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Button 1: Connect Google Analytics */}
                  {gaConnection.connected ? (
                    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 shadow-xs rounded-md py-3 px-4 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="14" width="4" height="8" rx="1.5" fill="#F9AB00" />
                          <rect x="10" y="8" width="4" height="14" rx="1.5" fill="#F9AB00" />
                          <rect x="17" y="2" width="4" height="20" rx="1.5" fill="#E37400" />
                          <circle cx="19" cy="4" r="1.5" fill="#F9AB00" />
                        </svg>
                        <div className="truncate text-left">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs block">
                            ✓ Connected
                          </span>
                          <span className="text-xs text-slate-500 truncate block font-mono">
                            {gaConnection.accountEmail || "Google Analytics"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGaConnection({ connected: false })}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleOAuthTarget("ga");
                        setIsUsingCustomGoogleAccount(false);
                        setCustomGoogleEmailInput("");
                        setActiveModal("googleOAuth");
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm rounded-md py-3 px-5 flex items-center justify-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-slate-300 transition cursor-pointer"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="14" width="4" height="8" rx="1.5" fill="#F9AB00" />
                        <rect x="10" y="8" width="4" height="14" rx="1.5" fill="#F9AB00" />
                        <rect x="17" y="2" width="4" height="20" rx="1.5" fill="#E37400" />
                        <circle cx="19" cy="4" r="1.5" fill="#F9AB00" />
                      </svg>
                      <span>Connect Google Analytics</span>
                    </button>
                  )}

                  {/* Button 2: Connect Google Search Console */}
                  {gscConnection.connected ? (
                    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 shadow-xs rounded-md py-3 px-4 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                        <div className="truncate text-left">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs block">
                            ✓ Connected
                          </span>
                          <span className="text-xs text-slate-500 truncate block font-mono">
                            {gscConnection.accountEmail || "Search Console"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGscConnection({ connected: false })}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleOAuthTarget("gsc");
                        setIsUsingCustomGoogleAccount(false);
                        setCustomGoogleEmailInput("");
                        setActiveModal("googleOAuth");
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm rounded-md py-3 px-5 flex items-center justify-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-slate-300 transition cursor-pointer"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span>Connect Google Search Console</span>
                    </button>
                  )}
                </div>

                {/* Row 2: Connect Matomo Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matomoConnection.connected ? (
                    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 shadow-xs rounded-md py-3 px-4 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="24" cy="24" r="24" fill="#3152A0" />
                          <path d="M11 35V20.5C11 18.5 12.5 17 14.5 17C16.5 17 18 18.5 18 20.5V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                          <path d="M18 26C18 23 20 21 22.5 21C25 21 27 23 27 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                          <path d="M27 26C27 23 29 21 31.5 21C34 21 36 23 36 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="14.5" cy="12" r="2.5" fill="#E45844" />
                          <circle cx="23.5" cy="16" r="2" fill="#E45844" />
                          <circle cx="32.5" cy="16" r="2" fill="#E45844" />
                        </svg>
                        <div className="truncate text-left">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs block">
                            ✓ Connected
                          </span>
                          <span className="text-xs text-slate-500 truncate block font-mono">
                            Site ID #{matomoConnection.siteId || "1"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMatomoConnection({ connected: false })}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMatomoServerUrlInput("");
                        setMatomoAuthTokenInput("");
                        setMatomoSiteIdInput("");
                        setActiveModal("matomo");
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm rounded-md py-3 px-5 flex items-center justify-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-slate-300 transition cursor-pointer"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="24" fill="#3152A0" />
                        <path d="M11 35V20.5C11 18.5 12.5 17 14.5 17C16.5 17 18 18.5 18 20.5V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                        <path d="M18 26C18 23 20 21 22.5 21C25 21 27 23 27 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                        <path d="M27 26C27 23 29 21 31.5 21C34 21 36 23 36 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="14.5" cy="12" r="2.5" fill="#E45844" />
                        <circle cx="23.5" cy="16" r="2" fill="#E45844" />
                        <circle cx="32.5" cy="16" r="2" fill="#E45844" />
                      </svg>
                      <span>Connect Matomo Analytics</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button: CONTINUE > */}
              <button
                type="button"
                disabled={!hasAnyServiceConnected}
                onClick={() => handleTabClick("traffic")}
                className={`mt-8 uppercase transition select-none ${
                  hasAnyServiceConnected
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-8 py-2.5 rounded text-xs font-semibold shadow-xs"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-0 px-8 py-2.5 rounded text-xs font-semibold"
                }`}
              >
                CONTINUE &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Traffic */}
      {activeTab === "traffic" && (
        <div className="space-y-6">
          {/* Timeframe selector */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Website Traffic Telemetry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Session metrics, visitor engagement, and conversion acquisition.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["7d", "28d", "90d"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTimeframe(key)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    timeframe === key
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Last {key}
                </button>
              ))}
            </div>
          </div>

          {/* Traffic KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Total Sessions</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">142,850</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +12.4% vs prev</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Total Users</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">98,420</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +8.2% vs prev</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Pageviews</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">385,210</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +15.7% vs prev</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Bounce Rate</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">42.3%</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↓ -3.1% improved</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Avg. Session Duration</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">2m 48s</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +18s vs prev</div>
            </div>
          </div>

          {/* Traffic Channels Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
              Acquisition by Traffic Channel
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Channel Group</th>
                  <th className="p-3">Sessions</th>
                  <th className="p-3">Share</th>
                  <th className="p-3">Users</th>
                  <th className="p-3">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { channel: "Organic Search", sessions: "91,710", share: "64.2%", users: "63,120", cr: "3.8%" },
                  { channel: "Direct", sessions: "26,427", share: "18.5%", users: "18,200", cr: "4.2%" },
                  { channel: "Referral", sessions: "13,999", share: "9.8%", users: "9,640", cr: "2.9%" },
                  { channel: "Organic Social", sessions: "7,285", share: "5.1%", users: "5,020", cr: "1.8%" },
                  { channel: "Paid Search", sessions: "3,429", share: "2.4%", users: "2,440", cr: "5.1%" },
                ].map((row) => (
                  <tr key={row.channel} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.channel}</td>
                    <td className="p-3 font-mono">{row.sessions}</td>
                    <td className="p-3">{row.share}</td>
                    <td className="p-3 font-mono">{row.users}</td>
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{row.cr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Snippets */}
      {activeTab === "snippets" && (() => {
        const activeSnippetKeyword =
          SNIPPET_KEYWORDS.find((k) => k.id === selectedSnippetKeywordId) || SNIPPET_KEYWORDS[1];

        const filteredKeywords = SNIPPET_KEYWORDS.filter((item) => {
          const matchesQuery = item.keyword.toLowerCase().includes(snippetKeywordSearch.toLowerCase().trim());
          if (!matchesQuery) return false;
          if (snippetGroupFilter === "Brand Terms") {
            return item.keyword.includes("composer");
          }
          if (snippetGroupFilter === "Tracking Tools") {
            return item.keyword.includes("track") || item.keyword.includes("idle");
          }
          return true;
        });

        // Graph calculations
        const historyData = activeSnippetKeyword.history;
        const totalPoints = historyData.dates.length;
        const graphWidth = 520;
        const graphHeight = 170;
        const paddingLeft = 45;
        const paddingRight = 25;
        const paddingTop = 25;
        const paddingBottom = 30;
        const usableWidth = graphWidth - paddingLeft - paddingRight;
        const usableHeight = graphHeight - paddingTop - paddingBottom;

        let metricValues: number[] = [];
        let yLabels: { value: string; y: number }[] = [];

        if (snippetMetric === "AVERAGE POSITION") {
          // Inverted: top rank (35) is near top, 100 is at bottom
          metricValues = historyData.positions;
          const minRank = 20;
          const maxRank = 100;
          yLabels = [
            { value: "35", y: paddingTop + ((35 - minRank) / (maxRank - minRank)) * usableHeight },
            { value: "36", y: paddingTop + ((36 - minRank) / (maxRank - minRank)) * usableHeight },
            { value: "50", y: paddingTop + ((50 - minRank) / (maxRank - minRank)) * usableHeight },
            { value: "100", y: paddingTop + ((100 - minRank) / (maxRank - minRank)) * usableHeight },
          ];
        } else if (snippetMetric === "TRAFFIC FORECAST") {
          metricValues = historyData.traffic;
          const maxVal = 260;
          yLabels = [
            { value: "250", y: paddingTop },
            { value: "150", y: paddingTop + usableHeight * 0.4 },
            { value: "50", y: paddingTop + usableHeight * 0.8 },
            { value: "0", y: paddingTop + usableHeight },
          ];
        } else {
          metricValues = historyData.visibility;
          yLabels = [
            { value: "100%", y: paddingTop },
            { value: "75%", y: paddingTop + usableHeight * 0.25 },
            { value: "50%", y: paddingTop + usableHeight * 0.5 },
            { value: "25%", y: paddingTop + usableHeight * 0.75 },
            { value: "0%", y: paddingTop + usableHeight },
          ];
        }

        const points = metricValues.map((val, idx) => {
          const x = paddingLeft + (idx / (totalPoints - 1)) * usableWidth;
          let y = paddingTop + usableHeight;
          if (snippetMetric === "AVERAGE POSITION") {
            const minRank = 20;
            const maxRank = 100;
            y = paddingTop + ((val - minRank) / (maxRank - minRank)) * usableHeight;
          } else if (snippetMetric === "TRAFFIC FORECAST") {
            const maxVal = 260;
            y = paddingTop + usableHeight - (val / maxVal) * usableHeight;
          } else {
            y = paddingTop + usableHeight - (val / 100) * usableHeight;
          }
          return { x, y, val, date: historyData.dates[idx] };
        });

        const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const areaStr = `${paddingLeft},${paddingTop + usableHeight} ${pointsStr} ${
          paddingLeft + usableWidth
        },${paddingTop + usableHeight}`;

        return (
          <div className="space-y-6">
            {/* 1. Information Banner */}
            {!isSnippetsBannerDismissed && (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 leading-relaxed shadow-xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 text-blue-600 dark:text-blue-400">ℹ</span>
                  <span>
                    Find out how effective your snippets are. After all, the way a web page is displayed in
                    search engines has a direct impact on the number of clicks it gets. All the data in this
                    section is grouped by search engines and dates, and is stored for 30 days.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSnippetsBannerDismissed(true)}
                  className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 p-0.5 rounded cursor-pointer transition flex-shrink-0"
                  aria-label="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 2. Title & Top Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mr-2">
                  Snippets
                </h2>

                {/* Search Engine / Country Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer"
                  >
                    {/* Google multicolor G icon */}
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Google India</span>
                    <span className="text-slate-400">▾</span>
                  </button>

                  {isEngineDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsEngineDropdownOpen(false)}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 font-semibold"
                      >
                        <span>🇮🇳</span>
                        <span>Google India</span>
                        <span className="ml-auto">✓</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEngineDropdownOpen(false)}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <span>🇺🇸</span>
                        <span>Google USA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEngineDropdownOpen(false)}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <span>🇬🇧</span>
                        <span>Google UK</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Date Range Picker Popover Container */}
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer"
                  >
                    <span>📅</span>
                    <span>{snippetDateRangeText}</span>
                    <span className="text-slate-400">▾</span>
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[620px] max-w-[760px]">
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
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer">
                              <span>{CAL_FULL_MONTHS[calendarLeftMonth]}  {calendarLeftYear}</span>
                              <span className="text-slate-400 text-[10px]">▾</span>
                            </div>
                            <div className="w-5" />
                          </div>

                          <div className="hidden sm:block border-r border-slate-100 dark:border-slate-800 h-6" />

                          {/* Right Month Header */}
                          <div className="flex items-center justify-between w-56">
                            <div className="w-5" />
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer">
                              <span>{CAL_FULL_MONTHS[calendarRightMonth]}  {calendarRightYear}</span>
                              <span className="text-slate-400 text-[10px]">▾</span>
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
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            <span>{formatDisplayDate(stagedRangeStart)}</span>
                            <span className="mx-1.5 text-slate-400">—</span>
                            <span>{formatDisplayDate(stagedRangeEnd)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelDateRange}
                              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyDateRange}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-xs tracking-wider uppercase transition cursor-pointer shadow-xs"
                            >
                              APPLY
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Quick Preset Range Buttons */}
                      <div className="w-full md:w-36 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
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
                            className={`w-full text-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition cursor-pointer ${
                              activePreset === preset
                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top-Right EXPORT Button */}
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                <span>⬆</span>
                <span>EXPORT</span>
              </button>
            </div>

            {/* 3. Two-Column Workspace Layout (Keyword Selector Table & Historical Graph) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Filterable Keyword Selector Table */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col">
                {/* Search & Group Filter Header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                    <input
                      type="text"
                      placeholder="Search keyword..."
                      value={snippetKeywordSearch}
                      onChange={(e) => setSnippetKeywordSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Group Filter Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      <span>📁</span>
                      <span className="truncate max-w-[110px]">{snippetGroupFilter}</span>
                      <span className="text-slate-400 text-[10px]">▾</span>
                    </button>
                    {isGroupDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                        {["ALL KEYWORDS", "Brand Terms", "Tracking Tools"].map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => {
                              setSnippetGroupFilter(grp);
                              setIsGroupDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left transition ${
                              snippetGroupFilter === grp
                                ? "text-blue-600 font-semibold bg-blue-50/40 dark:bg-blue-950/40"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {grp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1 max-h-[350px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 font-semibold">
                          <span className="flex items-center gap-1">
                            KEYWORD <span>▴</span>
                          </span>
                        </th>
                        <th className="p-3 font-semibold text-right whitespace-nowrap">
                          SEARCH VOLUME
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredKeywords.map((item) => {
                        const isSelected = item.id === selectedSnippetKeywordId;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedSnippetKeywordId(item.id)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? "bg-blue-50/70 dark:bg-blue-950/50 border-l-4 border-blue-600 font-semibold text-blue-900 dark:text-blue-100"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                {/* Radio selection circle */}
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition flex-shrink-0 ${
                                    isSelected
                                      ? "border-blue-600 bg-white dark:bg-slate-900"
                                      : "border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                  )}
                                </div>
                                <span className="truncate">{item.keyword}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-500 dark:text-slate-400">
                              {item.searchVolume}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredKeywords.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-6 text-center text-slate-400">
                            No keywords matching &quot;{snippetKeywordSearch}&quot;
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (7 cols): Metrics & Historical Trend Graph */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden p-5 flex flex-col justify-between">
                <div>
                  {/* Metric Switcher Tabs */}
                  <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto">
                    {(["AVERAGE POSITION", "TRAFFIC FORECAST", "SEARCH VISIBILITY"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSnippetMetric(m)}
                        className={`text-xs font-bold uppercase tracking-wider pb-2 -mb-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                          snippetMetric === m
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Timeframe Filter Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Keyword: <span className="font-bold text-slate-800 dark:text-slate-200">{activeSnippetKeyword.keyword}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-[11px] font-semibold">
                      {(["LAST WEEK", "MONTH", "3 MONTHS", "6 MONTHS"] as const).map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setSnippetTimeframe(tf)}
                          className={`px-2.5 py-0.5 rounded transition ${
                            snippetTimeframe === tf
                              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic SVG Trend Line Chart */}
                  <div className="w-full relative pt-2">
                    <svg
                      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                      className="w-full h-44 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="snippetLineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-Axis Labels */}
                      {yLabels.map((yl, i) => (
                        <g key={i}>
                          <line
                            x1={paddingLeft}
                            y1={yl.y}
                            x2={paddingLeft + usableWidth}
                            y2={yl.y}
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            className="text-slate-200 dark:text-slate-800"
                          />
                          <text
                            x={paddingLeft - 8}
                            y={yl.y + 3}
                            textAnchor="end"
                            fontSize="9"
                            className="fill-slate-400 font-mono"
                          >
                            {yl.value}
                          </text>
                        </g>
                      ))}

                      {/* Area Fill */}
                      <polygon points={areaStr} fill="url(#snippetLineGradient)" />

                      {/* Line Path */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Nodes with Tooltips */}
                      {points.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                            className="transition-transform group-hover:scale-125"
                          />
                          {/* Value tag on hover or key points */}
                          <text
                            x={p.x}
                            y={p.y - 8}
                            textAnchor="middle"
                            fontSize="9"
                            className="fill-blue-600 font-bold font-mono opacity-80 group-hover:opacity-100"
                          >
                            {p.val}
                          </text>

                          {/* X-axis date labels */}
                          <text
                            x={p.x}
                            y={paddingTop + usableHeight + 18}
                            textAnchor="middle"
                            fontSize="9"
                            className="fill-slate-400"
                          >
                            {p.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Bottom Legend Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>• Google India</span>
                </div>
              </div>
            </div>

            {/* 4. Live Google SERP Snippet Preview Card */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live SERP Snippet Preview
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{appliedRangeEnd.getDate()} {CAL_FULL_MONTHS[appliedRangeEnd.getMonth()]} {appliedRangeEnd.getFullYear()}</span>
                  </span>
                </div>

                {/* Desktop / Mobile Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSnippetDevice("desktop")}
                    className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      snippetDevice === "desktop"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSnippetDevice("mobile")}
                    className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      snippetDevice === "mobile"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    📱 Mobile
                  </button>
                </div>
              </div>

              {/* Real-World Google SERP Card (Dark Mode Search Engine Appearance) */}
              <div
                className={`bg-[#202124] text-[#bdc1c6] p-5 rounded-2xl border border-slate-700/80 shadow-md font-sans transition-all ${
                  snippetDevice === "mobile" ? "max-w-md mx-auto" : "max-w-3xl"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>{snippetDevice === "mobile" ? "Mobile SERP Layout" : "Desktop SERP Layout"}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    Rank #{activeSnippetKeyword.history.positions[activeSnippetKeyword.history.positions.length - 1]}
                  </span>
                </div>

                {/* Favicon & Domain Breadcrumb */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Favicon with blue W WorkComposer logo */}
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs flex-shrink-0">
                      W
                    </div>
                    <div className="truncate text-xs">
                      <span className="font-semibold text-white block truncate leading-tight">
                        WorkComposer
                      </span>
                      <span className="text-slate-400 text-[11px] block truncate font-mono">
                        {activeSnippetKeyword.url}
                      </span>
                    </div>
                  </div>

                  {/* Options 3-dots icon */}
                  <button
                    type="button"
                    aria-label="Snippet Options"
                    className="text-slate-400 hover:text-white text-sm p-1 rounded transition cursor-pointer"
                  >
                    ⋮
                  </button>
                </div>

                {/* Snippet Title (Link) */}
                <h4 className="text-lg text-[#8ab4f8] hover:underline cursor-pointer font-normal leading-snug my-1">
                  {activeSnippetKeyword.title}
                </h4>

                {/* Snippet Meta Description with Bold Search Terms */}
                <p className="text-xs text-[#bdc1c6] leading-relaxed">
                  <span>{activeSnippetKeyword.descriptionPrefix}</span>
                  <strong className="text-white font-semibold">{activeSnippetKeyword.boldTerms}</strong>
                  <span>{activeSnippetKeyword.descriptionSuffix}</span>
                  <span className="text-[#8ab4f8] hover:underline ml-1.5 cursor-pointer">
                    Read more
                  </span>
                </p>

                {/* Rich Snippets Features Badges */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/60 mt-3">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                    ⭐ 4.9 (128 reviews)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    FAQ Schema (3 questions)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    Sitelinks (4 active)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUB-TAB 4: Google Search Console Data */}
      {activeTab === "gsc" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Search Console Telemetry</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct organic query clicks, impressions, and search position averages.</p>
          </div>

          {/* GSC KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Total Clicks</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">48,250</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +9.4% vs prev</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Total Impressions</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">892,100</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% vs prev</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Average CTR</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">5.4%</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct search ratio</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Average Position</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">12.8</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +1.6 positions</div>
            </div>
          </div>

          {/* Top Search Queries Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
              Top Performing Search Queries
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Query</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { query: "enterprise seo platform", clicks: "4,210", impressions: "42,100", ctr: "10.0%", pos: "2.4" },
                  { query: "rank tracker api", clicks: "3,890", impressions: "51,200", ctr: "7.6%", pos: "3.1" },
                  { query: "best serp checker", clicks: "2,650", impressions: "38,400", ctr: "4.8%", pos: "4.8" },
                  { query: "organic traffic monitor", clicks: "1,940", impressions: "29,100", ctr: "6.7%", pos: "5.2" },
                  { query: "technical seo audit tool", clicks: "1,420", impressions: "24,800", ctr: "5.7%", pos: "7.4" },
                ].map((row) => (
                  <tr key={row.query} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.query}</td>
                    <td className="p-3 font-mono">{row.clicks}</td>
                    <td className="p-3 font-mono">{row.impressions}</td>
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{row.ctr}</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{row.pos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SEO potential */}
      {activeTab === "potential" && (() => {
        // Calculations
        const currentTraffic = 273;
        const currentCost = "$118.28";
        const currentClients = Math.max(1, Math.round(currentTraffic / conversionDenominator));
        const currentIncome = currentClients * avgRevenuePerCustomer;

        // Projected volume based on estimatedTop
        const topRatio = estimatedTop > 0 ? Math.sqrt(10 / estimatedTop) : 1;
        const expectedTraffic = Math.max(10, Math.round(450 * topRatio));
        const expectedCost = (expectedTraffic * (312.03 / 450)).toFixed(2);
        const expectedClients = Math.max(1, Math.round(expectedTraffic / conversionDenominator));
        const expectedIncome = expectedClients * avgRevenuePerCustomer;

        return (
          <div className="space-y-6">
            {/* 1. Dismissible Info Banner */}
            {!isPotentialBannerDismissed && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start justify-between gap-4 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 text-blue-600 dark:text-blue-400">ℹ</span>
                  <div>
                    <h4 className="font-bold text-sm text-blue-950 dark:text-blue-100 mb-0.5">
                      How does SEO potential work?
                    </h4>
                    <p className="leading-relaxed text-blue-900/90 dark:text-blue-200/90">
                      This tool will help you estimate the traffic volume, traffic cost (if acquired through Google Ads), and the potential number of clients.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSeoPotentialGuideOpen(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium underline cursor-pointer text-xs ml-auto mr-3"
                  >
                    Read more
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPotentialBannerDismissed(true)}
                    className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 p-1 rounded cursor-pointer transition"
                    aria-label="Dismiss banner"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* 2. Title & Top Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                SEO potential
              </h2>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                <span>⬆</span>
                <span>EXPORT</span>
              </button>
            </div>

            {/* 3. Interactive Assumption Cards (Sales Conversion & Revenue) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Blue Card: Conversion into sales */}
              <div className="bg-blue-600 text-white rounded-lg p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-lg font-bold">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span className="text-base font-medium">Conversion into sales</span>
                </div>
                <div className="bg-white/20 hover:bg-white/30 rounded-md px-5 py-3 flex items-center gap-3 border border-white/20 cursor-pointer transition">
                  {isEditingConversion ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="font-bold text-lg">1:</span>
                      <input
                        type="number"
                        aria-label="Conversion into sales denominator"
                        autoFocus
                        value={conversionDenominator}
                        onChange={(e) => setConversionDenominator(Math.max(1, Number(e.target.value) || 1))}
                        onBlur={() => setIsEditingConversion(false)}
                        onKeyDown={(e) => { if (e.key === "Enter") setIsEditingConversion(false); }}
                        className="w-20 bg-white/25 text-white font-bold text-base px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingConversion(false)}
                        className="text-xs bg-white text-blue-700 font-bold px-2 py-1 rounded hover:bg-white/90 cursor-pointer"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsEditingConversion(true)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsEditingConversion(true); }}
                      className="flex items-center gap-3 cursor-pointer select-none"
                      title="Click to edit conversion ratio"
                    >
                      <span className="text-xl font-bold tracking-wide">1:{conversionDenominator}</span>
                      <span className="text-sm opacity-80 hover:opacity-100">✏️</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Green Card: Average revenue per customer */}
              <div className="bg-emerald-600 text-white rounded-lg p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-lg">
                    💳
                  </div>
                  <span className="text-base font-medium">Average revenue per customer</span>
                </div>
                <div className="bg-white/20 hover:bg-white/30 rounded-md px-6 py-3 flex items-center gap-3 border border-white/20 cursor-pointer transition">
                  {isEditingRevenue ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="font-bold text-lg">$</span>
                      <input
                        type="number"
                        aria-label="Average revenue per customer"
                        autoFocus
                        value={avgRevenuePerCustomer}
                        onChange={(e) => setAvgRevenuePerCustomer(Math.max(1, Number(e.target.value) || 1))}
                        onBlur={() => setIsEditingRevenue(false)}
                        onKeyDown={(e) => { if (e.key === "Enter") setIsEditingRevenue(false); }}
                        className="w-20 bg-white/25 text-white font-bold text-base px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingRevenue(false)}
                        className="text-xs bg-white text-emerald-700 font-bold px-2 py-1 rounded hover:bg-white/90 cursor-pointer"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsEditingRevenue(true)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsEditingRevenue(true); }}
                      className="flex items-center gap-3 cursor-pointer select-none"
                      title="Click to edit revenue per customer"
                    >
                      <span className="text-xl font-bold tracking-wide">${avgRevenuePerCustomer}</span>
                      <span className="text-sm opacity-80 hover:opacity-100">✏️</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Forecasting Tables */}
            {/* Section 1: Current Traffic Estimate Table */}
            <div>
              <h3 className="text-base font-normal text-slate-700 dark:text-slate-200 mb-3 mt-8">
                Current traffic estimate for all added keywords.
              </h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                    <tr>
                      <th className="p-3.5">SEARCH ENGINE</th>
                      <th className="p-3.5 text-right">CURRENT TRAFFIC FORECAST</th>
                      <th className="p-3.5 text-right">CURRENT TRAFFIC COST IN $</th>
                      <th className="p-3.5 text-right">CURRENT NUMBER OF CLIENTS</th>
                      <th className="p-3.5 text-right">ESTIMATED INCOME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span className="text-sm">🇮🇳</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Google India</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {currentTraffic}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                        {currentCost}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {currentClients}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${currentIncome}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Expected Traffic Volume (Top Tier Goal) Table */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-base font-normal text-slate-700 dark:text-slate-200">
                  <span>
                    Expected traffic volume provided that every keyword ranks among the top {estimatedTop} in search results.
                  </span>
                  <span
                    className="w-4 h-4 rounded-full border border-slate-400 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer hover:border-slate-600 dark:hover:border-slate-200"
                    title="Estimated projection when all keywords rank inside top target"
                  >
                    ⁱ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Estimated top:</span>
                  <input
                    type="number"
                    aria-label="Estimated top rank tier"
                    value={estimatedTop}
                    onChange={(e) => setEstimatedTop(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 px-2.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                    <tr>
                      <th className="p-3.5">SEARCH ENGINE</th>
                      <th className="p-3.5 text-right">ESTIMATED TRAFFIC FORECAST</th>
                      <th className="p-3.5 text-right">ESTIMATED TRAFFIC COST IN $</th>
                      <th className="p-3.5 text-right">ESTIMATED NUMBER OF CLIENTS</th>
                      <th className="p-3.5 text-right">ESTIMATED INCOME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span className="text-sm">🇮🇳</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Google India</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {expectedTraffic}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                        ${expectedCost}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {expectedClients}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${expectedIncome}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Google OAuth Modal */}
      {activeModal === "googleOAuth" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setActiveModal(null);
            setGoogleOAuthTarget(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                setGoogleOAuthTarget(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer text-sm"
            >
              ✕
            </button>

            {/* Google Logo */}
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white text-center">
              Choose an account
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              to continue to SE Ranking
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 mb-4">
              {googleAccounts.map((acc) => (
                <button
                  type="button"
                  key={acc.email}
                  onClick={() => handleSelectGoogleAccount(acc.email)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-full ${acc.color} text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-sm`}>
                    {acc.avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition">
                      {acc.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {acc.email}
                    </div>
                  </div>
                  {acc.signedOut && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-normal shrink-0">
                      Signed out
                    </span>
                  )}
                </button>
              ))}

              {!isUsingCustomGoogleAccount ? (
                <button
                  type="button"
                  onClick={() => setIsUsingCustomGoogleAccount(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 font-bold shrink-0 text-sm">
                    +
                  </div>
                  <span className="text-sm font-medium">Use another account</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter Google email..."
                    value={customGoogleEmailInput}
                    onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                    className="w-full text-xs"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUsingCustomGoogleAccount(false)}
                      className="text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSelectGoogleAccount(customGoogleEmailInput.trim() || "user@example.com")}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with SE Ranking.
            </p>
          </div>
        </div>
      )}

      {/* Matomo Modal */}
      {activeModal === "matomo" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Connect Matomo Analytics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Matomo server URL address <span className="text-slate-400 font-normal">ⁱ</span>
                </label>
                <Input
                  type="text"
                  placeholder="https://yourdomain.com/your-new-page-url"
                  value={matomoServerUrlInput}
                  onChange={(e) => setMatomoServerUrlInput(e.target.value)}
                  className="w-full text-xs font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authentication token <span className="text-slate-400 font-normal">ⁱ</span>
                </label>
                <Input
                  type="password"
                  placeholder="Insert a token"
                  value={matomoAuthTokenInput}
                  onChange={(e) => setMatomoAuthTokenInput(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site ID <span className="text-slate-400 font-normal">ⁱ</span>
                </label>
                <Input
                  type="text"
                  placeholder="Insert ID"
                  value={matomoSiteIdInput}
                  onChange={(e) => setMatomoSiteIdInput(e.target.value)}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveModal(null)}
                className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              >
                CANCEL
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const sUrl = matomoServerUrlInput.trim() || "https://yourdomain.com/your-new-page-url";
                  const sId = matomoSiteIdInput.trim() || "1";
                  setMatomoConnection({
                    connected: true,
                    serverUrl: sUrl,
                    siteId: sId,
                    authToken: matomoAuthTokenInput.trim(),
                  });
                  setActiveModal(null);
                }}
                className="text-xs font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                CONNECT
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Guide Modal: How does SEO potential work? */}
      {isSeoPotentialGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="seo-potential-guide-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSeoPotentialGuideOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                  ℹ
                </div>
                <div>
                  <h3
                    id="seo-potential-guide-title"
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    How does SEO potential work?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Understanding organic search traffic, cost equivalents, and revenue projections
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSeoPotentialGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                The <strong>SEO Potential</strong> module estimates the tangible business value and financial return of improving your organic search rankings. Projections are calculated dynamically from your project keywords, rank positions, and business metrics.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                    <span>📈</span>
                    <span>1. Estimated Traffic</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Keyword search volumes are combined with expected Click-Through Rates (CTR) based on your target ranking tier (e.g. Top 10, Top 5, Top 1).
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    Formula: Search Volume × SERP CTR
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>💰</span>
                    <span>2. Traffic Cost</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Calculates how much equivalent paid traffic would cost if purchased through Google Ads pay-per-click (PPC) campaigns.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    Formula: Estimated Clicks × Google Ads CPC
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                    <span>👥</span>
                    <span>3. Potential Number of Clients</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Determines how many organic visitors convert into actual buyers or qualified leads based on your customizable sales conversion ratio.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    Formula: Traffic ÷ Conversion Ratio
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
                    <span>💵</span>
                    <span>4. Estimated Income</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Projects your gross revenue potential by multiplying converted clients with your average revenue per customer.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    Formula: Clients × Average Revenue
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs">
                💡 <strong>Tip:</strong> Click on the <em>Conversion into sales</em> or <em>Average revenue per customer</em> values to customize financial assumptions for your specific business model.
              </div>

              {/* How to get started? section with embedded example cards */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚀</span>
                  <span>How to get started?</span>
                </h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Targeted conversion actions:</strong> Set the conversion ratio showing how many visitors perform a targeted action (e.g. 1 out of 50 visitors makes a purchase).
                  </li>
                  <li>
                    <strong>Client profit & average income:</strong> Specify the average profit or income received from each paying customer (e.g. $5 per sale).
                  </li>
                </ul>

                {/* Example Assumption Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  {/* Blue Card: Conversion into sales */}
                  <div className="bg-blue-600 text-white rounded-lg p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium">Conversion into sales</span>
                    </div>
                    <div className="bg-white/10 hover:bg-white/20 border border-white/25 rounded-md px-3.5 py-1.5 flex items-center gap-2 cursor-pointer transition">
                      {isEditingExampleConversion ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-semibold">1:</span>
                          <input
                            type="number"
                            aria-label="Example conversion into sales denominator"
                            autoFocus
                            value={exampleConversion}
                            onChange={(e) => setExampleConversion(Math.max(1, Number(e.target.value) || 1))}
                            onBlur={() => setIsEditingExampleConversion(false)}
                            onKeyDown={(e) => { if (e.key === "Enter") setIsEditingExampleConversion(false); }}
                            className="w-14 bg-white/25 text-white font-semibold text-xs px-1 py-0.5 rounded focus:outline-none text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingExampleConversion(false)}
                            className="text-[10px] bg-white text-blue-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setIsEditingExampleConversion(true)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsEditingExampleConversion(true); }}
                          className="flex items-center gap-2 select-none"
                          title="Click to edit example conversion"
                        >
                          <span className="text-base font-semibold tracking-wide">1:{exampleConversion}</span>
                          <span className="text-xs opacity-80 hover:opacity-100">✏️</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Green Card: Average income from the client */}
                  <div className="bg-emerald-600 text-white rounded-lg p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium">Average income from the client</span>
                    </div>
                    <div className="bg-white/10 hover:bg-white/20 border border-white/25 rounded-md px-4 py-1.5 flex items-center gap-2 cursor-pointer transition">
                      {isEditingExampleIncome ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-semibold">$</span>
                          <input
                            type="number"
                            aria-label="Example average income from the client"
                            autoFocus
                            value={exampleIncome}
                            onChange={(e) => setExampleIncome(Math.max(1, Number(e.target.value) || 1))}
                            onBlur={() => setIsEditingExampleIncome(false)}
                            onKeyDown={(e) => { if (e.key === "Enter") setIsEditingExampleIncome(false); }}
                            className="w-14 bg-white/25 text-white font-semibold text-xs px-1 py-0.5 rounded focus:outline-none text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingExampleIncome(false)}
                            className="text-[10px] bg-white text-emerald-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setIsEditingExampleIncome(true)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsEditingExampleIncome(true); }}
                          className="flex items-center gap-2 select-none"
                          title="Click to edit example income"
                        >
                          <span className="text-base font-semibold tracking-wide">${exampleIncome}</span>
                          <span className="text-xs opacity-80 hover:opacity-100">✏️</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Customize these sample assumptions or apply them directly to your active project workspace.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionDenominator(exampleConversion);
                      setAvgRevenuePerCustomer(exampleIncome);
                      setIsSeoPotentialGuideOpen(false);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 flex-shrink-0"
                  >
                    <span>Apply to Workspace</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSeoPotentialGuideOpen(false)}
                className="px-6 py-2 text-xs font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-xs cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
