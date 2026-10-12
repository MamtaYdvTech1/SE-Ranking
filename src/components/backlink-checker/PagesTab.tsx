"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MOCK_ZOHO_PAGES,
  MOCK_WORKCOMPOSER_PAGES,
  MOCK_PAGES,
  ZohoPageItem,
  PageRecord,
} from "./mockBacklinkData";

interface PagesTabProps {
  projectDomain?: string;
  showSubTabs?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function PagesTab({
  projectDomain = "workco.com",
  showSubTabs = true,
  onNavigateTab,
}: PagesTabProps) {
  // Active domain (default workco.com, toggles to workcomposer.com)
  const [activeDomain, setActiveDomain] = useState<string>(projectDomain || "workco.com");

  useEffect(() => {
    if (projectDomain) {
      setActiveDomain(projectDomain);
      if (projectDomain.toLowerCase().includes("workcomposer")) {
        setLastCheckDate("September 26, 2026");
      } else {
        setLastCheckDate("September 23, 2026");
      }
    }
  }, [projectDomain]);

  // Banners
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showPromoBadge, setShowPromoBadge] = useState(false);

  // Email Notification
  const [emailNotification, setEmailNotification] = useState<string>("Bi-weekly");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [tempEmailFreq, setTempEmailFreq] = useState("Bi-weekly");

