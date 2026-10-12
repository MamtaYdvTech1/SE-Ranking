"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MOCK_REFERRING_DOMAINS, ReferringDomainRecord } from "./mockBacklinkData";

interface BacklinkReferringDomainsViewProps {
  projectId?: string;
  projectDomain?: string;
  onNavigateTab?: (tab: string) => void;
  showSubTabs?: boolean;
}

const SUB_TABS = [
  { id: "overview", label: "Overview", path: "overview" },
  { id: "backlinks", label: "Backlinks", path: "backlinks" },
  { id: "referring-domains", label: "Referring Domains", path: "domains" },
  { id: "anchor-texts", label: "Anchor Texts", path: "anchor-texts" },
  { id: "pages", label: "Pages", path: "pages" },
  { id: "ips", label: "IPs", path: "ips" },
];

export const FILTER_OPTIONS = [
  { id: "excludeSubdomains", label: "Exclude subdomains" },
  { id: "excludeDomains", label: "Exclude domains" },
  { id: "domain", label: "Domain" },
  { id: "dt", label: "DT" },
  { id: "brokenBacklinks", label: "Broken backlinks" },
  { id: "domainTraffic", label: "Domain Traffic" },
  { id: "pt", label: "PT" },
  { id: "linkTraffic", label: "Link traffic" },
  { id: "backlinkKeywords", label: "Backlink Keywords" },
  { id: "dofollowNofollow", label: "dofollow/nofollow" },
  { id: "keywords", label: "Keywords" },
  { id: "domainAge", label: "Domain age" },
  { id: "backlinks", label: "Backlinks" },
  { id: "firstSeen", label: "First seen" },
];

export const HISTORY_PRESETS = [
  { id: "DONT_SHOW", label: "DON'T SHOW" },
  { id: "LAST_7_DAYS", label: "LAST 7 DAYS" },
  { id: "LAST_30_DAYS", label: "LAST 30 DAYS" },
  { id: "LAST_3_MONTHS", label: "LAST 3 MONTHS" },
  { id: "LAST_6_MONTHS", label: "LAST 6 MONTHS" },
  { id: "LAST_YEAR", label: "LAST YEAR" },
];

