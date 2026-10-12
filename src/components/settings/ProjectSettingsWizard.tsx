"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Alert, Button, Input, Skeleton, Badge } from "@internal-seo/ui";
import { api } from "../../lib/api";
import {
  ProjectDetailDto,
  ProjectMemberDto,
  CompetitorDto,
  KeywordDto,
} from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { useAuth } from "../../context/AuthContext";
import { GscSettingsCard } from "../gsc/GscSettingsCard";
import { Ga4SettingsCard } from "../ga4/Ga4SettingsCard";
import { SearchEngineIcon } from "@/components/ui/SearchEngineIcons";

export type SettingsTabId =
  | "general"
  | "search_engines"
  | "keywords"
  | "prompts"
  | "competitors"
  | "integrations"
  | "analytics"
  | "crawl"
  | "members";

export interface ProjectSearchEngineItem {
  id: string;
  engine: string;
  country: string;
  location?: string;
  language: string;
  device: "Desktop" | "Mobile";
  trackAds: boolean;
  includeLocalPack: boolean;
  status: "Active" | "Paused";
}

export interface PromptItem {
  id: string;
  query: string;
  engine: string;
  group: string;
  frequency: string;
  status: "Active" | "Tracking";
  createdAt: string;
}

export const HISTORY_IMPORT_FORMATS = [
  "XLSX from SE Ranking",
  "CSV from SE Ranking",
  "CSV/XLSX from Semrush",
  "CSV from Agency Analytics",
  "CSV from RankRanger (line by line)",
  "CSV from RankRanger (by column)",
] as const;

import { CountryFlag } from "@/components/ui/CountryFlag";
export { CountryFlag };

export interface CompetitorCountry {
  code: string;
  name: string;
  flag?: string;
}

export const COMPETITOR_COUNTRIES: CompetitorCountry[] = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States of America", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom of Great Britain and Northern Ireland", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

// Pure HSV <-> RGB <-> HEX Conversion Utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : Math.round((diff / max) * 100);
  const v = Math.round(max * 100);
  return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = (h % 360 + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let rPrime = 0, gPrime = 0, bPrime = 0;
  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 220, s: 84, v: 92 }; // default #2563EB
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export interface ProjectSettingsWizardProps {
  projectId: string;
  initialTab?: SettingsTabId;
}

