"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MOCK_ZOHO_IPS,
  MOCK_WORKCOMPOSER_IPS,
  MOCK_IPS,
  ZohoIpItem,
  IpRecord,
} from "./mockBacklinkData";
import { CountryFlag } from "@/components/ui/CountryFlag";

export function CountryOrGlobeLogo({ type, flag, countryCode, country }: { type?: string; flag?: string; countryCode?: string; country?: string }) {
  const code = countryCode || type || flag || country;
  return <CountryFlag code={code} name={country} />;
}

interface IpsTabProps {
  projectDomain?: string;
  showSubTabs?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function IpsTab({
  projectDomain = "workcomposer.com",
  showSubTabs = true,
  onNavigateTab,
}: IpsTabProps) {
  // Domain selection (workcomposer.com as in screenshot, or workco.com)
  const [activeDomain, setActiveDomain] = useState<string>(projectDomain || "workcomposer.com");

  useEffect(() => {
    if (projectDomain) {
      setActiveDomain(projectDomain);
    }
  }, [projectDomain]);

  // Mode: IPS vs SUBNETS
  const [viewMode, setViewMode] = useState<"IPS" | "SUBNETS">("IPS");

  // Banners (Promo & Trial banners removed per design instructions)
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showPromoBadge, setShowPromoBadge] = useState(false);

  // Email Notification
  const [emailNotification, setEmailNotification] = useState<string>("Bi-weekly");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [tempEmailFreq, setTempEmailFreq] = useState("Bi-weekly");