  // Report Update State
  const [lastCheckDate, setLastCheckDate] = useState(
    projectDomain?.toLowerCase().includes("workcomposer") ? "September 26, 2026" : "September 23, 2026"
  );
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<"ALL" | "https" | "http">("ALL");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilterFields, setActiveFilterFields] = useState<
    ("backlinks" | "refDomains" | "brokenBacklinks")[]
  >([]);
  const [minBacklinks, setMinBacklinks] = useState("");
  const [maxBacklinks, setMaxBacklinks] = useState("");
  const [minRefDomains, setMinRefDomains] = useState("");
  const [maxRefDomains, setMaxRefDomains] = useState("");
  const [hasBrokenOnly, setHasBrokenOnly] = useState(false);

  // Presets
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const presetsRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<string>("ALL");
  const [presetsList, setPresetsList] = useState<
    { id: string; label: string; isCustom?: boolean; filterConfig?: any }[]
  >([]);

  const handleCreatePreset = () => {
    if (!presetNameInput.trim()) return;
    const newId = `custom-page-preset-${Date.now()}`;
    const newPreset = {
      id: newId,
      label: presetNameInput.trim(),
      isCustom: true,
      filterConfig: {
        search,
        protocolFilter,
        minBacklinks,
        maxBacklinks,
        minRefDomains,
        maxRefDomains,
        hasBrokenOnly,
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
    if (preset.filterConfig) {
      if (preset.filterConfig.search !== undefined) setSearch(preset.filterConfig.search);
      if (preset.filterConfig.protocolFilter) setProtocolFilter(preset.filterConfig.protocolFilter);
      if (preset.filterConfig.minBacklinks !== undefined) setMinBacklinks(preset.filterConfig.minBacklinks);
      if (preset.filterConfig.maxBacklinks !== undefined) setMaxBacklinks(preset.filterConfig.maxBacklinks);
      if (preset.filterConfig.minRefDomains !== undefined) setMinRefDomains(preset.filterConfig.minRefDomains);
      if (preset.filterConfig.maxRefDomains !== undefined) setMaxRefDomains(preset.filterConfig.maxRefDomains);
      if (preset.filterConfig.hasBrokenOnly !== undefined) setHasBrokenOnly(preset.filterConfig.hasBrokenOnly);
      if (preset.filterConfig.activeFilterFields) setActiveFilterFields(preset.filterConfig.activeFilterFields);
    }
  };

  // Columns visibility
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    url: true,
    backlinks: true,
    refDomains: true,
    domainTrust: false,
    status: false,
  });

  // Export Menu
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortField, setSortField] = useState<"url" | "backlinks" | "refDomains" | "none">("backlinks");
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
      date: "Sep 22, 2026",
      text: "Homepage has high concentration of quality backlinks. Excellent link distribution.",
    },
    {
      id: "n-2",
      author: "Sarah Chen",
      date: "Sep 18, 2026",
      text: "HTTP versions properly redirecting to canonical HTTPS with 301 status.",
    },
  ]);
  const [newNoteText, setNewNoteText] = useState("");

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const limitsRef = useRef<HTMLDivElement>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Page size
  const [pageSize, setPageSize] = useState<number>(20);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (limitsRef.current && !limitsRef.current.contains(e.target as Node)) {
        setIsLimitsOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setIsColumnsOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Source items
  const sourcePages: ZohoPageItem[] = useMemo(() => {
    if (activeDomain.toLowerCase() === "workco.com" || activeDomain.toLowerCase() === "zoho.com") {
      return MOCK_ZOHO_PAGES;
    }
    return MOCK_WORKCOMPOSER_PAGES;
  }, [activeDomain]);

  // Filtered & Sorted
  const filteredPages = useMemo(() => {
    return sourcePages
      .filter((item) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!item.url.toLowerCase().includes(q)) {
            return false;
          }
        }
        // Protocol
        if (protocolFilter !== "ALL" && item.protocol !== protocolFilter) {
          return false;
        }
        // Min/Max Backlinks
        if (minBacklinks) {
          const val = parseInt(minBacklinks, 10);
          if (!isNaN(val) && item.backlinksCount < val) return false;
        }
        if (maxBacklinks) {
          const val = parseInt(maxBacklinks, 10);
          if (!isNaN(val) && item.backlinksCount > val) return false;
        }
        // Min/Max Ref Domains
        if (minRefDomains) {
          const val = parseInt(minRefDomains, 10);
          if (!isNaN(val) && item.refDomainsCount < val) return false;
        }
        if (maxRefDomains) {
          const val = parseInt(maxRefDomains, 10);
          if (!isNaN(val) && item.refDomainsCount > val) return false;
        }
        // Broken backlinks filter
        if (hasBrokenOnly && (!item.brokenBacklinksCount || item.brokenBacklinksCount <= 0)) {
          return false;
        }
        // Presets
        if (activePreset === "HTTPS" && item.protocol !== "https") return false;
        if (activePreset === "HTTP" && item.protocol !== "http") return false;
        if (activePreset === "HIGH_BACKLINKS" && item.backlinksCount < 10) return false;
        if (activePreset === "HIGH_REF_DOMAINS" && item.refDomainsCount < 5) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === "none") return 0;
        let diff = 0;
        if (sortField === "url") {
          diff = a.url.localeCompare(b.url);
        } else if (sortField === "backlinks") {
          diff = a.backlinksCount - b.backlinksCount;
        } else if (sortField === "refDomains") {
          diff = a.refDomainsCount - b.refDomainsCount;
        }
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [
    sourcePages,
    search,
    protocolFilter,
    minBacklinks,
    maxBacklinks,
    minRefDomains,
    maxRefDomains,
    hasBrokenOnly,
    activePreset,
    sortField,
    sortOrder,
  ]);

  // Handle Sort
  const handleSort = (field: "url" | "backlinks" | "refDomains") => {
    if (sortField === field) {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else {
        setSortField("none");
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ["URL", "Protocol", "Backlinks", "Referring Domains", "Status Code", "Domain Trust"];
    const rows = filteredPages.map((p) => [
      `"${p.url}"`,
      p.protocol,
      p.backlinksCount,
      p.refDomainsCount,
      p.statusCode || 200,
      p.domainTrust || 50,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pages_${activeDomain}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    setToastMessage("CSV export downloaded successfully");
  };

  const handleExportXLS = () => {
    handleExportCSV();
    setToastMessage("Excel (XLS/CSV) exported successfully");
  };

  // Update Report action
  const handleUpdateReport = () => {
    setIsUpdatingReport(true);
    setTimeout(() => {
      setIsUpdatingReport(false);
      const now = new Date();
      const formatted = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      setLastCheckDate(formatted);
      setToastMessage("Report updated successfully. Fresh backlink data loaded.");
    }, 1200);
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newEntry = {
      id: `n-${Date.now()}`,
      author: "You",
      date: "Just now",
      text: newNoteText.trim(),
    };
    setNotesList([newEntry, ...notesList]);
    setNotesCount((prev) => prev + 1);
    setNewNoteText("");
    setToastMessage("Note added successfully");
  };

  const currentTab = "pages";

  return (
    <div className="relative space-y-4 font-sans text-slate-800 dark:text-slate-100 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}





      {/* Top Banner 2: Blue Notice Banner */}
      {showNoticeBanner && (
        <div className="flex items-start justify-between gap-3 px-4 py-2.5 bg-[#eff6ff] dark:bg-blue-950/40 border border-[#bfdbfe] dark:border-blue-900 text-blue-900 dark:text-blue-200 rounded-lg text-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 text-sm font-bold">ℹ</span>
            <span className="leading-relaxed">
              You may have noticed some changes in the number of backlinks and DT value. This is because we removed many outdated, disruptive backlinks from the new database. Our new data is more precise and reliable.
            </span>
          </div>
          <button
            onClick={() => setShowNoticeBanner(false)}
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 text-base leading-none p-0.5"
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* Breadcrumbs & Header Utility Row - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 font-medium">
          <button
            onClick={() => setActiveDomain(activeDomain === "workco.com" ? "workcomposer.com" : "workco.com")}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer font-medium"
            title="Click to toggle domain"
          >
            {activeDomain}
          </button>
          <span className="text-slate-400">›</span>
          <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer">Backlink Checker</span>
          <span className="text-slate-400">›</span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Pages</span>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Feedback
          </button>
          <button
            onClick={() => setIsNotesOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
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
              <span>Account limit <strong>0 / 10</strong></span>
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
                    <span className="font-bold text-slate-900 dark:text-white font-mono">0 of 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-amber-500 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>10 checks left today</span>
                    <span>Resets in 5h 18m</span>
                  </div>
                </div>

                {/* Monthly Quota */}
                <div className="space-y-1.5 mb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Monthly query quota</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">18 of 300</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[6%] h-full bg-blue-500 rounded-full" />
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
                      setIsPricingModalOpen(true);
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

      {/* Title & Email Notification & Update Report Bar - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pages / {activeDomain}
          </h1>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Email notification:</span>
            <button
              onClick={() => {
                setTempEmailFreq(emailNotification);
                setIsEmailModalOpen(true);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{emailNotification}</span>
              <span className="text-[9px]">▾</span>
            </button>
          </div>
        </div>

        {/* Right side: Last check & Update Report Button */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Last check: {lastCheckDate}
          </span>
          <button
            onClick={handleUpdateReport}
            disabled={isUpdatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-70 whitespace-nowrap uppercase tracking-wider"
          >
            <span className={`text-sm ${isUpdatingReport ? "animate-spin" : ""}`}>🔄</span>
            <span>{isUpdatingReport ? "UPDATING..." : "UPDATE REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation: Overview | Backlinks | Referring Domains | Anchor Texts | Pages | IPs - ALL IN ONE LINE */}
      {showSubTabs && (
        <div className="border-b border-slate-200 dark:border-slate-800 pt-1">
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium" role="tablist" aria-label="Pages sub tabs">
            {[
              { id: "overview", label: "Overview" },
              { id: "backlinks", label: "Backlinks" },
              { id: "referring-domains", label: "Referring Domains" },
              { id: "anchor-texts", label: "Anchor Texts" },
              { id: "pages", label: "Pages" },
              { id: "ips", label: "IPs" },
            ].map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onNavigateTab && onNavigateTab(tab.id)}
                  className={`pb-2.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "border-slate-900 text-slate-900 dark:border-white dark:text-white font-semibold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Blue Informational Guide Banner */}
      {showGuideBanner && (
        <div className="bg-[#eff6ff] dark:bg-sky-950/30 border border-[#bfdbfe] dark:border-sky-900/60 rounded-lg p-3.5 relative shadow-xs">
          <div className="flex items-start gap-2.5 pr-6">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">ℹ</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Get a full list of backlinks for any domain, complete with detailed data on each link. This tool is perfect for analysing any website&apos;s backlink profiles, including your competitors&apos; sites. In just minutes, you&apos;ll receive a report detailing every backlink, including information on the originating domains and pages they link to. With this data, you can get the full picture of any backlink profile and effectively evaluate the value and quality of each backlink.
            </p>
          </div>
          <button
            onClick={() => setShowGuideBanner(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
            aria-label="Dismiss guide"
          >
            ×
          </button>
        </div>
      )}

      {/* Table Controls: Item Count + Columns + Export - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Left: Count */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {filteredPages.length} pages
        </h3>

        {/* Right: Columns & Export */}
        <div className="flex items-center gap-2">
          {/* Columns Dropdown */}
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium px-3.5 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="font-bold text-slate-700 dark:text-slate-300">▥</span>
              <span>Columns</span>
            </button>
            {isColumnsOpen && (
              <div className="absolute right-0 top-9 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30 p-3 text-xs space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">Toggle Columns</div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.url}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, url: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>URL</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.backlinks}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, backlinks: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Backlinks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.refDomains}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, refDomains: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Referring Domains</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.domainTrust}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, domainTrust: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Domain Trust</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.status}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, status: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>HTTP Status</span>
                </label>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="border border-slate-200 bg-[#e2e8f0] dark:bg-slate-700 dark:border-slate-600 text-xs font-medium px-3.5 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>📤</span>
              <span>Export</span>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-9 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export CSV (.csv)
                </button>
                <button
                  onClick={handleExportXLS}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export Excel (.xls)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Row: Search Input + FILTER Button with Dropdown + PRESETS with Left Flyout */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          {/* Search URL or domain */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              placeholder="URL or domain"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
            <span className="absolute right-2.5 top-2 text-slate-400 text-xs pointer-events-none">🔍</span>
          </div>

          {/* + FILTER button & dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              aria-label="+ FILTER"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                isFilterMenuOpen
                  ? "bg-[#4e4376] text-white shadow-xs border border-[#4e4376]"
                  : activeFilterFields.length > 0
                  ? "bg-[#4e4376] text-white border border-[#4e4376]"
                  : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
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

            {/* Checkbox dropdown menu directly below + FILTER (Screenshot 1) */}
            {isFilterMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                {[
                  { id: "backlinks", label: "Backlinks" },
                  { id: "refDomains", label: "Ref.domains" },
                  { id: "brokenBacklinks", label: "Broken backlinks" },
                ].map((opt) => {
                  const isChecked = activeFilterFields.includes(opt.id as any);
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
                            setActiveFilterFields([...activeFilterFields, opt.id as any]);
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
        </div>

        {/* PRESETS Dropdown with Save filter preset flyout to the LEFT */}
        <div className="relative" ref={presetsRef}>
          <button
            type="button"
            aria-label="Presets"
            onClick={() => {
              const nextOpen = !isPresetsOpen;
              setIsPresetsOpen(nextOpen);
              setIsSaveFlyoutOpen(nextOpen);
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
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* Save filter preset item with nested flyout submenu to the LEFT */}
              <div
                className="relative"
                onMouseEnter={() => setIsSaveFlyoutOpen(true)}
              >
                <button
                  type="button"
                  aria-label="Save filter preset"
                  onClick={() => setIsSaveFlyoutOpen(true)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer font-medium ${
                    isSaveFlyoutOpen
                      ? "bg-[#e2e0ea] dark:bg-slate-800 text-[#4e4376] dark:text-purple-300 font-semibold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none font-bold text-slate-700 dark:text-slate-200">+</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Save filter preset</span>
                  </div>
                  <span className="text-slate-400 text-xs font-bold">&gt;</span>
                </button>

                {/* Save Filter Preset Flyout positioned to the LEFT (Screenshot) */}
                {isSaveFlyoutOpen && (
                  <div
                    role="dialog"
                    aria-label="Save filter preset"
                    className="absolute right-full top-0 mr-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3.5 z-50 text-xs text-slate-800 dark:text-slate-200"
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
                      className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3 shadow-inner"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={!presetNameInput.trim()}
                      onClick={handleCreatePreset}
                      className={`w-full py-2.5 rounded text-[11px] font-bold tracking-wider uppercase transition text-center ${
                        presetNameInput.trim()
                          ? "bg-[#4e4376] hover:bg-[#3d345c] text-white shadow-xs cursor-pointer"
                          : "bg-[#dcdde1] dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      CREATE FILTER PRESET
                    </button>
                  </div>
                )}
              </div>

              {/* Presets List (only shown if custom presets exist) */}
              {presetsList.length > 0 && (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Controls Panel when criteria are selected */}
      {activeFilterFields.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-lg animate-in fade-in duration-150">
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

          {activeFilterFields.includes("refDomains") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Ref. domains (Min - Max)</label>
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

          {activeFilterFields.includes("brokenBacklinks") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Broken backlinks</label>
                <button
                  type="button"
                  onClick={() => setActiveFilterFields(activeFilterFields.filter((f) => f !== "brokenBacklinks"))}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasBrokenOnly}
                    onChange={(e) => setHasBrokenOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4e4376] focus:ring-[#4e4376]"
                  />
                  <span>Only pages with broken links</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
              <tr>
                {visibleColumns.url && (
                  <th
                    onClick={() => handleSort("url")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>URL</span>
                      {sortField === "url" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.backlinks && (
                  <th
                    onClick={() => handleSort("backlinks")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span>BACKLINKS</span>
                      <span className="text-[10px] text-slate-400">▾</span>
                    </div>
                  </th>
                )}
                {visibleColumns.refDomains && (
                  <th
                    onClick={() => handleSort("refDomains")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span>REF.DOMAINS</span>
                      <span className="text-[10px] text-slate-400">▾</span>
                    </div>
                  </th>
                )}
                {visibleColumns.domainTrust && (
                  <th className="py-3 px-4 text-center">
                    <span>DT</span>
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="py-3 px-4 text-center">
                    <span>STATUS</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No pages found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredPages.map((item) => {
                  const isExpanded = expandedRowId === item.id;
                  const isWorkcomposer = item.url.includes("workcomposer");
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        {/* URL column */}
                        {visibleColumns.url && (
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2.5">
                              {/* Blue W/Z or Globe Favicon */}
                              <div className="w-5 h-5 rounded bg-[#0284c7] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {isWorkcomposer ? "W" : "Z"}
                              </div>
                              <div className="flex flex-col">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline font-normal text-xs break-all max-w-xl"
                                  title={item.url}
                                >
                                  {item.url}
                                </a>
                                {/* Status Code 200/301 badge directly underneath URL (Screenshot) */}
                                <div className="mt-1">
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      item.statusCode === 200 || !item.statusCode
                                        ? "bg-[#059669] text-white"
                                        : "bg-amber-500 text-white"
                                    } leading-none`}
                                  >
                                    {item.statusCode || 200}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Backlinks pill button with down arrow */}
                        {visibleColumns.backlinks && (
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (isExpanded && expandedTab === "backlinks") {
                                  setExpandedRowId(null);
                                } else {
                                  setExpandedRowId(item.id);
                                  setExpandedTab("backlinks");
                                }
                              }}
                              aria-label={`Backlinks: ${item.backlinksCount}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#f1f5f9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium text-xs transition cursor-pointer shadow-2xs"
                              title="Click to inspect sample backlinks"
                            >
                              <span>{item.backlinksCount}</span>
                              <span className="text-[9px] text-slate-500">▾</span>
                            </button>
                          </td>
                        )}

                        {/* Ref Domains pill button with down arrow */}
                        {visibleColumns.refDomains && (
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (isExpanded && expandedTab === "referring") {
                                  setExpandedRowId(null);
                                } else {
                                  setExpandedRowId(item.id);
                                  setExpandedTab("referring");
                                }
                              }}
                              aria-label={`Referring domains: ${item.refDomainsCount}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#f1f5f9] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium text-xs transition cursor-pointer shadow-2xs"
                              title="Click to inspect sample referring domains"
                            >
                              <span>{item.refDomainsCount}</span>
                              <span className="text-[9px] text-slate-500">▾</span>
                            </button>
                          </td>
                        )}

                        {/* DT (Optional) */}
                        {visibleColumns.domainTrust && (
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.domainTrust || 50}
                            </span>
                          </td>
                        )}

                        {/* Status Code (Optional) */}
                        {visibleColumns.status && (
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                item.statusCode === 200
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {item.statusCode || 200}
                            </span>
                          </td>
                        )}
                      </tr>

                      {/* Drilldown Drawer for Clicked Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-t border-b border-blue-200 dark:border-blue-900/60">
                          <td colSpan={5} className="p-4">
                            <div className="space-y-3">
                              {/* Sub tabs in drawer */}
                              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                  <button
                                    onClick={() => setExpandedTab("referring")}
                                    className={`pb-1 ${
                                      expandedTab === "referring"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                  >
                                    Referring Domains ({item.refDomainsCount})
                                  </button>
                                  <button
                                    onClick={() => setExpandedTab("backlinks")}
                                    className={`pb-1 ${
                                      expandedTab === "backlinks"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                  >
                                    Sample Backlinks ({item.backlinksCount})
                                  </button>
                                </div>
                                <button
                                  onClick={() => setExpandedRowId(null)}
                                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                  Close ✕
                                </button>
                              </div>

                              {/* Drawer content */}
                              {expandedTab === "referring" ? (
                                <div className="space-y-1.5">
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Sample referring domains pointing to <span className="font-mono text-slate-700 dark:text-slate-200">{item.url}</span>:
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    {item.sampleRefDomains && item.sampleRefDomains.length > 0 ? (
                                      item.sampleRefDomains.map((rd, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center justify-between"
                                        >
                                          <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                              {rd.domain}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                              Links: {rd.links}
                                            </div>
                                          </div>
                                          <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            DT {rd.dt}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs text-slate-400 col-span-3">No sample domains recorded.</div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Sample backlinks leading to this page:
                                  </div>
                                  <div className="space-y-2 pt-1">
                                    {item.sampleBacklinks && item.sampleBacklinks.length > 0 ? (
                                      item.sampleBacklinks.map((sb, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <a
                                              href={sb.sourceUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:underline font-mono truncate max-w-md"
                                            >
                                              {sb.sourceUrl}
                                            </a>
                                            <span
                                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                                                sb.isDofollow
                                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                              }`}
                                            >
                                              {sb.isDofollow ? "dofollow" : "nofollow"}
                                            </span>
                                          </div>
                                          <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                            Anchor: <span className="font-semibold text-slate-800 dark:text-slate-200">&ldquo;{sb.anchor}&rdquo;</span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs text-slate-400">No sample backlinks recorded.</div>
                                    )}
                                  </div>
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
      </div>

      {/* Bottom Pagination & Page Size */}
      <div className="flex justify-end pt-2">
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="appearance-none pr-7 pl-3 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="absolute right-2 top-1.5 pointer-events-none text-[10px] text-slate-400">
            ▾
          </span>
        </div>
      </div>

      {/* MODAL 1: Email Frequency */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Email Notification Frequency
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose how often you would like to receive updated crawl reports for {activeDomain}.
            </p>
            <div className="space-y-2">
              {["Daily", "Weekly", "Bi-weekly", "Monthly", "Disabled"].map((freq) => (
                <label
                  key={freq}
                  className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <input
                    type="radio"
                    name="emailFreq"
                    value={freq}
                    checked={tempEmailFreq === freq}
                    onChange={(e) => setTempEmailFreq(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{freq}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEmailNotification(tempEmailFreq);
                  setIsEmailModalOpen(false);
                  setToastMessage(`Email notification set to ${tempEmailFreq}`);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Feedback */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Share Your Feedback
              </h3>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Rate your experience:</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFeedbackRating(s)}
                    className={`text-xl ${s <= feedbackRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Comments or ideas</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What can we improve on the Pages tab?"
                rows={4}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedbackText("");
                  setToastMessage("Thank you for your feedback!");
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Notes */}
      {isNotesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Project Notes ({notesCount})
              </h3>
              <button
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a new note for this project..."
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                >
                  Add Note
                </button>
              </div>
            </form>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {notesList.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{n.author}</span>
                    <span>{n.date}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Pricing Plans */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Upgrade Your Plan
              </h3>
              <button
                onClick={() => setIsPricingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You currently have 11 days left on your trial. Choose a plan to keep running comprehensive backlink scans.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center space-y-2">
                <div className="font-bold text-sm">Essential</div>
                <div className="text-lg font-bold text-blue-600">$55<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <div className="text-[11px] text-slate-500">Up to 10 projects, 25,000 backlinks</div>
              </div>
              <div className="border-2 border-emerald-500 rounded-lg p-3 text-center space-y-2 bg-emerald-50/30 dark:bg-emerald-950/20 relative">
                <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold">POPULAR</span>
                <div className="font-bold text-sm">Pro</div>
                <div className="text-lg font-bold text-emerald-600">$109<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <div className="text-[11px] text-slate-500">Unlimited projects, 100,000 backlinks</div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center space-y-2">
                <div className="font-bold text-sm">Business</div>
                <div className="text-lg font-bold text-blue-600">$239<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <div className="text-[11px] text-slate-500">Custom API limits & SLA support</div>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  setIsPricingModalOpen(false);
                  setToastMessage("Redirecting to checkout...");
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded hover:bg-emerald-700"
              >
                Select Pro Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Limits */}
      {isLimitsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Account Limit Details
              </h3>
              <button
                onClick={() => setIsLimitsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Active checks today:</span>
                <span className="font-bold font-mono">0 / 10</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Monthly query limit:</span>
                <span className="font-bold font-mono">300</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Reset cycle:</span>
                <span className="text-slate-400">In 18 hours</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsLimitsModalOpen(false)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}