"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ProjectDetailDto } from "@/lib/types";
import { RankingsSubnav } from "./RankingsSubnav";
import { useAuth } from "@/context/AuthContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ProjectFavicon } from "@/components/ui/ProjectFavicon";

import {
  RankingSettingsState,
  defaultRankingSettings,
  ALL_TABLE_COLUMNS,
  DEFAULT_SELECTED_COLUMNS,
  DEFAULT_CHART_OPTIONS,
  DEFAULT_SECTION_OPTIONS,
  AMOUNT_OF_DATA_OPTIONS,
  DEFAULT_TABLE_VIEW_MODE_OPTIONS,
  SORT_BY_COLUMN_OPTIONS,
  NoteTypeOption,
  NOTE_TYPE_OPTIONS,
  DEFAULT_SELECTED_CHART_NOTES,
  CHART_NOTES_PRESETS,
  filterDatesByAmount,
  formatChartNotesSummary,
} from "@/hooks/useRankingSettings";

export {
  ALL_TABLE_COLUMNS,
  DEFAULT_SELECTED_COLUMNS,
  defaultRankingSettings,
  DEFAULT_CHART_OPTIONS,
  DEFAULT_SECTION_OPTIONS,
  AMOUNT_OF_DATA_OPTIONS,
  DEFAULT_TABLE_VIEW_MODE_OPTIONS,
  SORT_BY_COLUMN_OPTIONS,
  NOTE_TYPE_OPTIONS,
  DEFAULT_SELECTED_CHART_NOTES,
  CHART_NOTES_PRESETS,
  filterDatesByAmount,
};
export type { RankingSettingsState, NoteTypeOption };

export type RankingModalSubView =
  | "main"
  | "defaultChart"
  | "defaultSection"
  | "amountOfData"
  | "defaultTableViewMode"
  | "tableColumns"
  | "sortByColumn"
  | "chartNotes";

export interface RankingsHeaderProps {
  project: ProjectDetailDto;
  activeSubTab: "Summary" | "Detailed" | "Historical Data";
  title?: string;
  description?: string;
  badge?: string;
  badgeColor?: "blue" | "rose" | "emerald" | "amber" | "purple";
  notesCount?: number;
  keywordsCount?: number;
  totalKeywordsLimit?: number;
  manualRechecksUsed?: number;
  manualRechecksTotal?: number;
  searchEngine?: string;
  country?: string;
  language?: string;
  dateRange?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  isRechecking?: boolean;
  onAddKeywords?: () => void;
  onRecheck?: () => void;
  onExport?: (format?: "xlsx" | "csv") => void;
  onDataStudio?: () => void;
  onSaveRankingSettings?: (settings: RankingSettingsState) => void;
  showSubnav?: boolean;
}

