"use client";

import React, { useState, useMemo } from "react";
import { MOCK_BACKLINKS, BacklinkRecord } from "./mockBacklinkData";

interface BacklinksTableTabProps {
  projectDomain?: string;
}

// Helper to detect if a source URL is from a subdomain (excluding 'www')
function isSubdomain(urlStr: string): boolean {
  try {
    const hostname = new URL(urlStr).hostname.toLowerCase();
    const cleanHost = hostname.replace(/^www\./, "");
    const parts = cleanHost.split(".");
    const secondLevelTLDs = [
      "co.uk", "org.uk", "gov.uk", "ac.uk",
      "com.au", "net.au", "org.au",
      "co.nz", "co.jp", "com.br"
    ];
    const matchedCCTLD = secondLevelTLDs.find((tld) => cleanHost.endsWith("." + tld));
    if (matchedCCTLD) {
      return parts.length > 3;
    }
    return parts.length > 2;
  } catch {
    return false;
  }
}

export function BacklinksTableTab({ projectDomain = "workcomposer.com" }: BacklinksTableTabProps) {
  // Banners visibility
  const [showTopNotice, setShowTopNotice] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);

  // Email notification setting
  const [emailNotification, setEmailNotification] = useState<string>("Bi-weekly");
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NEW" | "LOST">("ALL");
  const [search, setSearch] = useState("");
  const [oneBacklinkPerDomain, setOneBacklinkPerDomain] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>("Don't show");
  const [dtFilter, setDtFilter] = useState<string>("all");
  const [isDtDropdownOpen, setIsDtDropdownOpen] = useState(false);

  // Custom DT Range inputs & applied filter
  const [dtFromInput, setDtFromInput] = useState<string>("");
  const [dtToInput, setDtToInput] = useState<string>("");
  const [appliedDtRange, setAppliedDtRange] = useState<{ from: number | null; to: number | null } | null>(null);

  // Subdomain Filter
  const [subdomainFilter, setSubdomainFilter] = useState<"Exclude subdomains" | "Include subdomains" | "Subdomains only">("Exclude subdomains");
  const [isSubdomainDropdownOpen, setIsSubdomainDropdownOpen] = useState(false);

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isUseBacklinksOpen, setIsUseBacklinksOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [linkTypeFilter, setLinkTypeFilter] = useState<string>("all");
  const [followFilter, setFollowFilter] = useState<string>("all");
  const [bestLinkOnly, setBestLinkOnly] = useState(false);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    backlink: true,
    domainTraffic: true,
    pageTraffic: true,
    dt: true,
    pt: true,
    keywords: true,
    anchorAndTarget: true,
    firstLastSeen: true,
  });

  // Sorting
  const [sortField, setSortField] = useState<keyof BacklinkRecord | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("1");

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...MOCK_BACKLINKS];

    // Status filter
    if (statusFilter === "NEW") {
      result = result.filter((b) => b.status === "New");
    } else if (statusFilter === "LOST") {
      result = result.filter((b) => b.status === "Lost");
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.sourceTitle.toLowerCase().includes(q) ||
          b.sourceUrl.toLowerCase().includes(q) ||
          b.anchorText.toLowerCase().includes(q) ||
          b.targetUrl.toLowerCase().includes(q)
      );
    }

    // One backlink per domain
    if (oneBacklinkPerDomain) {
      const seenDomains = new Set<string>();
      result = result.filter((b) => {
        try {
          const domain = new URL(b.sourceUrl).hostname;
          if (seenDomains.has(domain)) return false;
          seenDomains.add(domain);
          return true;
        } catch {
          return true;
        }
      });
    }

    // Subdomain filter
    if (subdomainFilter === "Exclude subdomains") {
      result = result.filter((b) => !isSubdomain(b.sourceUrl));
    } else if (subdomainFilter === "Subdomains only") {
      result = result.filter((b) => isSubdomain(b.sourceUrl));
    }

    // DT filter (Custom range takes precedence if set, otherwise preset dtFilter)
    if (appliedDtRange) {
      if (appliedDtRange.from !== null) {
        result = result.filter((b) => b.domainTrust >= appliedDtRange.from!);
      }
      if (appliedDtRange.to !== null) {
        result = result.filter((b) => b.domainTrust <= appliedDtRange.to!);
      }
    } else if (dtFilter === "high") {
      result = result.filter((b) => b.domainTrust >= 70);
    } else if (dtFilter === "mid") {
      result = result.filter((b) => b.domainTrust >= 30 && b.domainTrust < 70);
    } else if (dtFilter === "low") {
      result = result.filter((b) => b.domainTrust < 30);
    }

    // Follow filter
    if (followFilter === "dofollow") {
      result = result.filter((b) => b.isDofollow);
    } else if (followFilter === "nofollow") {
      result = result.filter((b) => !b.isDofollow);
    }

    // Best link only
    if (bestLinkOnly) {
      result = result.filter((b) => b.isBestLink);
    }

    // Sorting
    if (sortField !== "none") {
      result.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === "string") {
          return sortOrder === "asc"
            ? (aVal as string).localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        }
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    return result;
  }, [
    statusFilter,
    search,
    oneBacklinkPerDomain,
    subdomainFilter,
    appliedDtRange,
    dtFilter,
    followFilter,
    bestLinkOnly,
    sortField,
    sortOrder,
  ]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handlers
  const handleApplyDtRange = () => {
    const fromVal = dtFromInput.trim() !== "" ? parseInt(dtFromInput.trim(), 10) : null;
    const toVal = dtToInput.trim() !== "" ? parseInt(dtToInput.trim(), 10) : null;

    if (fromVal === null && toVal === null) {
      setAppliedDtRange(null);
    } else {
      setAppliedDtRange({
        from: fromVal !== null && !isNaN(fromVal) ? fromVal : null,
        to: toVal !== null && !isNaN(toVal) ? toVal : null,
      });
    }
    setIsDtDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleClearDtRange = () => {
    setDtFromInput("");
    setDtToInput("");
    setAppliedDtRange(null);
    setIsDtDropdownOpen(false);
    setCurrentPage(1);
  };
  const handleSort = (field: keyof BacklinkRecord) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedItems.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleUpdateReport = () => {
    setIsUpdatingReport(true);
    setTimeout(() => {
      setIsUpdatingReport(false);
      setUpdateToast("Backlink report refreshed successfully with latest live crawler metrics!");
      setTimeout(() => setUpdateToast(null), 4000);
    }, 1200);
  };

  const handleExport = (format: string) => {
    setIsExportOpen(false);
    alert(`Exporting ${filteredItems.length} backlinks to ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP NOTICE BANNER (DISMISSIBLE) */}
      {showTopNotice && (
        <div className="flex items-center justify-between gap-3 p-3 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              ℹ
            </span>
            <span>
              You may have noticed some changes in the number of backlinks and DT value. This is because we removed many outdated, disruptive backlinks from the new database. Our new data is more precise and reliable.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTopNotice(false)}
            aria-label="Dismiss notice"
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-bold px-2 py-0.5 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. SUBHEADER / BREADCRUMBS & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span className="hover:text-blue-600 cursor-pointer">{projectDomain}</span>
          <span>&gt;</span>
          <span className="hover:text-blue-600 cursor-pointer">Backlink Checker</span>
          <span>&gt;</span>
          <span className="hover:text-blue-600 cursor-pointer">Backlinks</span>
          <span>&gt;</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Active</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <span>Notes (46)</span>
          </button>
          <div
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full text-[11px] font-medium"
            title="Account limit for backlink checks"
          >
            <span>⚡ Account limit 0 / 10</span>
            <span className="cursor-help">ⓘ</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN TITLE & UPDATE REPORT ACTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Backlinks / {projectDomain}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Email notification:</span>
            <select
              value={emailNotification}
              onChange={(e) => setEmailNotification(e.target.value)}
              className="bg-transparent text-blue-600 dark:text-blue-400 font-semibold cursor-pointer border-b border-dashed border-blue-400 focus:outline-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last check: September 23, 2026
          </span>
          <button
            type="button"
            onClick={handleUpdateReport}
            disabled={isUpdatingReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span className={`text-sm ${isUpdatingReport ? "animate-spin" : ""}`}>⟳</span>
            <span>{isUpdatingReport ? "UPDATING..." : "UPDATE REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Update Toast */}
      {updateToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <span>✓</span>
          <span>{updateToast}</span>
        </div>
      )}

      {/* 4. SECONDARY INFORMATION BANNER */}
      {showGuideBanner && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl relative shadow-xs">
          <div className="flex items-start gap-3 pr-6">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              ℹ
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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

      {/* 5. SUMMARY STATS & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {filteredItems.length} backlinks
        </h3>

        <div className="flex items-center gap-2">
          {/* Columns Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span>⊞</span>
              <span>Columns</span>
            </button>

            {isColumnsOpen && (
              <div className="absolute right-0 top-9 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-30 space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Toggle Columns
                </div>
                {Object.entries({
                  backlink: "Backlink",
                  domainTraffic: "Domain Traffic",
                  pageTraffic: "Page Traffic",
                  dt: "Domain Trust (DT)",
                  pt: "Page Trust (PT)",
                  keywords: "Keywords",
                  anchorAndTarget: "Anchor & Target URL",
                  firstLastSeen: "First / Last Seen",
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

          {/* Export Action */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span>⤓</span>
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-9 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("xls")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Export Excel (.xls)
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. FILTER CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              {(["ALL", "NEW", "LOST"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md transition ${
                    statusFilter === status
                      ? "bg-slate-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            {/* One backlink per domain toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={oneBacklinkPerDomain}
                onChange={(e) => {
                  setOneBacklinkPerDomain(e.target.checked);
                  setCurrentPage(1);
                }}
                className="sr-only"
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  oneBacklinkPerDomain ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    oneBacklinkPerDomain ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
              <span className="font-medium">One backlink per domain</span>
            </label>

            {/* History Dropdown */}
            <div className="relative">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="Don't show">History: Don&apos;t show</option>
                <option value="30d">History: Last 30 days</option>
                <option value="90d">History: Last 90 days</option>
                <option value="all">History: Show all</option>
              </select>
            </div>

            {/* DT Filter with Custom Range Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDtDropdownOpen(!isDtDropdownOpen)}
                aria-label="Domain Trust range filter"
                aria-expanded={isDtDropdownOpen}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer select-none ${
                  isDtDropdownOpen || appliedDtRange !== null
                    ? "bg-[#534f6d] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>
                  DT
                  {appliedDtRange && (appliedDtRange.from !== null || appliedDtRange.to !== null)
                    ? ` ${appliedDtRange.from ?? 0}–${appliedDtRange.to ?? 100}`
                    : ""}
                </span>
                <span className="text-[10px]">{isDtDropdownOpen ? "▴" : "▾"}</span>
              </button>

              {isDtDropdownOpen && (
                <div className="absolute left-0 top-9 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3.5 z-40 space-y-3">
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Custom range
                  </div>

                  {/* Dual Input Range Box */}
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="From"
                      value={dtFromInput}
                      onChange={(e) => setDtFromInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDtRange()}
                      className="w-1/2 py-2 px-2 text-center text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                      aria-label="Domain Trust From"
                    />
                    <div className="relative flex items-center justify-center text-slate-400 dark:text-slate-500 select-none px-1 text-sm font-light">
                      <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 absolute"></span>
                      <span className="relative z-10 px-1 bg-white dark:bg-slate-800">—</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="To"
                      value={dtToInput}
                      onChange={(e) => setDtToInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDtRange()}
                      className="w-1/2 py-2 px-2 text-center text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                      aria-label="Domain Trust To"
                    />
                  </div>

                  {/* APPLY Button */}
                  <button
                    type="button"
                    onClick={handleApplyDtRange}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
                  >
                    APPLY
                  </button>

                  {/* Optional clear if range applied */}
                  {appliedDtRange && (
                    <button
                      type="button"
                      onClick={handleClearDtRange}
                      className="w-full text-center text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-0.5 cursor-pointer"
                    >
                      Reset range
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Exclude Subdomains Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubdomainDropdownOpen(!isSubdomainDropdownOpen)}
                aria-label="Subdomain filter"
                aria-expanded={isSubdomainDropdownOpen}
                className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition cursor-pointer shadow-xs"
              >
                <span>{subdomainFilter}</span>
                <span className="text-[10px] select-none">{isSubdomainDropdownOpen ? "▴" : "▾"}</span>
              </button>

              {isSubdomainDropdownOpen && (
                <div className="absolute left-0 top-9 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                  {(["Exclude subdomains", "Include subdomains", "Subdomains only"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSubdomainFilter(opt);
                        setIsSubdomainDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 ${
                        subdomainFilter === opt
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* USE BACKLINKS button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUseBacklinksOpen(!isUseBacklinksOpen)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                USE BACKLINKS
              </button>

              {isUseBacklinksOpen && (
                <div className="absolute right-0 top-9 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUseBacklinksOpen(false);
                      alert("Added selected backlinks to Backlink Monitor tool.");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Add to Backlink Monitor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUseBacklinksOpen(false);
                      alert("Exported backlinks to Google Disavow File.");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Export for Google Disavow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUseBacklinksOpen(false);
                      alert("Created SEO task from selected backlinks.");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Create SEO Task
                  </button>
                </div>
              )}
            </div>

            {/* PRESETS button with notification dot */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetsOpen(!isPresetsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 relative"
              >
                <span>PRESETS</span>
                <span className="text-[10px]">▾</span>
                <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5"></span>
              </button>

              {isPresetsOpen && (
                <div className="absolute right-0 top-9 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFollowFilter("dofollow");
                      setDtFilter("high");
                      setIsPresetsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    ⭐ High DT Dofollow Links
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBestLinkOnly(true);
                      setIsPresetsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    🔥 Best Links Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("NEW");
                      setIsPresetsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    ✨ Recently Acquired Links
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setDtFilter("all");
                      setAppliedDtRange(null);
                      setDtFromInput("");
                      setDtToInput("");
                      setSubdomainFilter("Exclude subdomains");
                      setFollowFilter("all");
                      setBestLinkOnly(false);
                      setOneBacklinkPerDomain(false);
                      setSearch("");
                      setIsPresetsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600 font-semibold"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: + FILTER expandable button */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
          >
            <span>{showAdvancedFilters ? "−" : "+"}</span>
            <span>FILTER</span>
          </button>

          {bestLinkOnly && (
            <span className="text-[11px] bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
              Filtered: Best Link Only (
              <button
                type="button"
                onClick={() => setBestLinkOnly(false)}
                className="underline ml-1 font-bold"
              >
                Clear
              </button>
              )
            </span>
          )}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Follow Status:</label>
              <select
                value={followFilter}
                onChange={(e) => setFollowFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All (Dofollow &amp; Nofollow)</option>
                <option value="dofollow">Dofollow only</option>
                <option value="nofollow">Nofollow only</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Link Type:</label>
              <select
                value={linkTypeFilter}
                onChange={(e) => setLinkTypeFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All link types</option>
                <option value="Text">Text links only</option>
                <option value="Image">Image links only</option>
                <option value="Redirect">Redirects only</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 pb-2">
                <input
                  type="checkbox"
                  checked={bestLinkOnly}
                  onChange={(e) => setBestLinkOnly(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  Show &quot;Best Link&quot; only
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Floating Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-14 z-30 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-400">
              {selectedIds.size} backlink{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Copied ${selectedIds.size} URLs to clipboard!`)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium"
            >
              Copy URLs
            </button>
            <button
              type="button"
              onClick={() => alert(`Added ${selectedIds.size} URLs to Disavow tool.`)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium"
            >
              Add to Disavow
            </button>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* 7. BACKLINKS DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((item) => selectedIds.has(item.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all backlinks"
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>

                {/* Backlink Column */}
                {visibleColumns.backlink && (
                  <th className="py-3 px-3 min-w-[280px]">BACKLINK</th>
                )}

                {/* Domain Traffic */}
                {visibleColumns.domainTraffic && (
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => handleSort("domainTrafficNum")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>DOMAIN TRAFFIC</span>
                      {sortField === "domainTrafficNum" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Page Traffic */}
                {visibleColumns.pageTraffic && (
                  <th className="py-3 px-3 text-right">PAGE TRAFFIC</th>
                )}

                {/* DT */}
                {visibleColumns.dt && (
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => handleSort("domainTrust")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>DT</span>
                      {sortField === "domainTrust" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* PT */}
                {visibleColumns.pt && (
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => handleSort("pageTrust")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>PT</span>
                      {sortField === "pageTrust" ? (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      ) : (
                        <span className="text-[9px]">▾</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Keywords */}
                {visibleColumns.keywords && (
                  <th
                    className="py-3 px-3 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => handleSort("keywordsCount")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>KEYWORDS</span>
                      {sortField === "keywordsCount" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Anchor and Target URL */}
                {visibleColumns.anchorAndTarget && (
                  <th className="py-3 px-3 min-w-[220px]">ANCHOR AND TARGET URL</th>
                )}

                {/* First Seen / Last Seen */}
                {visibleColumns.firstLastSeen && (
                  <th className="py-3 px-3 min-w-[130px]">FIRST SEEN / LAST SEEN</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {paginatedItems.map((item) => {
                const isSelected = selectedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(item.id)}
                        aria-label={`Select backlink from ${item.sourceTitle}`}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Backlink (Title + Source URL + Best Link badge) */}
                    {visibleColumns.backlink && (
                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate" title={item.sourceTitle}>
                          {item.sourceTitle}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline truncate block max-w-xs font-mono"
                            title={item.sourceUrl}
                          >
                            {item.sourceUrl}
                          </a>
                          <span className="text-[10px] text-slate-400">▾</span>
                        </div>
                        {item.isBestLink && (
                          <div className="mt-1.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-white shadow-xs">
                              BEST LINK
                            </span>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Domain Traffic */}
                    {visibleColumns.domainTraffic && (
                      <td className="py-3 px-3 text-right font-medium text-slate-800 dark:text-slate-200 font-mono">
                        {item.domainTraffic}
                      </td>
                    )}

                    {/* Page Traffic */}
                    {visibleColumns.pageTraffic && (
                      <td className="py-3 px-3 text-right text-slate-400 font-mono">
                        {item.pageTraffic}
                      </td>
                    )}

                    {/* DT */}
                    {visibleColumns.dt && (
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.domainTrust}
                        </span>
                      </td>
                    )}

                    {/* PT */}
                    {visibleColumns.pt && (
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {item.pageTrust}
                        </span>
                      </td>
                    )}

                    {/* Keywords */}
                    {visibleColumns.keywords && (
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {item.keywordsCount}
                        </span>
                      </td>
                    )}

                    {/* Anchor and Target URL */}
                    {visibleColumns.anchorAndTarget && (
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate" title={item.anchorText}>
                          {item.anchorText}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.linkType.toUpperCase()}
                          </span>
                          {!item.isDofollow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              NOFOLLOW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 truncate mt-1 font-mono">
                          <span className="truncate">{item.targetUrl}</span>
                          <span className="text-[10px] text-slate-400">▾</span>
                        </div>
                      </td>
                    )}

                    {/* First Seen / Last Seen */}
                    {visibleColumns.firstLastSeen && (
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px] font-mono leading-tight">
                        <div>{item.firstSeen}</div>
                        <div className="text-slate-400 mt-0.5">{item.lastSeen}</div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No backlinks found matching your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 8. PAGINATION FOOTER */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
          {/* Page numbers navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded flex items-center justify-center font-medium transition ${
                  currentPage === page
                    ? "bg-slate-800 text-white font-bold"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

            {totalPages > 4 && (
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                className={`w-7 h-7 rounded flex items-center justify-center font-medium transition ${
                  currentPage === totalPages
                    ? "bg-slate-800 text-white font-bold"
                    : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>

          {/* Go to page & Page Size dropdown */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span>Go to page:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const p = parseInt(goToPageInput, 10);
                    if (p >= 1 && p <= totalPages) setCurrentPage(p);
                  }
                }}
                className="w-12 py-1 px-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none"
              />
            </div>

            {/* Rows per page dropdown button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                <span>{pageSize}</span>
                <span className="text-[9px]">{isPageSizeOpen ? "▾" : "▴"}</span>
              </button>

              {isPageSizeOpen && (
                <div className="absolute right-0 bottom-8 w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                  {[20, 50, 100, 150, 200].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setIsPageSizeOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-center py-1.5 ${
                        pageSize === size
                          ? "bg-slate-100 dark:bg-slate-800 font-bold text-blue-600"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
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

      {/* 9. FEEDBACK MODAL */}
      {isFeedbackOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Backlink Checker Feedback
              </h3>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Help us improve! Share any feedback, missing features, or data suggestions.
            </p>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What can we improve on Backlink Checker?"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs rounded-lg font-medium text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  alert("Thank you for your feedback!");
                  setFeedbackText("");
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. PROJECT NOTES MODAL */}
      {isNotesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Project Notes (46)
              </h3>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Audit log notes and backlink outreach tracking entries for {projectDomain}.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Outreach campaign to tech directories initiated
                </span>
                <p className="text-slate-500 text-[11px]">23 Sep 2026 • 15 emails sent to SaaS listing reviewers</p>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Samsung security advisory editorial mention
                </span>
                <p className="text-slate-500 text-[11px]">19 Jul 2025 • High authority news mention on The Register</p>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  MakeUseOf overtime productivity round-up
                </span>
                <p className="text-slate-500 text-[11px]">08 Dec 2025 • DoFollow editorial backlink verified</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold"
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