  // Report Update State
  const [lastCheckDate, setLastCheckDate] = useState("September 26, 2026");
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [filterFieldIp, setFilterFieldIp] = useState(false);
  const [filterFieldRefDomains, setFilterFieldRefDomains] = useState(false);
  const [filterFieldBacklinks, setFilterFieldBacklinks] = useState(false);
  const [ipSearch, setIpSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [minRefDomains, setMinRefDomains] = useState("");
  const [maxRefDomains, setMaxRefDomains] = useState("");
  const [minBacklinks, setMinBacklinks] = useState("");
  const [maxBacklinks, setMaxBacklinks] = useState("");

  // Presets & Flyout
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [customPresets, setCustomPresets] = useState<string[]>([]);
  const presetsRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<string>("ALL");

  // Columns visibility
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    ip: true,
    country: true,
    refDomains: true,
    backlinks: true,
    subnet: false,
  });

  // Export Menu
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortField, setSortField] = useState<"ip" | "refDomains" | "backlinks" | "none">("refDomains");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination (screenshot has 20 per page, with 21 total -> page 1 has 20, page 2 has 1)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [goToPageInput, setGoToPageInput] = useState<string>("1");

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
      text: "Top referring IP 195.20.19.178 provides 15 referring domains and 16 backlinks.",
    },
    {
      id: "n-2",
      author: "David Wright",
      date: "Sep 20, 2026",
      text: "Diverse geographical spread across US, Germany, France, Singapore, Romania, UK, and Bulgaria.",
    },
  ]);
  const [newNoteText, setNewNoteText] = useState("");

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const limitsRef = useRef<HTMLDivElement>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

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

  const handleCreatePreset = () => {
    if (!presetNameInput.trim()) return;
    const name = presetNameInput.trim();
    setCustomPresets((prev) => [...prev, name]);
    setActivePreset(name);
    setPresetNameInput("");
    setIsSaveFlyoutOpen(false);
    setIsPresetsOpen(false);
    setToastMessage(`Filter preset "${name}" created successfully!`);
  };

  // Source Items
  const sourceIps: ZohoIpItem[] = useMemo(() => {
    if (activeDomain.toLowerCase() === "workco.com" || activeDomain.toLowerCase() === "zoho.com") {
      return MOCK_ZOHO_IPS;
    }
    return MOCK_WORKCOMPOSER_IPS;
  }, [activeDomain]);

  // Distinct countries for filter
  const distinctCountries = useMemo(() => {
    const map = new Map<string, string>();
    sourceIps.forEach((item) => {
      if (item.country) {
        map.set(item.country, item.flag);
      }
    });
    return Array.from(map.entries()).map(([country, flag]) => ({ country, flag }));
  }, [sourceIps]);

  // Filtered IP items
  const filteredIps = useMemo(() => {
    return sourceIps
      .filter((item) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchIp = item.ipAddress.toLowerCase().includes(q);
          const matchSubnet = item.subnet.toLowerCase().includes(q);
          const matchCountry = item.country.toLowerCase().includes(q);
          if (!matchIp && !matchSubnet && !matchCountry) return false;
        }

        // IP specific filter from + FILTER menu
        if (filterFieldIp && ipSearch.trim()) {
          if (!item.ipAddress.toLowerCase().includes(ipSearch.trim().toLowerCase())) return false;
        }

        // Country filter
        if (countryFilter !== "ALL" && item.country !== countryFilter) {
          return false;
        }

        // Range filters
        if (minRefDomains && item.refDomainsCount < parseInt(minRefDomains, 10)) return false;
        if (maxRefDomains && item.refDomainsCount > parseInt(maxRefDomains, 10)) return false;
        if (minBacklinks && item.backlinksCount < parseInt(minBacklinks, 10)) return false;
        if (maxBacklinks && item.backlinksCount > parseInt(maxBacklinks, 10)) return false;

        // Presets
        if (activePreset === "MULTI_LINK" && item.backlinksCount <= 1) return false;
        if (activePreset === "HIGH_REF" && item.refDomainsCount < 2) return false;
        if (activePreset === "US_ONLY" && item.countryCode !== "us") return false;
        if (activePreset === "EU_ONLY" && !["ro", "de", "fr", "dk", "at", "bg"].includes(item.countryCode)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === "none") return 0;
        let diff = 0;
        if (sortField === "ip") {
          diff = a.ipAddress.localeCompare(b.ipAddress);
        } else if (sortField === "refDomains") {
          diff = a.refDomainsCount - b.refDomainsCount;
        } else if (sortField === "backlinks") {
          diff = a.backlinksCount - b.backlinksCount;
        }
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [
    sourceIps,
    search,
    countryFilter,
    minRefDomains,
    maxRefDomains,
    minBacklinks,
    maxBacklinks,
    activePreset,
    sortField,
    sortOrder,
  ]);

  // Aggregated Subnets data (when viewMode === "SUBNETS")
  const aggregatedSubnets = useMemo(() => {
    const subMap = new Map<
      string,
      {
        subnet: string;
        ipsCount: number;
        refDomainsCount: number;
        backlinksCount: number;
        country: string;
        flag: string;
        logoType?: string;
        ips: ZohoIpItem[];
      }
    >();

    filteredIps.forEach((item) => {
      const existing = subMap.get(item.subnet);
      if (existing) {
        existing.ipsCount += 1;
        if (!item.ipCountInSubnet) {
          existing.refDomainsCount += item.refDomainsCount;
          existing.backlinksCount += item.backlinksCount;
        }
        existing.ips.push(item);
      } else {
        subMap.set(item.subnet, {
          subnet: item.subnet,
          ipsCount: item.ipCountInSubnet || 1,
          refDomainsCount: item.refDomainsCount,
          backlinksCount: item.backlinksCount,
          country: item.country,
          flag: item.flag,
          logoType: item.logoType,
          ips: [item],
        });
      }
    });

    return Array.from(subMap.values()).sort((a, b) => {
      if (sortField === "backlinks") {
        return sortOrder === "asc" ? a.backlinksCount - b.backlinksCount : b.backlinksCount - a.backlinksCount;
      }
      if (sortField === "refDomains") {
        return sortOrder === "asc" ? a.refDomainsCount - b.refDomainsCount : b.refDomainsCount - a.refDomainsCount;
      }
      return sortOrder === "asc" ? a.subnet.localeCompare(b.subnet) : b.subnet.localeCompare(a.subnet);
    });
  }, [filteredIps, sortField, sortOrder]);

  // Total count & Pagination calculation
  const totalItemsCount = viewMode === "IPS" ? filteredIps.length : aggregatedSubnets.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / pageSize));

  // Current page records
  const paginatedIps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIps.slice(start, start + pageSize);
  }, [filteredIps, currentPage, pageSize]);

  const paginatedSubnets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return aggregatedSubnets.slice(start, start + pageSize);
  }, [aggregatedSubnets, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (field: "ip" | "refDomains" | "backlinks") => {
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
    if (viewMode === "IPS") {
      const headers = ["IP Address", "Subnet", "Country", "Referring Domains", "Backlinks"];
      const rows = filteredIps.map((ip) => [
        `"${ip.ipAddress}"`,
        `"${ip.subnet}"`,
        `"${ip.country}"`,
        ip.refDomainsCount,
        ip.backlinksCount,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ips_${activeDomain}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["Subnet", "IP Count", "Country", "Referring Domains", "Backlinks"];
      const rows = aggregatedSubnets.map((sub) => [
        `"${sub.subnet}"`,
        sub.ipsCount,
        `"${sub.country}"`,
        sub.refDomainsCount,
        sub.backlinksCount,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `subnets_${activeDomain}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  const currentTab = "ips";

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
          <span className="text-slate-400 dark:text-slate-500 font-medium">IPs</span>
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
            IPs / {activeDomain}
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
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium" role="tablist" aria-label="IPs sub tabs">
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
          {activeDomain.includes("workcomposer") ? "99 referring ips" : (viewMode === "IPS" ? `${filteredIps.length} referring ips` : `${aggregatedSubnets.length} subnets`)}
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
                    checked={visibleColumns.ip}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, ip: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>IP Address</span>
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
                    checked={visibleColumns.backlinks}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, backlinks: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Backlinks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.country}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, country: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Country Location</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={visibleColumns.subnet}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, subnet: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Subnet / C-Block</span>
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

      {/* Filter Row: IPS/SUBNETS Pills + + FILTER + PRESETS - ALL IN ONE LINE */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* IPS / SUBNETS switch buttons */}
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden text-xs font-semibold shadow-xs">
            <button
              onClick={() => { setViewMode("IPS"); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 transition cursor-pointer font-bold uppercase tracking-wider text-[11px] ${
                viewMode === "IPS"
                  ? "bg-[#4e4376] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              IPS
            </button>
            <button
              onClick={() => { setViewMode("SUBNETS"); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 border-l border-slate-300 dark:border-slate-700 transition cursor-pointer font-bold uppercase tracking-wider text-[11px] ${
                viewMode === "SUBNETS"
                  ? "bg-[#4e4376] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              SUBNETS
            </button>
          </div>

          {/* + FILTER button with Dropdown containing 3 checkboxes */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              aria-label="+ FILTER"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer ${
                isFilterMenuOpen || filterFieldIp || filterFieldRefDomains || filterFieldBacklinks
                  ? "bg-[#4e4376] text-white shadow-xs"
                  : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-base font-bold leading-none">+</span>
              <span className="tracking-wider">FILTER</span>
            </button>

            {/* + FILTER Dropdown */}
            {isFilterMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 px-3 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      aria-label="IP"
                      checked={filterFieldIp}
                      onChange={(e) => setFilterFieldIp(e.target.checked)}
                      className="rounded border-slate-300 text-[#4e4376] focus:ring-[#4e4376] w-3.5 h-3.5"
                    />
                    <span className="font-medium">IP</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      aria-label="Ref.domains"
                      checked={filterFieldRefDomains}
                      onChange={(e) => setFilterFieldRefDomains(e.target.checked)}
                      className="rounded border-slate-300 text-[#4e4376] focus:ring-[#4e4376] w-3.5 h-3.5"
                    />
                    <span className="font-medium">Ref.domains</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      aria-label="Backlinks"
                      checked={filterFieldBacklinks}
                      onChange={(e) => setFilterFieldBacklinks(e.target.checked)}
                      className="rounded border-slate-300 text-[#4e4376] focus:ring-[#4e4376] w-3.5 h-3.5"
                    />
                    <span className="font-medium">Backlinks</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRESETS Dropdown with Left Flyout Submenu */}
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

                {/* Save Filter Preset Flyout positioned to the LEFT */}
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
                      className={`w-full py-2 rounded text-center text-xs font-semibold uppercase tracking-wider transition ${
                        presetNameInput.trim()
                          ? "bg-[#4e4376] hover:bg-[#3d3361] text-white cursor-pointer shadow-xs"
                          : "bg-[#dcdde1] dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      CREATE FILTER PRESET
                    </button>
                  </div>
                )}
              </div>

              {customPresets.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Custom Presets
                  </div>
                  {customPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setActivePreset(preset);
                        setIsPresetsOpen(false);
                        setIsSaveFlyoutOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 truncate ${
                        activePreset === preset ? "font-bold text-blue-600" : ""
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Input Chips/Bar */}
      {(filterFieldIp || filterFieldRefDomains || filterFieldBacklinks) && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex flex-wrap items-center gap-4 animate-in fade-in duration-100">
          {filterFieldIp && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">IP:</span>
              <input
                type="text"
                placeholder="Search IP address..."
                value={ipSearch}
                onChange={(e) => { setIpSearch(e.target.value); setCurrentPage(1); }}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs w-44"
              />
              {ipSearch && (
                <button onClick={() => setIpSearch("")} className="text-slate-400 hover:text-slate-600">×</button>
              )}
            </div>
          )}
          {filterFieldRefDomains && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Ref.domains:</span>
              <input
                type="number"
                placeholder="Min"
                value={minRefDomains}
                onChange={(e) => { setMinRefDomains(e.target.value); setCurrentPage(1); }}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxRefDomains}
                onChange={(e) => { setMaxRefDomains(e.target.value); setCurrentPage(1); }}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
            </div>
          )}
          {filterFieldBacklinks && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Backlinks:</span>
              <input
                type="number"
                placeholder="Min"
                value={minBacklinks}
                onChange={(e) => { setMinBacklinks(e.target.value); setCurrentPage(1); }}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxBacklinks}
                onChange={(e) => { setMaxBacklinks(e.target.value); setCurrentPage(1); }}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
              />
            </div>
          )}
          <button
            onClick={() => {
              setFilterFieldIp(false);
              setFilterFieldRefDomains(false);
              setFilterFieldBacklinks(false);
              setIpSearch("");
              setMinRefDomains("");
              setMaxRefDomains("");
              setMinBacklinks("");
              setMaxBacklinks("");
              setCurrentPage(1);
            }}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}

      {/* IPs or Subnets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
              <tr>
                {viewMode === "SUBNETS" ? (
                  <>
                    {/* Column 1: Subnet */}
                    <th
                      onClick={() => handleSort("ip")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>SUBNET</span>
                        <span className="text-[10px] text-slate-400 font-normal">ⓘ</span>
                        {sortField === "ip" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                      </div>
                    </th>

                    {/* Column 2: IP */}
                    <th className="py-3 px-4 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>IP</span>
                      </div>
                    </th>

                    {/* Column 3: Ref.domains */}
                    <th
                      onClick={() => handleSort("refDomains")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>REF.DOMAINS</span>
                        <span className="text-[10px] text-slate-500">˅</span>
                      </div>
                    </th>

                    {/* Column 4: Backlinks */}
                    <th
                      onClick={() => handleSort("backlinks")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>BACKLINKS</span>
                        <span className="text-[10px] text-slate-400 font-normal">ⓘ</span>
                      </div>
                    </th>
                  </>
                ) : (
                  <>
                    {/* Column 1: IP */}
                    <th
                      onClick={() => handleSort("ip")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>IP</span>
                        {sortField === "ip" && <span>{sortOrder === "asc" ? "▲" : "▼"}</span>}
                      </div>
                    </th>

                    {/* Column 2: Subnet (optional) */}
                    {visibleColumns.subnet && (
                      <th className="py-3 px-4 select-none">
                        <div className="flex items-center gap-1.5">
                          <span>SUBNET</span>
                        </div>
                      </th>
                    )}

                    {/* Column 2: Ref.domains */}
                    <th
                      onClick={() => handleSort("refDomains")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>REF.DOMAINS</span>
                        <span className="text-[10px] text-slate-500">˅</span>
                      </div>
                    </th>

                    {/* Column 3: Backlinks */}
                    <th
                      onClick={() => handleSort("backlinks")}
                      className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>BACKLINKS</span>
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {viewMode === "IPS" ? (
                paginatedIps.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.subnet ? 4 : 3} className="py-8 text-center text-slate-400">
                      No referring IPs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedIps.map((item) => {
                    const isExpanded = expandedRowId === item.id;
                    return (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          {/* IP with Flag / Country Code */}
                          <td className="py-3 px-4 font-mono font-normal text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <CountryFlag code={item.countryCode || item.country || item.logoType} />
                              {item.countryCode && (
                                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">{item.countryCode}</span>
                              )}
                              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                                {item.ipAddress}
                              </span>
                            </div>
                          </td>

                          {/* Subnet (optional) */}
                          {visibleColumns.subnet && (
                            <td className="py-3 px-4 font-mono text-slate-500 text-xs">
                              {item.subnet}
                            </td>
                          )}

                          {/* Ref Domains Pill Button */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (isExpanded && expandedTab === "referring") {
                                  setExpandedRowId(null);
                                } else {
                                  setExpandedRowId(item.id);
                                  setExpandedTab("referring");
                                }
                              }}
                              aria-label={`Referring domains for ${item.ipAddress}`}
                              className="px-2.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-mono font-medium inline-flex items-center gap-1.5 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs cursor-pointer transition"
                              title="Click to view referring domains"
                            >
                              <span>{item.refDomainsCount}</span>
                              <span className="text-[9px] text-slate-400">˅</span>
                            </button>
                          </td>

                          {/* Backlinks Pill Button */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (isExpanded && expandedTab === "backlinks") {
                                  setExpandedRowId(null);
                                } else {
                                  setExpandedRowId(item.id);
                                  setExpandedTab("backlinks");
                                }
                              }}
                              aria-label={`Backlinks for ${item.ipAddress}`}
                              className="px-2.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-mono font-medium inline-flex items-center gap-1.5 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs cursor-pointer transition"
                              title="Click to view backlinks"
                            >
                              <span>{item.backlinksCount}</span>
                              <span className="text-[9px] text-slate-400">˅</span>
                            </button>
                          </td>
                        </tr>

                        {/* Drilldown Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-t border-b border-blue-200 dark:border-blue-900/60">
                            <td colSpan={visibleColumns.subnet ? 4 : 3} className="p-4">
                              <div className="space-y-3">
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
                                      Referring Domains from {item.ipAddress} ({item.refDomainsCount})
                                    </button>
                                    <button
                                      onClick={() => setExpandedTab("backlinks")}
                                      className={`pb-1 ${
                                        expandedTab === "backlinks"
                                          ? "text-blue-600 border-b-2 border-blue-600"
                                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                      }`}
                                    >
                                      Backlinks from {item.ipAddress} ({item.backlinksCount})
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setExpandedRowId(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    Close ✕
                                  </button>
                                </div>

                                {expandedTab === "referring" ? (
                                  <div className="space-y-2">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                      Domains hosted on IP {item.ipAddress} ({item.country}):
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {item.sampleRefDomains && item.sampleRefDomains.length > 0 ? (
                                        item.sampleRefDomains.map((rd, sIdx) => (
                                          <div
                                            key={sIdx}
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
                                  <div className="space-y-2">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                      Sample backlinks originating from IP {item.ipAddress}:
                                    </div>
                                    <div className="space-y-2">
                                      {item.sampleBacklinks && item.sampleBacklinks.length > 0 ? (
                                        item.sampleBacklinks.map((sb, sIdx) => (
                                          <div
                                            key={sIdx}
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
                )
              ) : (
                /* SUBNETS Mode rows */
                paginatedSubnets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No subnets found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedSubnets.map((sub, idx) => {
                    const isExpanded = expandedRowId === sub.subnet;
                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          {/* Subnet with Flag / Globe Logo */}
                          <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2.5">
                              <CountryOrGlobeLogo type={sub.logoType} flag={sub.flag} />
                              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{sub.subnet}</span>
                            </div>
                          </td>

                          {/* IP count column */}
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            <button
                              aria-label={`IP count for ${sub.subnet}`}
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedRowId(null);
                                } else {
                                  setExpandedRowId(sub.subnet);
                                }
                              }}
                              className="font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 underline-offset-2 hover:underline cursor-pointer"
                              title="Click to view IPs in this subnet"
                            >
                              {sub.ipsCount}
                            </button>
                          </td>

                          {/* Ref Domains */}
                          <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-1 font-mono">
                              <span>{sub.refDomainsCount}</span>
                              <span className="text-[10px] text-slate-400">▾</span>
                            </span>
                          </td>

                          {/* Backlinks */}
                          <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-1 font-mono">
                              <span>{sub.backlinksCount}</span>
                            </span>
                          </td>
                        </tr>

                        {/* Subnet Drilldown Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-t border-b border-blue-200 dark:border-blue-900/60">
                            <td colSpan={4} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    IP Addresses in Subnet {sub.subnet} ({sub.ips.length} {sub.ips.length === 1 ? "IP" : "IPs"})
                                  </div>
                                  <button
                                    onClick={() => setExpandedRowId(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                  >
                                    Close ✕
                                  </button>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                                  {sub.ips.map((subIp) => (
                                    <div key={subIp.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <div className="flex items-center gap-2.5">
                                        <CountryOrGlobeLogo type={subIp.logoType} flag={subIp.flag} />
                                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{subIp.ipAddress}</span>
                                        <span className="text-slate-400">({subIp.country})</span>
                                      </div>
                                      <div className="flex items-center gap-6">
                                        <span className="text-slate-600 dark:text-slate-300">
                                          Ref.domains: <strong className="font-mono">{subIp.refDomainsCount}</strong>
                                        </span>
                                        <span className="text-slate-600 dark:text-slate-300">
                                          Backlinks: <strong className="font-mono">{subIp.backlinksCount}</strong>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Pagination matching Screenshot: < 1 2 >  Go to page: [ 1 ]   20 ▾ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs">
        {/* Page Switcher: < 1 2 > */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => {
                setCurrentPage(pg);
                setGoToPageInput(String(pg));
              }}
              aria-label={`Page ${pg}`}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === pg
                  ? "bg-[#334155] text-white"
                  : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        {/* Center: Go to page: [ 1 ] */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToPageInput}
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt(goToPageInput, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                } else {
                  setGoToPageInput(String(currentPage));
                }
              }
            }}
            className="w-12 px-2 py-1 text-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
          />
        </div>

        {/* Right: Page Size Selector (20 ▾) */}
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
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
                placeholder="What can we improve on the IPs tab?"
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