// Helpers for calendar formatting
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDisplayDate(d: Date): string {
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function parseInitialDate(str?: string, defaultDate?: Date): Date {
  if (!str) return defaultDate || new Date();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  return defaultDate || new Date();
}

export function RankingsHeader({
  project,
  activeSubTab,
  title,
  description,
  badge,
  badgeColor = "blue",
  notesCount = 46,
  keywordsCount,
  totalKeywordsLimit = 750,
  manualRechecksUsed = 0,
  manualRechecksTotal = 750,
  searchEngine = "Google",
  country,
  language = "EN",
  dateRange: initialDateRange = "15 Sep 2026 - 16 Sep 2026",
  onDateRangeChange,
  isRechecking = false,
  onAddKeywords,
  onRecheck,
  onExport,
  onDataStudio,
  onSaveRankingSettings,
  showSubnav = true,
}: RankingsHeaderProps) {
  const { isViewer } = useAuth();

  // Utility state
  const [copiedLink, setCopiedLink] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Popovers & Dropdowns State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRankingSettingsModalOpen, setIsRankingSettingsModalOpen] = useState(false);
  const [isChartNotesDropdownOpen, setIsChartNotesDropdownOpen] = useState(false);
  const [rankingModalView, setRankingModalView] = useState<RankingModalSubView>("main");

  // Ranking Settings state
  const [rankingSettings, setRankingSettings] = useState<RankingSettingsState>(defaultRankingSettings);
  const [tempSettings, setTempSettings] = useState<RankingSettingsState>(defaultRankingSettings);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem(`ranking_settings_${project.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setRankingSettings((prev) => ({ ...prev, ...parsed }));
          setTempSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [project.id]);

  const handleToggleColumn = (col: string) => {
    setTempSettings((prev) => {
      const current = prev.selectedColumns || DEFAULT_SELECTED_COLUMNS;
      const updated = current.includes(col)
        ? current.filter((c) => c !== col)
        : [...current, col];
      return {
        ...prev,
        selectedColumns: updated,
        tableColumns: updated.length === 0 ? "None selected" : updated.join(", "),
      };
    });
  };

  const handleClearAllColumns = () => {
    setTempSettings((prev) => ({
      ...prev,
      selectedColumns: [],
      tableColumns: "None selected",
    }));
  };

  const handleToggleChartNote = (noteId: string) => {
    setTempSettings((prev) => {
      const current = prev.selectedChartNotes || DEFAULT_SELECTED_CHART_NOTES;
      const updated = current.includes(noteId)
        ? current.filter((n) => n !== noteId)
        : [...current, noteId];

      const presetLabel = formatChartNotesSummary(updated);

      return {
        ...prev,
        selectedChartNotes: updated,
        chartNotes: presetLabel,
      };
    });
  };

  const handleSelectChartNotesPreset = (preset: string) => {
    if (preset === "Keyword note, Project note, Google update, Important update...") {
      setIsChartNotesDropdownOpen(false);
      setRankingModalView("chartNotes");
      return;
    }

    let selectedNotes: string[] = [];
    if (preset === "All notes") {
      selectedNotes = ["Keyword note", "Project note", "Google update", "Important update", "Keywords added"];
    } else if (preset === "Project notes only") {
      selectedNotes = ["Project note"];
    } else if (preset === "Algorithm updates only") {
      selectedNotes = ["Google update", "Important update"];
    } else if (preset === "Disabled") {
      selectedNotes = [];
    }

    setTempSettings((prev) => ({
      ...prev,
      chartNotes: preset,
      selectedChartNotes: selectedNotes,
    }));
    setIsChartNotesDropdownOpen(false);
  };

  const handleSaveRankingSettings = () => {
    setRankingSettings(tempSettings);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`ranking_settings_${project.id}`, JSON.stringify(tempSettings));
      } catch (e) {
        // ignore
      }
    }
    if (onSaveRankingSettings) {
      onSaveRankingSettings(tempSettings);
    }
    setIsChartNotesDropdownOpen(false);
    setRankingModalView("main");
    setIsRankingSettingsModalOpen(false);
  };

  const handleCancelRankingSettings = () => {
    setTempSettings(rankingSettings);
    setIsChartNotesDropdownOpen(false);
    setRankingModalView("main");
    setIsRankingSettingsModalOpen(false);
  };

  // Export Modal state
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Date Range state
  const [currentDateRangeText, setCurrentDateRangeText] = useState(initialDateRange);
  useEffect(() => {
    if (initialDateRange) setCurrentDateRangeText(initialDateRange);
  }, [initialDateRange]);

  // Dual Calendar State
  // Calendar base anchor: left month is August 2026 by default
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August (0-indexed)

  const [rangeStart, setRangeStart] = useState<Date>(new Date(2026, 8, 15)); // 15 Sep 2026
  const [rangeEnd, setRangeEnd] = useState<Date>(new Date(2026, 8, 16));   // 16 Sep 2026
  const [selectingEnd, setSelectingEnd] = useState(false);

  // References for outside click detection
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dataStudioRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const chartNotesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (dataStudioRef.current && !dataStudioRef.current.contains(e.target as Node)) {
        setIsDataStudioOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (chartNotesDropdownRef.current && !chartNotesDropdownRef.current.contains(e.target as Node)) {
        setIsChartNotesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCountry = country || project.primaryLocation || "India";
  const displayKeywordsCount = keywordsCount !== undefined ? keywordsCount : 45;

  const handleCopyGuestLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };


  const badgeColorClass = {
    blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
  }[badgeColor];

  // Calendar Navigation Chevrons
  const handlePrevMonth = () => {
    if (calendarLeftMonth === 0) {
      setCalendarLeftMonth(11);
      setCalendarLeftYear((y) => y - 1);
    } else {
      setCalendarLeftMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarLeftMonth === 11) {
      setCalendarLeftMonth(0);
      setCalendarLeftYear((y) => y + 1);
    } else {
      setCalendarLeftMonth((m) => m + 1);
    }
  };

  // Compute right calendar month
  const calendarRightYear = calendarLeftMonth === 11 ? calendarLeftYear + 1 : calendarLeftYear;
  const calendarRightMonth = calendarLeftMonth === 11 ? 0 : calendarLeftMonth + 1;

  // Day click handler
  const handleDayClick = (date: Date) => {
    if (!selectingEnd) {
      setRangeStart(date);
      setRangeEnd(date);
      setSelectingEnd(true);
    } else {
      if (date < rangeStart) {
        setRangeStart(date);
        setRangeEnd(rangeStart);
      } else {
        setRangeEnd(date);
      }
      setSelectingEnd(false);
    }
  };

  // Presets
  const applyPreset = (preset: string) => {
    const today = new Date(2026, 8, 16); // 16 Sep 2026 anchored
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

    setRangeStart(start);
    setRangeEnd(end);
    setSelectingEnd(false);

    // Adjust left calendar month so start is visible
    setCalendarLeftYear(start.getFullYear());
    setCalendarLeftMonth(start.getMonth());
  };

  // Apply Date Range
  const handleApplyDateRange = () => {
    const formattedStart = formatDisplayDate(rangeStart);
    const formattedEnd = formatDisplayDate(rangeEnd);
    const newRange = `${formattedStart} - ${formattedEnd}`;
    setCurrentDateRangeText(newRange);
    setIsDatePickerOpen(false);
    if (onDateRangeChange) {
      onDateRangeChange(formattedStart, formattedEnd);
    }
  };

  // Render month grid
  const renderMonthCalendar = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In standard Mon-first: Mon=0, ..., Sun=6
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: React.ReactNode[] = [];
    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const isStart = current.toDateString() === rangeStart.toDateString();
      const isEnd = current.toDateString() === rangeEnd.toDateString();
      const isInRange = current > rangeStart && current < rangeEnd;

      let style = "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md";
      if (isStart && isEnd) {
        style = "bg-blue-600 text-white font-bold rounded-full shadow-xs";
      } else if (isStart) {
        style = "bg-blue-600 text-white font-bold rounded-l-full shadow-xs";
      } else if (isEnd) {
        style = "bg-blue-600 text-white font-bold rounded-r-full shadow-xs border-2 border-blue-400";
      } else if (isInRange) {
        style = "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200 rounded-none";
      }

      cells.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => handleDayClick(current)}
          className={`h-7 w-7 text-xs flex items-center justify-center transition ${style}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="w-56 select-none">
        <div className="text-center font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
          {MONTH_NAMES[month]} {year}
        </div>
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

  // Trigger Client-side CSV Download
  const handleExecuteExport = () => {
    if (onExport) {
      onExport(exportFormat);
    }

    // Generate client-side text/csv payload
    const csvContent = [
      "Keyword,Target URL,Ranked URL,Search Volume,Position",
      `"enterprise rank tracker","https://${project.primaryDomain}/rank-tracker","https://${project.primaryDomain}/rank-tracker",4200,2`,
      `"seo audit platform","https://${project.primaryDomain}/audit","https://${project.primaryDomain}/audit-guide",1800,12`,
      `"best seo tools","https://${project.primaryDomain}/tools","https://${project.primaryDomain}/tools",950,5`,
      `"competitor analysis software","https://${project.primaryDomain}/competitors","https://${project.primaryDomain}/competitors",2400,1`,
    ].join("\n");

    try {
      if (typeof window !== "undefined" && typeof window.URL?.createObjectURL === "function") {
        const blob = new Blob([csvContent], {
          type: exportFormat === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rankings_${project.primaryDomain || "project"}_${exportFormat === "xlsx" ? "export.xlsx" : "export.csv"}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof window.URL?.revokeObjectURL === "function") {
          URL.revokeObjectURL(url);
        }
      }
    } catch {}

    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-4 mb-4 relative">
      {/* 1. TOP UTILITY ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 text-xs border-b border-slate-200 dark:border-slate-800/80 pb-3">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <ProjectFavicon
            domain={project.primaryDomain || project.name}
            name={project.name}
            size={16}
            className="w-4 h-4 rounded-[3px] shrink-0 object-contain"
          />
          <Link
            href={`/projects/${project.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition truncate max-w-[200px]"
            title={project.primaryDomain || project.name}
          >
            {project.primaryDomain || project.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <Link
            href={`/projects/${project.id}/rankings`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Rankings
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{activeSubTab}</span>
        </nav>

        {/* Right Utility Links & Quota Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Guest Link */}
          <button
            onClick={handleCopyGuestLink}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition cursor-pointer"
            title="Copy guest link to clipboard"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{copiedLink ? "Link Copied!" : "Guest link"}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          {/* Feedback */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Feedback</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          {/* Notes */}
          <button
            onClick={() => setShowNotesModal(true)}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Notes ({notesCount})</span>
          </button>

          {/* Quota / Limit Badges */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {/* Manual Rechecks Quota Badge */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
              title="Manual SERP recheck quota balance"
            >
              <span>Manual rechecks: {manualRechecksUsed} / {manualRechecksTotal}</span>
              <span className="text-[10px] w-3.5 h-3.5 rounded-full bg-cyan-200/70 dark:bg-cyan-800/80 inline-flex items-center justify-center font-bold">
                i
              </span>
            </span>

            {/* Keyword Limits Badge */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              title="Active tracked keywords limit for this project tier"
            >
              <span>Keyword limits: {displayKeywordsCount} / {totalKeywordsLimit}</span>
              <span className="text-[10px] w-3.5 h-3.5 rounded-full bg-amber-200/70 dark:bg-amber-800/80 inline-flex items-center justify-center font-bold">
                i
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
        {/* Left: Search Engine / Country / Language & Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Engine / Country / Language Selector */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {/* Google Icon */}
            <div className="px-2 py-1 flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{searchEngine}</span>
            </div>

            {/* Country */}
            <div className="px-2 py-1 flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700">
              <CountryFlag name={displayCountry} size="sm" />
              <span>{displayCountry}</span>
            </div>

            {/* Language Selector */}
            <div className="px-2 py-0.5">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Search engine language"
              >
                <option value="EN">EN ▾</option>
                <option value="HI">HI ▾</option>
                <option value="ES">ES ▾</option>
                <option value="FR">FR ▾</option>
                <option value="DE">DE ▾</option>
              </select>
            </div>
          </div>

          {/* Date Range Picker Button with Dual-Month Popover Anchor */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Click to choose comparison date range"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{currentDateRangeText}</span>
              <span className="text-slate-400">▾</span>
            </button>

            {/* 1. DUAL-MONTH DATE RANGE PICKER POPOVER */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[620px] max-w-[720px]">
                {/* Left Section: Dual Month Calendars */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                      title="Previous month"
                    >
                      &lt;
                    </button>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Date Range
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                      title="Next month"
                    >
                      &gt;
                    </button>
                  </div>

                  {/* Side-by-side Dual Calendar */}
                  <div className="flex items-start gap-5">
                    {renderMonthCalendar(calendarLeftYear, calendarLeftMonth)}
                    <div className="border-r border-slate-100 dark:border-slate-800 h-52 hidden sm:block" />
                    {renderMonthCalendar(calendarRightYear, calendarRightMonth)}
                  </div>

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>{formatDisplayDate(rangeStart)}</span>
                      <span className="mx-1.5 text-slate-400">—</span>
                      <span>{formatDisplayDate(rangeEnd)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyDateRange}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
                      >
                        APPLY
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Section: Preset Sidebar Buttons */}
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
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2">
          {/* 2. DATA STUDIO DROPDOWN */}
          <div className="relative" ref={dataStudioRef}>
            <button
              onClick={() => setIsDataStudioOpen(!isDataStudioOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#534b71] hover:bg-[#453d61] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
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
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-[13px] font-normal text-slate-800 dark:text-slate-200 animate-in fade-in duration-100">
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
                    if (onDataStudio) onDataStudio();
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

          {/* 3. EXPORT BUTTON & MODAL TRIGGER */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Export rankings data"
          >
            <svg className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>EXPORT</span>
          </button>

          {/* 4. SETTINGS GEAR DROPDOWN */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer"
              title="Rankings Module Settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px]">▾</span>
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 text-xs">
                <Link
                  href={`/projects/${project.id}/settings`}
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <span>⚙</span>
                  <span>Project settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setTempSettings(rankingSettings);
                    setIsRankingSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <span>📊</span>
                  <span>Ranking settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. INDEXING PROGRESS LINE */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-emerald-300 dark:border-emerald-800/70" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% INDEXED
          </span>
        </div>
      </div>

      {/* 4. TITLE & BOTTOM ACTION TRIGGERS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-1">
        {title ? (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <span>{title}</span>
              {badge && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${badgeColorClass}`}>
                  {badge}
                </span>
              )}
            </h1>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {/* Recheck Data Button */}
          <button
            onClick={onRecheck}
            disabled={isRechecking || isViewer}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 gap-1.5 cursor-pointer"
            title="Recheck latest SERP rankings data"
          >
            {isRechecking ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span>Recheck Data</span>
            <span className="text-[10px] opacity-80">▾</span>
          </button>

          {/* Add Keywords Button (Prominent Green) */}
          {!isViewer && onAddKeywords && (
            <button
              onClick={onAddKeywords}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-md shadow-xs text-white bg-emerald-600 hover:bg-emerald-700 transition gap-1 cursor-pointer"
            >
              <span>+ Add Keywords</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      {showSubnav && <RankingsSubnav projectId={project.id} />}

      {/* EXPORT MODAL DIALOG */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Export data</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Format Selection Cards */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Choose the desired file format for downloading your keyword rankings data:
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

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📝</span> Rankings Project Notes ({notesCount})
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Core SERP Update:</span>
                <p className="mt-1">Tracking ongoing search engine algorithm adjustments across primary commercial keyword groups.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Target Optimization:</span>
                <p className="mt-1">All target URLs matched with verified 200 HTTP response codes.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>💬</span> Submit Rankings Feedback
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Have suggestions or observations regarding ranking accuracy or SERP metrics? Let the SEO engineering team know.
            </p>
            <textarea
              rows={3}
              placeholder="Enter your feedback or feature request..."
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. RANKING SETTINGS MODAL DIALOG */}
      {isRankingSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {rankingModalView === "main" ? (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Ranking settings</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body: 10 Configurable Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {/* Row 1: Show charts */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Show charts</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tempSettings.showCharts}
                      onClick={() => setTempSettings(prev => ({ ...prev, showCharts: !prev.showCharts }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tempSettings.showCharts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title="Toggle charts display"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          tempSettings.showCharts ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 2: Show all search engines data (i) */}
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Show all search engines data</span>
                      <span
                        title="Display metrics combined across all search engine configurations"
                        className="text-[10px] w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 inline-flex items-center justify-center font-bold cursor-help"
                      >
                        i
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tempSettings.showAllSearchEngines}
                      onClick={() => setTempSettings(prev => ({ ...prev, showAllSearchEngines: !prev.showAllSearchEngines }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tempSettings.showAllSearchEngines ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title="Toggle all search engines data"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          tempSettings.showAllSearchEngines ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 3: Default chart */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("defaultChart")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Select default chart"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Default chart</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.defaultChart} &gt;
                    </span>
                  </button>

                  {/* Row 4: Default section */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("defaultSection")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Select default section"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Default section</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.defaultSection} &gt;
                    </span>
                  </button>

                  {/* Row 5: Keywords per page */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Keywords per page</span>
                    <div className="relative">
                      <select
                        value={tempSettings.keywordsPerPage}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, keywordsPerPage: Number(e.target.value) }))}
                        className="bg-transparent text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 cursor-pointer focus:outline-none text-right"
                      >
                        <option value="100">100 &gt;</option>
                        <option value="50">50 &gt;</option>
                        <option value="25">25 &gt;</option>
                        <option value="250">250 &gt;</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 6: Web page URL (i) */}
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Web page URL</span>
                      <span
                        title="Specify how target URLs are rendered in keyword rows"
                        className="text-[10px] w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 inline-flex items-center justify-center font-bold cursor-help"
                      >
                        i
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={tempSettings.webPageUrlDisplay}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, webPageUrlDisplay: e.target.value }))}
                        className="bg-transparent text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 cursor-pointer focus:outline-none text-right"
                      >
                        <option value="Icon">Icon &gt;</option>
                        <option value="Full URL">Full URL &gt;</option>
                        <option value="Path only">Path only &gt;</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 7: Table columns (click navigates to Table Columns sub-view) */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("tableColumns")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Configure visible table columns"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Table columns</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.selectedColumns && tempSettings.selectedColumns.length > 0
                        ? tempSettings.selectedColumns.join(", ")
                        : "None selected"}{" "}
                      &gt;
                    </span>
                  </button>

                  {/* Row 8: Rankings data alignment */}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Rankings data alignment</span>
                    <div className="relative">
                      <select
                        value={tempSettings.rankingsDataAlignment}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, rankingsDataAlignment: e.target.value }))}
                        className="bg-transparent text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 cursor-pointer focus:outline-none text-right"
                      >
                        <option value="Left to right">Left to right &gt;</option>
                        <option value="Right to left">Right to left &gt;</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 9: Amount of displayed data */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("amountOfData")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Select amount of displayed data"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Amount of displayed data</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.amountOfDisplayedData} &gt;
                    </span>
                  </button>

                  {/* Row 10: Default table view mode */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("defaultTableViewMode")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Select default table view mode"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Default table view mode</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.defaultTableViewMode} &gt; ▾
                    </span>
                  </button>

                  {/* Row 11: Sort by column */}
                  <button
                    type="button"
                    onClick={() => setRankingModalView("sortByColumn")}
                    className="w-full flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1 -mx-1 text-left transition cursor-pointer"
                    title="Select sort by column"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Sort by column</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 truncate max-w-[260px] text-right">
                      {tempSettings.sortByColumn || "Default"} &gt;
                    </span>
                  </button>

                  {/* Row 12: Chart notes */}
                  <div className="flex items-center justify-between py-2.5 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChartNotesDropdownOpen(false);
                        setRankingModalView("chartNotes");
                      }}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer text-left focus:outline-none"
                      title="Drill into Chart notes settings"
                    >
                      Chart notes
                    </button>
                    <div className="relative flex items-center gap-1" ref={chartNotesDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChartNotesDropdownOpen(false);
                          setRankingModalView("chartNotes");
                        }}
                        className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 cursor-pointer focus:outline-none text-right max-w-[260px] truncate flex items-center justify-end gap-1"
                        title="Configure chart notes"
                      >
                        <span className="truncate">
                          {formatChartNotesSummary(tempSettings.selectedChartNotes)}
                        </span>
                        <span className="text-slate-400 shrink-0">&gt;</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChartNotesDropdownOpen((prev) => !prev)}
                        className="text-slate-400 hover:text-blue-600 p-0.5 rounded cursor-pointer focus:outline-none"
                        title="Select chart notes preset"
                      >
                        <span className="text-xs">▾</span>
                      </button>

                      {/* Anchored Dropdown directly to the trigger element */}
                      {isChartNotesDropdownOpen && (
                        <div
                          className="absolute right-0 bottom-full mb-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 divide-y divide-slate-100 dark:divide-slate-800/80 animate-in fade-in zoom-in-95 duration-100"
                        >
                          {CHART_NOTES_PRESETS.map((preset) => {
                            const isSelected = tempSettings.chartNotes === preset;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleSelectChartNotesPreset(preset)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                                  isSelected
                                    ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <span className="truncate pr-2">{preset} &gt;</span>
                                {isSelected && (
                                  <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRankingSettings}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
              </>
            ) : rankingModalView === "defaultChart" ? (
              <>
                {/* 1. DEFAULT CHART SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Default chart
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which metric chart is displayed by default:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {DEFAULT_CHART_OPTIONS.map((opt) => {
                    const isSelected = tempSettings.defaultChart === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTempSettings(prev => ({ ...prev, defaultChart: opt }))}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : rankingModalView === "defaultSection" ? (
              <>
                {/* 2. DEFAULT SECTION SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Default section
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which rankings section opens by default:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {DEFAULT_SECTION_OPTIONS.map((opt) => {
                    const isSelected = tempSettings.defaultSection === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTempSettings(prev => ({ ...prev, defaultSection: opt }))}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : rankingModalView === "amountOfData" ? (
              <>
                {/* 3. AMOUNT OF DISPLAYED DATA SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Amount of displayed data
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select number of recent ranking dates to display in tables:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {AMOUNT_OF_DATA_OPTIONS.map((opt) => {
                    const isSelected = tempSettings.amountOfDisplayedData === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTempSettings(prev => ({ ...prev, amountOfDisplayedData: opt }))}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : rankingModalView === "defaultTableViewMode" ? (
              <>
                {/* 4. DEFAULT TABLE VIEW MODE SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Default table view mode
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select default grouping mode for keyword rankings table:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {DEFAULT_TABLE_VIEW_MODE_OPTIONS.map((opt) => {
                    const isSelected = tempSettings.defaultTableViewMode === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTempSettings(prev => ({ ...prev, defaultTableViewMode: opt }))}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : rankingModalView === "sortByColumn" ? (
              <>
                {/* 6. SORT BY COLUMN SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Sort by column
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which column determines the default sorting order:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {SORT_BY_COLUMN_OPTIONS.map((col) => {
                    const isSelected = (tempSettings.sortByColumn || "Default") === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTempSettings((prev) => ({ ...prev, sortByColumn: col }))}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {col}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : rankingModalView === "chartNotes" ? (
              <>
                {/* 7. CHART NOTES / NOTE TYPES SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold cursor-pointer"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Chart notes
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which note types and updates are displayed on the chart:
                </p>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {NOTE_TYPE_OPTIONS.map((item) => {
                    const isSelected = (tempSettings.selectedChartNotes || DEFAULT_SELECTED_CHART_NOTES).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleChartNote(item.id)}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.id === "Keyword note" && (
                            <span className="w-5 h-5 flex items-center justify-center text-slate-400 text-sm">💬</span>
                          )}
                          {item.id === "Project note" && (
                            <span className="w-5 h-5 flex items-center justify-center text-slate-900 dark:text-slate-100 text-sm">🗩</span>
                          )}
                          {item.id === "Google update" && (
                            <span className="w-5 h-5 flex items-center justify-center">
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                              </svg>
                            </span>
                          )}
                          {item.id === "Important update" && (
                            <span className="w-5 h-5 flex items-center justify-center text-amber-500 text-sm">⚠️</span>
                          )}
                          {item.id === "Keywords added" && (
                            <span className="w-5 h-5 flex items-center justify-center text-emerald-500 font-bold text-sm">➕</span>
                          )}
                          <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                            {item.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 5. NESTED "TABLE COLUMNS" SUB-VIEW */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRankingModalView("main")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold"
                      title="Back to Ranking settings"
                    >
                      &lt; BACK
                    </button>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Table columns
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRankingSettings}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                    title="Close modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Sub-view Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which columns appear in the keyword rankings table:
                </p>

                {/* Scrollable list of 16 options */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs pr-1">
                  {ALL_TABLE_COLUMNS.map((col) => {
                    const isSelected = tempSettings.selectedColumns?.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleToggleColumn(col)}
                        className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition text-left cursor-pointer ${
                          isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                          {col}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* 16. None selected option */}
                  <button
                    type="button"
                    onClick={handleClearAllColumns}
                    className={`w-full flex items-center justify-between py-2.5 px-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition text-left cursor-pointer ${
                      tempSettings.selectedColumns?.length === 0 ? "bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 font-bold" : "text-slate-500"
                    }`}
                  >
                    <span className="italic font-medium">None selected (clears all)</span>
                    {tempSettings.selectedColumns?.length === 0 && (
                      <span className="text-rose-600 font-bold text-sm">✓</span>
                    )}
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRankingModalView("main")}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    &lt; BACK
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRankingSettings}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRankingSettings}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