export function ProjectSettingsWizard({ projectId, initialTab }: ProjectSettingsWizardProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isWriter = isSuperAdmin || user?.role === "SEOExecutive";

  // Tab state
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab || "general");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as SettingsTabId | null;
      if (tabParam && ["general", "search_engines", "keywords", "prompts", "competitors", "integrations", "analytics", "crawl", "members"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [initialTab]);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [keywords, setKeywords] = useState<KeywordDto[]>([]);

  // Tab 1: General Information
  const [name, setName] = useState("");
  const [domainType, setDomainType] = useState("*.domain/* (Recommended)");
  const [group, setGroup] = useState("General");
  const [projectColor, setProjectColor] = useState("#2563eb");
  const [backlinkReport, setBacklinkReport] = useState(true);
  const [status, setStatus] = useState("Active");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group Searchable Popover State
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([
    "General",
    "Brand Terms",
    "Competitor Terms",
    "High Intent",
    "E-Commerce",
    "Enterprise",
    "Client Projects",
    "Internal Tools",
  ]);
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [newGroupNameInput, setNewGroupNameInput] = useState("");
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // Project Color Popover State (2D Saturation / Value Canvas + Vertical Hue Slider)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [hue, setHue] = useState(() => hexToHsv(projectColor).h);
  const [saturation, setSaturation] = useState(() => hexToHsv(projectColor).s);
  const [value, setValue] = useState(() => hexToHsv(projectColor).v);
  const [hexInputValue, setHexInputValue] = useState(() => projectColor.replace(/^#/, "").toUpperCase());
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Sync color picker HSV and Hex when projectColor updates
  useEffect(() => {
    const hsv = hexToHsv(projectColor);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setValue(hsv.v);
    setHexInputValue(projectColor.replace(/^#/, "").toUpperCase());
  }, [projectColor]);

  // Click outside listener for Group dropdown and Color picker popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGroupDropdownOpen(false);
        setIsCreatingNewGroup(false);
      }
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setIsColorPickerOpen(false);
      }
      if (
        importGroupDropdownRef.current &&
        !importGroupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsImportGroupDropdownOpen(false);
        setIsCreatingImportNewGroup(false);
      }
      if (
        historyFormatDropdownRef.current &&
        !historyFormatDropdownRef.current.contains(event.target as Node)
      ) {
        setIsHistoryFormatDropdownOpen(false);
      }
      if (
        keywordGroupDropdownRef.current &&
        !keywordGroupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsKeywordGroupDropdownOpen(false);
        setIsCreatingKeywordNewGroup(false);
      }
      if (
        importPromptsGroupDropdownRef.current &&
        !importPromptsGroupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsImportPromptsGroupDropdownOpen(false);
        setIsCreatingImportPromptsNewGroup(false);
      }
      if (
        competitorCountryPopoverRef.current &&
        !competitorCountryPopoverRef.current.contains(event.target as Node)
      ) {
        setIsCompetitorCountryPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global ESC key listener for modal dismissal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsImportPromptsModalOpen(false);
        setIsImportModalOpen(false);
        setIsCompetitorCountryPopoverOpen(false);
        setActiveAnalyticsModal(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered groups for real-time search
  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return availableGroups;
    return availableGroups.filter((g) =>
      g.toLowerCase().includes(groupSearchQuery.toLowerCase().trim())
    );
  }, [availableGroups, groupSearchQuery]);

  // Color picker event handlers
  const handleSaturationValueChange = (clientX: number, clientY: number) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);
    setSaturation(s);
    setValue(v);
    const newHex = hsvToHex(hue, s, v);
    setProjectColor(newHex);
    setHexInputValue(newHex.replace(/^#/, "").toUpperCase());
  };

  const handleHueChange = (clientY: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const h = Math.round((y / rect.height) * 360) % 360;
    setHue(h);
    const newHex = hsvToHex(h, saturation, value);
    setProjectColor(newHex);
    setHexInputValue(newHex.replace(/^#/, "").toUpperCase());
  };

  const handleHexInputChange = (val: string) => {
    const clean = val.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).toUpperCase();
    setHexInputValue(clean);
    if (clean.length === 6 || clean.length === 3) {
      const fullHex = `#${clean}`;
      setProjectColor(fullHex);
      const hsv = hexToHsv(fullHex);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setValue(hsv.v);
    }
  };

  // Tab 2: Search Engines
  const [selectedEngineChip, setSelectedEngineChip] = useState("Google");
  const [selectedDevice, setSelectedDevice] = useState<"Desktop" | "Mobile">("Desktop");
  const [engineCountry, setEngineCountry] = useState("United States");
  const [engineLocation, setEngineLocation] = useState("");
  const [engineLanguage, setEngineLanguage] = useState("English (en)");
  const [trackAds, setTrackAds] = useState(true);
  const [includeLocalPack, setIncludeLocalPack] = useState(true);
  const [searchEnginesSearchQuery, setSearchEnginesSearchQuery] = useState("");
  const [addedSearchEngines, setAddedSearchEngines] = useState<ProjectSearchEngineItem[]>([]);

  // Tab 3: Keywords
  const [keywordText, setKeywordText] = useState("");
  const [keywordGroup, setKeywordGroup] = useState("General");
  const [isKeywordGroupDropdownOpen, setIsKeywordGroupDropdownOpen] = useState(false);
  const [keywordGroupSearchQuery, setKeywordGroupSearchQuery] = useState("");
  const [isCreatingKeywordNewGroup, setIsCreatingKeywordNewGroup] = useState(false);
  const [newKeywordGroupNameInput, setNewKeywordGroupNameInput] = useState("");
  const keywordGroupDropdownRef = useRef<HTMLDivElement>(null);
  const [suggestKeywords, setSuggestKeywords] = useState(true);
  const [keywordSearchFilter, setKeywordSearchFilter] = useState("");
  const [keywordEngineFilter, setKeywordEngineFilter] = useState("all");

  // Filtered groups for Keyword group popover
  const filteredKeywordGroups = useMemo(() => {
    if (!keywordGroupSearchQuery.trim()) return availableGroups;
    return availableGroups.filter((g) =>
      g.toLowerCase().includes(keywordGroupSearchQuery.toLowerCase().trim())
    );
  }, [availableGroups, keywordGroupSearchQuery]);
  // Multi-view Import Keywords Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalView, setImportModalView] = useState<"menu" | "csvFile" | "csvHistory" | "googleAnalytics">("menu");
  const [importCsvFormat, setImportCsvFormat] = useState("CSV / Text");
  const [importHistoryFormat, setImportHistoryFormat] = useState<string>("CSV from SE Ranking");
  const [isHistoryFormatDropdownOpen, setIsHistoryFormatDropdownOpen] = useState(false);
  const historyFormatDropdownRef = useRef<HTMLDivElement>(null);
  const [fileContainsTargetLinks, setFileContainsTargetLinks] = useState(false);
  const [importSearchEngine, setImportSearchEngine] = useState("all");
  const [importTargetGroup, setImportTargetGroup] = useState("General");
  const [isImportGroupDropdownOpen, setIsImportGroupDropdownOpen] = useState(false);
  const [importGroupSearchQuery, setImportGroupSearchQuery] = useState("");
  const [isCreatingImportNewGroup, setIsCreatingImportNewGroup] = useState(false);
  const [newImportGroupNameInput, setNewImportGroupNameInput] = useState("");
  const importGroupDropdownRef = useRef<HTMLDivElement>(null);
  const [checkRankingsTargetUrlOnly, setCheckRankingsTargetUrlOnly] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedKeywordsToImport, setParsedKeywordsToImport] = useState<{ term: string; targetUrl?: string }[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered groups for Import to group popover
  const filteredImportGroups = useMemo(() => {
    if (!importGroupSearchQuery.trim()) return availableGroups;
    return availableGroups.filter((g) =>
      g.toLowerCase().includes(importGroupSearchQuery.toLowerCase().trim())
    );
  }, [availableGroups, importGroupSearchQuery]);

  const processFileContent = (content: string, withTargetLinks: boolean, format?: string) => {
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const results: { term: string; targetUrl?: string }[] = [];

    if (lines.length === 0) return results;

    const firstLine = lines[0];
    const sep = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";

    // Handle RankRanger (by column) matrix format
    if (format === "CSV from RankRanger (by column)") {
      const headers = firstLine.split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ""));
      headers.slice(1).forEach((header) => {
        const cleaned = header.trim().replace(/^["']|["']$/g, "");
        if (
          cleaned &&
          !cleaned.toLowerCase().includes("date") &&
          !cleaned.toLowerCase().includes("engine") &&
          !cleaned.toLowerCase().includes("time")
        ) {
          results.push({ term: cleaned });
        }
      });
      if (results.length > 0) return results;
    }

    const firstLineLower = firstLine.toLowerCase();
    const isHeaderRow =
      firstLineLower.includes("keyword") ||
      firstLineLower.includes("query") ||
      firstLineLower.includes("search term") ||
      firstLineLower.includes("phrase") ||
      firstLineLower.includes("position") ||
      firstLineLower.includes("url") ||
      firstLineLower.includes("rank") ||
      firstLineLower.includes("landing page");

    const startIndex = isHeaderRow ? 1 : 0;
    let keywordColIdx = 0;
    let urlColIdx = -1;

    if (isHeaderRow) {
      const headers = firstLine.split(sep).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
      const kwIdx = headers.findIndex(
        (h) =>
          h.includes("keyword") ||
          h.includes("query") ||
          h.includes("search term") ||
          h.includes("phrase")
      );
      if (kwIdx !== -1) keywordColIdx = kwIdx;

      const uIdx = headers.findIndex(
        (h) =>
          h.includes("target url") ||
          h.includes("landing page") ||
          h.includes("url") ||
          h.includes("link")
      );
      if (uIdx !== -1) urlColIdx = uIdx;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if ((withTargetLinks || urlColIdx !== -1) && (line.includes(",") || line.includes("\t") || line.includes(";"))) {
        const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const term = (parts[keywordColIdx] || parts[0] || "").replace(/^\d+[\.\)]\s*/, "");
        const rawUrl = urlColIdx !== -1 ? parts[urlColIdx] : parts[1];
        const targetUrl =
          rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/"))
            ? rawUrl
            : undefined;

        if (term) {
          results.push({ term, targetUrl });
        }
      } else {
        const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const term = (parts[keywordColIdx] || parts[0] || "").replace(/^\d+[\.\)]\s*/, "");
        if (term) {
          results.push({ term });
        }
      }
    }

    return results;
  };

  const handleFileSelected = (file: File, withTargetLinks: boolean, format?: string) => {
    setImportError(null);
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      const parsed = processFileContent(
        text,
        withTargetLinks,
        format || (importModalView === "csvHistory" ? importHistoryFormat : undefined)
      );
      setParsedKeywordsToImport(parsed);
    };
    reader.onerror = () => {
      setImportError("Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedKeywordsToImport.length === 0) return;

    const newKeywordTerms = parsedKeywordsToImport.map((p) => p.term);
    setKeywordText((prev) => {
      const existing = prev.trim();
      return existing ? `${existing}\n${newKeywordTerms.join("\n")}` : newKeywordTerms.join("\n");
    });

    if (importTargetGroup) {
      setKeywordGroup(importTargetGroup);
    }

    setFeedbackSuccess(`Successfully imported ${parsedKeywordsToImport.length} keywords from ${uploadedFileName || "file"}.`);
    setIsImportModalOpen(false);
    setImportModalView("menu");
    setIsImportGroupDropdownOpen(false);
    setIsHistoryFormatDropdownOpen(false);
    setUploadedFileName(null);
    setParsedKeywordsToImport([]);
  };
  const [isAddingKeywords, setIsAddingKeywords] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    General: true,
  });

  // Tab 4: Prompts
  const [promptEngine, setPromptEngine] = useState("ChatGPT");
  const [promptMode, setPromptMode] = useState<"Manually" | "Suggestions">("Manually");
  const [promptText, setPromptText] = useState("");
  const [promptGroup, setPromptGroup] = useState("Default AI Prompts");
  const [promptsList, setPromptsList] = useState<PromptItem[]>([
    {
      id: "p-1",
      query: "Best enterprise SEO platform for rank tracking",
      engine: "ChatGPT",
      group: "Default AI Prompts",
      frequency: "Daily",
      status: "Active",
      createdAt: "2026-09-10T00:00:00Z",
    },
    {
      id: "p-2",
      query: "Top SEO intelligence software with crawl audit",
      engine: "Google Gemini",
      group: "Default AI Prompts",
      frequency: "Daily",
      status: "Active",
      createdAt: "2026-09-12T00:00:00Z",
    },
  ]);

  // Import Prompts Modal State
  const [isImportPromptsModalOpen, setIsImportPromptsModalOpen] = useState(false);
  const [importPromptsFormat, setImportPromptsFormat] = useState<"simple" | "withGroups">("simple");
  const [importPromptsEngine, setImportPromptsEngine] = useState("ChatGPT");
  const [importPromptsGroup, setImportPromptsGroup] = useState("General");
  const [importPromptsFileName, setImportPromptsFileName] = useState<string | null>(null);
  const [parsedPromptsToImport, setParsedPromptsToImport] = useState<{ query: string; group?: string; engine?: string }[]>([]);
  const [isDraggingPromptsFile, setIsDraggingPromptsFile] = useState(false);
  const [importPromptsError, setImportPromptsError] = useState<string | null>(null);
  const promptsFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportPromptsGroupDropdownOpen, setIsImportPromptsGroupDropdownOpen] = useState(false);
  const [importPromptsGroupSearchQuery, setImportPromptsGroupSearchQuery] = useState("");
  const [isCreatingImportPromptsNewGroup, setIsCreatingImportPromptsNewGroup] = useState(false);
  const [newImportPromptsGroupNameInput, setNewImportPromptsGroupNameInput] = useState("");
  const importPromptsGroupDropdownRef = useRef<HTMLDivElement>(null);

  const promptGroupsList = useMemo(() => {
    const defaultPromptGroups = ["General", "Default AI Prompts", "Comparison Queries", "Product Reviews"];
    return Array.from(new Set([...defaultPromptGroups, ...availableGroups]));
  }, [availableGroups]);

  const filteredImportPromptGroups = useMemo(() => {
    if (!importPromptsGroupSearchQuery.trim()) return promptGroupsList;
    return promptGroupsList.filter((g) =>
      g.toLowerCase().includes(importPromptsGroupSearchQuery.toLowerCase().trim())
    );
  }, [promptGroupsList, importPromptsGroupSearchQuery]);

  // Tab 5: Competitors
  const [competitorInputText, setCompetitorInputText] = useState("");
  const [competitorDomainType, setCompetitorDomainType] = useState("*.domain/* (Recommended)");
  const [suggestCompetitors, setSuggestCompetitors] = useState(true);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [competitorSearchQuery, setCompetitorSearchQuery] = useState("");
  const [selectedCompetitorCountry, setSelectedCompetitorCountry] = useState<CompetitorCountry>(
    COMPETITOR_COUNTRIES[0]
  );
  const [isCompetitorCountryPopoverOpen, setIsCompetitorCountryPopoverOpen] = useState(false);
  const [competitorCountrySearchQuery, setCompetitorCountrySearchQuery] = useState("");
  const competitorCountryPopoverRef = useRef<HTMLDivElement>(null);

  // Tab 7: Crawl Settings
  const [maxPages, setMaxPages] = useState(5000);
  const [maxDepth, setMaxDepth] = useState(10);
  const [concurrency, setConcurrency] = useState(5);
  const [rateLimitMs, setRateLimitMs] = useState(200);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);
  const [userAgent, setUserAgent] = useState("InternalSEOPlatformBot/1.0");

  // Tab 6: Statistics & Analytics Services
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
  const [activeAnalyticsModal, setActiveAnalyticsModal] = useState<"ga" | "gsc" | "matomo" | "googleOAuth" | null>(null);
  const [googleOAuthTarget, setGoogleOAuthTarget] = useState<"ga" | "gsc" | null>(null);
  const [isUsingCustomGoogleAccount, setIsUsingCustomGoogleAccount] = useState(false);
  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState("");

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
    ];
    if (user?.email && !list.some((a) => a.email.toLowerCase() === user.email.toLowerCase())) {
      list.unshift({
        name: user.fullName || user.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
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
        propertyId: gaMeasurementIdInput || "G-DEMO123456",
        accountEmail: selectedEmail,
      });
    } else if (googleOAuthTarget === "gsc") {
      setGscConnection({
        connected: true,
        siteUrl: gscSiteUrlInput || (project?.primaryDomain ? `https://${project.primaryDomain}/` : "https://example.com/"),
        accountEmail: selectedEmail,
      });
    }
    setActiveAnalyticsModal(null);
    setGoogleOAuthTarget(null);
  };

  // Connection modal inputs
  const [gaMeasurementIdInput, setGaMeasurementIdInput] = useState("");
  const [gscSiteUrlInput, setGscSiteUrlInput] = useState("");
  const [matomoServerUrlInput, setMatomoServerUrlInput] = useState("");
  const [matomoSiteIdInput, setMatomoSiteIdInput] = useState("");
  const [matomoAuthTokenInput, setMatomoAuthTokenInput] = useState("");

  // Tab 8: Member Assignments
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberAccessLevel, setNewMemberAccessLevel] = useState("Member");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // General Status Alerts
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    let ignore = false;
    Promise.all([
      api.projects.get(projectId),
      api.audit.getSettings(projectId),
      api.projects.getMembers(projectId),
      api.competitors ? api.competitors.list(projectId).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      api.keywords ? api.keywords.list(projectId, { pageSize: 100 }).catch(() => ({ data: { items: [], totalCount: 0 } })) : Promise.resolve({ data: { items: [], totalCount: 0 } }),
    ])
      .then(([projRes, crawlRes, membersRes, compRes, kwRes]) => {
        if (!ignore) {
          if (projRes.data) {
            setProject(projRes.data);
            setName(projRes.data.name || "");
            setStatus(String(projRes.data.status || "Active"));

            // Initialize default search engine
            setAddedSearchEngines([
              {
                id: "eng-default",
                engine: projRes.data.defaultSearchEngine || "Google",
                country: projRes.data.countryCode === "US" ? "United States" : projRes.data.countryCode || "United States",
                location: projRes.data.primaryLocation || "United States",
                language: "English (en)",
                device: (projRes.data.defaultDevice === "mobile" ? "Mobile" : "Desktop"),
                trackAds: true,
                includeLocalPack: true,
                status: "Active",
              },
            ]);
          }

          if (crawlRes.data) {
            if (crawlRes.data.crawlMaxPages !== undefined) setMaxPages(crawlRes.data.crawlMaxPages);
            if (crawlRes.data.crawlMaxDepth !== undefined) setMaxDepth(crawlRes.data.crawlMaxDepth);
            if (crawlRes.data.crawlConcurrency !== undefined) setConcurrency(crawlRes.data.crawlConcurrency);
            if (crawlRes.data.crawlRateLimitMs !== undefined) setRateLimitMs(crawlRes.data.crawlRateLimitMs);
            if (crawlRes.data.crawlRespectRobotsTxt !== undefined) setRespectRobotsTxt(crawlRes.data.crawlRespectRobotsTxt);
            if (crawlRes.data.crawlUserAgent !== undefined) setUserAgent(crawlRes.data.crawlUserAgent);
          }

          if (membersRes.data) {
            setMembers(membersRes.data);
          }

          if (compRes?.data) {
            setCompetitors(compRes.data);
          }

          if (kwRes?.data) {
            const items = Array.isArray(kwRes.data) ? kwRes.data : kwRes.data.items || [];
            setKeywords(items);
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load project settings:", err);
          setFeedbackError("Failed to load project settings data.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  // Save changes handler (called on APPLY or form submit)
  const handleSaveGeneral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isWriter) return;

    setIsSaving(true);
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      await api.projects.update(projectId, {
        name,
        status: status as ProjectDetailDto["status"],
        defaultDevice: selectedDevice.toLowerCase(),
        defaultSearchEngine: selectedEngineChip.toLowerCase(),
      });

      if (api.audit?.updateSettings) {
        await api.audit.updateSettings(projectId, {
          crawlMaxPages: maxPages,
          crawlMaxDepth: maxDepth,
          crawlConcurrency: concurrency,
          crawlRateLimitMs: rateLimitMs,
          crawlRespectRobotsTxt: respectRobotsTxt,
          crawlUserAgent: userAgent,
        });
      }

      setFeedbackSuccess("Project settings applied and saved successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update project settings.";
      setFeedbackError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Add search engine
  const handleAddSearchEngine = (e: React.FormEvent) => {
    e.preventDefault();
    const newEngine: ProjectSearchEngineItem = {
      id: `eng-${Date.now()}`,
      engine: selectedEngineChip,
      country: engineCountry,
      location: engineLocation || undefined,
      language: engineLanguage,
      device: selectedDevice,
      trackAds,
      includeLocalPack,
      status: "Active",
    };
    setAddedSearchEngines((prev) => [newEngine, ...prev]);
    setFeedbackSuccess(`Added ${selectedEngineChip} (${selectedDevice} - ${engineCountry}) to project search engines.`);
  };

  const handleRemoveSearchEngine = (id: string) => {
    setAddedSearchEngines((prev) => prev.filter((eng) => eng.id !== id));
  };

  // Add Keywords
  const parsedKeywordLines = useMemo(() => {
    return keywordText
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }, [keywordText]);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedKeywordLines.length === 0 || !isWriter) return;

    setIsAddingKeywords(true);
    try {
      if (api.keywords?.bulk) {
        const rows = parsedKeywordLines.map((kw) => ({
          keywordText: kw,
          groupName: keywordGroup,
          targetUrl: project?.primaryDomain ? `https://${project.primaryDomain}` : undefined,
          searchIntent: "Commercial",
        }));
        await (api.keywords.bulk as (pId: string, r: unknown) => Promise<unknown>)(projectId, rows);
      } else if (api.keywords?.create) {
        for (const kw of parsedKeywordLines) {
          await api.keywords.create(projectId, {
            keywordText: kw,
            groupName: keywordGroup,
            targetUrl: project?.primaryDomain ? `https://${project.primaryDomain}` : undefined,
            searchIntent: "Commercial",
          });
        }
      }

      // Refresh keywords
      const kwRes = await api.keywords.list(projectId, { pageSize: 100 });
      let items = kwRes?.data ? (Array.isArray(kwRes.data) ? kwRes.data : kwRes.data.items || []) : [];
      const existingTerms = new Set(
        items.map((k: KeywordDto) => (k.keywordText || (k as unknown as { term?: string }).term || "").toLowerCase())
      );
      const newlyAddedLocals: KeywordDto[] = parsedKeywordLines
        .filter((term) => !existingTerms.has(term.toLowerCase()))
        .map((term, idx) => ({
          id: `kw-new-${Date.now()}-${idx}`,
          projectId,
          keywordText: term,
          groupName: keywordGroup,
          searchEngine: "google",
          countryCode: "US",
          languageCode: "en",
          createdAt: new Date().toISOString(),
        } as unknown as KeywordDto));
      if (newlyAddedLocals.length > 0) {
        items = [...items, ...newlyAddedLocals];
      }
      setKeywords(items);

      setKeywordText("");
      setFeedbackSuccess(`Successfully added ${parsedKeywordLines.length} keyword(s) to project.`);
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to add keywords.");
    } finally {
      setIsAddingKeywords(false);
    }
  };

  // Group keywords by groupName
  const groupedKeywords = useMemo(() => {
    const map: Record<string, KeywordDto[]> = {};
    keywords.forEach((kw) => {
      const g = kw.groupName || "General";
      if (!map[g]) map[g] = [];
      map[g].push(kw);
    });
    if (!map["General"]) {
      map["General"] = [];
    }
    return map;
  }, [keywords]);

  const activeKeywordGroups = useMemo(() => {
    const groups = Object.keys(groupedKeywords);
    return groups.sort((a, b) => {
      if (a === "General") return -1;
      if (b === "General") return 1;
      return a.localeCompare(b);
    });
  }, [groupedKeywords]);

  const handleDeleteKeyword = async (kwId: string) => {
    if (!isWriter) return;
    try {
      if (api.keywords?.delete) {
        await api.keywords.delete(projectId, kwId);
        setKeywords((prev) => prev.filter((k) => k.id !== kwId));
      }
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to delete keyword.");
    }
  };

  // Add Prompts
  const parsedPromptLines = useMemo(() => {
    return promptText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [promptText]);

  const handleAddPrompts = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPromptLines.length === 0) return;

    const newPrompts: PromptItem[] = parsedPromptLines.map((q, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      query: q,
      engine: promptEngine,
      group: promptGroup,
      frequency: "Daily",
      status: "Active",
      createdAt: new Date().toISOString(),
    }));

    setPromptsList((prev) => [...newPrompts, ...prev]);
    setPromptText("");
    setFeedbackSuccess(`Added ${parsedPromptLines.length} prompt(s) for ${promptEngine} tracking.`);
  };

  const handleDeletePrompt = (promptId: string) => {
    setPromptsList((prev) => prev.filter((p) => p.id !== promptId));
  };

  const processPromptsFileContent = (content: string, format: "simple" | "withGroups") => {
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const results: { query: string; group?: string; engine?: string }[] = [];

    if (lines.length === 0) return results;

    const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
    const firstCell = lines[0].split(sep)[0].trim().toLowerCase().replace(/^["']|["']$/g, "");
    const isHeader =
      firstCell === "prompt" ||
      firstCell === "prompts" ||
      firstCell === "query" ||
      firstCell === "queries" ||
      firstCell === "search term" ||
      firstCell === "search terms" ||
      firstCell === "question" ||
      firstCell === "questions";

    const startIndex = isHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (format === "withGroups" && (line.includes(",") || line.includes("\t") || line.includes(";"))) {
        const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
        const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const query = (parts[0] || "").replace(/^\d+[\.\)]\s*/, "").trim();
        const customGroup = parts[1] ? parts[1].trim() : undefined;
        if (query) {
          results.push({
            query,
            group: customGroup || importPromptsGroup,
            engine: importPromptsEngine,
          });
        }
      } else {
        const query = line.replace(/^\d+[\.\)]\s*/, "").replace(/^["']|["']$/g, "").trim();
        if (query) {
          results.push({
            query,
            group: importPromptsGroup,
            engine: importPromptsEngine,
          });
        }
      }
    }

    return results;
  };

  const handlePromptsFileSelected = (file: File, format: "simple" | "withGroups") => {
    setImportPromptsError(null);
    setImportPromptsFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      const parsed = processPromptsFileContent(text, format);
      setParsedPromptsToImport(parsed);
    };
    reader.onerror = () => {
      setImportPromptsError("Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handleExecuteImportPrompts = () => {
    if (parsedPromptsToImport.length === 0) return;

    const remainingQuota = Math.max(0, 20 - promptsList.length);
    const toImport = parsedPromptsToImport.slice(0, remainingQuota);

    if (toImport.length === 0) {
      setFeedbackError("Prompt limit of 20 reached. Delete existing prompts to import more.");
      setIsImportPromptsModalOpen(false);
      return;
    }

    const newPromptItems: PromptItem[] = toImport.map((item, idx) => ({
      id: `p-imp-${Date.now()}-${idx}`,
      query: item.query,
      engine: importPromptsEngine,
      group: (importPromptsFormat === "withGroups" && item.group) ? item.group : importPromptsGroup,
      frequency: "Daily",
      status: "Active",
      createdAt: new Date().toISOString(),
    }));

    if (importPromptsFormat === "withGroups") {
      const newDiscoveredGroups: string[] = [];
      toImport.forEach((item) => {
        if (
          item.group &&
          !availableGroups.includes(item.group) &&
          !newDiscoveredGroups.includes(item.group)
        ) {
          newDiscoveredGroups.push(item.group);
        }
      });
      if (newDiscoveredGroups.length > 0) {
        setAvailableGroups((prev) => [...prev, ...newDiscoveredGroups]);
      }
    }

    setPromptsList((prev) => [...newPromptItems, ...prev]);
    setFeedbackSuccess(
      `Successfully imported ${newPromptItems.length} prompt(s) into project tracking.`
    );
    setIsImportPromptsModalOpen(false);
    setIsImportPromptsGroupDropdownOpen(false);
    setImportPromptsGroupSearchQuery("");
    setIsCreatingImportPromptsNewGroup(false);
    setNewImportPromptsGroupNameInput("");
    setImportPromptsFileName(null);
    setParsedPromptsToImport([]);
  };

  // Competitor suggestions
  const competitorSuggestions = useMemo(
    () => [
      { domain: "semrush.com", sharedKeywords: 1420 },
      { domain: "ahrefs.com", sharedKeywords: 1180 },
      { domain: "onetracker.in", sharedKeywords: 2840 },
      { domain: "afk-assistant.com", sharedKeywords: 1950 },
      { domain: "moz.com", sharedKeywords: 890 },
      { domain: "seranking.com", sharedKeywords: 760 },
    ],
    []
  );

  const filteredCompetitorSuggestions = useMemo(() => {
    const q = competitorSearchQuery.toLowerCase().trim();
    if (!q) return competitorSuggestions;
    return competitorSuggestions.filter((s) => s.domain.toLowerCase().includes(q));
  }, [competitorSuggestions, competitorSearchQuery]);

  const filteredCompetitorCountries = useMemo(() => {
    const q = competitorCountrySearchQuery.toLowerCase().trim();
    if (!q) return COMPETITOR_COUNTRIES;
    return COMPETITOR_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [competitorCountrySearchQuery]);

  // Add Competitors & Synchronized Numbered Input Parsing
  const currentInputDomains = useMemo(() => {
    return competitorInputText
      .split("\n")
      .map((c) => c.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((c) => c.length > 0);
  }, [competitorInputText]);

  const parsedCompetitorLines = useMemo(() => {
    return currentInputDomains;
  }, [currentInputDomains]);

  const selectableVisibleSuggestions = useMemo(() => {
    return filteredCompetitorSuggestions.filter(
      (s) => !competitors.some((c) => c.domain.toLowerCase() === s.domain.toLowerCase())
    );
  }, [filteredCompetitorSuggestions, competitors]);

  const isAllVisibleSelected = useMemo(() => {
    if (selectableVisibleSuggestions.length === 0) return false;
    return selectableVisibleSuggestions.every((s) =>
      currentInputDomains.some((d) => d.toLowerCase() === s.domain.toLowerCase())
    );
  }, [selectableVisibleSuggestions, currentInputDomains]);

  const isSomeVisibleSelected = useMemo(() => {
    return selectableVisibleSuggestions.some((s) =>
      currentInputDomains.some((d) => d.toLowerCase() === s.domain.toLowerCase())
    );
  }, [selectableVisibleSuggestions, currentInputDomains]);

  const handleToggleCompetitorSuggestion = (domain: string) => {
    const exists = currentInputDomains.some((d) => d.toLowerCase() === domain.toLowerCase());
    if (exists) {
      const remaining = currentInputDomains.filter((d) => d.toLowerCase() !== domain.toLowerCase());
      setCompetitorInputText(remaining.map((d, idx) => `${idx + 1}. ${d}`).join("\n"));
    } else {
      const totalCompetitors = competitors.length + currentInputDomains.length;
      if (totalCompetitors >= 5) {
        setFeedbackError("Maximum of 5 competitors reached.");
        return;
      }
      const updated = [...currentInputDomains, domain];
      setCompetitorInputText(updated.map((d, idx) => `${idx + 1}. ${d}`).join("\n"));
    }
  };

  const handleToggleAllVisibleSuggestions = () => {
    const availableSlots = Math.max(0, 5 - competitors.length - currentInputDomains.length);
    const shouldDeselect = isAllVisibleSelected || (availableSlots === 0 && isSomeVisibleSelected);

    if (shouldDeselect) {
      // Deselect all currently visible suggestions
      const visibleDomains = selectableVisibleSuggestions.map((s) => s.domain.toLowerCase());
      const remaining = currentInputDomains.filter(
        (d) => !visibleDomains.includes(d.toLowerCase())
      );
      setCompetitorInputText(remaining.map((d, idx) => `${idx + 1}. ${d}`).join("\n"));
    } else {
      // Select visible suggestions up to remaining slots (max 5)
      const toAdd = selectableVisibleSuggestions
        .map((s) => s.domain)
        .filter((d) => !currentInputDomains.some((cur) => cur.toLowerCase() === d.toLowerCase()))
        .slice(0, availableSlots);

      if (toAdd.length === 0 && selectableVisibleSuggestions.length > 0) {
        setFeedbackError("Maximum of 5 competitors reached.");
        return;
      }

      const updated = [...currentInputDomains, ...toAdd];
      setCompetitorInputText(updated.map((d, idx) => `${idx + 1}. ${d}`).join("\n"));
    }
  };

  const handleAddCompetitors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCompetitorLines.length === 0 || !isWriter) return;

    setIsAddingCompetitor(true);
    try {
      for (const domain of parsedCompetitorLines) {
        await api.competitors.add(projectId, {
          domain,
          name: domain,
        });
      }
      const compRes = await api.competitors.list(projectId);
      setCompetitors(compRes.data || []);
      setCompetitorInputText("");
      setFeedbackSuccess(`Successfully added ${parsedCompetitorLines.length} competitor(s).`);
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to add competitors.");
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  const handleAddSuggestedCompetitor = async (suggestedDomain: string) => {
    if (!isWriter) return;
    try {
      await api.competitors.add(projectId, {
        domain: suggestedDomain,
        name: suggestedDomain,
      });
      const compRes = await api.competitors.list(projectId);
      setCompetitors(compRes.data || []);
      // Remove from manual input textarea if present
      setCompetitorInputText((prev) => {
        const remaining = prev
          .split("\n")
          .map((c) => c.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter((c) => c.length > 0 && c.toLowerCase() !== suggestedDomain.toLowerCase());
        return remaining.map((d, idx) => `${idx + 1}. ${d}`).join("\n");
      });
      setFeedbackSuccess(`Added competitor ${suggestedDomain}.`);
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to add competitor.");
    }
  };

  const handleDeleteCompetitor = async (compId: string) => {
    if (!isWriter) return;
    try {
      await api.competitors.delete(projectId, compId);
      setCompetitors((prev) => prev.filter((c) => c.id !== compId));
      setFeedbackSuccess("Competitor removed successfully.");
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to delete competitor.");
    }
  };

  // Member Management
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWriter || !newMemberUserId) return;

    setIsSaving(true);
    try {
      const res = await api.projects.addMember(projectId, {
        userId: newMemberUserId,
        accessLevel: newMemberAccessLevel,
      });
      if (res.data) {
        const newMember = res.data;
        setMembers((prev) => [...prev, newMember]);
        setNewMemberUserId("");
        setIsAddingMember(false);
        setFeedbackSuccess("Member assigned successfully.");
      }
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to assign member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!isWriter) return;
    try {
      await api.projects.removeMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setFeedbackSuccess("Member removed successfully.");
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to remove member.");
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!isSuperAdmin) return;
    setIsDeleting(true);
    try {
      await api.projects.update(projectId, {
        status: "Archived" as ProjectDetailDto["status"],
      });
      window.location.href = "/projects";
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Failed to delete project.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex gap-6 min-h-[600px] p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-72 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const primaryDomain = project?.primaryDomain || "acme.com";
  const protocol = project?.protocol || "https://";

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header & Close Action */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">Project Settings</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
            {primaryDomain}
          </span>
        </div>

        {/* Top-Right ✕ ESC Close Button */}
        <Link
          href={`/projects/${projectId}/rankings`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          title="Close Settings (ESC)"
        >
          <span>✕</span>
          <span className="text-[10px] uppercase font-mono tracking-wider">ESC</span>
        </Link>
      </div>

      {/* Feedback Alerts */}
      {feedbackSuccess && (
        <div className="mx-6 mt-4">
          <Alert variant="success">{feedbackSuccess}</Alert>
        </div>
      )}
      {feedbackError && (
        <div className="mx-6 mt-4">
          <Alert variant="error">{feedbackError}</Alert>
        </div>
      )}

      {/* Wizard Body: Left Rail + Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Signature SE Ranking Blue Left Navigation Rail */}
        <aside className="w-full md:w-72 bg-gradient-to-b from-[#10223d] via-[#14284b] to-[#0d1c33] text-white p-5 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-md">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300/80 mb-0.5">
                {primaryDomain}
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">Settings</h2>
            </div>

            {/* Navigation Tabs List with Active Pill Styling */}
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "general"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">⚙️</span>
                <span>General information</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("search_engines")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "search_engines"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">🔍</span>
                <span>Search engines</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("keywords")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "keywords"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">🔑</span>
                <span>Keywords</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prompts")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "prompts"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">✨</span>
                <span>Prompts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("competitors")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "competitors"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">👥</span>
                <span>Competitors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                  activeTab === "analytics" || activeTab === "integrations"
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base">📊</span>
                <span>Statistics and Analytics services</span>
              </button>

              {/* Backward-Compatible Admin & Audit Tabs */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("crawl")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === "crawl"
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  <span className="text-base">🕷️</span>
                  <span>Crawl Limits &amp; Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("members")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === "members"
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  <span className="text-base">👥</span>
                  <span>Member Assignments</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom Pinned Row: Project Status with Interactive Toggle */}
          <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="font-semibold">Project status:</span>
              <span className="text-slate-400 text-[10px] cursor-help" title="Active projects refresh rankings automatically according to schedule.">(i)</span>
            </div>

            <button
              type="button"
              onClick={() => setStatus((prev) => (prev === "Active" ? "Paused" : "Active"))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                status === "Active" ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  status === "Active" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 p-6 md:p-8 bg-white dark:bg-slate-900 overflow-y-auto">
          {/* TAB 1: General Information */}
          {activeTab === "general" && (
            <div className="max-w-3xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">General Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure primary project domain mapping, organizational group, and branding colors.
                </p>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-6">
                {/* Website URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Website URL
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
                      {protocol}
                    </span>
                    <Input
                      type="text"
                      disabled
                      value={`${protocol}${primaryDomain}`}
                      className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Domain Type Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Domain type
                  </label>
                  <select
                    value={domainType}
                    onChange={(e) => setDomainType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="*.domain/* (Recommended)">*.domain/* (Recommended — tracks all subdomains &amp; paths)</option>
                    <option value="domain/*">domain/* (tracks root domain and all paths)</option>
                    <option value="exact URL">exact URL (tracks precise landing page only)</option>
                  </select>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Enterprise US"
                    className="text-xs"
                  />
                </div>

                {/* Group Selector with Searchable Popover & "+ Create new..." */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Group
                  </label>
                  <div className="relative" ref={groupDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center justify-between cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-haspopup="listbox"
                      aria-expanded={isGroupDropdownOpen}
                    >
                      <span className={group ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-400"}>
                        {group || "No group selected"}
                      </span>
                      <span className="text-slate-400 text-xs select-none">▾</span>
                    </button>

                    {isGroupDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        {/* Search Input Box */}
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40">
                          <span className="text-slate-400 text-xs select-none">🔍</span>
                          <input
                            type="text"
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                            autoFocus
                          />
                          {groupSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setGroupSearchQuery("")}
                              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Dynamic Group List */}
                        <div className="max-h-48 overflow-y-auto p-1 text-xs space-y-0.5">
                          {/* Default Option: No group selected */}
                          <button
                            type="button"
                            onClick={() => {
                              setGroup("");
                              setIsGroupDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left cursor-pointer ${
                              !group
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span>No group selected</span>
                            {!group && <span className="font-bold">✓</span>}
                          </button>

                          {filteredGroups.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                setGroup(g);
                                setIsGroupDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left cursor-pointer ${
                                group === g
                                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                                  : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span>{g}</span>
                              {group === g && <span className="font-bold">✓</span>}
                            </button>
                          ))}

                          {filteredGroups.length === 0 && (
                            <div className="px-3 py-2 text-slate-400 text-center text-[11px]">
                              No groups found matching &quot;{groupSearchQuery}&quot;
                            </div>
                          )}
                        </div>

                        {/* Divider & Create Action */}
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                          {!isCreatingNewGroup ? (
                            <button
                              type="button"
                              onClick={() => setIsCreatingNewGroup(true)}
                              className="w-full text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <span>+ Create new...</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={newGroupNameInput}
                                onChange={(e) => setNewGroupNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const trimmed = newGroupNameInput.trim();
                                    if (trimmed) {
                                      if (!availableGroups.includes(trimmed)) {
                                        setAvailableGroups((prev) => [...prev, trimmed]);
                                      }
                                      setGroup(trimmed);
                                      setNewGroupNameInput("");
                                      setIsCreatingNewGroup(false);
                                      setIsGroupDropdownOpen(false);
                                    }
                                  } else if (e.key === "Escape") {
                                    setIsCreatingNewGroup(false);
                                    setNewGroupNameInput("");
                                  }
                                }}
                                placeholder="Enter group name..."
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = newGroupNameInput.trim();
                                  if (trimmed) {
                                    if (!availableGroups.includes(trimmed)) {
                                      setAvailableGroups((prev) => [...prev, trimmed]);
                                    }
                                    setGroup(trimmed);
                                    setNewGroupNameInput("");
                                    setIsCreatingNewGroup(false);
                                    setIsGroupDropdownOpen(false);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCreatingNewGroup(false);
                                  setNewGroupNameInput("");
                                }}
                                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Color Picker with 2D Saturation & Hue Popover */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Project color
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-block" ref={colorPickerRef}>
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen((prev) => !prev)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 transition cursor-pointer shadow-xs"
                        title="Choose project color"
                        aria-label="Choose project color"
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs shrink-0"
                          style={{ backgroundColor: projectColor }}
                        />
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                          {projectColor.toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-xs">▾</span>
                      </button>

                      {isColorPickerOpen && (
                        <div className="absolute left-0 top-full mt-2 z-40 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 w-64">
                          {/* 2D Canvas + Vertical Hue Slider */}
                          <div className="flex gap-3">
                            {/* Saturation / Value 2D Box */}
                            <div
                              ref={satValRef}
                              onPointerDown={(e) => {
                                try {
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {}
                                handleSaturationValueChange(e.clientX, e.clientY);
                              }}
                              onPointerMove={(e) => {
                                if (e.buttons > 0) handleSaturationValueChange(e.clientX, e.clientY);
                              }}
                              className="relative flex-1 h-32 rounded-xl overflow-hidden cursor-crosshair select-none shadow-inner"
                              style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
                              data-testid="color-picker-sat-val"
                            >
                              {/* White horizontal gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                              {/* Black vertical gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                              {/* Draggable pointer */}
                              <div
                                className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-1 ring-black/20"
                                style={{
                                  left: `${saturation}%`,
                                  top: `${100 - value}%`,
                                  backgroundColor: projectColor,
                                }}
                              />
                            </div>

                            {/* Vertical Hue Slider Bar */}
                            <div
                              ref={hueRef}
                              onPointerDown={(e) => {
                                try {
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {}
                                handleHueChange(e.clientY);
                              }}
                              onPointerMove={(e) => {
                                if (e.buttons > 0) handleHueChange(e.clientY);
                              }}
                              className="relative w-5 h-32 rounded-xl cursor-pointer select-none shadow-inner"
                              style={{
                                background:
                                  "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                              }}
                              data-testid="color-picker-hue-slider"
                            >
                              {/* Dual Carets Indicator */}
                              <div
                                className="absolute left-0 right-0 -translate-y-1/2 pointer-events-none flex justify-between items-center -mx-1"
                                style={{ top: `${(hue / 360) * 100}%` }}
                              >
                                <span className="text-[10px] text-slate-800 dark:text-slate-100 font-bold select-none leading-none">
                                  ▶
                                </span>
                                <span className="text-[10px] text-slate-800 dark:text-slate-100 font-bold select-none leading-none">
                                  ◀
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Swatch & Hex Input */}
                          <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <div
                              className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs shrink-0"
                              style={{ backgroundColor: projectColor }}
                              data-testid="color-picker-swatch"
                            />
                            <div className="flex-1 flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-mono">
                              <span className="text-slate-400 font-bold mr-1 select-none">#</span>
                              <input
                                type="text"
                                value={hexInputValue}
                                onChange={(e) => handleHexInputChange(e.target.value)}
                                placeholder="C90296"
                                maxLength={6}
                                className="w-full bg-transparent text-slate-900 dark:text-slate-100 uppercase font-semibold focus:outline-none"
                                aria-label="Hex color code"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Select Palette Swatches */}
                    <div className="flex items-center gap-2">
                      {["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#C90296"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setProjectColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white text-[10px] ${
                            projectColor.toUpperCase() === color.toUpperCase() ? "scale-125 ring-2 ring-offset-2 ring-blue-500" : "hover:scale-110"
                          }`}
                          title={`Select color ${color}`}
                        >
                          {projectColor.toUpperCase() === color.toUpperCase() && "✓"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backlink Report Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>Backlink report</span>
                      <span className="text-slate-400 text-[10px] cursor-help" title="Weekly inbound link auditing and lost backlink tracking">(i)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically monitor inbound backlinks, referring domains, and link acquisition velocity.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBacklinkReport((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      backlinkReport ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        backlinkReport ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Danger Zone: Delete Project */}
                <div className="pt-6 border-t border-rose-100 dark:border-rose-950/40">
                  <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                        Danger Zone: Delete Project
                      </h4>
                      <p className="text-[11px] text-rose-700/80 dark:text-rose-400 mt-0.5">
                        Once deleted, all tracked keywords, crawl history, and ranking snapshots are permanently archived.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold shrink-0"
                    >
                      Delete project
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Search Engines */}
          {activeTab === "search_engines" && (
            <div className="max-w-4xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Search Engines</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure search engines, device contexts, locations, and localized SERP feature rules.
                </p>
              </div>

              {/* Add Search Engine Card */}
              <form onSubmit={handleAddSearchEngine} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-5">
                {/* Engine Strip & Device Selector */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {["Google", "AI Overviews", "AI Mode", "ChatGPT"].map((eng) => (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => setSelectedEngineChip(eng)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                          selectedEngineChip === eng
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <SearchEngineIcon engine={eng} size={15} />
                        <span>{eng}</span>
                      </button>
                    ))}
                  </div>

                  {/* Device Toggle */}
                  <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                    {(["Desktop", "Mobile"] as const).map((dev) => (
                      <button
                        key={dev}
                        type="button"
                        onClick={() => setSelectedDevice(dev)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          selectedDevice === dev
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        }`}
                      >
                        {dev === "Desktop" ? "💻 Desktop" : "📱 Mobile"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country, Location, and Language Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={engineCountry}
                      onChange={(e) => setEngineCountry(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="United States">United States (US)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada (CA)</option>
                      <option value="Australia">Australia (AU)</option>
                      <option value="Germany">Germany (DE)</option>
                      <option value="France">France (FR)</option>
                      <option value="India">India (IN)</option>
                      <option value="Japan">Japan (JP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Location (Optional)
                    </label>
                    <Input
                      type="text"
                      value={engineLocation}
                      onChange={(e) => setEngineLocation(e.target.value)}
                      placeholder="e.g. New York, NY"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Google interface language
                    </label>
                    <select
                      value={engineLanguage}
                      onChange={(e) => setEngineLanguage(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="English (en)">English (en)</option>
                      <option value="Spanish (es)">Spanish (es)</option>
                      <option value="German (de)">German (de)</option>
                      <option value="French (fr)">French (fr)</option>
                      <option value="Japanese (ja)">Japanese (ja)</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes: Ads and Local Pack */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={trackAds}
                      onChange={(e) => setTrackAds(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Track Google Ads rankings</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeLocalPack}
                      onChange={(e) => setIncludeLocalPack(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Include Google Local Pack results</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="font-bold">
                    Add search engine
                  </Button>
                </div>
              </form>

              {/* Added Search Engines Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Search engines added to the project ({addedSearchEngines.length})
                  </h4>
                  <Input
                    type="text"
                    value={searchEnginesSearchQuery}
                    onChange={(e) => setSearchEnginesSearchQuery(e.target.value)}
                    placeholder="Search added engines..."
                    className="max-w-xs text-xs"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Search Engine</th>
                        <th className="py-2.5 px-4">Location / Language</th>
                        <th className="py-2.5 px-4">Device</th>
                        <th className="py-2.5 px-4">Features</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {addedSearchEngines
                        .filter((eng) =>
                          eng.engine.toLowerCase().includes(searchEnginesSearchQuery.toLowerCase()) ||
                          eng.country.toLowerCase().includes(searchEnginesSearchQuery.toLowerCase())
                        )
                        .map((eng) => (
                          <tr key={eng.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <SearchEngineIcon engine={eng.engine} size={16} />
                              <span>{eng.engine}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {eng.location ? `${eng.location}, ` : ""}{eng.country} • {eng.language}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{eng.device}</Badge>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-slate-500">
                              {eng.trackAds && "Ads "}
                              {eng.includeLocalPack && "• Local Pack"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="success">Active</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSearchEngine(eng.id)}
                                className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-xs font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Keywords */}
          {activeTab === "keywords" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keywords</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add and categorize target keywords with automated search intent and ranking checks.
                  </p>
                </div>

                {/* Quota Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <span>Keyword limits {keywords.length} / 750</span>
                  <span className="cursor-help text-[10px]" title="Standard enterprise package includes 750 keyword snapshots.">(i)</span>
                </div>
              </div>

              {/* Bound Search Engines Checkboxes */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-4 text-xs font-medium">
                <span className="font-bold text-slate-700 dark:text-slate-300">Bound Engines:</span>
                {addedSearchEngines.map((eng) => (
                  <label key={eng.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                    <span>{eng.engine} ({eng.device} - {eng.country})</span>
                  </label>
                ))}
              </div>

              {/* Keyword Entry Form */}
              <form onSubmit={handleAddKeywords} className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Add Keywords (One per line)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportModalView("menu");
                      setIsImportGroupDropdownOpen(false);
                      setIsHistoryFormatDropdownOpen(false);
                      setUploadedFileName(null);
                      setParsedKeywordsToImport([]);
                      setFileContainsTargetLinks(false);
                      setIsImportModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Import keywords</span>
                    <span className="text-[10px] text-slate-400">(i)</span>
                  </button>
                </div>

                {/* Numbered Textarea Container */}
                <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500">
                  <textarea
                    rows={6}
                    value={keywordText}
                    onChange={(e) => setKeywordText(e.target.value)}
                    placeholder="1. enterprise seo platform&#10;2. serp tracking tool&#10;3. keyword rank monitoring&#10;4. rank tracking software"
                    className="w-full p-3 font-mono text-xs text-slate-900 dark:text-slate-100 bg-transparent border-0 focus:outline-none resize-y"
                  />
                </div>

                {/* Controls Bar: Group Selector, Suggestions Toggle, Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-4">
                    {/* Interactive Keyword Group Dropdown */}
                    <div className="relative" ref={keywordGroupDropdownRef}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Keyword group <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Select or create a keyword cluster to organize your tracked queries.">(i)</span>:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsKeywordGroupDropdownOpen((prev) => !prev);
                            setIsCreatingKeywordNewGroup(false);
                            setKeywordGroupSearchQuery("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                          aria-haspopup="listbox"
                          aria-expanded={isKeywordGroupDropdownOpen}
                        >
                          <span>📁</span>
                          <span className="font-semibold">{keywordGroup || "General"}</span>
                          <span className="text-slate-400 text-[10px] ml-1">▾</span>
                        </button>
                      </div>

                      {isKeywordGroupDropdownOpen && (
                        <div className="absolute z-50 mt-1.5 left-0 min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in duration-100">
                          {/* Search Input Box */}
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/70 dark:bg-slate-800/60">
                            <span className="text-slate-400 text-xs">🔍</span>
                            <input
                              type="text"
                              value={keywordGroupSearchQuery}
                              onChange={(e) => setKeywordGroupSearchQuery(e.target.value)}
                              placeholder="Search groups"
                              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                              autoFocus
                            />
                            {keywordGroupSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setKeywordGroupSearchQuery("")}
                                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Dynamic Group List */}
                          <div className="max-h-48 overflow-y-auto p-1 text-xs space-y-0.5">
                            {filteredKeywordGroups.map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => {
                                  setKeywordGroup(g);
                                  setIsKeywordGroupDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left cursor-pointer ${
                                  keywordGroup === g
                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>📁</span>
                                  <span>{g}</span>
                                </div>
                                {keywordGroup === g && <span className="font-bold">✓</span>}
                              </button>
                            ))}

                            {filteredKeywordGroups.length === 0 && (
                              <div className="px-3 py-2 text-slate-400 text-center text-[11px]">
                                No groups found matching &quot;{keywordGroupSearchQuery}&quot;
                              </div>
                            )}
                          </div>

                          {/* Divider & + New group Action */}
                          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                            {!isCreatingKeywordNewGroup ? (
                              <button
                                type="button"
                                onClick={() => setIsCreatingKeywordNewGroup(true)}
                                className="w-full text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 cursor-pointer transition"
                              >
                                <span>+ New group</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={newKeywordGroupNameInput}
                                  onChange={(e) => setNewKeywordGroupNameInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const trimmed = newKeywordGroupNameInput.trim();
                                      if (trimmed) {
                                        if (!availableGroups.includes(trimmed)) {
                                          setAvailableGroups((prev) => [...prev, trimmed]);
                                        }
                                        setKeywordGroup(trimmed);
                                        setNewKeywordGroupNameInput("");
                                        setIsCreatingKeywordNewGroup(false);
                                        setIsKeywordGroupDropdownOpen(false);
                                      }
                                    } else if (e.key === "Escape") {
                                      setIsCreatingKeywordNewGroup(false);
                                      setNewKeywordGroupNameInput("");
                                    }
                                  }}
                                  placeholder="Enter group name..."
                                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const trimmed = newKeywordGroupNameInput.trim();
                                    if (trimmed) {
                                      if (!availableGroups.includes(trimmed)) {
                                        setAvailableGroups((prev) => [...prev, trimmed]);
                                      }
                                      setKeywordGroup(trimmed);
                                      setNewKeywordGroupNameInput("");
                                      setIsCreatingKeywordNewGroup(false);
                                      setIsKeywordGroupDropdownOpen(false);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCreatingKeywordNewGroup(false);
                                    setNewKeywordGroupNameInput("");
                                  }}
                                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={suggestKeywords}
                        onChange={(e) => setSuggestKeywords(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Suggest keywords</span>
                    </label>
                  </div>

                  {/* Dynamic Add Keywords Button */}
                  <Button
                    type="submit"
                    variant={parsedKeywordLines.length > 0 ? "primary" : "outline"}
                    size="sm"
                    disabled={parsedKeywordLines.length === 0 || isAddingKeywords}
                    className={`font-bold transition ${
                      parsedKeywordLines.length === 0
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isAddingKeywords
                      ? "Adding keywords..."
                      : parsedKeywordLines.length === 0
                      ? "No keywords to add"
                      : `Add ${parsedKeywordLines.length} keywords`}
                  </Button>
                </div>
              </form>

              {/* Added Keywords Accordion Table */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Keywords added to the project ({keywords.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={keywordEngineFilter}
                      onChange={(e) => setKeywordEngineFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">All Engines</option>
                      <option value="google">Google Desktop</option>
                      <option value="mobile">Google Mobile</option>
                    </select>
                    <Input
                      type="text"
                      value={keywordSearchFilter}
                      onChange={(e) => setKeywordSearchFilter(e.target.value)}
                      placeholder="Search keywords..."
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* Dynamic Group Accordions */}
                <div className="space-y-3">
                  {activeKeywordGroups.map((grpName) => {
                    const groupKws = groupedKeywords[grpName] || [];
                    const isExpanded = expandedGroups[grpName] ?? true;
                    const filteredKws = groupKws.filter((kw) =>
                      (kw.keywordText || (kw as unknown as { term?: string }).term || "")
                        .toLowerCase()
                        .includes(keywordSearchFilter.toLowerCase())
                    );

                    return (
                      <div
                        key={grpName}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
                      >
                        <div
                          onClick={() =>
                            setExpandedGroups((prev) => ({
                              ...prev,
                              [grpName]: !isExpanded,
                            }))
                          }
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-slate-800 select-none hover:bg-slate-100/80 dark:hover:bg-slate-800 transition"
                        >
                          <div className="flex items-center gap-2">
                            <span>{isExpanded ? "▼" : "▶"}</span>
                            <span>📁</span>
                            <span className="text-slate-900 dark:text-slate-100">
                              {grpName}
                              {grpName === "General" ? " [Main]" : ""} ({groupKws.length})
                            </span>
                          </div>
                          <span className="text-slate-400 font-normal text-[11px]">
                            {isExpanded ? "Click to collapse" : "Click to expand"}
                          </span>
                        </div>

                        {isExpanded && (
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                <th className="py-2 px-4">Keyword</th>
                                <th className="py-2 px-4">Group</th>
                                <th className="py-2 px-4">Target URL</th>
                                <th className="py-2 px-4">Date Added</th>
                                <th className="py-2 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredKws.map((kw) => (
                                <tr key={kw.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                    {kw.keywordText || (kw as unknown as { term?: string }).term}
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-500">
                                    <Badge variant="outline">{kw.groupName || grpName}</Badge>
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs font-mono text-[11px]">
                                    {kw.targetUrl || `https://${primaryDomain}`}
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                                    {kw.createdAt ? formatDate(kw.createdAt) : "Today"}
                                  </td>
                                  <td className="py-2.5 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteKeyword(kw.id)}
                                      className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-xs font-medium cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {groupKws.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-slate-400">
                                    No keywords added to this group yet. Use the form above to add your search terms.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                  {keywords.length === 0 && (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                      No keywords added to this project yet. Use the form above to add your primary search terms.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Prompts (AI Search Tracking) */}
          {activeTab === "prompts" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Prompts (AI Search Tracking)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track your domain presence across AI generative search answers in ChatGPT, Google Gemini, and Claude.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  <span>Prompt limits {promptsList.length} / 20</span>
                </div>
              </div>

              {/* AI Engine Chips & Mode Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {["ChatGPT", "Google Gemini", "Claude", "Perplexity"].map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => setPromptEngine(eng)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        promptEngine === eng
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPromptMode("Manually")}
                      className={`px-3 py-1 rounded-md transition ${
                        promptMode === "Manually" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Manually
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptMode("Suggestions")}
                      className={`px-3 py-1 rounded-md transition ${
                        promptMode === "Suggestions" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Suggestions
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportPromptsFormat("simple");
                      setImportPromptsFileName(null);
                      setParsedPromptsToImport([]);
                      setImportPromptsError(null);
                      setIsImportPromptsModalOpen(true);
                    }}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Import from CSV
                  </Button>
                </div>
              </div>

              {/* Numbered Prompt Textarea */}
              <form onSubmit={handleAddPrompts} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Prompts (One query per line)
                  </label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="1. What is the most reliable enterprise SEO platform?&#10;2. Best software for tracking rank fluctuations in 2026"
                    className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Prompt group:</span>
                    <select
                      value={promptGroup}
                      onChange={(e) => setPromptGroup(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs"
                    >
                      <option value="Default AI Prompts">Default AI Prompts</option>
                      <option value="Comparison Queries">Comparison Queries</option>
                      <option value="Product Reviews">Product Reviews</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={parsedPromptLines.length === 0}
                    className="font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {parsedPromptLines.length === 0 ? "No prompts to add" : `Add ${parsedPromptLines.length} prompts`}
                  </Button>
                </div>
              </form>

              {/* Added Prompts Table */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Prompts added to the project ({promptsList.length})
                </h4>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Prompt / Query</th>
                        <th className="py-2.5 px-4">AI Engine</th>
                        <th className="py-2.5 px-4">Group</th>
                        <th className="py-2.5 px-4">Frequency</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {promptsList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-sm truncate">
                            {p.query}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge variant="outline">{p.engine}</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{p.group}</td>
                          <td className="py-2.5 px-4 text-slate-500">{p.frequency}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant="success">Active</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePrompt(p.id)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Competitors */}
          {activeTab === "competitors" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Competitors</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track competitor SERP overlap, keyword gaps, and visibility benchmarks.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <span>Competitors {competitors.length} / 5</span>
                </div>
              </div>

              {/* 2-Column Grid: Left Manual Input, Right Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Numbered Competitor Input */}
                <form onSubmit={handleAddCompetitors} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <span>Competitors</span>
                      <span className="text-slate-400 font-normal text-[11px]" title="Add competitors manually or select from suggestions">(i)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={competitorInputText}
                      onChange={(e) => setCompetitorInputText(e.target.value)}
                      placeholder="1. semrush.com&#10;2. ahrefs.com&#10;3. moz.com"
                      aria-label="Competitors (i)"
                      className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Domain type
                    </label>
                    <select
                      value={competitorDomainType}
                      onChange={(e) => setCompetitorDomainType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="*.domain/* (Recommended)">*.domain/* (Recommended)</option>
                      <option value="domain/*">domain/*</option>
                      <option value="exact URL">exact URL</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={suggestCompetitors}
                        onChange={(e) => setSuggestCompetitors(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Suggest competitors</span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={parsedCompetitorLines.length === 0 || isAddingCompetitor}
                      className="font-bold"
                    >
                      {isAddingCompetitor ? "Adding..." : "Add competitors"}
                    </Button>
                  </div>
                </form>

                {/* Right: Competitor Suggestions Panel */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Competitor suggestions
                    </h4>
                    <span className="text-[10px] text-slate-400">Based on organic SERP overlap</span>
                  </div>

                  {/* Target domain selector with Country Popover */}
                  <div className="flex items-center justify-between">
                    <div className="relative" ref={competitorCountryPopoverRef}>
                      <button
                        type="button"
                        aria-label="Select country for competitor suggestions"
                        aria-haspopup="listbox"
                        aria-expanded={isCompetitorCountryPopoverOpen}
                        onClick={() => {
                          setIsCompetitorCountryPopoverOpen((prev) => !prev);
                          setCompetitorCountrySearchQuery("");
                        }}
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Target domain and search engine country"
                      >
                        <span>{project?.primaryDomain || "workcomposer.com"}</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">G</span>
                          <CountryFlag code={selectedCompetitorCountry.code} name={selectedCompetitorCountry.name} />
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isCompetitorCountryPopoverOpen ? "▴" : "▾"}
                        </span>
                      </button>

                      {/* Floating Country Popover */}
                      {isCompetitorCountryPopoverOpen && (
                        <div className="absolute left-0 mt-1.5 w-72 z-30 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md overflow-hidden animate-in fade-in duration-100">
                          {/* Search Input */}
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              autoFocus
                              value={competitorCountrySearchQuery}
                              onChange={(e) => setCompetitorCountrySearchQuery(e.target.value)}
                              placeholder="Search"
                              aria-label="Search countries"
                              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                          </div>

                          {/* Scrollable Country List */}
                          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5 text-xs">
                            {filteredCompetitorCountries.length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-400">
                                No countries found
                              </div>
                            ) : (
                              filteredCompetitorCountries.map((country) => {
                                const isSelected = selectedCompetitorCountry.code === country.code;
                                return (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompetitorCountry(country);
                                      setIsCompetitorCountryPopoverOpen(false);
                                      setCompetitorCountrySearchQuery("");
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition cursor-pointer ${
                                      isSelected
                                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <CountryFlag code={country.code} name={country.name} />
                                      <span className="truncate">{country.name}</span>
                                    </div>
                                    {isSelected && (
                                      <span className="text-blue-600 dark:text-blue-400 font-bold ml-2 shrink-0">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search input placement */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={competitorSearchQuery}
                      onChange={(e) => setCompetitorSearchQuery(e.target.value)}
                      placeholder="Search"
                      aria-label="Search competitor suggestions"
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                      🔍
                    </div>
                  </div>

                  {/* Suggestion list table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                    {/* Table headers */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          aria-label="All domains"
                          checked={isAllVisibleSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
                          }}
                          onChange={handleToggleAllVisibleSuggestions}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span>All domains</span>
                      </label>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        # of keywords
                      </span>
                    </div>

                    {/* Table rows or empty state */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                      {filteredCompetitorSuggestions.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                          No matching competitor suggestions
                        </div>
                      ) : (
                        filteredCompetitorSuggestions.map((item) => {
                          const isCheckedInInput = currentInputDomains.some(
                            (d) => d.toLowerCase() === item.domain.toLowerCase()
                          );
                          const isAlreadySaved = competitors.some(
                            (c) => c.domain.toLowerCase() === item.domain.toLowerCase()
                          );
                          const isChecked = isCheckedInInput || isAlreadySaved;

                          return (
                            <div
                              key={item.domain}
                              className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                            >
                              <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${item.domain}`}
                                  checked={isChecked}
                                  disabled={isAlreadySaved}
                                  onChange={() => handleToggleCompetitorSuggestion(item.domain)}
                                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span
                                  className={`font-medium truncate ${
                                    isChecked
                                      ? "text-blue-600 dark:text-blue-400 font-bold"
                                      : "text-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  {item.domain}
                                </span>
                                {isAlreadySaved && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                    Added
                                  </span>
                                )}
                              </label>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                                  {item.sharedKeywords.toLocaleString()}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isAlreadySaved}
                                  onClick={() => handleAddSuggestedCompetitor(item.domain)}
                                  className="text-[10px] py-0.5 px-2 font-bold h-6"
                                >
                                  {isAlreadySaved ? "Added" : "+ Add"}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Added Competitors Table */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Competitors added to the project ({competitors.length})
                </h4>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Competitor Domain</th>
                        <th className="py-2.5 px-4">Domain Type</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {competitors.map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {comp.domain}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">*.domain/*</td>
                          <td className="py-2.5 px-4">
                            <Badge variant="success">Active</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteCompetitor(comp.id)}
                              className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-xs font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {competitors.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No competitors added yet. Enter competitor domains or use the suggestions panel.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Statistics and Analytics Services */}
          {(activeTab === "integrations" || activeTab === "analytics") && (
            <div className="max-w-4xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-xs uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 mb-1">
                  Statistics and Analytics Services
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Connect statistics and analytics services
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Here you can connect popular statistics and analytics services to your account. This process might take several minutes to complete.
                </p>
              </div>

              {/* 2-Column Responsive Grid with the 3 Branded Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {/* 1. Google Analytics Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                        {/* Branded orange/yellow chart SVG */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="14" width="4" height="8" rx="1.5" fill="#F9AB00" />
                          <rect x="10" y="8" width="4" height="14" rx="1.5" fill="#F9AB00" />
                          <rect x="17" y="2" width="4" height="20" rx="1.5" fill="#E37400" />
                          <circle cx="19" cy="4" r="1.5" fill="#F9AB00" />
                        </svg>
                      </div>
                      {gaConnection.connected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Not connected</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Google Analytics
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Connect your Google Analytics 4 property to view traffic, user behavior, and conversion metrics.
                    </p>
                    {gaConnection.connected && (
                      <div className="mb-4 space-y-1">
                        {gaConnection.accountEmail && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                            Account: <span className="font-semibold">{gaConnection.accountEmail}</span>
                          </div>
                        )}
                        {gaConnection.propertyId && (
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                            ID: {gaConnection.propertyId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    {gaConnection.connected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGaMeasurementIdInput(gaConnection.propertyId || "");
                            setActiveAnalyticsModal("ga");
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer text-center"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGaConnection({ connected: false });
                            setGaMeasurementIdInput("");
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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
                          setActiveAnalyticsModal("googleOAuth");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-sm"
                      >
                        Connect Google Analytics
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Google Search Console Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                        {/* Google multicolor G icon */}
                        <svg className="w-7 h-7" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </div>
                      {gscConnection.connected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Not connected</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Google Search Console
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Track organic search performance, queries, impressions, and average positions directly from Google.
                    </p>
                    {gscConnection.connected && (
                      <div className="mb-4 space-y-1">
                        {gscConnection.accountEmail && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                            Account: <span className="font-semibold">{gscConnection.accountEmail}</span>
                          </div>
                        )}
                        {gscConnection.siteUrl && (
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                            Site: {gscConnection.siteUrl}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    {gscConnection.connected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGscSiteUrlInput(gscConnection.siteUrl || "");
                            setActiveAnalyticsModal("gsc");
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer text-center"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGscConnection({ connected: false });
                            setGscSiteUrlInput("");
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
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
                          setActiveAnalyticsModal("googleOAuth");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-sm"
                      >
                        Connect Google Search Console
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Matomo Analytics Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                        {/* Matomo M icon */}
                        <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="24" cy="24" r="24" fill="#3152A0" />
                          <path d="M11 35V20.5C11 18.5 12.5 17 14.5 17C16.5 17 18 18.5 18 20.5V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
                          <path d="M18 26C18 23 20 21 22.5 21C25 21 27 23 27 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
                          <path d="M27 26C27 23 29 21 31.5 21C34 21 36 23 36 26V35" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
                          <circle cx="14.5" cy="12" r="2.5" fill="#E45844"/>
                          <circle cx="23.5" cy="16" r="2" fill="#E45844"/>
                          <circle cx="32.5" cy="16" r="2" fill="#E45844"/>
                        </svg>
                      </div>
                      {matomoConnection.connected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Connected
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Not connected</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Matomo Analytics
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      Connect your self-hosted or cloud Matomo instance for privacy-focused web analytics.
                    </p>
                    {matomoConnection.connected && (
                      <div className="mb-4 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                        Site #{matomoConnection.siteId || "1"} ({matomoConnection.serverUrl || "matomo"})
                      </div>
                    )}
                  </div>
                  <div>
                    {matomoConnection.connected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMatomoServerUrlInput(matomoConnection.serverUrl || "");
                            setMatomoSiteIdInput(matomoConnection.siteId || "");
                            setActiveAnalyticsModal("matomo");
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer text-center"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMatomoConnection({ connected: false });
                            setMatomoServerUrlInput("");
                            setMatomoSiteIdInput("");
                            setMatomoAuthTokenInput("");
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMatomoServerUrlInput("");
                          setMatomoSiteIdInput("");
                          setActiveAnalyticsModal("matomo");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-sm"
                      >
                        Connect Matomo Analytics
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct API sync cards */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detailed Integration &amp; Property Binding
                </div>
                <GscSettingsCard projectId={projectId} />
                <Ga4SettingsCard projectId={projectId} />
              </div>
            </div>
          )}

          {/* TAB 7: Crawl Limits & Schedule */}
          {activeTab === "crawl" && (
            <div className="max-w-3xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Crawl Limits &amp; Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure depth parameters, concurrency thresholds, and crawler user agents for technical SEO audits.
                </p>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Pages Limit
                    </label>
                    <Input
                      type="number"
                      value={maxPages}
                      onChange={(e) => setMaxPages(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Crawl Depth
                    </label>
                    <Input
                      type="number"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Concurrency Threshold
                    </label>
                    <Input
                      type="number"
                      value={concurrency}
                      onChange={(e) => setConcurrency(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rate Limit Delay (ms)
                    </label>
                    <Input
                      type="number"
                      value={rateLimitMs}
                      onChange={(e) => setRateLimitMs(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Crawler User Agent
                  </label>
                  <Input
                    type="text"
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={respectRobotsTxt}
                      onChange={(e) => setRespectRobotsTxt(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Strictly adhere to robots.txt directives</span>
                  </label>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: Member Assignments */}
          {activeTab === "members" && (
            <div className="max-w-4xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Member Assignments</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assign organization members to this project with role-based read and write privileges.
                  </p>
                </div>

                {isWriter && !isAddingMember && (
                  <Button variant="primary" size="sm" onClick={() => setIsAddingMember(true)} className="font-bold">
                    Add Member
                  </Button>
                )}
              </div>

              {/* Add Member Form */}
              {isAddingMember && (
                <form onSubmit={handleAddMember} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Assign User to Project
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        User ID (GUID) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. 22222222-2222-2222-2222-222222222222"
                        value={newMemberUserId}
                        onChange={(e) => setNewMemberUserId(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Access Level
                      </label>
                      <select
                        value={newMemberAccessLevel}
                        onChange={(e) => setNewMemberAccessLevel(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                      >
                        <option value="Member">Member (Read &amp; Write)</option>
                        <option value="ReadOnly">ReadOnly (Viewer)</option>
                        <option value="Owner">Owner</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingMember(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                      {isSaving ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Member List Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Name / Email</th>
                      <th className="py-2.5 px-4">System Role</th>
                      <th className="py-2.5 px-4">Access Level</th>
                      <th className="py-2.5 px-4">Assigned Date</th>
                      {isWriter && <th className="py-2.5 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{m.fullName || m.email}</div>
                          <div className="text-slate-400 text-[11px]">{m.email}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline">{m.role || "User"}</Badge>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant={m.accessLevel === "Owner" ? "default" : m.accessLevel === "Member" ? "info" : "outline"}>
                            {String(m.accessLevel)}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {formatDate(m.assignedAt)}
                        </td>
                        {isWriter && (
                          <td className="py-2.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(m.userId)}
                              className="text-rose-600 hover:text-rose-800 text-xs"
                            >
                              Remove
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No team members explicitly assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-10">
        <Link
          href={`/projects/${projectId}/rankings`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
        >
          &lt; BACK TO PROJECT
        </Link>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isSaving || !isWriter}
          onClick={() => handleSaveGeneral()}
          className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
        >
          {isSaving ? "APPLYING..." : "APPLY"}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>Confirm Project Deletion</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete project <strong className="text-slate-900 dark:text-slate-100">{name || primaryDomain}</strong>? All historical rankings, keyword snapshots, and crawl reports will be archived.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteProject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Keywords Multi-View Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Import keywords
                </h3>
                {importModalView === "menu" && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Add keywords manually or copy and paste them below from a text editor.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Error banner if file parsing failed */}
            {importError && (
              <Alert variant="error">{importError}</Alert>
            )}

            {/* VIEW 1: Main Menu View */}
            {importModalView === "menu" && (
              <div className="space-y-3 pt-1">
                {/* 1. Google Analytics Option */}
                <button
                  type="button"
                  onClick={() => setImportModalView("googleAnalytics")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      📊
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        Google analytics
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Import top queries driving organic sessions and landing pages
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-base transition">
                    ›
                  </span>
                </button>

                {/* 2. CSV File Option */}
                <button
                  type="button"
                  onClick={() => setImportModalView("csvFile")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                      📄
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        CSV file
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Upload a .csv, .txt, or spreadsheet with target search terms
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-base transition">
                    ›
                  </span>
                </button>

                {/* 3. CSV/XLS with positions history Option */}
                <button
                  type="button"
                  onClick={() => setImportModalView("csvHistory")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      📈
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        CSV/XLS with positions history
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Import keyword ranking records exported from SE Ranking or Excel
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold text-base transition">
                    ›
                  </span>
                </button>
              </div>
            )}

            {/* VIEW 2: CSV File Import Sub-View */}
            {importModalView === "csvFile" && (
              <div className="space-y-4">
                {/* Format Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Format
                  </label>
                  <select
                    value={importCsvFormat}
                    onChange={(e) => setImportCsvFormat(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CSV / Text">CSV / Text</option>
                    <option value="Plain Text (.txt)">Plain Text (.txt)</option>
                  </select>
                </div>

                {/* Helper text */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Make an import file in utf-8 encoding. You can load CSV file, exported from Excel, or just a plain text file, where each new keyword is placed on new line.
                </div>

                {/* File contains target links checkbox */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fileContainsTargetLinks}
                    onChange={(e) => {
                      setFileContainsTargetLinks(e.target.checked);
                      if (fileInputRef.current?.files?.[0]) {
                        handleFileSelected(fileInputRef.current.files[0], e.target.checked);
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>File contains target links</span>
                </label>

                {/* Search Engine & Import to group Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Search engine
                    </label>
                    <select
                      value={importSearchEngine}
                      onChange={(e) => setImportSearchEngine(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">Select search engines ▾</option>
                      <option value="google_desktop">Google (Desktop)</option>
                      <option value="google_mobile">Google (Mobile)</option>
                    </select>
                  </div>

                  <div className="relative" ref={importGroupDropdownRef}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Import to group
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportGroupDropdownOpen((prev) => !prev);
                        setIsCreatingImportNewGroup(false);
                        setImportGroupSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer"
                      aria-haspopup="listbox"
                      aria-expanded={isImportGroupDropdownOpen}
                    >
                      <span className="truncate">{importTargetGroup || "General"}</span>
                      <span className="text-slate-400 text-[10px] ml-1.5">▾</span>
                    </button>

                    {isImportGroupDropdownOpen && (
                      <div className="absolute z-50 mt-1 left-0 right-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in duration-100 min-w-[200px]">
                        {/* Search Input Box */}
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/70 dark:bg-slate-800/60">
                          <span className="text-slate-400 text-xs">🔍</span>
                          <input
                            type="text"
                            value={importGroupSearchQuery}
                            onChange={(e) => setImportGroupSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                          autoFocus
                        />
                        {importGroupSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setImportGroupSearchQuery("")}
                            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Dynamic Group List */}
                      <div className="max-h-48 overflow-y-auto p-1 text-xs space-y-0.5">
                        {filteredImportGroups.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setImportTargetGroup(g);
                              setIsImportGroupDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left cursor-pointer ${
                              importTargetGroup === g
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                                : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>📁</span>
                              <span>{g}</span>
                            </div>
                            {importTargetGroup === g && <span className="font-bold">✓</span>}
                          </button>
                        ))}
                        {filteredImportGroups.length === 0 && (
                          <div className="px-3 py-2 text-slate-400 text-center text-[11px]">
                            No groups found matching &quot;{importGroupSearchQuery}&quot;
                          </div>
                        )}
                      </div>

                      {/* Divider & + New group Action */}
                      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        {!isCreatingImportNewGroup ? (
                          <button
                            type="button"
                            onClick={() => setIsCreatingImportNewGroup(true)}
                            className="w-full text-left text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <span>+ New group</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newImportGroupNameInput}
                              onChange={(e) => setNewImportGroupNameInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = newImportGroupNameInput.trim();
                                  if (trimmed) {
                                    if (!availableGroups.includes(trimmed)) {
                                      setAvailableGroups((prev) => [...prev, trimmed]);
                                    }
                                    setImportTargetGroup(trimmed);
                                    setNewImportGroupNameInput("");
                                    setIsCreatingImportNewGroup(false);
                                    setIsImportGroupDropdownOpen(false);
                                  }
                                } else if (e.key === "Escape") {
                                  setIsCreatingImportNewGroup(false);
                                  setNewImportGroupNameInput("");
                                }
                              }}
                              placeholder="Enter group name..."
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = newImportGroupNameInput.trim();
                                if (trimmed) {
                                  if (!availableGroups.includes(trimmed)) {
                                    setAvailableGroups((prev) => [...prev, trimmed]);
                                  }
                                  setImportTargetGroup(trimmed);
                                  setNewImportGroupNameInput("");
                                  setIsCreatingImportNewGroup(false);
                                  setIsImportGroupDropdownOpen(false);
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingImportNewGroup(false);
                                setNewImportGroupNameInput("");
                              }}
                              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox: check rankings for target URL only */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkRankingsTargetUrlOnly}
                  onChange={(e) => setCheckRankingsTargetUrlOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Check rankings for target URL only</span>
              </label>

              {/* File Drag and Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file, fileContainsTargetLinks);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDraggingFile
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/30 dark:bg-slate-800/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file, fileContainsTargetLinks);
                  }}
                />
                <div className="space-y-1">
                  <span className="text-2xl">📄</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {uploadedFileName ? uploadedFileName : "Choose file or drag here"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {parsedKeywordsToImport.length > 0
                      ? `${parsedKeywordsToImport.length} keywords parsed`
                      : "CSV or TXT format (max 5 MB)"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalView("menu")}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  &lt; Back to options
                </button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={parsedKeywordsToImport.length === 0}
                    onClick={handleExecuteImport}
                    className="font-bold"
                  >
                    Import {parsedKeywordsToImport.length > 0 ? `(${parsedKeywordsToImport.length})` : ""}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: CSV/XLS with positions history Sub-View */}
          {importModalView === "csvHistory" && (
            <div className="space-y-4">
              <div className="relative" ref={historyFormatDropdownRef}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  History File Format
                </label>
                <button
                  type="button"
                  onClick={() => setIsHistoryFormatDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
                >
                  <span>{importHistoryFormat}</span>
                  <span className="text-slate-400 text-xs">▾</span>
                </button>
                {isHistoryFormatDropdownOpen && (
                  <div className="absolute z-50 mt-1 left-0 right-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-1 text-xs">
                    {HISTORY_IMPORT_FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setImportHistoryFormat(fmt);
                          setIsHistoryFormatDropdownOpen(false);
                          if (fileInputRef.current?.files?.[0]) {
                            handleFileSelected(fileInputRef.current.files[0], fileContainsTargetLinks, fmt);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition ${
                          importHistoryFormat === fmt
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold"
                            : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Import keyword ranking records and historical tracking positions directly from your previous rank tracking platform.
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file, fileContainsTargetLinks, importHistoryFormat);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDraggingFile
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/30 dark:bg-slate-800/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file, fileContainsTargetLinks, importHistoryFormat);
                  }}
                />
                <div className="space-y-1">
                  <span className="text-2xl">📈</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {uploadedFileName ? uploadedFileName : "Choose history file or drag here"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {parsedKeywordsToImport.length > 0
                      ? `${parsedKeywordsToImport.length} keywords parsed`
                      : "CSV or XLSX from supported tools"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalView("menu")}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  &lt; Back to options
                </button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={parsedKeywordsToImport.length === 0}
                    onClick={handleExecuteImport}
                    className="font-bold"
                  >
                    Import History {parsedKeywordsToImport.length > 0 ? `(${parsedKeywordsToImport.length})` : ""}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: Google Analytics Import Sub-View */}
          {importModalView === "googleAnalytics" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Google Analytics Keyword Sync
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Import organic queries and search performance keywords directly from your connected Google Analytics property.
                </p>
              </div>

              {gaConnection.connected ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                  Connected to GA4 ({gaConnection.accountEmail || gaConnection.propertyId})
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  Google Analytics is not connected yet. You can connect your account in the Statistics &amp; Analytics tab.
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalView("menu")}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  &lt; Back to options
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Import Prompts Modal */}
    {isImportPromptsModalOpen && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Import Prompts from File
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a CSV or TXT file containing AI search queries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsImportPromptsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {importPromptsError && (
            <Alert variant="error">{importPromptsError}</Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  AI Engine
                </label>
                <select
                  value={importPromptsEngine}
                  onChange={(e) => setImportPromptsEngine(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Google Gemini">Google Gemini</option>
                  <option value="Claude">Claude</option>
                  <option value="Perplexity">Perplexity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  File Format
                </label>
                <select
                  value={importPromptsFormat}
                  onChange={(e) => setImportPromptsFormat(e.target.value as "simple" | "withGroups")}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="simple">Simple (Query per line)</option>
                  <option value="withGroups">With Groups (Query, Group)</option>
                </select>
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPromptsFile(true);
              }}
              onDragLeave={() => setIsDraggingPromptsFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPromptsFile(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handlePromptsFileSelected(file, importPromptsFormat);
              }}
              onClick={() => promptsFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                isDraggingPromptsFile
                  ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/30 dark:bg-slate-800/20"
              }`}
            >
              <input
                type="file"
                ref={promptsFileInputRef}
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePromptsFileSelected(file, importPromptsFormat);
                }}
              />
              <div className="space-y-1">
                <span className="text-2xl">✨</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {importPromptsFileName ? importPromptsFileName : "Choose prompt file or drag here"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {parsedPromptsToImport.length > 0
                    ? `${parsedPromptsToImport.length} prompts parsed`
                    : "CSV or TXT format (max 20 prompts)"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImportPromptsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={parsedPromptsToImport.length === 0}
                onClick={handleExecuteImportPrompts}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Import Prompts {parsedPromptsToImport.length > 0 ? `(${parsedPromptsToImport.length})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Analytics Configuration / OAuth Modals */}
    {activeAnalyticsModal === "googleOAuth" && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <span>Connect Google Account</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select an existing Google profile or enter a custom account email.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAnalyticsModal(null)}
              className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {googleAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectGoogleAccount(acc.email)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition text-left cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full ${acc.color} text-white flex items-center justify-center text-xs font-bold`}>
                  {acc.avatarLetter}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{acc.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                </div>
                {acc.signedOut && (
                  <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-normal mr-1">
                    Signed out
                  </span>
                )}
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Select ›</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {!isUsingCustomGoogleAccount ? (
              <button
                type="button"
                onClick={() => setIsUsingCustomGoogleAccount(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Use another account
              </button>
            ) : (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="account@gmail.com"
                  value={customGoogleEmailInput}
                  onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                  className="text-xs"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUsingCustomGoogleAccount(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!customGoogleEmailInput.includes("@")}
                    onClick={() => handleSelectGoogleAccount(customGoogleEmailInput)}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {activeAnalyticsModal === "ga" && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Configure Google Analytics 4
          </h3>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Measurement ID / Property ID
            </label>
            <Input
              type="text"
              value={gaMeasurementIdInput}
              onChange={(e) => setGaMeasurementIdInput(e.target.value)}
              placeholder="G-XXXXXXX or 123456789"
              className="text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveAnalyticsModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setGaConnection((prev) => ({
                  ...prev,
                  connected: true,
                  propertyId: gaMeasurementIdInput,
                }));
                setActiveAnalyticsModal(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    )}

    {activeAnalyticsModal === "gsc" && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Configure Google Search Console
          </h3>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Site URL / Domain Property
            </label>
            <Input
              type="text"
              value={gscSiteUrlInput}
              onChange={(e) => setGscSiteUrlInput(e.target.value)}
              placeholder="https://example.com/ or sc-domain:example.com"
              className="text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveAnalyticsModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setGscConnection((prev) => ({
                  ...prev,
                  connected: true,
                  siteUrl: gscSiteUrlInput,
                }));
                setActiveAnalyticsModal(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    )}

    {activeAnalyticsModal === "matomo" && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Configure Matomo Analytics
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Server URL
              </label>
              <Input
                type="text"
                value={matomoServerUrlInput}
                onChange={(e) => setMatomoServerUrlInput(e.target.value)}
                placeholder="https://analytics.example.com"
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Site ID
              </label>
              <Input
                type="text"
                value={matomoSiteIdInput}
                onChange={(e) => setMatomoSiteIdInput(e.target.value)}
                placeholder="1"
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Auth Token
              </label>
              <Input
                type="password"
                value={matomoAuthTokenInput}
                onChange={(e) => setMatomoAuthTokenInput(e.target.value)}
                placeholder="token_auth"
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveAnalyticsModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setMatomoConnection({
                  connected: true,
                  serverUrl: matomoServerUrlInput,
                  siteId: matomoSiteIdInput,
                  authToken: matomoAuthTokenInput,
                });
                setActiveAnalyticsModal(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default ProjectSettingsWizard;