export interface CustomFilterPreset {
  id: string;
  name: string;
  createdAt: string;
  filters: {
    statusFilter: "ACTIVE" | "NEW" | "LOST";
    search: string;
    enabledFilters: Record<string, boolean>;
    minPtInput: string;
    maxPtInput: string;
    minLinkTrafficInput: string;
    maxLinkTrafficInput: string;
    minBacklinkKeywordsInput: string;
    maxBacklinkKeywordsInput: string;
    dofollowFilter: "ALL" | "DOFOLLOW" | "NOFOLLOW";
    minKeywordsInput: string;
    maxKeywordsInput: string;
    domainAgeFilter: string;
    minDtInput: string;
    maxDtInput: string;
    minTrafficInput: string;
    maxTrafficInput: string;
    minBacklinksInput: string;
    maxBacklinksInput: string;
    firstSeenFilter: string;
    historyFilter: string;
    appliedHistoryPreset: string;
    appliedHistoryLabel: string;
    appliedRangeStart?: string | null;
    appliedRangeEnd?: string | null;
  };
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIdx = months.indexOf(parts[1].toLowerCase());
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatShortDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function BacklinkReferringDomainsView({
  projectId = "proj-123",
  projectDomain = "workcomposer.com",
  onNavigateTab,
  showSubTabs = true,
}: BacklinkReferringDomainsViewProps) {
  const router = useRouter();

  // Banners visibility
  const [showTopNotice, setShowTopNotice] = useState(true);
  const [showGuideBanner, setShowGuideBanner] = useState(true);

  // Email notification setting
  const [emailNotification, setEmailNotification] = useState<string>("Bi-weekly");
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "NEW" | "LOST">("ACTIVE");
  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("Don't show");

  // History Dual-Month Popover States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyPopoverRef = React.useRef<HTMLDivElement>(null);
  const [activeHistoryPreset, setActiveHistoryPreset] = useState<string>("DONT_SHOW");
  const [appliedHistoryPreset, setAppliedHistoryPreset] = useState<string>("DONT_SHOW");
  const [appliedHistoryLabel, setAppliedHistoryLabel] = useState<string>("Don't show");
  const [draftRangeStart, setDraftRangeStart] = useState<Date | null>(null);
  const [draftRangeEnd, setDraftRangeEnd] = useState<Date | null>(null);
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date | null>(null);
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date | null>(null);

  // Dual-month navigation (Left = August 2026, Right = September 2026)
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August (0-indexed)

  const calendarRightMonth = calendarLeftMonth === 11 ? 0 : calendarLeftMonth + 1;
  const calendarRightYear = calendarLeftMonth === 11 ? calendarLeftYear + 1 : calendarLeftYear;

  const handlePrevMonth = () => {
    if (calendarLeftMonth === 0) {
      setCalendarLeftYear((y) => y - 1);
      setCalendarLeftMonth(11);
    } else {
      setCalendarLeftMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarLeftMonth === 11) {
      setCalendarLeftYear((y) => y + 1);
      setCalendarLeftMonth(0);
    } else {
      setCalendarLeftMonth((m) => m + 1);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setActiveHistoryPreset(presetId);
    const today = new Date(2026, 8, 26); // 26 Sep 2026
    if (presetId === "DONT_SHOW") {
      setDraftRangeStart(null);
      setDraftRangeEnd(null);
    } else if (presetId === "LAST_7_DAYS") {
      setDraftRangeStart(new Date(2026, 8, 20));
      setDraftRangeEnd(today);
    } else if (presetId === "LAST_30_DAYS") {
      setDraftRangeStart(new Date(2026, 7, 28));
      setDraftRangeEnd(today);
    } else if (presetId === "LAST_3_MONTHS") {
      setDraftRangeStart(new Date(2026, 5, 26));
      setDraftRangeEnd(today);
    } else if (presetId === "LAST_6_MONTHS") {
      setDraftRangeStart(new Date(2026, 2, 26));
      setDraftRangeEnd(today);
    } else if (presetId === "LAST_YEAR") {
      setDraftRangeStart(new Date(2025, 8, 26));
      setDraftRangeEnd(today);
    }
  };

  const handleCancelHistory = () => {
    setIsHistoryOpen(false);
    setActiveHistoryPreset(appliedHistoryPreset);
    setDraftRangeStart(appliedRangeStart);
    setDraftRangeEnd(appliedRangeEnd);
  };

  const handleApplyHistory = () => {
    setAppliedHistoryPreset(activeHistoryPreset);
    setAppliedRangeStart(draftRangeStart);
    setAppliedRangeEnd(draftRangeEnd);
    if (activeHistoryPreset === "DONT_SHOW") {
      setAppliedHistoryLabel("Don't show");
      setHistoryFilter("Don't show");
    } else if (activeHistoryPreset === "LAST_7_DAYS") {
      setAppliedHistoryLabel("Last 7 days");
      setHistoryFilter("7d");
    } else if (activeHistoryPreset === "LAST_30_DAYS") {
      setAppliedHistoryLabel("Last 30 days");
      setHistoryFilter("30d");
    } else if (activeHistoryPreset === "LAST_3_MONTHS") {
      setAppliedHistoryLabel("Last 3 months");
      setHistoryFilter("90d");
    } else if (activeHistoryPreset === "LAST_6_MONTHS") {
      setAppliedHistoryLabel("Last 6 months");
      setHistoryFilter("6m");
    } else if (activeHistoryPreset === "LAST_YEAR") {
      setAppliedHistoryLabel("Last year");
      setHistoryFilter("1y");
    } else if (draftRangeStart) {
      if (draftRangeEnd) {
        const lbl = `${formatShortDate(draftRangeStart)} - ${formatShortDate(draftRangeEnd)}`;
        setAppliedHistoryLabel(lbl);
        setHistoryFilter(lbl);
      } else {
        const lbl = formatShortDate(draftRangeStart);
        setAppliedHistoryLabel(lbl);
        setHistoryFilter(lbl);
      }
    }
    setIsHistoryOpen(false);
    setCurrentPage(1);
  };

  // + FILTER Popover & Checkbox selections matching design screenshot
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterPopoverRef = React.useRef<HTMLDivElement>(null);

  const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>({
    excludeSubdomains: false,
    excludeDomains: false,
    domain: false,
    dt: false,
    brokenBacklinks: false,
    domainTraffic: false,
    pt: false,
    linkTraffic: false,
    backlinkKeywords: false,
    dofollowNofollow: false,
    keywords: false,
    domainAge: false,
    backlinks: false,
    firstSeen: false,
  });

  // Filter Values
  const [subdomainFilterMode, setSubdomainFilterMode] = useState<"Exclude subdomains" | "Include subdomains" | "Subdomains only">("Exclude subdomains");
  const [excludeDomainsInput, setExcludeDomainsInput] = useState<string>("");
  const [domainFilterInput, setDomainFilterInput] = useState<string>("");
  const [brokenBacklinksOnly, setBrokenBacklinksOnly] = useState<boolean>(true);
  const [minPtInput, setMinPtInput] = useState<string>("");
  const [maxPtInput, setMaxPtInput] = useState<string>("");
  const [minLinkTrafficInput, setMinLinkTrafficInput] = useState<string>("");
  const [maxLinkTrafficInput, setMaxLinkTrafficInput] = useState<string>("");
  const [minBacklinkKeywordsInput, setMinBacklinkKeywordsInput] = useState<string>("");
  const [maxBacklinkKeywordsInput, setMaxBacklinkKeywordsInput] = useState<string>("");
  const [dofollowFilter, setDofollowFilter] = useState<"ALL" | "DOFOLLOW" | "NOFOLLOW">("ALL");
  const [minKeywordsInput, setMinKeywordsInput] = useState<string>("");
  const [maxKeywordsInput, setMaxKeywordsInput] = useState<string>("");
  const [domainAgeFilter, setDomainAgeFilter] = useState<string>("ALL");
  const [minDtInput, setMinDtInput] = useState<string>("");
  const [maxDtInput, setMaxDtInput] = useState<string>("");
  const [minTrafficInput, setMinTrafficInput] = useState<string>("");
  const [maxTrafficInput, setMaxTrafficInput] = useState<string>("");
  const [minBacklinksInput, setMinBacklinksInput] = useState<string>("");
  const [maxBacklinksInput, setMaxBacklinksInput] = useState<string>("");
  const [firstSeenFilter, setFirstSeenFilter] = useState<string>("ALL");

  // Presets & Columns & Export Menus
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const presetsContainerRef = React.useRef<HTMLDivElement>(null);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [savedPresets, setSavedPresets] = useState<CustomFilterPreset[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("backlink_ref_domains_presets");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const handleCreatePreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: CustomFilterPreset = {
      id: `preset_${Date.now()}`,
      name: presetNameInput.trim(),
      createdAt: new Date().toISOString(),
      filters: {
        statusFilter,
        search,
        enabledFilters: { ...enabledFilters },
        minPtInput,
        maxPtInput,
        minLinkTrafficInput,
        maxLinkTrafficInput,
        minBacklinkKeywordsInput,
        maxBacklinkKeywordsInput,
        dofollowFilter,
        minKeywordsInput,
        maxKeywordsInput,
        domainAgeFilter,
        minDtInput,
        maxDtInput,
        minTrafficInput,
        maxTrafficInput,
        minBacklinksInput,
        maxBacklinksInput,
        firstSeenFilter,
        historyFilter,
        appliedHistoryPreset,
        appliedHistoryLabel,
        appliedRangeStart: appliedRangeStart ? appliedRangeStart.toISOString() : null,
        appliedRangeEnd: appliedRangeEnd ? appliedRangeEnd.toISOString() : null,
      },
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem("backlink_ref_domains_presets", JSON.stringify(updated));
    } catch (e) {}
    setActivePresetId(newPreset.id);
    setPresetNameInput("");
    setIsPresetsOpen(false);
    setIsSaveFlyoutOpen(false);
  };

  const handleApplyCustomPreset = (preset: CustomFilterPreset) => {
    setStatusFilter(preset.filters.statusFilter);
    setSearch(preset.filters.search || "");
    setEnabledFilters(preset.filters.enabledFilters || {});
    setMinPtInput(preset.filters.minPtInput || "");
    setMaxPtInput(preset.filters.maxPtInput || "");
    setMinLinkTrafficInput(preset.filters.minLinkTrafficInput || "");
    setMaxLinkTrafficInput(preset.filters.maxLinkTrafficInput || "");
    setMinBacklinkKeywordsInput(preset.filters.minBacklinkKeywordsInput || "");
    setMaxBacklinkKeywordsInput(preset.filters.maxBacklinkKeywordsInput || "");
    setDofollowFilter(preset.filters.dofollowFilter || "ALL");
    setMinKeywordsInput(preset.filters.minKeywordsInput || "");
    setMaxKeywordsInput(preset.filters.maxKeywordsInput || "");
    setDomainAgeFilter(preset.filters.domainAgeFilter || "ALL");
    setMinDtInput(preset.filters.minDtInput || "");
    setMaxDtInput(preset.filters.maxDtInput || "");
    setMinTrafficInput(preset.filters.minTrafficInput || "");
    setMaxTrafficInput(preset.filters.maxTrafficInput || "");
    setMinBacklinksInput(preset.filters.minBacklinksInput || "");
    setMaxBacklinksInput(preset.filters.maxBacklinksInput || "");
    setFirstSeenFilter(preset.filters.firstSeenFilter || "ALL");
    setHistoryFilter(preset.filters.historyFilter || "Don't show");
    setAppliedHistoryPreset(preset.filters.appliedHistoryPreset || "DONT_SHOW");
    setAppliedHistoryLabel(preset.filters.appliedHistoryLabel || "Don't show");
    if (preset.filters.appliedRangeStart) {
      setAppliedRangeStart(new Date(preset.filters.appliedRangeStart));
    } else {
      setAppliedRangeStart(null);
    }
    if (preset.filters.appliedRangeEnd) {
      setAppliedRangeEnd(new Date(preset.filters.appliedRangeEnd));
    } else {
      setAppliedRangeEnd(null);
    }
    setActivePresetId(preset.id);
    setIsPresetsOpen(false);
    setIsSaveFlyoutOpen(false);
    setCurrentPage(1);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem("backlink_ref_domains_presets", JSON.stringify(updated));
    } catch (e) {}
    if (activePresetId === id) setActivePresetId(null);
  };

  // Click outside and escape key to dismiss popovers
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(event.target as Node)
      ) {
        setIsFilterPopoverOpen(false);
      }
      if (
        historyPopoverRef.current &&
        !historyPopoverRef.current.contains(event.target as Node)
      ) {
        setIsHistoryOpen(false);
      }
      if (
        presetsContainerRef.current &&
        !presetsContainerRef.current.contains(event.target as Node)
      ) {
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFilterPopoverOpen(false);
        setIsHistoryOpen(false);
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Modals
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [expandedBacklinksDomain, setExpandedBacklinksDomain] = useState<string | null>(null);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    domain: true,
    dt: true,
    pt: true,
    domainTraffic: true,
    linkTraffic: false,
    backlinks: true,
    backlinkKeywords: false,
    dofollowNofollow: false,
    keyword: true,
    domainAge: true,
    firstSeen: true,
  });

  // Sorting
  const [sortField, setSortField] = useState<keyof ReferringDomainRecord | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("1");

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...MOCK_REFERRING_DOMAINS];

    // Status filter
    if (statusFilter === "ACTIVE") {
      result = result.filter((item) => item.status === "Active");
    } else if (statusFilter === "NEW") {
      result = result.filter((item) => item.status === "New");
    } else if (statusFilter === "LOST") {
      result = result.filter((item) => item.status === "Lost");
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.domain.toLowerCase().includes(q) ||
          (item.country && item.country.toLowerCase().includes(q)) ||
          (item.ip && item.ip.includes(q))
      );
    }

    // Exclude subdomains Filter
    if (enabledFilters.excludeSubdomains) {
      if (subdomainFilterMode === "Exclude subdomains") {
        result = result.filter((item) => {
          const clean = item.domain.replace(/^www\./, "");
          return clean.split(".").length <= 2;
        });
      } else if (subdomainFilterMode === "Subdomains only") {
        result = result.filter((item) => {
          const clean = item.domain.replace(/^www\./, "");
          return clean.split(".").length > 2;
        });
      }
    }

    // Exclude domains Filter
    if (enabledFilters.excludeDomains && excludeDomainsInput.trim() !== "") {
      const excluded = excludeDomainsInput
        .toLowerCase()
        .split(/[,;\s]+/)
        .filter(Boolean);
      result = result.filter(
        (item) => !excluded.some((ex) => item.domain.toLowerCase().includes(ex))
      );
    }

    // Domain Filter
    if (enabledFilters.domain && domainFilterInput.trim() !== "") {
      const q = domainFilterInput.toLowerCase().trim();
      result = result.filter((item) => item.domain.toLowerCase().includes(q));
    }

    // Broken backlinks Filter
    if (enabledFilters.brokenBacklinks && brokenBacklinksOnly) {
      result = result.filter(
        (item) => item.status === "Lost" || (item.nofollowCount ?? 0) > 2 || item.domainTrust < 50
      );
    }

    // 1. PT Filter
    if (enabledFilters.pt || minPtInput.trim() !== "" || maxPtInput.trim() !== "") {
      if (minPtInput.trim() !== "") {
        const val = parseInt(minPtInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.pageTrust ?? item.domainTrust) >= val);
      }
      if (maxPtInput.trim() !== "") {
        const val = parseInt(maxPtInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.pageTrust ?? item.domainTrust) <= val);
      }
    }

    // 2. Link Traffic Filter
    if (enabledFilters.linkTraffic || minLinkTrafficInput.trim() !== "" || maxLinkTrafficInput.trim() !== "") {
      if (minLinkTrafficInput.trim() !== "") {
        const val = parseInt(minLinkTrafficInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.linkTrafficNum ?? 0) >= val);
      }
      if (maxLinkTrafficInput.trim() !== "") {
        const val = parseInt(maxLinkTrafficInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.linkTrafficNum ?? 0) <= val);
      }
    }

    // 3. Backlink Keywords Filter
    if (enabledFilters.backlinkKeywords || minBacklinkKeywordsInput.trim() !== "" || maxBacklinkKeywordsInput.trim() !== "") {
      if (minBacklinkKeywordsInput.trim() !== "") {
        const val = parseInt(minBacklinkKeywordsInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.backlinkKeywordsNum ?? 0) >= val);
      }
      if (maxBacklinkKeywordsInput.trim() !== "") {
        const val = parseInt(maxBacklinkKeywordsInput, 10);
        if (!isNaN(val)) result = result.filter((item) => (item.backlinkKeywordsNum ?? 0) <= val);
      }
    }

    // 4. dofollow / nofollow Filter
    if (enabledFilters.dofollowNofollow && dofollowFilter !== "ALL") {
      if (dofollowFilter === "DOFOLLOW") {
        result = result.filter((item) => (item.dofollowCount ?? 0) > 0);
      } else if (dofollowFilter === "NOFOLLOW") {
        result = result.filter((item) => (item.nofollowCount ?? 0) > 0);
      }
    }

    // 5. Keywords Filter
    if (enabledFilters.keywords || minKeywordsInput.trim() !== "" || maxKeywordsInput.trim() !== "") {
      if (minKeywordsInput.trim() !== "") {
        const val = parseInt(minKeywordsInput, 10);
        if (!isNaN(val)) result = result.filter((item) => item.keywordsNum >= val);
      }
      if (maxKeywordsInput.trim() !== "") {
        const val = parseInt(maxKeywordsInput, 10);
        if (!isNaN(val)) result = result.filter((item) => item.keywordsNum <= val);
      }
    }

    // 6. Domain Age Filter
    if (enabledFilters.domainAge && domainAgeFilter !== "ALL") {
      if (domainAgeFilter === ">10") {
        result = result.filter((item) => item.domainAge.includes(">10") || parseInt(item.domainAge, 10) >= 10);
      } else if (domainAgeFilter === ">5") {
        result = result.filter((item) => item.domainAge.includes(">10") || item.domainAge.includes(">5") || parseInt(item.domainAge, 10) >= 5);
      } else if (domainAgeFilter === ">3") {
        result = result.filter((item) => item.domainAge.includes(">10") || item.domainAge.includes(">5") || item.domainAge.includes(">3") || parseInt(item.domainAge, 10) >= 3);
      } else if (domainAgeFilter === ">1") {
        result = result.filter((item) => !item.domainAge.includes("<1") && (item.domainAge.includes(">") || parseInt(item.domainAge, 10) >= 1));
      }
    }

    // 7. Domain Trust (DT) Filter
    if (minDtInput.trim() !== "") {
      const minDt = parseInt(minDtInput, 10);
      if (!isNaN(minDt)) {
        result = result.filter((item) => item.domainTrust >= minDt);
      }
    }
    if (maxDtInput.trim() !== "") {
      const maxDt = parseInt(maxDtInput, 10);
      if (!isNaN(maxDt)) {
        result = result.filter((item) => item.domainTrust <= maxDt);
      }
    }

    // 8. Domain Traffic Filter
    if (minTrafficInput.trim() !== "") {
      const minT = parseInt(minTrafficInput, 10);
      if (!isNaN(minT)) {
        result = result.filter((item) => item.domainTrafficNum >= minT);
      }
    }
    if (maxTrafficInput.trim() !== "") {
      const maxT = parseInt(maxTrafficInput, 10);
      if (!isNaN(maxT)) {
        result = result.filter((item) => item.domainTrafficNum <= maxT);
      }
    }

    // 9. Backlinks Filter
    if (minBacklinksInput.trim() !== "") {
      const minB = parseInt(minBacklinksInput, 10);
      if (!isNaN(minB)) {
        result = result.filter((item) => item.backlinksCount >= minB);
      }
    }
    if (maxBacklinksInput.trim() !== "") {
      const maxB = parseInt(maxBacklinksInput, 10);
      if (!isNaN(maxB)) {
        result = result.filter((item) => item.backlinksCount <= maxB);
      }
    }

    // 10. First Seen Filter
    if (enabledFilters.firstSeen && firstSeenFilter !== "ALL") {
      if (firstSeenFilter === "2026") {
        result = result.filter((item) => item.firstSeen.includes("2026"));
      } else if (firstSeenFilter === "2025") {
        result = result.filter((item) => item.firstSeen.includes("2025"));
      } else if (firstSeenFilter === "30d") {
        result = result.filter((item) => item.firstSeen.includes("Sep 2026") || item.firstSeen.includes("Aug 2026"));
      }
    }

    // 11. History Date Range Filter
    if (appliedHistoryPreset !== "DONT_SHOW" && appliedRangeStart) {
      const startTs = new Date(
        appliedRangeStart.getFullYear(),
        appliedRangeStart.getMonth(),
        appliedRangeStart.getDate()
      ).getTime();

      const endD = appliedRangeEnd || appliedRangeStart;
      const endTs = new Date(
        endD.getFullYear(),
        endD.getMonth(),
        endD.getDate(),
        23, 59, 59, 999
      ).getTime();

      result = result.filter((item) => {
        const parsedFirst = parseDate(item.firstSeen);
        const parsedLast = item.lastSeen ? parseDate(item.lastSeen) : null;
        const firstTs = parsedFirst ? parsedFirst.getTime() : null;
        const lastTs = parsedLast ? parsedLast.getTime() : null;

        if (firstTs && firstTs >= startTs && firstTs <= endTs) return true;
        if (lastTs && lastTs >= startTs && lastTs <= endTs) return true;
        if (firstTs && lastTs && firstTs <= startTs && lastTs >= endTs) return true;
        return false;
      });
    }

    // Sorting
    if (sortField !== "none") {
      result.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [
    statusFilter,
    search,
    enabledFilters,
    minPtInput,
    maxPtInput,
    minLinkTrafficInput,
    maxLinkTrafficInput,
    minBacklinkKeywordsInput,
    maxBacklinkKeywordsInput,
    dofollowFilter,
    minKeywordsInput,
    maxKeywordsInput,
    domainAgeFilter,
    minDtInput,
    maxDtInput,
    minTrafficInput,
    maxTrafficInput,
    minBacklinksInput,
    maxBacklinksInput,
    firstSeenFilter,
    subdomainFilterMode,
    excludeDomainsInput,
    domainFilterInput,
    brokenBacklinksOnly,
    appliedHistoryPreset,
    appliedRangeStart,
    appliedRangeEnd,
    sortField,
    sortOrder,
  ]);

  const toggleFilterOption = (filterId: string) => {
    setEnabledFilters((prev) => {
      const nextState = !prev[filterId];
      if (nextState) {
        if (filterId === "pt") setVisibleColumns((c) => ({ ...c, pt: true }));
        if (filterId === "linkTraffic") setVisibleColumns((c) => ({ ...c, linkTraffic: true }));
        if (filterId === "backlinkKeywords") setVisibleColumns((c) => ({ ...c, backlinkKeywords: true }));
        if (filterId === "dofollowNofollow") setVisibleColumns((c) => ({ ...c, dofollowNofollow: true }));
      }
      return { ...prev, [filterId]: nextState };
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (enabledFilters.excludeSubdomains) count++;
    if (enabledFilters.excludeDomains) count++;
    if (enabledFilters.domain) count++;
    if (enabledFilters.dt) count++;
    if (enabledFilters.brokenBacklinks) count++;
    if (enabledFilters.domainTraffic) count++;
    if (enabledFilters.pt) count++;
    if (enabledFilters.linkTraffic) count++;
    if (enabledFilters.backlinkKeywords) count++;
    if (enabledFilters.dofollowNofollow) count++;
    if (enabledFilters.keywords) count++;
    if (enabledFilters.domainAge) count++;
    if (enabledFilters.backlinks) count++;
    if (enabledFilters.firstSeen) count++;
    if (appliedHistoryPreset !== "DONT_SHOW") count++;
    return count;
  }, [enabledFilters, appliedHistoryPreset]);

  const resetAllFilters = () => {
    setStatusFilter("ACTIVE");
    setSearch("");
    setSubdomainFilterMode("Exclude subdomains");
    setExcludeDomainsInput("");
    setDomainFilterInput("");
    setBrokenBacklinksOnly(true);
    setMinPtInput("");
    setMaxPtInput("");
    setMinLinkTrafficInput("");
    setMaxLinkTrafficInput("");
    setMinBacklinkKeywordsInput("");
    setMaxBacklinkKeywordsInput("");
    setDofollowFilter("ALL");
    setMinKeywordsInput("");
    setMaxKeywordsInput("");
    setDomainAgeFilter("ALL");
    setMinDtInput("");
    setMaxDtInput("");
    setMinTrafficInput("");
    setMaxTrafficInput("");
    setMinBacklinksInput("");
    setMaxBacklinksInput("");
    setFirstSeenFilter("ALL");
    setHistoryFilter("Don't show");
    setActiveHistoryPreset("DONT_SHOW");
    setAppliedHistoryPreset("DONT_SHOW");
    setAppliedHistoryLabel("Don't show");
    setDraftRangeStart(null);
    setDraftRangeEnd(null);
    setAppliedRangeStart(null);
    setAppliedRangeEnd(null);
    setEnabledFilters({
      excludeSubdomains: false,
      excludeDomains: false,
      domain: false,
      dt: false,
      brokenBacklinks: false,
      domainTraffic: false,
      pt: false,
      linkTraffic: false,
      backlinkKeywords: false,
      dofollowNofollow: false,
      keywords: false,
      domainAge: false,
      backlinks: false,
      firstSeen: false,
    });
    setActivePresetId(null);
    setIsSaveFlyoutOpen(false);
    setCurrentPage(1);
  };

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handlers
  const handleSort = (field: keyof ReferringDomainRecord) => {
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
      setUpdateToast("Referring domains report refreshed successfully with latest live crawler metrics!");
      setTimeout(() => setUpdateToast(null), 4000);
    }, 1200);
  };

  const handleExport = (format: string) => {
    setIsExportOpen(false);
    alert(`Exporting ${filteredItems.length} referring domains to ${format.toUpperCase()}...`);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(goToPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const handleTabClick = (tabId: string, path: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
    } else {
      router.push(`/projects/${projectId}/backlink-checker/${path}`);
    }
  };

  const renderCalendarMonth = (year: number, month: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthLabel = `${monthNames[month]} ${year}`;
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const isToday = (d: number) => year === 2026 && month === 8 && d === 26;
    const isFuture = (d: number) => {
      if (year > 2026) return true;
      if (year === 2026 && month > 8) return true;
      if (year === 2026 && month === 8 && d > 26) return true;
      return false;
    };

    const handleDayClick = (d: number) => {
      if (isFuture(d)) return;
      const clicked = new Date(year, month, d);
      setActiveHistoryPreset("CUSTOM");
      if (!draftRangeStart || (draftRangeStart && draftRangeEnd)) {
        setDraftRangeStart(clicked);
        setDraftRangeEnd(null);
      } else {
        if (clicked < draftRangeStart) {
          setDraftRangeEnd(draftRangeStart);
          setDraftRangeStart(clicked);
        } else {
          setDraftRangeEnd(clicked);
        }
      }
    };

    return (
      <div className="w-[220px]">
        <div className="text-center font-bold text-xs text-slate-800 dark:text-slate-100 py-1 mb-2">
          {monthLabel}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((dw, i) => (
            <div key={i} className="h-6 flex items-center justify-center">
              {dw}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-7" />
          ))}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const currentTs = new Date(year, month, dayNum).getTime();
            const startTs = draftRangeStart
              ? new Date(draftRangeStart.getFullYear(), draftRangeStart.getMonth(), draftRangeStart.getDate()).getTime()
              : null;
            const endTs = draftRangeEnd
              ? new Date(draftRangeEnd.getFullYear(), draftRangeEnd.getMonth(), draftRangeEnd.getDate()).getTime()
              : null;

            const isStart = startTs !== null && currentTs === startTs;
            const isEnd = endTs !== null && currentTs === endTs;
            const inRange = startTs !== null && endTs !== null && currentTs > startTs && currentTs < endTs;
            const future = isFuture(dayNum);
            const today = isToday(dayNum);

            let cellClass = "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
            if (future) {
              cellClass = "text-slate-300 dark:text-slate-600 cursor-not-allowed";
            } else if (isStart || isEnd) {
              cellClass = "bg-[#433b5c] text-white font-bold rounded";
            } else if (inRange) {
              cellClass = "bg-[#ece8f4] dark:bg-purple-950/40 text-slate-900 dark:text-slate-100 font-semibold";
            }

            return (
              <button
                key={dayNum}
                type="button"
                disabled={future}
                aria-label={`Select date ${dayNum} ${monthNames[month]} ${year}`}
                onClick={() => handleDayClick(dayNum)}
                className={`h-7 w-full flex flex-col items-center justify-center relative rounded text-xs transition cursor-pointer ${cellClass}`}
              >
                <span>{dayNum}</span>
                {today && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isStart || isEnd ? "bg-white" : "bg-blue-600"
                    } -mt-0.5`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP NOTICE ALERTS */}
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

      {/* 2. BREADCRUMB & UTILITIES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span className="hover:text-blue-600 cursor-pointer">{projectDomain}</span>
          <span>&gt;</span>
          <span className="hover:text-blue-600 cursor-pointer">Backlink Checker</span>
          <span>&gt;</span>
          <span className="hover:text-blue-600 cursor-pointer">Referring Domains</span>
          <span>&gt;</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Active</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
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

      {/* 3. TITLE & REPORT STATUS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Referring Domains / {projectDomain}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Email notification:</span>
            <select
              value={emailNotification}
              onChange={(e) => setEmailNotification(e.target.value)}
              aria-label="Email notification frequency"
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
            Last check: September 24, 2026
          </span>
          <button
            type="button"
            onClick={handleUpdateReport}
            disabled={isUpdatingReport}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span className={`text-sm ${isUpdatingReport ? "animate-spin" : ""}`}>🔄</span>
            <span>{isUpdatingReport ? "UPDATING..." : "UPDATE REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Update Toast */}
      {updateToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <span>✓</span>
          <span>{updateToast}</span>
        </div>
      )}

      {/* Secondary informative card banner */}
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

      {/* 4. HORIZONTAL SUB-TABS (IF SHOW SUB TABS) */}
      {showSubTabs && (
        <div className="border-b border-slate-200 dark:border-slate-800 -mb-2">
          <nav role="tablist" aria-label="Referring Domains Sub Navigation" className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {SUB_TABS.map((tab) => {
              const isActive = tab.id === "referring-domains";
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className={`py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                    isActive
                      ? "border-[#433b5c] text-[#433b5c] dark:text-white dark:border-white font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 5. SUMMARY STATS & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {filteredItems.length} referring domains
        </h3>

        <div className="flex items-center gap-2">
          {/* Columns Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnsOpen(!isColumnsOpen)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>☷</span>
              <span>Columns</span>
            </button>

            {isColumnsOpen && (
              <div className="absolute right-0 top-9 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-30 space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  Toggle Columns
                </div>
                {Object.entries({
                  domain: "Domain",
                  dt: "Domain Trust (DT)",
                  pt: "Page Trust (PT)",
                  domainTraffic: "Domain Traffic",
                  linkTraffic: "Link Traffic",
                  backlinks: "Backlinks",
                  backlinkKeywords: "Backlink Keywords",
                  dofollowNofollow: "dofollow/nofollow",
                  keyword: "Keywords",
                  domainAge: "Domain Age",
                  firstSeen: "First Seen",
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
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>⬇</span>
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-9 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("xls")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Export Excel (.xls)
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
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
            {/* Segmented Status Buttons */}
            <div className="inline-flex rounded-md shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ACTIVE");
                  setCurrentPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-l-md transition cursor-pointer ${
                  statusFilter === "ACTIVE"
                    ? "bg-[#433b5c] text-white font-bold"
                    : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                }`}
              >
                ACTIVE
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("NEW");
                  setCurrentPage(1);
                }}
                className={`text-xs px-3 py-1.5 transition cursor-pointer ${
                  statusFilter === "NEW"
                    ? "bg-[#433b5c] text-white font-bold"
                    : "border-y border-r border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                }`}
              >
                NEW
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("LOST");
                  setCurrentPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-r-md transition cursor-pointer ${
                  statusFilter === "LOST"
                    ? "bg-[#433b5c] text-white font-bold"
                    : "border-y border-r border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                }`}
              >
                LOST
              </button>
            </div>

            {/* History Button & Dual-Month Popover matching screenshot */}
            <div className="relative" ref={historyPopoverRef}>
              <button
                type="button"
                id="btn-history-popover"
                aria-expanded={isHistoryOpen}
                aria-label={`History: ${appliedHistoryLabel}`}
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer select-none ${
                  isHistoryOpen
                    ? "bg-[#e2e0ea] dark:bg-slate-700 text-[#2c2738] dark:text-white border-[#d3d0de] dark:border-slate-600 font-bold"
                    : appliedHistoryPreset !== "DONT_SHOW"
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
              >
                <span>History: {appliedHistoryLabel} {isHistoryOpen ? "▴" : "▾"}</span>
              </button>

              {/* Dual-Month Calendar Popover */}
              {isHistoryOpen && (
                <div
                  id="history-popover-dropdown"
                  className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 min-w-[620px] max-w-[700px] animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Left: Dual Month Calendar */}
                    <div className="flex-1">
                      {/* Nav Bar */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          aria-label="Previous month"
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer"
                        >
                          &lt;
                        </button>

                        <div className="flex items-center gap-16 font-bold text-xs text-slate-700 dark:text-slate-200">
                          {/* Centered navigation headers */}
                        </div>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          aria-label="Next month"
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold cursor-pointer"
                        >
                          &gt;
                        </button>
                      </div>

                      {/* Side by side months */}
                      <div className="flex items-start gap-6 justify-center">
                        {renderCalendarMonth(calendarLeftYear, calendarLeftMonth)}
                        <div className="w-[1px] bg-slate-100 dark:bg-slate-800 h-64 hidden md:block" />
                        {renderCalendarMonth(calendarRightYear, calendarRightMonth)}
                      </div>
                    </div>

                    {/* Right: Presets Column */}
                    <div className="w-full sm:w-44 flex flex-col gap-2 pt-1 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-5">
                      {HISTORY_PRESETS.map((preset) => {
                        const isSelected = activeHistoryPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset.id)}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase transition text-center border cursor-pointer ${
                              isSelected
                                ? "bg-[#433b5c] text-white border-[#433b5c] shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelHistory}
                      className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyHistory}
                      className="px-5 py-1.5 rounded-lg bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* + FILTER button & Dropdown Popover matching user screenshot */}
            <div className="relative" ref={filterPopoverRef}>
              <button
                type="button"
                id="btn-filter-popover"
                onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-[#433b5c] hover:bg-[#39324e] transition shadow-xs cursor-pointer select-none"
                aria-expanded={isFilterPopoverOpen}
                aria-label="+ FILTER"
              >
                <span className="text-sm font-bold leading-none">+</span>
                <span>FILTER</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-white/25 text-white text-[10px] rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Popover Dropdown with Checkbox options */}
              {isFilterPopoverOpen && (
                <div
                  id="filter-popover-dropdown"
                  className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="max-h-64 overflow-y-auto px-1 space-y-0.5 scrollbar-thin">
                    {FILTER_OPTIONS.map((opt) => {
                      const isChecked = !!enabledFilters[opt.id];
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer select-none transition ${
                            isChecked ? "bg-slate-50/80 dark:bg-slate-800/60 font-semibold" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`filter-opt-${opt.id}`}
                            aria-label={opt.label}
                            checked={isChecked}
                            onChange={() => toggleFilterOption(opt.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#433b5c] focus:ring-[#433b5c] cursor-pointer"
                          />
                          <span className="text-xs text-slate-800 dark:text-slate-200">
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Input */}
            <div className="relative min-w-[210px]">
              <input
                type="text"
                placeholder="Search domain, country or IP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Right Action: Presets Dropdown */}
          <div className="relative" ref={presetsContainerRef}>
            <button
              type="button"
              id="btn-presets-popover"
              onClick={() => {
                const next = !isPresetsOpen;
                setIsPresetsOpen(next);
                setIsSaveFlyoutOpen(next);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition cursor-pointer ${
                isPresetsOpen
                  ? "bg-[#433b5c] text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              aria-expanded={isPresetsOpen}
              aria-haspopup="true"
            >
              <span>PRESETS</span>
              <span className="text-[10px] font-bold">{isPresetsOpen ? "^" : "▾"}</span>
            </button>

            {isPresetsOpen && (
              <div
                id="presets-dropdown-menu"
                className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Save filter preset item with nested flyout submenu to the LEFT */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsSaveFlyoutOpen(true)}
                >
                  <button
                    type="button"
                    id="btn-save-filter-preset"
                    onClick={() => setIsSaveFlyoutOpen(!isSaveFlyoutOpen)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer font-medium ${
                      isSaveFlyoutOpen
                        ? "bg-[#e2e0ea] dark:bg-slate-800 text-[#433b5c] dark:text-purple-300 font-semibold"
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
                      id="flyout-save-filter-preset"
                      className="absolute right-full top-0 mr-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 text-xs text-slate-800 dark:text-slate-200"
                      onMouseEnter={() => setIsSaveFlyoutOpen(true)}
                    >
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
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
                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3.5 shadow-inner"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!presetNameInput.trim()}
                        onClick={handleCreatePreset}
                        className={`w-full py-2.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition text-center ${
                          presetNameInput.trim()
                            ? "bg-[#433b5c] hover:bg-[#342e47] text-white shadow-xs cursor-pointer"
                            : "bg-[#d0d3d9] dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        CREATE FILTER PRESET
                      </button>
                    </div>
                  )}
                </div>

                {/* Saved Presets */}
                {savedPresets.length > 0 && (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <div className="px-1 py-0.5">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Saved Presets
                      </div>
                      {savedPresets.map((preset) => (
                        <div
                          key={preset.id}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                            activePresetId === preset.id
                              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyCustomPreset(preset)}
                            className="flex-1 text-left truncate cursor-pointer"
                          >
                            {preset.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomPreset(preset.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 px-1 text-xs cursor-pointer transition"
                            aria-label={`Delete preset ${preset.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeFiltersCount > 0 && (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setIsPresetsOpen(false);
                        setIsSaveFlyoutOpen(false);
                        setActivePresetId(null);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600 font-semibold cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Inputs Toolbar */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {/* Exclude Subdomains Filter */}
              {enabledFilters.excludeSubdomains && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Exclude Subdomains</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, excludeSubdomains: false }));
                        setSubdomainFilterMode("Exclude subdomains");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Remove exclude subdomains filter"
                    >
                      ✕
                    </button>
                  </div>
                  <select
                    value={subdomainFilterMode}
                    onChange={(e) => {
                      setSubdomainFilterMode(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Exclude subdomains">Exclude subdomains</option>
                    <option value="Include subdomains">Include subdomains</option>
                    <option value="Subdomains only">Subdomains only</option>
                  </select>
                </div>
              )}

              {/* Exclude Domains Filter */}
              {enabledFilters.excludeDomains && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Exclude Domains</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, excludeDomains: false }));
                        setExcludeDomainsInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Remove exclude domains filter"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. spam.com, ad.net"
                    value={excludeDomainsInput}
                    onChange={(e) => {
                      setExcludeDomainsInput(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Domain Filter */}
              {enabledFilters.domain && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Domain</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domain: false }));
                        setDomainFilterInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Remove domain filter"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search or enter domain..."
                    value={domainFilterInput}
                    onChange={(e) => {
                      setDomainFilterInput(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Broken Backlinks Filter */}
              {enabledFilters.brokenBacklinks && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Broken Backlinks</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, brokenBacklinks: false }));
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                      aria-label="Remove broken backlinks filter"
                    >
                      ✕
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={brokenBacklinksOnly}
                      onChange={(e) => {
                        setBrokenBacklinksOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 rounded text-[#433b5c] focus:ring-[#433b5c]"
                    />
                    <span>Show broken backlinks only</span>
                  </label>
                </div>
              )}

              {/* PT Filter */}
              {enabledFilters.pt && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Page Trust (PT)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, pt: false }));
                        setMinPtInput("");
                        setMaxPtInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min (0)"
                      value={minPtInput}
                      onChange={(e) => {
                        setMinPtInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max (100)"
                      value={maxPtInput}
                      onChange={(e) => {
                        setMaxPtInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Link Traffic Filter */}
              {enabledFilters.linkTraffic && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Link Traffic</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, linkTraffic: false }));
                        setMinLinkTrafficInput("");
                        setMaxLinkTrafficInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minLinkTrafficInput}
                      onChange={(e) => {
                        setMinLinkTrafficInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxLinkTrafficInput}
                      onChange={(e) => {
                        setMaxLinkTrafficInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Backlink Keywords Filter */}
              {enabledFilters.backlinkKeywords && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Backlink Keywords</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, backlinkKeywords: false }));
                        setMinBacklinkKeywordsInput("");
                        setMaxBacklinkKeywordsInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBacklinkKeywordsInput}
                      onChange={(e) => {
                        setMinBacklinkKeywordsInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBacklinkKeywordsInput}
                      onChange={(e) => {
                        setMaxBacklinkKeywordsInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* dofollow / nofollow Filter */}
              {enabledFilters.dofollowNofollow && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>dofollow/nofollow</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, dofollowNofollow: false }));
                        setDofollowFilter("ALL");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="inline-flex w-full rounded border border-slate-300 dark:border-slate-700 overflow-hidden text-xs">
                    {(["ALL", "DOFOLLOW", "NOFOLLOW"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setDofollowFilter(mode);
                          setCurrentPage(1);
                        }}
                        className={`flex-1 py-1 font-semibold text-center transition cursor-pointer ${
                          dofollowFilter === mode
                            ? "bg-[#433b5c] text-white"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {mode === "ALL" ? "All" : mode === "DOFOLLOW" ? "Dofollow" : "Nofollow"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords Filter */}
              {enabledFilters.keywords && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Keywords</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, keywords: false }));
                        setMinKeywordsInput("");
                        setMaxKeywordsInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minKeywordsInput}
                      onChange={(e) => {
                        setMinKeywordsInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxKeywordsInput}
                      onChange={(e) => {
                        setMaxKeywordsInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Domain Age Filter */}
              {enabledFilters.domainAge && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Domain Age</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domainAge: false }));
                        setDomainAgeFilter("ALL");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <select
                    value={domainAgeFilter}
                    onChange={(e) => {
                      setDomainAgeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="ALL">Any domain age</option>
                    <option value=">1">&gt; 1 year</option>
                    <option value=">3">&gt; 3 years</option>
                    <option value=">5">&gt; 5 years</option>
                    <option value=">10">&gt; 10 years</option>
                  </select>
                </div>
              )}

              {/* DT Filter */}
              {enabledFilters.dt && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Domain Trust (DT)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, dt: false }));
                        setMinDtInput("");
                        setMaxDtInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minDtInput}
                      onChange={(e) => {
                        setMinDtInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxDtInput}
                      onChange={(e) => {
                        setMaxDtInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Domain Traffic Filter */}
              {enabledFilters.domainTraffic && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Domain Traffic</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domainTraffic: false }));
                        setMinTrafficInput("");
                        setMaxTrafficInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minTrafficInput}
                      onChange={(e) => {
                        setMinTrafficInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxTrafficInput}
                      onChange={(e) => {
                        setMaxTrafficInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Backlinks Filter */}
              {enabledFilters.backlinks && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Backlinks Count</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, backlinks: false }));
                        setMinBacklinksInput("");
                        setMaxBacklinksInput("");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBacklinksInput}
                      onChange={(e) => {
                        setMinBacklinksInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBacklinksInput}
                      onChange={(e) => {
                        setMaxBacklinksInput(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* First Seen Filter */}
              {enabledFilters.firstSeen && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                  <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>First Seen Date</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, firstSeen: false }));
                        setFirstSeenFilter("ALL");
                        setCurrentPage(1);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <select
                    value={firstSeenFilter}
                    onChange={(e) => {
                      setFirstSeenFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="ALL">Any first seen date</option>
                    <option value="30d">Last 30-60 days</option>
                    <option value="2026">Seen in 2026</option>
                    <option value="2025">Seen in 2025</option>
                  </select>
                </div>
              )}
            </div>

            {/* Active Chips & Reset Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Active Filters ({filteredItems.length} matching):
                </span>
                {enabledFilters.excludeSubdomains && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    {subdomainFilterMode}
                    <button
                      type="button"
                      onClick={() => setEnabledFilters((p) => ({ ...p, excludeSubdomains: false }))}
                      className="hover:text-blue-900 cursor-pointer"
                      aria-label="Remove exclude subdomains chip"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.excludeDomains && excludeDomainsInput && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Exclude: {excludeDomainsInput}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, excludeDomains: false }));
                        setExcludeDomainsInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                      aria-label="Remove exclude domains chip"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.domain && domainFilterInput && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Domain: {domainFilterInput}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domain: false }));
                        setDomainFilterInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                      aria-label="Remove domain chip"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.brokenBacklinks && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Broken backlinks
                    <button
                      type="button"
                      onClick={() => setEnabledFilters((p) => ({ ...p, brokenBacklinks: false }))}
                      className="hover:text-blue-900 cursor-pointer"
                      aria-label="Remove broken backlinks chip"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.pt && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    PT: {minPtInput || "0"} - {maxPtInput || "100"}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, pt: false }));
                        setMinPtInput("");
                        setMaxPtInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.linkTraffic && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Link Traffic: {minLinkTrafficInput || "0"}+
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, linkTraffic: false }));
                        setMinLinkTrafficInput("");
                        setMaxLinkTrafficInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.backlinkKeywords && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    BL Keywords: {minBacklinkKeywordsInput || "0"}+
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, backlinkKeywords: false }));
                        setMinBacklinkKeywordsInput("");
                        setMaxBacklinkKeywordsInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.dofollowNofollow && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    {dofollowFilter === "ALL" ? "All Links" : dofollowFilter}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, dofollowNofollow: false }));
                        setDofollowFilter("ALL");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.domainAge && domainAgeFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Age {domainAgeFilter} yrs
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domainAge: false }));
                        setDomainAgeFilter("ALL");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.dt && (minDtInput || maxDtInput) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    DT: {minDtInput || "0"} - {maxDtInput || "100"}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, dt: false }));
                        setMinDtInput("");
                        setMaxDtInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.keywords && (minKeywordsInput || maxKeywordsInput) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Keywords: {minKeywordsInput || "0"}+
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, keywords: false }));
                        setMinKeywordsInput("");
                        setMaxKeywordsInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.domainTraffic && (minTrafficInput || maxTrafficInput) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Domain Traffic: {minTrafficInput || "0"}+
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, domainTraffic: false }));
                        setMinTrafficInput("");
                        setMaxTrafficInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.backlinks && (minBacklinksInput || maxBacklinksInput) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    Backlinks: {minBacklinksInput || "0"}+
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, backlinks: false }));
                        setMinBacklinksInput("");
                        setMaxBacklinksInput("");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {enabledFilters.firstSeen && firstSeenFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    First Seen: {firstSeenFilter}
                    <button
                      type="button"
                      onClick={() => {
                        setEnabledFilters((p) => ({ ...p, firstSeen: false }));
                        setFirstSeenFilter("ALL");
                      }}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {appliedHistoryPreset !== "DONT_SHOW" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-medium">
                    History: {appliedHistoryLabel}
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedHistoryPreset("DONT_SHOW");
                        setActiveHistoryPreset("DONT_SHOW");
                        setAppliedHistoryLabel("Don't show");
                        setHistoryFilter("Don't show");
                        setAppliedRangeStart(null);
                        setAppliedRangeEnd(null);
                        setDraftRangeStart(null);
                        setDraftRangeEnd(null);
                      }}
                      className="hover:text-purple-900 cursor-pointer"
                      aria-label="Remove history filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. REFERRING DOMAINS DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8f9fb] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold tracking-wider">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((item) => selectedIds.has(item.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all referring domains"
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>

                {/* DOMAIN */}
                {visibleColumns.domain && (
                  <th
                    onClick={() => handleSort("domain")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>DOMAIN</span>
                      {sortField === "domain" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* DT ▾ */}
                {visibleColumns.dt && (
                  <th
                    onClick={() => handleSort("domainTrust")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>DT</span>
                      <span className="text-[10px]">
                        {sortField === "domainTrust"
                          ? sortOrder === "asc"
                            ? "▲"
                            : "▼"
                          : "▾"}
                      </span>
                    </div>
                  </th>
                )}

                {/* PT ▾ */}
                {visibleColumns.pt && (
                  <th
                    onClick={() => handleSort("pageTrust" as any)}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>PT</span>
                      <span className="text-[10px]">
                        {sortField === ("pageTrust" as any)
                          ? sortOrder === "asc"
                            ? "▲"
                            : "▼"
                          : "▾"}
                      </span>
                    </div>
                  </th>
                )}

                {/* DOMAIN TRAFFIC */}
                {visibleColumns.domainTraffic && (
                  <th
                    onClick={() => handleSort("domainTrafficNum")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>DOMAIN TRAFFIC</span>
                      {sortField === "domainTrafficNum" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* LINK TRAFFIC */}
                {visibleColumns.linkTraffic && (
                  <th
                    onClick={() => handleSort("linkTrafficNum" as any)}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>LINK TRAFFIC</span>
                      {sortField === ("linkTrafficNum" as any) && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* BACKLINKS */}
                {visibleColumns.backlinks && (
                  <th
                    onClick={() => handleSort("backlinksCount")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>BACKLINKS</span>
                      {sortField === "backlinksCount" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* BACKLINK KEYWORDS */}
                {visibleColumns.backlinkKeywords && (
                  <th
                    onClick={() => handleSort("backlinkKeywordsNum" as any)}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>BL KEYWORDS</span>
                      {sortField === ("backlinkKeywordsNum" as any) && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* DO/NOFOLLOW */}
                {visibleColumns.dofollowNofollow && (
                  <th className="py-3 px-4">
                    <span>DO/NOFOLLOW</span>
                  </th>
                )}

                {/* KEYWORD */}
                {visibleColumns.keyword && (
                  <th
                    onClick={() => handleSort("keywordsNum")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>KEYWORD</span>
                      {sortField === "keywordsNum" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* DOMAIN AGE */}
                {visibleColumns.domainAge && (
                  <th
                    onClick={() => handleSort("domainAge")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>DOMAIN AGE</span>
                      {sortField === "domainAge" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}

                {/* FIRST SEEN */}
                {visibleColumns.firstSeen && (
                  <th
                    onClick={() => handleSort("firstSeen")}
                    className="py-3 px-4 cursor-pointer hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>FIRST SEEN</span>
                      {sortField === "firstSeen" && (
                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const isExpanded = expandedBacklinksDomain === item.domain;
                const totalVisibleCols = Object.values(visibleColumns).filter(Boolean).length + 1;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.id)}
                          aria-label={`Select domain ${item.domain}`}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* DOMAIN */}
                      {visibleColumns.domain && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] flex-shrink-0">
                              🌐
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 cursor-pointer">
                              {item.domain}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* DT (Domain Trust score with dark horizontal indicator bar) */}
                      {visibleColumns.dt && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 w-5">
                              {item.domainTrust}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#433b5c] dark:bg-slate-300 rounded-full"
                                style={{ width: `${item.domainTrust}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* PT (Page Trust score with blue horizontal indicator bar) */}
                      {visibleColumns.pt && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 w-5">
                              {item.pageTrust ?? item.domainTrust}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                style={{ width: `${item.pageTrust ?? item.domainTrust}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* DOMAIN TRAFFIC */}
                      {visibleColumns.domainTraffic && (
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-200">
                          {item.domainTraffic}
                        </td>
                      )}

                      {/* LINK TRAFFIC */}
                      {visibleColumns.linkTraffic && (
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-200">
                          {item.linkTraffic ?? "0"}
                        </td>
                      )}

                      {/* BACKLINKS (count with dropdown chevron, e.g., 1 ▾, 2 ▾, 27 ▾) */}
                      {visibleColumns.backlinks && (
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBacklinksDomain(
                                isExpanded ? null : item.domain
                              )
                            }
                            className="inline-flex items-center gap-1 font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            aria-label={`View backlinks for ${item.domain}`}
                          >
                            <span>{item.backlinksCount}</span>
                            <span className="text-[10px]">▾</span>
                          </button>
                        </td>
                      )}

                      {/* BACKLINK KEYWORDS */}
                      {visibleColumns.backlinkKeywords && (
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-200">
                          {item.backlinkKeywords ?? "0"}
                        </td>
                      )}

                      {/* DO/NOFOLLOW */}
                      {visibleColumns.dofollowNofollow && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium">
                            {(item.dofollowCount ?? 0) > 0 && (
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                                {item.dofollowCount} do
                              </span>
                            )}
                            {(item.nofollowCount ?? 0) > 0 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded font-semibold border border-slate-200 dark:border-slate-700">
                                {item.nofollowCount} no
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* KEYWORD */}
                      {visibleColumns.keyword && (
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-200">
                          {item.keywords}
                        </td>
                      )}

                      {/* DOMAIN AGE */}
                      {visibleColumns.domainAge && (
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {item.domainAge}
                        </td>
                      )}

                      {/* FIRST SEEN */}
                      {visibleColumns.firstSeen && (
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.firstSeen}
                        </td>
                      )}
                    </tr>

                    {/* Expandable Backlinks Details Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-y border-blue-100 dark:border-blue-900/40">
                        <td colSpan={totalVisibleCols} className="p-4">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                              <span>Backlinks originating from {item.domain} ({item.backlinksCount} total)</span>
                              <span className="text-slate-400 font-normal">First seen: {item.firstSeen}</span>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">
                                    https://{item.domain}/reviews/workcomposer-analysis/
                                  </div>
                                  <div className="text-slate-500 text-[11px] mt-0.5">
                                    Target: https://www.workcomposer.com/ | Anchor: &quot;WorkComposer&quot;
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-bold text-[10px]">
                                    DOFOLLOW
                                  </span>
                                  <span className="text-slate-400 text-[11px]">Seen: {item.firstSeen}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="py-12 text-center text-slate-500">
                    No referring domains match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 8. PAGINATION CONTROLS (MATCHING SCREENSHOT 3) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          {/* Left: Previous <, Pages (1..9), Next > */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    isActive
                      ? "bg-[#433b5c] text-white shadow-xs"
                      : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              &gt;
            </button>
          </div>

          {/* Center: Go to page: [ 1 ] */}
          <form onSubmit={handleGoToPage} className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Go to page:
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToPageInput}
              onChange={(e) => setGoToPageInput(e.target.value)}
              aria-label="Go to page input"
              className="w-14 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-center font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

          {/* Right: Rows per page selector [ 20 ▾ ] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer shadow-xs"
            >
              <span>{pageSize}</span>
              <span className="text-[10px]">▾</span>
            </button>

            {isPageSizeOpen && (
              <div className="absolute right-0 bottom-9 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                {[10, 20, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setIsPageSizeOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 ${
                      pageSize === size
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    } cursor-pointer`}
                  >
                    {size} rows
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#433b5c] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-4 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <span>{selectedIds.size} referring domains selected</span>
          <div className="h-4 w-px bg-slate-600"></div>
          <button
            type="button"
            onClick={() => {
              alert(`Copied ${selectedIds.size} domains to clipboard.`);
            }}
            className="hover:text-blue-300 transition cursor-pointer"
          >
            Copy Domains
          </button>
          <button
            type="button"
            onClick={() => {
              alert(`Exported ${selectedIds.size} domains to Google Disavow.`);
            }}
            className="hover:text-blue-300 transition cursor-pointer"
          >
            Add to Disavow
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            className="hover:text-blue-300 transition cursor-pointer"
          >
            Export Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-300 hover:text-white underline cursor-pointer ml-2"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Send Feedback on Referring Domains
            </h3>
            <textarea
              rows={4}
              placeholder="What can we improve in Referring Domains analysis?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex items-center justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedbackText("");
                  alert("Thank you for your feedback!");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Referring Domains Notes (46)
              </h3>
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-100">about.me</span>: High authority profile link active since Jul 2025.
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-100">es.gizmodo.com</span>: Spanish tech blog editorial coverage with 892K traffic.
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-100">www.saashub.com</span>: 27 backlinks originating across directory category pages.
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
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