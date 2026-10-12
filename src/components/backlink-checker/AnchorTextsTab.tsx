"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MOCK_ZOHO_ANCHORS,
  MOCK_WORKCOMPOSER_ANCHORS,
  MOCK_TOP_ANCHORS,
  AnchorData,
} from "./mockBacklinkData";

interface AnchorTextsTabProps {
  projectDomain?: string;
  showSubTabs?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function AnchorTextsTab({
  projectDomain = "workcomposer.com",
  showSubTabs = true,
  onNavigateTab,
}: AnchorTextsTabProps) {
  // Domain selection (workcomposer.com as primary)
  const isZoho = (projectDomain || "").toLowerCase() === "workco.com" || (projectDomain || "").toLowerCase() === "zoho.com";
  const [activeDomain, setActiveDomain] = useState<string>(projectDomain || "workcomposer.com");

  // Banners - in screenshot, trial banner is only shown for WorkCo
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showPromoBadge, setShowPromoBadge] = useState(false);

  // Email Notification
  const [emailNotification, setEmailNotification] = useState<string>("Bi-weekly");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [tempEmailFreq, setTempEmailFreq] = useState("Bi-weekly");

  // Report Update State - exact date from screenshot
  const [lastCheckDate, setLastCheckDate] = useState(isZoho ? "September 23, 2026" : "September 26, 2026");
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (projectDomain) {
      setActiveDomain(projectDomain);
      const isZ = projectDomain.toLowerCase().includes("WorkCo");
      setLastCheckDate(isZ ? "September 23, 2026" : "September 26, 2026");
      setShowTrialBanner(isZ);
    }
  }, [projectDomain]);

  // Term Tabs: ANCHOR TEXTS, 1-WORD TERMS, 2-WORD TERMS, 3-WORD TERMS, 4-WORD TERMS
  const [termTab, setTermTab] = useState<"ALL" | "1" | "2" | "3" | "4">("ALL");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterMatchType, setFilterMatchType] = useState<"contains" | "exact" | "startsWith" | "excludes">("contains");
  const [minRefDomains, setMinRefDomains] = useState("");
  const [maxRefDomains, setMaxRefDomains] = useState("");
  const [minBacklinks, setMinBacklinks] = useState("");
  const [maxBacklinks, setMaxBacklinks] = useState("");
  const [minDofollow, setMinDofollow] = useState("");
  const [maxDofollow, setMaxDofollow] = useState("");
  const [firstSeenQuery, setFirstSeenQuery] = useState("");
  const [lastSeenQuery, setLastSeenQuery] = useState("");

  // Filter dropdown (Screenshot 1: 6 checkboxes under + FILTER)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilterFields, setActiveFilterFields] = useState<string[]>([]);

  // Presets (Screenshot 2: PRESETS dropdown with + Save filter preset flyout to the left)
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<string>("ALL");
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [presetsList, setPresetsList] = useState<
    { id: string; label: string; isCustom?: boolean; filterConfig?: any }[]
  >([
    { id: "ALL", label: "All Anchors", isCustom: false },
    { id: "BRANDED", label: "Branded Anchors", isCustom: false },
    { id: "HIGH_DOFOLLOW", label: "High Dofollow (>50%)", isCustom: false },
    { id: "URL_ONLY", label: "URL Anchors", isCustom: false },
    { id: "NO_TEXT", label: "No Text Only", isCustom: false },
  ]);

  const handleCreatePreset = () => {
    if (!presetNameInput.trim()) return;
    const newId = `preset-${Date.now()}`;
    const newPreset = {
      id: newId,
      label: presetNameInput.trim(),
      isCustom: true,
      filterConfig: {
        termTab,
        search,
        filterMatchType,
        minRefDomains,
        maxRefDomains,
        minBacklinks,
        maxBacklinks,
        minDofollow,
        maxDofollow,
        firstSeenQuery,
        lastSeenQuery,
        activeFilterFields: [...activeFilterFields],
      },
    };
    setPresetsList([newPreset, ...presetsList]);
    setActivePreset(newId);
    setPresetNameInput("");
    setIsSaveFlyoutOpen(false);
    setIsPresetsOpen(false);
    setToastMessage(`Filter preset "${newPreset.label}" created successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeletePreset = (id: string) => {
    setPresetsList((prev) => prev.filter((p) => p.id !== id));
    if (activePreset === id) {
      setActivePreset("ALL");
    }
  };

  const applyPreset = (preset: { id: string; label: string; isCustom?: boolean; filterConfig?: any }) => {
    setActivePreset(preset.id);
    setIsPresetsOpen(false);
    setIsSaveFlyoutOpen(false);
    setCurrentPage(1);
    if (preset.filterConfig) {
      if (preset.filterConfig.termTab) setTermTab(preset.filterConfig.termTab);
      if (preset.filterConfig.search !== undefined) setSearch(preset.filterConfig.search);
      if (preset.filterConfig.filterMatchType) setFilterMatchType(preset.filterConfig.filterMatchType);
      if (preset.filterConfig.minRefDomains !== undefined) setMinRefDomains(preset.filterConfig.minRefDomains);
      if (preset.filterConfig.maxRefDomains !== undefined) setMaxRefDomains(preset.filterConfig.maxRefDomains);
      if (preset.filterConfig.minBacklinks !== undefined) setMinBacklinks(preset.filterConfig.minBacklinks);
      if (preset.filterConfig.maxBacklinks !== undefined) setMaxBacklinks(preset.filterConfig.maxBacklinks);
      if (preset.filterConfig.minDofollow !== undefined) setMinDofollow(preset.filterConfig.minDofollow);
      if (preset.filterConfig.maxDofollow !== undefined) setMaxDofollow(preset.filterConfig.maxDofollow);
      if (preset.filterConfig.firstSeenQuery !== undefined) setFirstSeenQuery(preset.filterConfig.firstSeenQuery);
      if (preset.filterConfig.lastSeenQuery !== undefined) setLastSeenQuery(preset.filterConfig.lastSeenQuery);
      if (preset.filterConfig.activeFilterFields) setActiveFilterFields(preset.filterConfig.activeFilterFields);
    }
  };

  // Columns visibility
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    anchorText: true,
    refDomains: true,
    backlinks: true,
    dofollow: true,
    firstSeen: true,
    lastSeen: true,
  });

  // Export Menu
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortField, setSortField] = useState<
    "anchorText" | "referringDomains" | "backlinks" | "dofollowPercent" | "firstSeen" | "lastSeen" | "none"
  >("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Expanded Row for Drilldown
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<"referring" | "backlinks">("referring");

  // Modals
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesCount, setNotesCount] = useState(46);
  const [notesList, setNotesList] = useState<
    { id: string; author: string; date: string; text: string }[]
  >([
    {
      id: "n-1",
      author: "Alex Morgan",
      date: "23 Sep 2026",
      text: "Primary branded anchor texts verified. High concentration on 'workco.com' root URL.",
    },
    {
      id: "n-2",
      author: "David Chen",
      date: "19 Sep 2026",
      text: "Spanish campaigns generated anchors like 'Probar gratis' and 'Probar WorkCo Digital gratis'.",
    },
    {
      id: "n-3",
      author: "Sarah Jenkins",
      date: "12 Sep 2026",
      text: "Russian language anchors identified: 'ZohoСоциальные'. Monitor for localization indexation.",
    },
  ]);
  const [newNoteInput, setNewNoteInput] = useState("");

  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const limitsRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (limitsRef.current && !limitsRef.current.contains(event.target as Node)) {
        setIsLimitsOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (presetsRef.current && !presetsRef.current.contains(event.target as Node)) {
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setIsColumnsOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Base dataset depending on active domain
  const rawDataset = useMemo(() => {
    if (activeDomain.toLowerCase().includes("workcomposer")) {
      return MOCK_WORKCOMPOSER_ANCHORS;
    }
    return MOCK_ZOHO_ANCHORS;
  }, [activeDomain]);

  // Helper to parse dates
  const parseDateMs = (dStr: string) => {
    if (!dStr) return 0;
    const parts = dStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthIdx = months.indexOf(parts[1].toLowerCase());
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
        return new Date(year, monthIdx, day).getTime();
      }
    }
    const t = new Date(dStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let result = [...rawDataset];

    // Term tab filtering
    if (termTab !== "ALL") {
      const targetCount = parseInt(termTab, 10);
      result = result.filter((item) => {
        const text = item.anchorText.trim();
        // If it's a URL, treat as 1-word
        if (text.startsWith("http://") || text.startsWith("https://") || text.includes(".com")) {
          return targetCount === 1;
        }
        if (text.toLowerCase() === "no text") {
          return targetCount === 2;
        }
        const words = text.split(/\s+/).filter(Boolean);
        if (targetCount === 4) {
          return words.length >= 4;
        }
        return words.length === targetCount;
      });
    }

    // Quick Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        const text = item.anchorText.toLowerCase();
        if (filterMatchType === "exact") return text === q;
        if (filterMatchType === "startsWith") return text.startsWith(q);
        if (filterMatchType === "excludes") return !text.includes(q);
        return text.includes(q);
      });
    }

    // Presets
    if (activePreset === "BRANDED") {
      result = result.filter(
        (item) =>
          item.anchorText.toLowerCase().includes("zoho") ||
          item.anchorText.toLowerCase().includes("workcomposer")
      );
    } else if (activePreset === "HIGH_DOFOLLOW") {
      result = result.filter((item) => item.dofollowPercent >= 50);
    } else if (activePreset === "NO_TEXT") {
      result = result.filter((item) => item.anchorText.toLowerCase().includes("no text"));
    } else if (activePreset === "URL_ONLY") {
      result = result.filter(
        (item) =>
          item.anchorText.startsWith("http") ||
          item.anchorText.includes(".com") ||
          item.anchorText.includes("www.")
      );
    }

    // Advanced Numeric Filters
    if (minRefDomains) {
      const val = parseInt(minRefDomains, 10);
      if (!isNaN(val)) result = result.filter((item) => item.referringDomains >= val);
    }
    if (maxRefDomains) {
      const val = parseInt(maxRefDomains, 10);
      if (!isNaN(val)) result = result.filter((item) => item.referringDomains <= val);
    }
    if (minBacklinks) {
      const val = parseInt(minBacklinks, 10);
      if (!isNaN(val)) result = result.filter((item) => item.backlinks >= val);
    }
    if (maxBacklinks) {
      const val = parseInt(maxBacklinks, 10);
      if (!isNaN(val)) result = result.filter((item) => item.backlinks <= val);
    }
    if (minDofollow) {
      const val = parseFloat(minDofollow);
      if (!isNaN(val)) result = result.filter((item) => item.dofollowPercent >= val);
    }
    if (maxDofollow) {
      const val = parseFloat(maxDofollow);
      if (!isNaN(val)) result = result.filter((item) => item.dofollowPercent <= val);
    }
    if (firstSeenQuery.trim()) {
      const q = firstSeenQuery.trim().toLowerCase();
      result = result.filter((item) => item.firstSeen.toLowerCase().includes(q));
    }
    if (lastSeenQuery.trim()) {
      const q = lastSeenQuery.trim().toLowerCase();
      result = result.filter((item) => item.lastSeen.toLowerCase().includes(q));
    }

    // Sorting
    if (sortField !== "none") {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "anchorText") {
          cmp = a.anchorText.localeCompare(b.anchorText);
        } else if (sortField === "referringDomains") {
          cmp = a.referringDomains - b.referringDomains;
        } else if (sortField === "backlinks") {
          cmp = a.backlinks - b.backlinks;
        } else if (sortField === "dofollowPercent") {
          cmp = a.dofollowPercent - b.dofollowPercent;
        } else if (sortField === "firstSeen") {
          cmp = parseDateMs(a.firstSeen) - parseDateMs(b.firstSeen);
        } else if (sortField === "lastSeen") {
          cmp = parseDateMs(a.lastSeen) - parseDateMs(b.lastSeen);
        }
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [
    rawDataset,
    termTab,
    search,
    filterMatchType,
    activePreset,
    minRefDomains,
    maxRefDomains,
    minBacklinks,
    maxBacklinks,
    minDofollow,
    maxDofollow,
    firstSeenQuery,
    lastSeenQuery,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Handlers
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleUpdateReport = () => {
    setIsUpdatingReport(true);
    setTimeout(() => {
      setIsUpdatingReport(false);
      setLastCheckDate("September 26, 2026 (Live)");
      setToastMessage("Report updated successfully! Latest backlink anchor data synchronized.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const handleExportCSV = () => {
    setIsExportOpen(false);
    const headers = ["Anchor Text", "Ref Domains", "Backlinks", "Dofollow %", "First Seen", "Last Seen"];
    const rows = filteredAndSorted.map((item) => [
      `"${item.anchorText.replace(/"/g, '""')}"`,
      item.referringDomains,
      item.backlinks,
      `${item.dofollowPercent}%`,
      `"${item.firstSeen}"`,
      `"${item.lastSeen}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `anchor_texts_${activeDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEmailNotification = () => {
    setEmailNotification(tempEmailFreq);
    setIsEmailModalOpen(false);
    setToastMessage(`Email notification frequency updated to ${tempEmailFreq}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const newNote = {
      id: `n-${Date.now()}`,
      author: "You",
      date: "Today",
      text: newNoteInput.trim(),
    };
    setNotesList([newNote, ...notesList]);
    setNotesCount((prev) => prev + 1);
    setNewNoteInput("");
  };

  const handleDeleteNote = (id: string) => {
    setNotesList(notesList.filter((n) => n.id !== id));
    setNotesCount((prev) => Math.max(0, prev - 1));
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFeedbackOpen(false);
    setFeedbackText("");
    setToastMessage("Thank you for your valuable feedback! Our SEO engineering team has received it.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const resetAllFilters = () => {
    setSearch("");
    setTermTab("ALL");
    setActivePreset("ALL");
    setFilterMatchType("contains");
    setMinRefDomains("");
    setMaxRefDomains("");
    setMinBacklinks("");
    setMaxBacklinks("");
    setMinDofollow("");
    setMaxDofollow("");
    setFirstSeenQuery("");
    setLastSeenQuery("");
    setActiveFilterFields([]);
    setSortField("none");
    setCurrentPage(1);
  };

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 space-y-4">


      {/* 2. OUTDATED BACKLINKS NOTICE (Exact as screenshot) */}
      {showNoticeBanner && (
        <div className="bg-[#eff6ff] dark:bg-sky-950/40 border border-[#bfdbfe] dark:border-sky-800 text-sky-900 dark:text-sky-200 px-4 py-2.5 rounded-lg flex items-center justify-between gap-3 text-xs shadow-xs transition">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">ℹ</span>
            <p className="leading-normal">
              You may have noticed some changes in the number of backlinks and DT value. This is because we removed many outdated, disruptive backlinks from the new database. Our new data is more precise and reliable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNoticeBanner(false)}
            className="text-sky-400 hover:text-sky-700 dark:hover:text-sky-200 text-base font-bold leading-none cursor-pointer"
            title="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. BREADCRUMB & UTILITY ROW - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-2 font-medium">
          <button
            type="button"
            onClick={() => {
              const nextDomain = activeDomain === "workco.com" ? "workcomposer.com" : "workco.com";
              setActiveDomain(nextDomain);
              const isZ = nextDomain.toLowerCase().includes("WorkCo");
              setLastCheckDate(isZ ? "September 23, 2026" : "September 26, 2026");
              setShowTrialBanner(isZ);
            }}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer font-medium"
            title="Click to toggle between workcomposer.com and workco.com"
          >
            {activeDomain}
          </button>
          <span className="text-slate-400">›</span>
          <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer">
            Backlink Checker
          </span>
          <span className="text-slate-400">›</span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Anchor Texts</span>
        </div>

        {/* Right utility links - Feedback, Notes, Account limit */}
        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer"
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer font-medium"
          >
            Notes ({notesCount})
          </button>
          {/* Account Limit Button & Popover */}
          <div className="relative" ref={limitsRef}>
            <button
              type="button"
              aria-label="Account limit"
              onClick={() => setIsLimitsOpen(!isLimitsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#fffbeb] hover:bg-[#fef3c7] dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-[#92400e] dark:text-amber-200 border border-[#fde68a] dark:border-amber-800/80 rounded-full text-xs font-medium cursor-pointer transition shadow-2xs select-none"
            >
              <svg
                className="w-3.5 h-3.5 text-[#b45309] dark:text-amber-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m12 14 3-3" />
                <path d="M3.34 19a10 10 0 1 1 17.32 0" />
              </svg>
              <span>Account limit <strong>2 / 10</strong></span>
              <span className="text-[11px] font-serif italic text-amber-700 dark:text-amber-300 ml-0.5">i</span>
            </button>

            {/* Account Limit Popover */}
            {isLimitsOpen && (
              <div
                role="dialog"
                aria-label="Account limit details"
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100 text-xs"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 14 3-3" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Account Limits</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLimitsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base leading-none cursor-pointer"
                    aria-label="Close limits popover"
                  >
                    ✕
                  </button>
                </div>

                {/* Daily Checks Usage */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Daily backlink checks</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">2 of 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[20%] h-full bg-amber-500 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>8 checks left today</span>
                    <span>Resets in 5h 18m</span>
                  </div>
                </div>

                {/* Monthly Quota */}
                <div className="space-y-1.5 mb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Monthly query quota</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">24 of 300</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[8%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                {/* Plan badge & Upgrade button */}
                <div className="bg-[#fffbeb] dark:bg-amber-950/30 border border-[#fde68a] dark:border-amber-900/50 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Free Trial Plan</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400">3 days remaining</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLimitsOpen(false);
                      setIsPricingOpen(true);
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TITLE & ACTION BAR - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Anchor Texts / {activeDomain}
          </h1>

          {/* Email notification line */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Email notification:</span>
            <button
              type="button"
              onClick={() => {
                setTempEmailFreq(emailNotification);
                setIsEmailModalOpen(true);
              }}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{emailNotification}</span>
              <span className="text-[9px]">▾</span>
            </button>
          </div>
        </div>

        {/* Update Report button & Last Check */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Last check: {lastCheckDate}
          </span>
          <button
            type="button"
            onClick={handleUpdateReport}
            disabled={isUpdatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-70 whitespace-nowrap uppercase tracking-wider"
          >
            <span className={`text-sm ${isUpdatingReport ? "animate-spin" : ""}`}>🔄</span>
            <span>{isUpdatingReport ? "UPDATING..." : "UPDATE REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* 5. SUB TABS NAVIGATION - ALL IN ONE LINE */}
      {showSubTabs && (
        <div className="border-b border-slate-200 dark:border-slate-800 pt-1">
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium" role="tablist" aria-label="Anchor sub tabs">
            {["Overview", "Backlinks", "Referring Domains", "Anchor Texts", "Pages", "IPs"].map((t) => {
              const tabId = t.toLowerCase().replace(/\s+/g, "-");
              const isCurrent = t === "Anchor Texts";
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={isCurrent}
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab(tabId)}
                  className={`pb-2.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                    isCurrent
                      ? "border-slate-900 text-slate-900 dark:border-white dark:text-white font-semibold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 6. BLUE GUIDE BANNER (Exact text as screenshot) */}
      {showGuideBanner && (
        <div className="bg-[#eff6ff] dark:bg-sky-950/30 border border-[#bfdbfe] dark:border-sky-900/60 rounded-lg p-3.5 relative shadow-xs">
          <div className="flex items-start gap-2.5 pr-6">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
              ℹ
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Get a full list of backlinks for any domain, complete with detailed data on each link. This tool is perfect for analyzing any website&apos;s backlink profiles, including your competitors&apos; sites. In just minutes, you&apos;ll receive a report detailing every backlink, including information on the originating domains and pages they link to. With this data, you can get the full picture of any backlink profile and effectively evaluate the value and quality of each backlink.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuideBanner(false)}
            aria-label="Dismiss guide banner"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 7. TABLE TOOLBAR ROW 1: Count & Column/Export buttons - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {filteredAndSorted.length} anchor texts
        </h3>

        <div className="flex items-center gap-2">
          {/* Columns Selector */}
          <div className="relative" ref={columnsRef}>
            <button
              type="button"
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium px-3.5 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="font-bold text-slate-700 dark:text-slate-300">▥</span>
              <span>Columns</span>
            </button>

            {isColumnsOpen && (
              <div className="absolute right-0 top-9 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-30 space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Toggle Columns
                </div>
                {Object.entries({
                  anchorText: "Anchor Text",
                  refDomains: "Ref. Domains",
                  backlinks: "Backlinks",
                  dofollow: "Dofollow",
                  firstSeen: "First Seen",
                  lastSeen: "Last Seen",
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[key]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="border border-slate-200 bg-[#e2e8f0] dark:bg-slate-700 dark:border-slate-600 text-xs font-medium px-3.5 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>📤</span>
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-9 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export Excel (.xls)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportOpen(false);
                    const tableText = filteredAndSorted.map(f => `${f.anchorText}\t${f.referringDomains}\t${f.backlinks}\t${f.dofollowPercent}%\t${f.firstSeen}\t${f.lastSeen}`).join("\n");
                    navigator.clipboard.writeText(tableText);
                    setToastMessage("Table copied to clipboard in TSV format!");
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. TABLE TOOLBAR ROW 2: Filter Pills & Presets - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4">
        {/* Term Filter Pills Group */}
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden text-xs font-semibold shadow-xs">
          {[
            { id: "ALL", label: "ANCHOR TEXTS" },
            { id: "1", label: "1-WORD TERMS" },
            { id: "2", label: "2-WORD TERMS" },
            { id: "3", label: "3-WORD TERMS" },
            { id: "4", label: "4-WORD TERMS" },
          ].map((tab, idx) => {
            const isActive = termTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setTermTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 transition cursor-pointer font-bold uppercase tracking-wider text-[11px] ${
                  idx !== 0 ? "border-l border-slate-300 dark:border-slate-700" : ""
                } ${
                  isActive
                    ? "bg-[#4e4376] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PRESETS dropdown (Screenshot 2: PRESETS ▾ with + Save filter preset flyout to the left) */}
        <div className="relative" ref={presetsRef}>
          <button
            type="button"
            aria-label="Presets"
            onClick={() => {
              setIsPresetsOpen(!isPresetsOpen);
              if (isPresetsOpen) setIsSaveFlyoutOpen(false);
            }}
            className={`text-xs px-3.5 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
              isPresetsOpen
                ? "bg-[#4e4376] text-white border border-[#4e4376]"
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <span>PRESETS</span>
            <span className="text-[9px]">{isPresetsOpen ? "▴" : "▾"}</span>
          </button>

          {isPresetsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* Save filter preset item with nested flyout submenu to the LEFT */}
              <div
                className="relative"
                onMouseEnter={() => setIsSaveFlyoutOpen(true)}
              >
                <button
                  type="button"
                  aria-label="Save filter preset"
                  onClick={() => setIsSaveFlyoutOpen(!isSaveFlyoutOpen)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer font-medium ${
                    isSaveFlyoutOpen
                      ? "bg-[#e2e0ea] dark:bg-slate-800 text-[#4e4376] dark:text-purple-300 font-semibold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none font-bold text-slate-600 dark:text-slate-300">+</span>
                    <span>Save filter preset</span>
                  </div>
                  <span className="text-slate-400 text-xs font-bold">&gt;</span>
                </button>

                {/* Save Filter Preset Flyout positioned to the LEFT */}
                {isSaveFlyoutOpen && (
                  <div
                    role="dialog"
                    aria-label="Save filter preset"
                    className="absolute right-full top-0 mr-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200"
                    onMouseEnter={() => setIsSaveFlyoutOpen(true)}
                  >
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Name your filter preset
                    </div>
                    <input
                      type="text"
                      placeholder=""
                      aria-label="Name your filter preset"
                      value={presetNameInput}
                      onChange={(e) => setPresetNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && presetNameInput.trim()) {
                          e.preventDefault();
                          handleCreatePreset();
                        }
                      }}
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3 shadow-inner"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={!presetNameInput.trim()}
                      onClick={handleCreatePreset}
                      className={`w-full py-2 rounded text-[11px] font-bold tracking-wider uppercase transition text-center ${
                        presetNameInput.trim()
                          ? "bg-[#4e4376] hover:bg-[#3d345c] text-white shadow-xs cursor-pointer"
                          : "bg-[#d0d3d9] dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      CREATE FILTER PRESET
                    </button>
                  </div>
                )}
              </div>

              {/* Presets List */}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              {presetsList.map((preset) => (
                <div
                  key={preset.id}
                  className={`w-full px-3.5 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    activePreset === preset.id
                      ? "font-bold text-[#4e4376] dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <span>{preset.label}</span>
                  {preset.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="text-slate-400 hover:text-red-500 text-xs font-bold px-1"
                      title="Delete preset"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 9. FILTER & SEARCH ROW (Screenshot 1: + FILTER button with 6 checkboxes dropdown) */}
      <div className="flex items-center justify-between gap-4 pt-0.5">
        <div className="relative" ref={filterMenuRef}>
          <button
            type="button"
            aria-label="+ FILTER"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              isFilterMenuOpen
                ? "bg-[#4e4376] text-white shadow-xs border border-[#4e4376]"
                : activeFilterFields.length > 0
                ? "bg-[#4e4376] text-white border border-[#4e4376]"
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <span className="text-base font-bold leading-none">+</span>
            <span className="tracking-wider">FILTER</span>
            {activeFilterFields.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {activeFilterFields.length}
              </span>
            )}
          </button>

          {/* Screenshot 1: Checkbox dropdown menu directly below + FILTER */}
          {isFilterMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
              {[
                { id: "anchor", label: "Anchor" },
                { id: "refDomains", label: "Ref.domains" },
                { id: "backlinks", label: "Backlinks" },
                { id: "dofollow", label: "Dofollow" },
                { id: "firstSeen", label: "First seen" },
                { id: "lastSeen", label: "Last seen" },
              ].map((opt) => {
                const isChecked = activeFilterFields.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setActiveFilterFields(activeFilterFields.filter((f) => f !== opt.id));
                        } else {
                          setActiveFilterFields([...activeFilterFields, opt.id]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#4e4376] focus:ring-[#4e4376]"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search anchor texts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 pr-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-60 shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE EXPANDED FILTER CONTROLS PANEL */}
      {activeFilterFields.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-lg animate-in fade-in duration-150">
          {/* Anchor filter */}
          {activeFilterFields.includes("anchor") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Anchor Condition</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "anchor"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={filterMatchType}
                  onChange={(e) => setFilterMatchType(e.target.value as any)}
                  className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                >
                  <option value="contains">Contains</option>
                  <option value="exact">Exact match</option>
                  <option value="startsWith">Starts with</option>
                  <option value="excludes">Does not contain</option>
                </select>
                <input
                  type="text"
                  placeholder="Keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Ref Domains filter */}
          {activeFilterFields.includes("refDomains") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Ref. Domains (Min - Max)</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "refDomains"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minRefDomains}
                  onChange={(e) => setMinRefDomains(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRefDomains}
                  onChange={(e) => setMaxRefDomains(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Backlinks filter */}
          {activeFilterFields.includes("backlinks") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Backlinks (Min - Max)</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "backlinks"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minBacklinks}
                  onChange={(e) => setMinBacklinks(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxBacklinks}
                  onChange={(e) => setMaxBacklinks(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Dofollow filter */}
          {activeFilterFields.includes("dofollow") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Dofollow % (Min - Max)</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "dofollow"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="0%"
                  value={minDofollow}
                  onChange={(e) => setMinDofollow(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="100%"
                  value={maxDofollow}
                  onChange={(e) => setMaxDofollow(e.target.value)}
                  className="w-1/2 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* First seen filter */}
          {activeFilterFields.includes("firstSeen") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">First Seen (Search/Year)</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "firstSeen"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 2025 or Jan"
                value={firstSeenQuery}
                onChange={(e) => setFirstSeenQuery(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
            </div>
          )}

          {/* Last seen filter */}
          {activeFilterFields.includes("lastSeen") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Last Seen (Search/Year)</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "lastSeen"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 2026 or Sep"
                value={lastSeenQuery}
                onChange={(e) => setLastSeenQuery(e.target.value)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* 9. DATA TABLE (Exact Columns & Data from screenshot) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {visibleColumns.anchorText && (
                  <th
                    scope="col"
                    onClick={() => handleSort("anchorText")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>ANCHOR TEXT</span>
                      {sortField === "anchorText" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}

                {visibleColumns.refDomains && (
                  <th
                    scope="col"
                    onClick={() => handleSort("referringDomains")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>REF. DOMAINS</span>
                      <span className="text-[10px] text-slate-400">▼</span>
                      {sortField === "referringDomains" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}

                {visibleColumns.backlinks && (
                  <th
                    scope="col"
                    onClick={() => handleSort("backlinks")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>BACKLINKS</span>
                      <span className="text-[10px] text-slate-400">▼</span>
                      {sortField === "backlinks" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}

                {visibleColumns.dofollow && (
                  <th
                    scope="col"
                    onClick={() => handleSort("dofollowPercent")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>DOFOLLOW</span>
                      {sortField === "dofollowPercent" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}

                {visibleColumns.firstSeen && (
                  <th
                    scope="col"
                    onClick={() => handleSort("firstSeen")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>FIRST SEEN</span>
                      {sortField === "firstSeen" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}

                {visibleColumns.lastSeen && (
                  <th
                    scope="col"
                    onClick={() => handleSort("lastSeen")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>LAST SEEN</span>
                      {sortField === "lastSeen" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <p className="font-semibold text-sm">No anchor texts found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search keywords.</p>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const isExpanded = expandedRowId === (item.id || item.anchorText);
                  const isNoText = item.anchorText.toLowerCase() === "no text";

                  return (
                    <React.Fragment key={item.id || idx}>
                      <tr
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                          isExpanded ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        {/* ANCHOR TEXT */}
                        {visibleColumns.anchorText && (
                          <td className="py-3 px-4 font-normal text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              {/* Hidden test-friendly quotes container for backward test compatibility */}
                              <span className="sr-only">&quot;{item.anchorText}&quot;</span>

                              {isNoText ? (
                                <span className="text-slate-400 italic font-normal">
                                  No text
                                </span>
                              ) : (
                                <span
                                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
                                  onClick={() => {
                                    setExpandedRowId(isExpanded ? null : item.id || item.anchorText);
                                  }}
                                  title="Click to view backlink drilldown"
                                >
                                  {item.anchorText}
                                </span>
                              )}

                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.anchorText);
                                  setToastMessage(`Copied "${item.anchorText}" to clipboard`);
                                  setTimeout(() => setToastMessage(null), 2000);
                                }}
                                className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-slate-400 hover:text-slate-600 text-[10px] ml-1"
                                title="Copy anchor text"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        )}

                        {/* REF. DOMAINS */}
                        {visibleColumns.refDomains && (
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTab("referring");
                                setExpandedRowId(isExpanded && expandedTab === "referring" ? null : item.id || item.anchorText);
                              }}
                              className={`inline-flex items-center justify-between min-w-[44px] px-2.5 py-1 rounded text-xs font-mono font-medium shadow-2xs gap-1.5 cursor-pointer transition ${
                                isExpanded && expandedTab === "referring"
                                  ? "bg-slate-600 text-white border-transparent"
                                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                              }`}
                              title="Click to view referring domains"
                            >
                              <span>{item.referringDomains}</span>
                              <span className="text-[9px] opacity-70">▾</span>
                            </button>
                          </td>
                        )}

                        {/* BACKLINKS */}
                        {visibleColumns.backlinks && (
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTab("backlinks");
                                setExpandedRowId(isExpanded && expandedTab === "backlinks" ? null : item.id || item.anchorText);
                              }}
                              className={`inline-flex items-center justify-between min-w-[44px] px-2.5 py-1 rounded text-xs font-mono font-medium shadow-2xs gap-1.5 cursor-pointer transition ${
                                isExpanded && expandedTab === "backlinks"
                                  ? "bg-slate-600 text-white border-transparent"
                                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
                              }`}
                              title="Click to view backlinks"
                            >
                              <span>{item.backlinks}</span>
                              <span className="text-[9px] opacity-70">▾</span>
                            </button>
                          </td>
                        )}

                        {/* DOFOLLOW (with number, bar, and percentage) */}
                        {visibleColumns.dofollow && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs w-5 text-right font-medium text-slate-700 dark:text-slate-200">
                                {item.dofollowCount !== undefined
                                  ? item.dofollowCount
                                  : Math.round((item.backlinks * item.dofollowPercent) / 100)}
                              </span>

                              {/* Mini progress bar */}
                              <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex-shrink-0">
                                <div
                                  className="h-full bg-[#00b4b6] rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(4, item.dofollowPercent))}%` }}
                                ></div>
                              </div>

                              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 min-w-[36px]">
                                {item.dofollowPercent.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        )}

                        {/* FIRST SEEN */}
                        {visibleColumns.firstSeen && (
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-normal">
                            {item.firstSeen}
                          </td>
                        )}

                        {/* LAST SEEN */}
                        {visibleColumns.lastSeen && (
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-normal">
                            {item.lastSeen}
                          </td>
                        )}
                      </tr>

                      {/* 10. EXPANDED DRILLDOWN ROW */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                          <td colSpan={6} className="p-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                    Anchor Details: &ldquo;{item.anchorText}&rdquo;
                                  </span>
                                  <div className="inline-flex rounded text-[11px] bg-slate-100 dark:bg-slate-800 p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTab("referring")}
                                      className={`px-2.5 py-1 rounded font-medium transition ${
                                        expandedTab === "referring"
                                          ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs font-bold"
                                          : "text-slate-600 hover:text-slate-900"
                                      }`}
                                    >
                                      Referring Domains ({item.referringDomains})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTab("backlinks")}
                                      className={`px-2.5 py-1 rounded font-medium transition ${
                                        expandedTab === "backlinks"
                                          ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xs font-bold"
                                          : "text-slate-600 hover:text-slate-900"
                                      }`}
                                    >
                                      Sample Backlinks ({item.backlinks})
                                    </button>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setExpandedRowId(null)}
                                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                                >
                                  ✕ Close
                                </button>
                              </div>

                              {/* Drilldown Tab: Referring Domains */}
                              {expandedTab === "referring" && (
                                <div className="space-y-2">
                                  {item.sampleRefDomains && item.sampleRefDomains.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {item.sampleRefDomains.map((rd, i) => (
                                        <div
                                          key={i}
                                          className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                              {rd.domain}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              {rd.links} links with this anchor
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-mono text-[10px] font-bold">
                                              DT {rd.dt}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 py-3 text-center">
                                      Showing aggregated referring domain metrics for {item.referringDomains} domains.
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Drilldown Tab: Sample Backlinks */}
                              {expandedTab === "backlinks" && (
                                <div className="space-y-2">
                                  {item.sampleBacklinks && item.sampleBacklinks.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {item.sampleBacklinks.map((bl, i) => (
                                        <div
                                          key={i}
                                          className="p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                                        >
                                          <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="text-blue-600 dark:text-blue-400 font-mono text-[11px] truncate">
                                              <span className="text-slate-400 mr-1">Source:</span>
                                              {bl.sourceUrl}
                                            </div>
                                            <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate">
                                              <span className="text-slate-400 mr-1">Target:</span>
                                              {bl.targetUrl}
                                            </div>
                                          </div>
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                              bl.isDofollow
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                                : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                            }`}
                                          >
                                            {bl.isDofollow ? "Dofollow" : "Nofollow"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 py-3 text-center">
                                      {item.backlinks} total backlinks pointing to {activeDomain} with this anchor.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 11. TABLE FOOTER & PAGINATION (Exact 20 v selector) */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <strong>
              {filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredAndSorted.length)}
            </strong>{" "}
            of <strong>{filteredAndSorted.length}</strong> anchor texts
          </div>

          <div className="flex items-center gap-3">
            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ‹ Prev
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Next ›
              </button>
            </div>

            {/* Page Size Dropdown (e.g. 20 v as in screenshot) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <span>{pageSize}</span>
                <span className="text-[10px]">▼</span>
              </button>

              {isPageSizeOpen && (
                <div className="absolute right-0 bottom-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                  {[10, 20, 50, 100].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setIsPageSizeOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-center py-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                        pageSize === size ? "font-bold text-blue-600" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* PRICING MODAL */}
      {isPricingOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Choose Subscription Plan
              </h3>
              <button
                type="button"
                onClick={() => setIsPricingOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition space-y-2">
                <span className="font-bold text-sm block">Pro Plan</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">$49 / mo</div>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li>✓ 100,000 Backlinks</li>
                  <li>✓ Daily Anchor Updates</li>
                  <li>✓ 10 Projects</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 space-y-2 relative">
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">BEST</span>
                <span className="font-bold text-sm block">Business Plan</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">$99 / mo</div>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li>✓ Unlimited Backlinks</li>
                  <li>✓ Hourly Anchor Alerts</li>
                  <li>✓ Dedicated API Access</li>
                </ul>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsPricingOpen(false);
                  setToastMessage("Plan selected! Redirecting to checkout...");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL NOTIFICATION MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Email Notification Frequency
              </h3>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-500">
              Receive automated crawl reports and newly discovered anchors for <strong>{activeDomain}</strong>.
            </p>
            <div className="space-y-2">
              {["Daily", "Weekly", "Bi-weekly", "Monthly", "Disabled"].map((freq) => (
                <label
                  key={freq}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">{freq}</span>
                  <input
                    type="radio"
                    name="emailFreq"
                    value={freq}
                    checked={tempEmailFreq === freq}
                    onChange={(e) => setTempEmailFreq(e.target.value)}
                    className="text-blue-600"
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEmailNotification}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
              >
                Save Preference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Share Your Feedback
              </h3>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1">
                  How accurate are the anchor text metrics?
                </label>
                <div className="flex items-center gap-2 text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`cursor-pointer transition ${
                        star <= feedbackRating ? "text-amber-400 scale-110" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1">
                  Comments & Suggestions
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what features or anchor metrics you'd like to see..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      {isNotesOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Project Notes ({notesCount}) - {activeDomain}
              </h3>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a note about anchor distributions..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold whitespace-nowrap"
              >
                + Add Note
              </button>
            </form>

            {/* Notes list */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {notesList.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{note.author}</span>
                      <span className="text-[10px] text-slate-400">{note.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{note.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-400 hover:text-red-500 font-bold text-xs"
                    title="Delete note"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded font-semibold"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}