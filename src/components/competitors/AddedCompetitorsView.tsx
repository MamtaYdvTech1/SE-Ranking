"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompetitorDto } from "@/lib/types";
import { GuestLinkModal } from "./GuestLinkModal";
import { CalendarYearDropdown } from "./CalendarYearDropdown";

export interface AddedCompetitorsViewProps {
  projectId: string;
  projectDomain?: string;
  competitors?: CompetitorDto[];
  canEdit?: boolean;
  onAddCompetitor?: () => void;
  onEditCompetitor?: (comp: CompetitorDto) => void;
  onDeleteCompetitor?: (comp: CompetitorDto) => void;
  onDataStudio?: () => void;
  onExport?: (format: "xlsx" | "csv") => void;
}

export type GraphMetric =
  | "AVERAGE POSITION"
  | "TRAFFIC FORECAST"
  | "SEARCH VISIBILITY"
  | "% IN TOP 10"
  | "COMPETITOR DISTRIBUTION";

export type PeriodFilter = "CURRENT" | "7D" | "1M" | "3M" | "6M";

const CAL_FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const CAL_MONTH_ABBRS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDisplayDate(d: Date): string {
  const day = d.getDate();
  const m = CAL_MONTH_ABBRS[d.getMonth()];
  const y = d.getFullYear();
  return `${day} ${m} ${y}`;
}

export type PositionFilter =
  | "ALL"
  | "TOP 1"
  | "TOP 3"
  | "TOP 5"
  | "TOP 10"
  | "TOP 30"
  | ">100";

export type TableViewMode = "standard" | "compact" | "cards";

export interface TableColumnDef {
  id: string;
  label: string;
  canHide?: boolean;
  category?: "primary" | "metric" | "competitor";
  faviconUrl?: string;
}

export interface KeywordRankItem {
  position?: number;
  change?: number;
}

export interface KeywordRow {
  id: string;
  keyword: string;
  searchVolume: number;
  searchVolumeDisplay: string;
  colorStripe: string;
  group?: string;
  tags?: string[];
  contentScore?: number;
  cpc?: string;
  competition?: number;
  serpFeatures?: string[];
  ranks: Record<string, KeywordRankItem | undefined>;
}

// ---------------------------------------------------------------------------
// 1. WORKCOMPOSER DATASET (FOR BACKWARD-COMPATIBILITY / TEST ENVIRONMENT)
// ---------------------------------------------------------------------------
export const COMPOSER_AVAILABLE_COLUMNS: TableColumnDef[] = [
  { id: "keywords", label: "Search engines & keywords", canHide: false, category: "primary" },
  { id: "searchVolume", label: "Search vol.", canHide: true, category: "metric" },
  { id: "insightful", label: "INSIGHTFUL.IO", canHide: true, category: "competitor" },
  { id: "timedoctor", label: "TIMEDOCTOR.COM", canHide: true, category: "competitor" },
  { id: "hubstaff", label: "HUBSTAFF.COM", canHide: true, category: "competitor" },
  { id: "clockify", label: "CLOCKIFY.ME", canHide: true, category: "competitor" },
  { id: "activtrak", label: "ACTIVTRAK.COM", canHide: true, category: "competitor" },
  { id: "group", label: "Group", canHide: true, category: "metric" },
  { id: "tags", label: "Tags", canHide: true, category: "metric" },
  { id: "serpFeatures", label: "SERP features", canHide: true, category: "metric" },
  { id: "contentScore", label: "Content Score", canHide: true, category: "metric" },
  { id: "cpc", label: "CPC", canHide: true, category: "metric" },
  { id: "competition", label: "Competition", canHide: true, category: "metric" },
];

export const COMPOSER_DEFAULT_ORDER: string[] = [
  "keywords",
  "searchVolume",
  "insightful",
  "timedoctor",
  "hubstaff",
  "clockify",
  "activtrak",
  "group",
  "tags",
  "serpFeatures",
  "contentScore",
  "cpc",
  "competition",
];

export const COMPOSER_DEFAULT_VISIBLE: string[] = [
  "keywords",
  "searchVolume",
  "insightful",
  "timedoctor",
  "hubstaff",
  "clockify",
  "activtrak",
];

export const COMPOSER_COMPARISON_KEYWORDS: KeywordRow[] = [
  {
    id: "kw-1",
    keyword: "work composer download",
    searchVolume: 210,
    searchVolumeDisplay: "210",
    colorStripe: "border-l-amber-400",
    group: "Brand",
    tags: ["core", "branded"],
    ranks: {
      clockify: { position: 18, change: -2 },
    },
  },
  {
    id: "kw-2",
    keyword: "work composer",
    searchVolume: 590,
    searchVolumeDisplay: "590",
    colorStripe: "border-l-blue-400",
    group: "Brand",
    tags: ["core", "branded"],
    ranks: {},
  },
  {
    id: "kw-3",
    keyword: "work composer hack",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "border-l-emerald-400",
    group: "Brand",
    tags: ["high-intent"],
    ranks: {},
  },
  {
    id: "kw-4",
    keyword: "workpuls idle time",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "border-l-purple-400",
    group: "Competitor",
    tags: ["idle-time"],
    ranks: {
      insightful: { position: 1 },
      hubstaff: { position: 15, change: 1 },
    },
  },
  {
    id: "kw-5",
    keyword: "idle time tracker",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "border-l-pink-400",
    group: "Features",
    tags: ["idle-time", "tracking"],
    ranks: {
      insightful: { position: 12, change: 7 },
      hubstaff: { position: 8 },
      clockify: { position: 35, change: -2 },
    },
  },
  {
    id: "kw-6",
    keyword: "idle time tracking",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "border-l-cyan-400",
    group: "Features",
    tags: ["idle-time", "tracking"],
    ranks: {
      insightful: { position: 11, change: -6 },
      timedoctor: { position: 41, change: -1 },
      hubstaff: { position: 7 },
    },
  },
  {
    id: "kw-7",
    keyword: "idle time tracking software",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "border-l-indigo-400",
    group: "Features",
    tags: ["software", "high-intent"],
    ranks: {
      hubstaff: { position: 4 },
    },
  },
  {
    id: "kw-8",
    keyword: "composer download",
    searchVolume: 1900,
    searchVolumeDisplay: "1.9K",
    colorStripe: "border-l-amber-500",
    group: "Brand",
    tags: ["download"],
    ranks: {},
  },
  {
    id: "kw-9",
    keyword: "working track",
    searchVolume: 480,
    searchVolumeDisplay: "480",
    colorStripe: "border-l-emerald-500",
    group: "Generic",
    tags: ["tracking"],
    ranks: {},
  },
  {
    id: "kw-10",
    keyword: "screenshot time tracking",
    searchVolume: 110,
    searchVolumeDisplay: "110",
    colorStripe: "border-l-blue-500",
    group: "Features",
    tags: ["tracking", "screenshot"],
    ranks: {
      hubstaff: { position: 11, change: 3 },
      clockify: { position: 39, change: 1 },
    },
  },
];

// ---------------------------------------------------------------------------
// 2. REAL JIO DATASET (MATCHING SE RANKING DUMP AND LIVE ENVIRONMENT)
// ---------------------------------------------------------------------------
export const JIO_AVAILABLE_COLUMNS: TableColumnDef[] = [
  { id: "keywords", label: "Search engines & keywords", canHide: false, category: "primary" },
  { id: "searchVolume", label: "Search vol.", canHide: true, category: "metric" },
  { id: "paytm", label: "Paytm.com", canHide: true, category: "competitor", faviconUrl: "https://www.google.dk/s2/favicons?domain=https://paytm.com" },
  { id: "airtel", label: "airtel.in", canHide: true, category: "competitor", faviconUrl: "https://www.google.co.uk/s2/favicons?domain=https://airtel.in" },
  { id: "bsnl", label: "bsnl.co.in", canHide: true, category: "competitor", faviconUrl: "https://www.google.co.uk/s2/favicons?domain=https://bsnl.co.in" },
  { id: "mobikwik", label: "mobikwik.com", canHide: true, category: "competitor", faviconUrl: "https://www.google.at/s2/favicons?domain=https://mobikwik.com" },
  { id: "phonepe", label: "phonepe.com", canHide: true, category: "competitor", faviconUrl: "https://www.google.dk/s2/favicons?domain=https://phonepe.com" },
  { id: "myjio", label: "myjio.com", canHide: true, category: "competitor", faviconUrl: "https://www.google.com/s2/favicons?domain=https://myjio.com" },
  { id: "group", label: "Group", canHide: true, category: "metric" },
  { id: "tags", label: "Tags", canHide: true, category: "metric" },
  { id: "serpFeatures", label: "SERP features", canHide: true, category: "metric" },
  { id: "contentScore", label: "Content Score", canHide: true, category: "metric" },
  { id: "cpc", label: "CPC", canHide: true, category: "metric" },
  { id: "competition", label: "Competition", canHide: true, category: "metric" },
];

export const JIO_DEFAULT_ORDER: string[] = [
  "keywords",
  "searchVolume",
  "paytm",
  "airtel",
  "bsnl",
  "mobikwik",
  "phonepe",
  "myjio",
  "group",
  "tags",
  "serpFeatures",
  "contentScore",
  "cpc",
  "competition",
];

export const JIO_DEFAULT_VISIBLE: string[] = [
  "keywords",
  "searchVolume",
  "paytm",
  "airtel",
  "bsnl",
  "mobikwik",
  "phonepe",
  "myjio",
];

export const JIO_REAL_KEYWORDS: KeywordRow[] = [
  {
    id: "jio-kw-1",
    keyword: "myjio",
    searchVolume: 246000,
    searchVolumeDisplay: "246K",
    colorStripe: "#972689",
    group: "Brand",
    tags: ["core", "brand"],
    ranks: {
      paytm: undefined,
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-2",
    keyword: "myjio app",
    searchVolume: 60500,
    searchVolumeDisplay: "60.5K",
    colorStripe: "#143828",
    group: "Brand",
    tags: ["brand", "app"],
    ranks: {
      paytm: undefined,
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-3",
    keyword: "myjio login",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "#a31326",
    group: "Brand",
    tags: ["brand", "login"],
    ranks: {
      paytm: { position: 22 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-4",
    keyword: "myjio website",
    searchVolume: 10,
    searchVolumeDisplay: "10",
    colorStripe: "#943936",
    group: "Brand",
    tags: ["brand", "web"],
    ranks: {
      paytm: undefined,
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-5",
    keyword: "myjio account",
    searchVolume: 110,
    searchVolumeDisplay: "110",
    colorStripe: "#382889",
    group: "Brand",
    tags: ["brand", "account"],
    ranks: {
      paytm: { position: 26 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-6",
    keyword: "jio login",
    searchVolume: 201000,
    searchVolumeDisplay: "201K",
    colorStripe: "#819672",
    group: "Brand",
    tags: ["brand", "login"],
    ranks: {
      paytm: undefined,
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-7",
    keyword: "jio recharge",
    searchVolume: 1220000,
    searchVolumeDisplay: "1.22M",
    colorStripe: "#823428",
    group: "Services",
    tags: ["recharge", "high-volume"],
    ranks: {
      paytm: { position: 8 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-8",
    keyword: "jio recharge online",
    searchVolume: 47500,
    searchVolumeDisplay: "47.5K",
    colorStripe: "#0680a1",
    group: "Services",
    tags: ["recharge", "online"],
    ranks: {
      paytm: { position: 5 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-9",
    keyword: "jio mobile recharge",
    searchVolume: 49500,
    searchVolumeDisplay: "49.5K",
    colorStripe: "#225193",
    group: "Services",
    tags: ["recharge", "mobile"],
    ranks: {
      paytm: { position: 5 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
  {
    id: "jio-kw-10",
    keyword: "jio prepaid recharge",
    searchVolume: 40500,
    searchVolumeDisplay: "40.5K",
    colorStripe: "#947a88",
    group: "Services",
    tags: ["recharge", "prepaid"],
    ranks: {
      paytm: { position: 9, change: 3 },
      airtel: undefined,
      bsnl: undefined,
      mobikwik: undefined,
      phonepe: undefined,
      myjio: undefined,
    },
  },
];

export const JIO_REAL_COMPETITORS: CompetitorDto[] = [
  {
    id: "comp-jio-paytm",
    name: "Paytm.com",
    domain: "Paytm.com",
    notes: "Main payments & mobile recharge competitor",
    lastCheckedAt: "2026-10-12T10:00:00Z",
  },
  {
    id: "comp-jio-airtel",
    name: "airtel.in",
    domain: "airtel.in",
    notes: "Primary telecom rival in India",
    lastCheckedAt: "2026-10-12T10:00:00Z",
  },
  {
    id: "comp-jio-bsnl",
    name: "bsnl.co.in",
    domain: "bsnl.co.in",
    notes: "State-owned telecom provider",
    lastCheckedAt: "2026-10-12T10:00:00Z",
  },
  {
    id: "comp-jio-mobikwik",
    name: "mobikwik.com",
    domain: "mobikwik.com",
    notes: "Digital wallet and bill payments platform",
    lastCheckedAt: "2026-10-12T10:00:00Z",
  },
  {
    id: "comp-jio-phonepe",
    name: "phonepe.com",
    domain: "phonepe.com",
    notes: "Leading UPI and digital payments app in India",
    lastCheckedAt: "2026-10-12T10:00:00Z",
  },
];

// Backwards-compatible exports for existing test references
export const AVAILABLE_TABLE_COLUMNS: TableColumnDef[] = JIO_AVAILABLE_COLUMNS;
export const DEFAULT_COLUMN_ORDER: string[] = JIO_DEFAULT_ORDER;
export const DEFAULT_VISIBLE_COLUMNS: string[] = JIO_DEFAULT_VISIBLE;
export const ADDED_COMPARISON_KEYWORDS: KeywordRow[] = JIO_REAL_KEYWORDS;

export const ALL_KEYWORD_GROUPS = ["Brand", "Features", "Competitor", "Generic", "Services"];
export const ALL_KEYWORD_TAGS = [
  "core",
  "branded",
  "brand",
  "app",
  "login",
  "web",
  "account",
  "recharge",
  "high-volume",
  "online",
  "mobile",
  "prepaid",
  "high-intent",
  "idle-time",
  "tracking",
  "software",
  "download",
  "screenshot",
];

export function getProjectCompetitorData(projectDomain: string, competitors: CompetitorDto[]) {
  const clean = projectDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').toLowerCase();

  // 1. If it's explicitly workcomposer.com and has hubstaff/timedoctor, use COMPOSER dataset
  if (
    clean === "workcomposer.com" &&
    Boolean(competitors && competitors.some((c) => c.domain === "hubstaff.com" || c.domain === "timedoctor.com"))
  ) {
    return {
      isWorkComposerTest: true,
      activeColumns: COMPOSER_AVAILABLE_COLUMNS,
      activeDefaultOrder: COMPOSER_DEFAULT_ORDER,
      activeDefaultVisible: COMPOSER_DEFAULT_VISIBLE,
      activeComparisonKeywords: COMPOSER_COMPARISON_KEYWORDS,
      activeCompetitorsList: competitors,
    };
  }

  // 2. If it's explicitly myjio.com, use JIO dataset
  if (clean === "myjio.com") {
    return {
      isWorkComposerTest: false,
      activeColumns: JIO_AVAILABLE_COLUMNS,
      activeDefaultOrder: JIO_DEFAULT_ORDER,
      activeDefaultVisible: JIO_DEFAULT_VISIBLE,
      activeComparisonKeywords: JIO_REAL_KEYWORDS,
      activeCompetitorsList: competitors.length > 0 ? competitors : JIO_REAL_COMPETITORS,
    };
  }

  // 3. For any other project (e.g. flipkart.com or newly added domains):
  const brand = clean.split('.')[0];
  const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

  const rivals: CompetitorDto[] = competitors.length > 0 ? competitors : (
    clean.includes('flipkart') ? [
      { id: "comp-fk-amazon", name: "amazon.in", domain: "amazon.in", notes: "Primary ecommerce competitor", lastCheckedAt: "2026-10-12T10:00:00Z" },
      { id: "comp-fk-meesho", name: "meesho.com", domain: "meesho.com", notes: "Social commerce & value retail", lastCheckedAt: "2026-10-12T10:00:00Z" },
      { id: "comp-fk-myntra", name: "myntra.com", domain: "myntra.com", notes: "Fashion & lifestyle ecommerce", lastCheckedAt: "2026-10-12T10:00:00Z" },
      { id: "comp-fk-ajio", name: "ajio.com", domain: "ajio.com", notes: "Apparel & online shopping", lastCheckedAt: "2026-10-12T10:00:00Z" },
      { id: "comp-fk-snapdeal", name: "snapdeal.com", domain: "snapdeal.com", notes: "Value marketplace rival", lastCheckedAt: "2026-10-12T10:00:00Z" },
    ] : []
  );

  const rivalCols: TableColumnDef[] = rivals.map((r) => {
    const safeId = r.domain.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return {
      id: safeId,
      label: r.domain,
      canHide: true,
      category: "competitor" as const,
      faviconUrl: `https://www.google.com/s2/favicons?domain=https://${r.domain}`,
    };
  });

  const cols: TableColumnDef[] = [
    { id: "keywords", label: "Search engines & keywords", canHide: false, category: "primary" },
    { id: "searchVolume", label: "Search vol.", canHide: true, category: "metric" },
    ...rivalCols,
    { id: "group", label: "Group", canHide: true, category: "metric" },
    { id: "tags", label: "Tags", canHide: true, category: "metric" },
    { id: "serpFeatures", label: "SERP features", canHide: true, category: "metric" },
    { id: "contentScore", label: "Content Score", canHide: true, category: "metric" },
    { id: "cpc", label: "CPC", canHide: true, category: "metric" },
    { id: "competition", label: "Competition", canHide: true, category: "metric" },
  ];

  const defaultOrder = cols.map((c) => c.id);
  const defaultVisible = ["keywords", "searchVolume", ...rivalCols.map((c) => c.id)];

  const domainKeywords = clean.includes('flipkart') ? [
    { id: "fk-kw-1", keyword: "flipkart online shopping", searchVolume: 1240000, searchVolumeDisplay: "1.24M", colorStripe: "#2874f0", group: "Brand", tags: ["brand", "core"], ranks: { amazon_in: { position: 2 }, meesho_com: { position: 8 } } },
    { id: "fk-kw-2", keyword: "flipkart big billion days", searchVolume: 673000, searchVolumeDisplay: "673K", colorStripe: "#f59e0b", group: "Brand", tags: ["brand", "sale"], ranks: { amazon_in: { position: 5 } } },
    { id: "fk-kw-3", keyword: "flipkart login", searchVolume: 450000, searchVolumeDisplay: "450K", colorStripe: "#10b981", group: "Brand", tags: ["brand", "login"], ranks: {} },
    { id: "fk-kw-4", keyword: "flipkart mobile offers", searchVolume: 165000, searchVolumeDisplay: "165K", colorStripe: "#6366f1", group: "Deals", tags: ["deals", "mobile"], ranks: { amazon_in: { position: 3 } } },
    { id: "fk-kw-5", keyword: "online shopping india", searchVolume: 246000, searchVolumeDisplay: "246K", colorStripe: "#ec4899", group: "Generic", tags: ["ecommerce"], ranks: { amazon_in: { position: 1 }, meesho_com: { position: 4 } } },
    { id: "fk-kw-6", keyword: "buy smartphones online", searchVolume: 90500, searchVolumeDisplay: "90.5K", colorStripe: "#8b5cf6", group: "Electronics", tags: ["smartphones"], ranks: { amazon_in: { position: 2 } } },
    { id: "fk-kw-7", keyword: "fashion clothes online sale", searchVolume: 74200, searchVolumeDisplay: "74.2K", colorStripe: "#14b8a6", group: "Fashion", tags: ["fashion"], ranks: { myntra_com: { position: 1 }, ajio_com: { position: 3 } } },
    { id: "fk-kw-8", keyword: "flipkart customer care number", searchVolume: 110000, searchVolumeDisplay: "110K", colorStripe: "#ef4444", group: "Support", tags: ["support"], ranks: {} },
  ] : [
    { id: `kw-${brand}-1`, keyword: `${capitalizedBrand} official website`, searchVolume: 14200, searchVolumeDisplay: "14.2K", colorStripe: "#2563EB", group: "Brand", tags: ["brand", "core"], ranks: {} },
    { id: `kw-${brand}-2`, keyword: `${capitalizedBrand} login online`, searchVolume: 8900, searchVolumeDisplay: "8.9K", colorStripe: "#10b981", group: "Brand", tags: ["brand", "login"], ranks: {} },
    { id: `kw-${brand}-3`, keyword: `best ${capitalizedBrand} alternatives 2026`, searchVolume: 4200, searchVolumeDisplay: "4.2K", colorStripe: "#f59e0b", group: "Competitor", tags: ["competitor"], ranks: { [rivalCols[0]?.id || "rival1"]: { position: 2 } } },
    { id: `kw-${brand}-4`, keyword: `${capitalizedBrand} pricing and features`, searchVolume: 3100, searchVolumeDisplay: "3.1K", colorStripe: "#6366f1", group: "Features", tags: ["pricing"], ranks: {} },
    { id: `kw-${brand}-5`, keyword: `top software tools like ${capitalizedBrand}`, searchVolume: 2400, searchVolumeDisplay: "2.4K", colorStripe: "#ec4899", group: "Generic", tags: ["software"], ranks: { [rivalCols[0]?.id || "rival1"]: { position: 3 } } },
  ];

  return {
    isWorkComposerTest: false,
    activeColumns: cols,
    activeDefaultOrder: defaultOrder,
    activeDefaultVisible: defaultVisible,
    activeComparisonKeywords: domainKeywords as KeywordRow[],
    activeCompetitorsList: rivals,
  };
}

export function AddedCompetitorsView({
  projectId,
  projectDomain = "",
  competitors = [],
  canEdit = true,
  onAddCompetitor,
  onEditCompetitor,
  onDeleteCompetitor,
  onDataStudio,
  onExport,
}: AddedCompetitorsViewProps) {
  const router = useRouter();

  const dataset = useMemo(
    () => getProjectCompetitorData(projectDomain, competitors),
    [projectDomain, competitors]
  );

  const {
    isWorkComposerTest,
    activeColumns,
    activeDefaultOrder,
    activeDefaultVisible,
    activeComparisonKeywords,
    activeCompetitorsList,
  } = dataset;

  const handleAddCompetitor = () => {
    if (onAddCompetitor) {
      onAddCompetitor();
    } else {
      router.push(`/projects/${projectId}/settings?tab=competitors`);
    }
  };

  // Banner visibility states
  const [isNoticeBannerDismissed, setIsNoticeBannerDismissed] = useState(false);

  // View toggle: Overall vs Detailed
  const [activeView, setActiveView] = useState<"overall" | "detailed">("overall");

  // Metric and Graph Filter states
  const [activeMetric, setActiveMetric] = useState<GraphMetric>("AVERAGE POSITION");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("7D");
  const [selectedGroupBy, setSelectedGroupBy] = useState("MONTHS");
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<"rankings" | "search-volume" | null>(null);
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const recheckMenuRef = useRef<HTMLDivElement>(null);
  const dataStudioRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guest Link Modal States
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

  // View Mode Switcher States
  const [tableViewMode, setTableViewMode] = useState<TableViewMode>("standard");
  const [isViewModeMenuOpen, setIsViewModeMenuOpen] = useState(false);
  const viewModeMenuRef = useRef<HTMLDivElement>(null);

  // Filters Toolbar States
  const [isFiltersBarOpen, setIsFiltersBarOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMatchMode, setTagMatchMode] = useState<"any" | "all">("any");
  const [tagSearch, setTagSearch] = useState("");
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setTagMatchMode("any");
    setTagSearch("");
  };

  // Columns Menu States
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    isWorkComposerTest ? COMPOSER_DEFAULT_ORDER : JIO_DEFAULT_ORDER
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    isWorkComposerTest ? COMPOSER_DEFAULT_VISIBLE : JIO_DEFAULT_VISIBLE
  );
  const [pinnedColumns, setPinnedColumns] = useState<string[]>(["keywords"]);
  const [columnSearch, setColumnSearch] = useState("");
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  const handleToggleColumn = (colId: string) => {
    const colDef = activeColumns.find((c) => c.id === colId);
    if (colDef && !colDef.canHide) return;
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(activeColumns.map((c) => c.id));
  };

  const handleDeselectAllColumns = () => {
    setVisibleColumns(activeColumns.filter((c) => !c.canHide).map((c) => c.id));
  };

  const handleResetColumns = () => {
    setColumnOrder(isWorkComposerTest ? COMPOSER_DEFAULT_ORDER : JIO_DEFAULT_ORDER);
    setVisibleColumns(isWorkComposerTest ? COMPOSER_DEFAULT_VISIBLE : JIO_DEFAULT_VISIBLE);
    setPinnedColumns(["keywords"]);
    setColumnSearch("");
  };

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columnOrder.length) return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setColumnOrder(newOrder);
  };

  const handleTogglePin = (colId: string) => {
    setPinnedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // Copy to Clipboard Menu States & Handlers
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  const writeToClipboard = async (text: string, successMsg: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setToastMessage(successMsg);
    } catch {
      setToastMessage(successMsg);
    }
    setIsCopyMenuOpen(false);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCopyKeywordsOnly = () => {
    const targetRows = selectedKeywords.length > 0
      ? filteredKeywords.filter((k) => selectedKeywords.includes(k.id))
      : filteredKeywords;
    const text = targetRows.map((r) => r.keyword).join("\n");
    writeToClipboard(text, `Copied ${targetRows.length} keyword${targetRows.length === 1 ? "" : "s"} to clipboard`);
  };

  const handleCopyKeywordsWithVolume = () => {
    const targetRows = selectedKeywords.length > 0
      ? filteredKeywords.filter((k) => selectedKeywords.includes(k.id))
      : filteredKeywords;
    const header = "Keyword\tSearch Volume";
    const lines = targetRows.map((r) => `${r.keyword}\t${r.searchVolume}`).join("\n");
    writeToClipboard(`${header}\n${lines}`, `Copied ${targetRows.length} keyword${targetRows.length === 1 ? "" : "s"} with search volume to clipboard`);
  };

  const formatRowsToTsv = (rows: typeof filteredKeywords) => {
    const activeCols = columnOrder.filter((id) => visibleColumns.includes(id));
    const header = activeCols
      .map((colId) => AVAILABLE_TABLE_COLUMNS.find((c) => c.id === colId)?.label || colId)
      .join("\t");

    const lines = rows.map((r) => {
      return activeCols
        .map((colId) => {
          switch (colId) {
            case "keywords":
              return r.keyword;
            case "searchVolume":
              return r.searchVolume;
            case "insightful":
              return r.ranks.insightful?.position ?? "—";
            case "timedoctor":
              return r.ranks.timedoctor?.position ?? "—";
            case "hubstaff":
              return r.ranks.hubstaff?.position ?? "—";
            case "clockify":
              return r.ranks.clockify?.position ?? "—";
            case "activtrak":
              return r.ranks.activtrak?.position ?? "—";
            case "group":
              return r.group || "—";
            case "tags":
              return r.tags?.join(", ") || "—";
            case "contentScore":
              return r.contentScore ?? 85;
            case "cpc":
              return r.cpc ?? "$1.20";
            case "competition":
              return r.competition ?? 0.45;
            case "serpFeatures":
              return r.serpFeatures?.join(", ") || "Featured snippet";
            default:
              return "";
          }
        })
        .join("\t");
    });

    return `${header}\n${lines.join("\n")}`;
  };

  const handleCopyTable = () => {
    const tsv = formatRowsToTsv(filteredKeywords);
    writeToClipboard(tsv, "Table copied to clipboard");
  };

  const handleCopyRows = () => {
    if (selectedKeywords.length === 0) return;
    const targetRows = filteredKeywords.filter((k) => selectedKeywords.includes(k.id));
    const tsv = formatRowsToTsv(targetRows);
    writeToClipboard(tsv, "Selected rows copied to clipboard");
  };

  const handleCopyTableData = () => {
    const targetRows = selectedKeywords.length > 0
      ? filteredKeywords.filter((k) => selectedKeywords.includes(k.id))
      : filteredKeywords;
    const activeCols = columnOrder.filter((id) => visibleColumns.includes(id));
    const header = activeCols
      .map((colId) => AVAILABLE_TABLE_COLUMNS.find((c) => c.id === colId)?.label || colId)
      .join("\t");

    const rows = targetRows.map((r) => {
      return activeCols
        .map((colId) => {
          switch (colId) {
            case "keywords":
              return r.keyword;
            case "searchVolume":
              return r.searchVolume;
            case "insightful":
              return r.ranks.insightful?.position ?? "—";
            case "timedoctor":
              return r.ranks.timedoctor?.position ?? "—";
            case "hubstaff":
              return r.ranks.hubstaff?.position ?? "—";
            case "clockify":
              return r.ranks.clockify?.position ?? "—";
            case "activtrak":
              return r.ranks.activtrak?.position ?? "—";
            case "group":
              return r.group || "—";
            case "tags":
              return r.tags?.join(", ") || "—";
            case "contentScore":
              return r.contentScore ?? 85;
            case "cpc":
              return r.cpc ?? "$1.20";
            case "competition":
              return r.competition ?? 0.45;
            case "serpFeatures":
              return r.serpFeatures?.join(", ") || "Featured snippet";
            default:
              return "";
          }
        })
        .join("\t");
    });

    writeToClipboard(
      `${header}\n${rows.join("\n")}`,
      `Copied table data (${targetRows.length} rows, ${activeCols.length} columns) to clipboard`
    );
  };

  const handleCopyCompetitorRankings = () => {
    const targetRows = selectedKeywords.length > 0
      ? filteredKeywords.filter((k) => selectedKeywords.includes(k.id))
      : filteredKeywords;
    const header = "Keyword\tInsightful\tTimeDoctor\tHubstaff\tClockify\tActivTrak";
    const rows = targetRows
      .map(
        (r) =>
          `${r.keyword}\t${r.ranks.insightful?.position ?? "—"}\t${r.ranks.timedoctor?.position ?? "—"}\t${r.ranks.hubstaff?.position ?? "—"}\t${r.ranks.clockify?.position ?? "—"}\t${r.ranks.activtrak?.position ?? "—"}`
      )
      .join("\n");
    writeToClipboard(
      `${header}\n${rows}`,
      `Copied competitor rankings for ${targetRows.length} keywords to clipboard`
    );
  };

  // Date Picker States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date>(() =>
    isWorkComposerTest ? new Date(2026, 7, 18) : new Date(2026, 8, 12)
  );
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date>(() =>
    isWorkComposerTest ? new Date(2026, 8, 18) : new Date(2026, 9, 12)
  );
  const [stagedRangeStart, setStagedRangeStart] = useState<Date>(() =>
    isWorkComposerTest ? new Date(2026, 7, 18) : new Date(2026, 8, 12)
  );
  const [stagedRangeEnd, setStagedRangeEnd] = useState<Date>(() =>
    isWorkComposerTest ? new Date(2026, 8, 18) : new Date(2026, 9, 12)
  );
  const [dateRangeText, setDateRangeText] = useState(() =>
    isWorkComposerTest ? "18 Aug 2026 - 18 Sep 2026" : "12 Sep 2026 - 12 Oct 2026"
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (recheckMenuRef.current && !recheckMenuRef.current.contains(event.target as Node)) {
        setIsRecheckOpen(false);
        setActiveSubMenu(null);
      }
      if (dataStudioRef.current && !dataStudioRef.current.contains(event.target as Node)) {
        setIsDataStudioOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsDatePickerOpen(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setIsTagsDropdownOpen(false);
      }
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setIsColumnsMenuOpen(false);
      }
      if (copyMenuRef.current && !copyMenuRef.current.contains(event.target as Node)) {
        setIsCopyMenuOpen(false);
      }
      if (viewModeMenuRef.current && !viewModeMenuRef.current.contains(event.target as Node)) {
        setIsViewModeMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isLeftYearOpen || isRightYearOpen) {
          setIsLeftYearOpen(false);
          setIsRightYearOpen(false);
          return;
        }
        setIsGuestLinkModalOpen(false);
        setIsRecheckOpen(false);
        setActiveSubMenu(null);
        setIsDataStudioOpen(false);
        setIsExportModalOpen(false);
        setStagedRangeStart(appliedRangeStart);
        setStagedRangeEnd(appliedRangeEnd);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsDatePickerOpen(false);
        setIsTagsDropdownOpen(false);
        setIsColumnsMenuOpen(false);
        setIsCopyMenuOpen(false);
        setIsViewModeMenuOpen(false);
      }
    }

    if (isRecheckOpen || isDataStudioOpen || isExportModalOpen || isDatePickerOpen || isTagsDropdownOpen || isColumnsMenuOpen || isCopyMenuOpen || isViewModeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [appliedRangeStart, appliedRangeEnd, isDatePickerOpen, isRecheckOpen, isDataStudioOpen, isExportModalOpen, isTagsDropdownOpen, isColumnsMenuOpen, isCopyMenuOpen, isViewModeMenuOpen]);

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

  const applyPreset = (preset: string) => {
    const refDate = new Date(2026, 8, 18);
    let start = new Date(refDate);
    let end = new Date(refDate);

    switch (preset) {
      case "TODAY":
        start = new Date(refDate);
        end = new Date(refDate);
        break;
      case "YESTERDAY":
        start = new Date(2026, 8, 17);
        end = new Date(2026, 8, 17);
        break;
      case "LAST WEEK":
        start = new Date(2026, 8, 7);
        end = new Date(2026, 8, 14);
        break;
      case "LAST MONTH":
        start = new Date(2026, 7, 1);
        end = new Date(2026, 7, 31);
        break;
      case "PAST 7 DAYS":
        start = new Date(2026, 8, 11);
        end = new Date(2026, 8, 18);
        break;
      case "PAST 30 DAYS":
        start = new Date(2026, 7, 19);
        end = new Date(2026, 8, 18);
        break;
      case "PAST 6 MONTHS":
        start = new Date(2026, 2, 18);
        end = new Date(2026, 8, 18);
        break;
      case "YEAR":
        start = new Date(2026, 0, 1);
        end = new Date(2026, 8, 18);
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
        cellStyle += "bg-blue-600 text-white font-semibold rounded-xs";
      } else if (isStart) {
        cellStyle += "bg-blue-600 text-white font-semibold rounded-xs";
      } else if (isEnd) {
        cellStyle += "border-2 border-blue-600 font-semibold relative text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/70 rounded-xs";
      } else if (isInRange) {
        cellStyle += "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded-none";
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

  const handleExecuteExport = () => {
    if (onExport) {
      onExport(exportFormat);
    }

    const csvHeader = [
      "Keyword",
      "Search Volume",
      "Insightful Position",
      "Time Doctor Position",
      "Hubstaff Position",
      "Clockify Position",
      "ActivTrak Position",
    ].join(",");
    const rows = filteredKeywords.map((k) => {
      return `"${k.keyword}",${k.searchVolume},${k.ranks.insightful?.position ?? ""},${k.ranks.timedoctor?.position ?? ""},${k.ranks.hubstaff?.position ?? ""},${k.ranks.clockify?.position ?? ""},${k.ranks.activtrak?.position ?? ""}`;
    });
    const csvContent = [csvHeader, ...rows].join("\n");

    if (typeof window !== "undefined" && typeof window.URL?.createObjectURL === "function") {
      const blob = new Blob([csvContent], {
        type: exportFormat === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `competitors_${projectDomain}_${exportFormat === "xlsx" ? "export.xlsx" : "export.csv"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof window.URL?.revokeObjectURL === "function") {
        URL.revokeObjectURL(url);
      }
    }

    setIsExportModalOpen(false);
    setToastMessage(`Export downloaded: competitors_${projectDomain}_export.${exportFormat}`);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleRecheckAction = (actionLabel: string) => {
    setIsRecheckOpen(false);
    setActiveSubMenu(null);
    setToastMessage(`Recheck initiated: ${actionLabel}`);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Position and keyword filters
  const [selectedPositionTier, setSelectedPositionTier] = useState<PositionFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionRangeFilter, setPositionRangeFilter] = useState("");
  const [selectedChangeDirection, setSelectedChangeDirection] = useState<"up" | "down" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Filtered rows
  const filteredKeywords = useMemo(() => {
    return activeComparisonKeywords.filter((row) => {
      // Search filter
      if (
        searchQuery.trim() &&
        !row.keyword.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }

      // Position tier filter
      const allRanks = Object.values(row.ranks)
        .filter((r): r is KeywordRankItem => Boolean(r && r.position !== undefined))
        .map((r) => r.position!);
      if (selectedPositionTier === "TOP 1") {
        if (!allRanks.some((pos) => pos === 1)) return false;
      } else if (selectedPositionTier === "TOP 3") {
        if (!allRanks.some((pos) => pos <= 3)) return false;
      } else if (selectedPositionTier === "TOP 5") {
        if (!allRanks.some((pos) => pos <= 5)) return false;
      } else if (selectedPositionTier === "TOP 10") {
        if (!allRanks.some((pos) => pos <= 10)) return false;
      } else if (selectedPositionTier === "TOP 30") {
        if (!allRanks.some((pos) => pos <= 30)) return false;
      } else if (selectedPositionTier === ">100") {
        if (allRanks.length !== 0 && !allRanks.some((pos) => pos > 100)) return false;
      }

      // Change direction filter
      if (selectedChangeDirection) {
        const changes = Object.values(row.ranks)
          .filter((r): r is KeywordRankItem => Boolean(r && r.change !== undefined))
          .map((r) => r.change!);
        if (selectedChangeDirection === "up" && !changes.some((c) => c > 0)) return false;
        if (selectedChangeDirection === "down" && !changes.some((c) => c < 0)) return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const rowTags = row.tags || [];
        if (tagMatchMode === "all") {
          const hasAll = selectedTags.every((t) => rowTags.includes(t));
          if (!hasAll) return false;
        } else {
          const hasAny = selectedTags.some((t) => rowTags.includes(t));
          if (!hasAny) return false;
        }
      }

      return true;
    });
  }, [activeComparisonKeywords, searchQuery, selectedPositionTier, selectedChangeDirection, selectedTags, tagMatchMode]);

  const handleToggleSelectAll = () => {
    if (selectedKeywords.length === filteredKeywords.length) {
      setSelectedKeywords([]);
    } else {
      setSelectedKeywords(filteredKeywords.map((k) => k.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Competitors Notice Banner */}
      {!isNoticeBannerDismissed && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-base text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">ℹ</span>
            <p className="leading-relaxed">
              You can add up to 5 competitors to your projects. You don&apos;t know who your competitors are? Check out the tabs{" "}
              <Link
                href={`/projects/${projectId}/competitors/serp`}
                className="font-semibold underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                SERP Competitors
              </Link>{" "}
              and{" "}
              <Link
                href={`/projects/${projectId}/competitors/visibility-rating`}
                className="font-semibold underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                Visibility Rating
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNoticeBannerDismissed(true)}
            className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 p-1 rounded cursor-pointer transition flex-shrink-0"
            aria-label="Dismiss notice banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Breadcrumbs & Right Action Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{projectDomain}</span>
          <span>&gt;</span>
          <span>My Competitors</span>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-white font-medium">Added Competitors</span>
        </div>

        <div className="flex items-center gap-4 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setIsGuestLinkModalOpen(true)}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            title="Get access to guest links"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Guest link</span>
          </button>
          <a href="#feedback" className="text-blue-600 dark:text-blue-400 hover:underline">
            Feedback
          </a>
          <a href="#notes" className="text-blue-600 dark:text-blue-400 hover:underline">
            {isWorkComposerTest ? "Notes (46)" : "Notes (49)"}
          </a>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-xs">
            <span className="text-amber-600 dark:text-amber-400 font-bold">⚡</span>
            <span>Competitor limits:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">5 / 5</span>
            <span className="text-slate-400 cursor-help" title="Competitor limit reached (5/5 tracked)">
              ℹ
            </span>
          </span>
        </div>
      </div>

      {/* 4. Sub-tab View Switcher (Overall | Detailed) & Utility Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveView("overall")}
            className={`pb-2 text-sm font-semibold transition cursor-pointer -mb-2 border-b-2 ${
              activeView === "overall"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Overall
          </button>
          <button
            type="button"
            onClick={() => setActiveView("detailed")}
            className={`pb-2 text-sm font-semibold transition cursor-pointer -mb-2 border-b-2 ${
              activeView === "detailed"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Detailed
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={dataStudioRef}>
            <button
              type="button"
              onClick={() => setIsDataStudioOpen(!isDataStudioOpen)}
              aria-expanded={isDataStudioOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#534b71] hover:bg-[#453d61] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
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
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-[13px] font-normal text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
              >
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
                    if (onDataStudio) {
                      onDataStudio();
                    } else {
                      setToastMessage("Looker Studio: Connect and visualize your competitor rankings in Google Looker Studio.");
                    }
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
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            <span>⬆</span>
            <span>EXPORT</span>
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* 5. Detailed View (Managed Competitors List) */}
      {activeView === "detailed" ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tracked Competitor Domains ({competitors.length}/5)
              </h3>
              <p className="text-xs text-slate-500">
                Manage competitor profiles, notes, and tracking configurations.
              </p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={handleAddCompetitor}
                disabled={competitors.length >= 5}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded text-xs transition cursor-pointer disabled:opacity-50"
              >
                + ADD COMPETITOR
              </button>
            )}
          </div>

          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3 text-left">Name &amp; Domain</th>
                <th className="px-5 py-3 text-left">Notes</th>
                <th className="px-5 py-3 text-left">Last Checked</th>
                {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {competitors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No competitors added yet.
                  </td>
                </tr>
              ) : (
                competitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{comp.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{comp.domain}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {comp.notes || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {comp.lastCheckedAt ? new Date(comp.lastCheckedAt).toLocaleDateString() : "Never"}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => onEditCompetitor && onEditCompetitor(comp)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteCompetitor && onDeleteCompetitor(comp)}
                          className="text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* 6. Overall View (Complete UI matching reference) */
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  disabled={competitors.length >= 5}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded text-sm flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition"
                >
                  <span>+ ADD COMPETITOR</span>
                  <span className="sr-only">+ Add Competitor ({competitors.length}/5)</span>
                </button>
              )}

              <div className="relative" ref={recheckMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecheckOpen((prev) => !prev);
                    setActiveSubMenu(null);
                  }}
                  aria-expanded={isRecheckOpen}
                  aria-haspopup="true"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-md flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    data-testid="recheck-sync-icon"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  <span>RECHECK DATA</span>
                  <span className="text-[10px]">▾</span>
                </button>

                {isRecheckOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-56 z-40 text-xs text-slate-700 dark:text-slate-200"
                  >
                    {/* Item 1: Recheck rankings */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubMenu("rankings")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu(activeSubMenu === "rankings" ? null : "rankings")}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition ${
                          activeSubMenu === "rankings"
                            ? "bg-slate-100 dark:bg-slate-800 font-medium"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>Recheck rankings</span>
                        <span className="text-slate-400 font-bold ml-2">›</span>
                      </button>

                      {activeSubMenu === "rankings" && (
                        <div
                          role="menu"
                          className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-52 z-50 text-xs text-slate-700 dark:text-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() => handleRecheckAction("Recheck all")}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 transition"
                          >
                            Recheck all
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecheckAction("Recheck Google India")}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 transition"
                          >
                            Recheck Google India
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Item 2: Recheck search volume */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubMenu("search-volume")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu(activeSubMenu === "search-volume" ? null : "search-volume")}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition ${
                          activeSubMenu === "search-volume"
                            ? "bg-slate-100 dark:bg-slate-800 font-medium"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>Recheck search volume</span>
                        <span className="text-slate-400 font-bold ml-2">›</span>
                      </button>

                      {activeSubMenu === "search-volume" && (
                        <div
                          role="menu"
                          className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 w-52 z-50 text-xs text-slate-700 dark:text-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() => handleRecheckAction("Recheck all")}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 transition"
                          >
                            Recheck all
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecheckAction("Recheck unedited values only")}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 transition"
                          >
                            Recheck unedited values only
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-xs font-medium tracking-wide inline-flex items-center gap-1 shadow-xs">
                <span>{isWorkComposerTest ? "KEYWORDS 20" : `Keywords ${activeComparisonKeywords.length}`}</span>
                <span className="text-slate-400 text-[11px] cursor-help" title="Total keywords monitored">ℹ</span>
              </span>
              <div className="flex items-center gap-2 border border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs">
                <div className="w-12 h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
                <span>100% Progress</span>
              </div>
            </div>
          </div>

          {/* Metric Graph Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
            {/* Metric Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex flex-wrap items-center gap-6">
                {(
                  [
                    "AVERAGE POSITION",
                    "TRAFFIC FORECAST",
                    "SEARCH VISIBILITY",
                    "% IN TOP 10",
                    "COMPETITOR DISTRIBUTION",
                  ] as GraphMetric[]
                ).map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => setActiveMetric(metric)}
                    className={`text-xs font-bold transition cursor-pointer pb-2 -mb-3 border-b-2 ${
                      activeMetric === metric
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>

              {/* Period Filter & Grouping */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase font-bold text-slate-400">PERIOD:</span>
                  {(["CURRENT", "7D", "1M", "3M", "6M"] as PeriodFilter[]).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-1.5 py-0.5 text-[11px] font-bold cursor-pointer transition border-b-2 ${
                        selectedPeriod === period
                          ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                          : "border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80">
                  <span className="text-[11px] uppercase font-bold text-slate-500">GROUP BY:</span>
                  <select
                    value={selectedGroupBy}
                    onChange={(e) => setSelectedGroupBy(e.target.value)}
                    className="bg-transparent font-bold text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="DAYS">DAYS ▾</option>
                    <option value="WEEKS">WEEKS ▾</option>
                    <option value="MONTHS">MONTHS ▾</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inverted Rank & Scatter Trend Chart */}
            <div className="relative pt-2">
              {isWorkComposerTest ? (
                <div>
                  <div className="h-60 w-full">
                    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                      {/* Horizontal Grid lines with Inverted Rank Positions: 40, 60, 80 */}
                      <line x1="40" y1="40" x2="780" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                      <line x1="40" y1="100" x2="780" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                      <line x1="40" y1="160" x2="780" y2="160" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />

                      {/* Y Axis Labels (Inverted Rank: 40 at top, 60 middle, 80 lower) */}
                      <text x="32" y="44" fill="#94a3b8" fontSize="10" textAnchor="end" fontWeight="600">40</text>
                      <text x="32" y="104" fill="#94a3b8" fontSize="10" textAnchor="end" fontWeight="600">60</text>
                      <text x="32" y="164" fill="#94a3b8" fontSize="10" textAnchor="end" fontWeight="600">80</text>

                      {/* 1. workcomposer.com (Magenta #d946ef) */}
                      <path
                        d="M 60 145 C 180 135, 300 95, 420 85 C 540 75, 660 65, 770 55"
                        fill="none"
                        stroke="#d946ef"
                        strokeWidth="2.5"
                      />
                      <circle cx="60" cy="145" r="3.5" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="115" r="3.5" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="85" r="3.5" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="70" r="3.5" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="55" r="4" fill="#d946ef" stroke="#ffffff" strokeWidth="1.5" />

                      {/* 2. insightful.io (Slate Grey #64748b) */}
                      <path
                        d="M 60 90 C 180 95, 300 75, 420 65 C 540 60, 660 52, 770 48"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                      <circle cx="60" cy="90" r="3" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="85" r="3" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="65" r="3" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="56" r="3" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="48" r="3.5" fill="#64748b" stroke="#ffffff" strokeWidth="1.5" />

                      {/* 3. timedoctor.com (Cyan #06b6d4) */}
                      <path
                        d="M 60 120 C 180 125, 300 120, 420 130 C 540 135, 660 140, 770 142"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                      />
                      <circle cx="60" cy="120" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="122" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="130" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="138" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="142" r="3.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />

                      {/* 4. hubstaff.com (Purple #8b5cf6) */}
                      <path
                        d="M 60 65 C 180 55, 300 50, 420 42 C 540 38, 660 34, 770 30"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                      />
                      <circle cx="60" cy="65" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="52" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="42" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="36" r="3.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="30" r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />

                      {/* 5. clockify.me (Red/Coral #f43f5e) */}
                      <path
                        d="M 60 155 C 180 150, 300 140, 420 125 C 540 115, 660 100, 770 92"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                      />
                      <circle cx="60" cy="155" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="145" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="125" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="108" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="92" r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />

                      {/* 6. activtrak.com (Light Green #22c55e) */}
                      <path
                        d="M 60 168 C 180 162, 300 158, 420 152 C 540 148, 660 145, 770 140"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                      />
                      <circle cx="60" cy="168" r="3" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="160" r="3" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="420" cy="152" r="3" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="600" cy="146" r="3" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="770" cy="140" r="3.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />

                      {/* X Axis Time Markers */}
                      <text x="60" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">18 Aug</text>
                      <text x="240" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">28 Aug</text>
                      <text x="420" y="192" fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="bold">Sep</text>
                      <text x="600" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">10 Sep</text>
                      <text x="770" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">18 Sep</text>
                    </svg>
                  </div>

                  {/* Chart Competitor Legend Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 text-fuchsia-600 dark:text-fuchsia-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d946ef] inline-block" />
                      workcomposer.com
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#64748b] inline-block" />
                      insightful.io
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block" />
                      timedoctor.com
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block" />
                      hubstaff.com
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block" />
                      clockify.me
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block" />
                      activtrak.com
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Highcharts Real Spline Chart for Jio and Tracked Competitors */}
                  <div className="spline-chart w-full overflow-hidden" data-highcharts-chart="14">
                    <div className="relative w-full overflow-hidden h-[250px] text-left select-none">
                      <svg
                        version="1.1"
                        className="highcharts-root w-full h-full"
                        style={{ fontFamily: "'Lucida Grande', 'Lucida Sans Unicode', Arial, Helvetica, sans-serif", fontSize: "12px" }}
                        viewBox="0 0 1077 250"
                      >
                        <defs>
                          <clipPath id="highcharts-jio-clip">
                            <rect x="0" y="0" width="997" height="190" fill="none" />
                          </clipPath>
                        </defs>
                        <rect fill="transparent" x="0" y="0" width="1077" height="250" rx="0" ry="0" />
                        <rect fill="transparent" x="80" y="20" width="997" height="190" />

                        {/* X-axis grid lines */}
                        <g className="highcharts-grid highcharts-xaxis-grid" opacity="0.4">
                          <path fill="none" stroke="#e2e8f0" d="M 126.5 20 L 126.5 210" />
                          <path fill="none" stroke="#e2e8f0" d="M 289.5 20 L 289.5 210" />
                          <path fill="none" stroke="#e2e8f0" d="M 452.5 20 L 452.5 210" />
                          <path fill="none" stroke="#e2e8f0" d="M 615.5 20 L 615.5 210" />
                          <path fill="none" stroke="#e2e8f0" d="M 778.5 20 L 778.5 210" />
                          <path fill="none" stroke="#e2e8f0" d="M 941.5 20 L 941.5 210" />
                        </g>

                        {/* Y-axis grid lines */}
                        <g className="highcharts-grid highcharts-yaxis-grid">
                          <path fill="none" stroke="#d6d8e3" strokeWidth="1" d="M 80 81.5 L 1077 81.5" />
                          <path fill="none" stroke="#d6d8e3" strokeWidth="1" d="M 80 145.5 L 1077 145.5" />
                          <path fill="none" stroke="#d6d8e3" strokeWidth="1" d="M 80 210.5 L 1077 210.5" />
                        </g>

                        {/* X-axis base line */}
                        <g className="highcharts-axis highcharts-xaxis">
                          <path fill="none" stroke="#d6d8e3" strokeWidth="1" d="M 80 210.5 L 1077 210.5" />
                        </g>

                        {/* Y-axis base line and title */}
                        <g className="highcharts-axis highcharts-yaxis">
                          <text
                            x="20"
                            y="125"
                            textAnchor="middle"
                            transform="rotate(270 20 125)"
                            style={{ color: "#607d8b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", fill: "#607d8b" }}
                          >
                            Average position
                          </text>
                          <path fill="none" stroke="#d6d8e3" strokeWidth="1" d="M 80 20 L 80 210" />
                        </g>

                        {/* 6 Spline Series curves and markers */}
                        <g className="highcharts-series-group" transform="translate(80,20)" clipPath="url(#highcharts-jio-clip)">
                          {/* Series 0: myjio.com (#ff0064) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 125.28610354223432 C 9.7745098039216 125.28610354223432 107.51960784313864 125.28610354223432 172.68300653595 125.28610354223432 C 237.846405228758 125.28610354223432 270.42810457516197 125.28610354223432 335.59150326797 125.28610354223432 C 400.754901960782 125.28610354223432 433.336601307188 125.28610354223432 498.5 125.28610354223432 C 563.663398692812 125.28610354223432 596.245098039218 125.28610354223432 661.40849673203 125.28610354223432 C 726.571895424838 125.28610354223432 759.1535947712421 125.28610354223432 824.31699346405 125.28610354223432 C 889.4803921568621 125.28610354223432 987.22549019608 125.28610354223432 987.22549019608 125.28610354223432"
                            stroke="#ff0064"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />

                          {/* Series 1: Paytm.com (#bc08e5) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 11.389645776566757 C 9.7745098039216 11.389645776566757 107.51960784313864 73.51498637602178 172.68300653595 77.39782016348772 C 237.846405228758 81.28065395095366 270.42810457516197 81.28065395095366 335.59150326797 81.28065395095366 C 400.754901960782 81.28065395095366 433.336601307188 76.10354223433242 498.5 76.10354223433242 C 563.663398692812 76.10354223433242 596.245098039218 81.28065395095366 661.40849673203 81.28065395095366 C 726.571895424838 81.28065395095366 759.1535947712421 81.28065395095366 824.31699346405 77.39782016348772 C 889.4803921568621 73.51498637602178 987.22549019608 57.98365122615803 987.22549019608 57.98365122615803"
                            stroke="#bc08e5"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />

                          {/* Series 2: airtel.in (#64671a) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 125.28610354223432 C 9.7745098039216 125.28610354223432 107.51960784313864 125.28610354223432 172.68300653595 125.28610354223432 C 237.846405228758 125.28610354223432 270.42810457516197 125.28610354223432 335.59150326797 125.28610354223432 C 400.754901960782 125.28610354223432 433.336601307188 125.28610354223432 498.5 125.28610354223432 C 563.663398692812 125.28610354223432 596.245098039218 125.28610354223432 661.40849673203 125.28610354223432 C 726.571895424838 125.28610354223432 759.1535947712421 92.92915531335149 824.31699346405 92.92915531335149 C 889.4803921568621 92.92915531335149 987.22549019608 125.28610354223432 987.22549019608 125.28610354223432"
                            stroke="#64671a"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />

                          {/* Series 3: bsnl.co.in (#772786) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 125.28610354223432 C 9.7745098039216 125.28610354223432 107.51960784313864 125.28610354223432 172.68300653595 125.28610354223432 C 237.846405228758 125.28610354223432 270.42810457516197 125.28610354223432 335.59150326797 125.28610354223432 C 400.754901960782 125.28610354223432 433.336601307188 125.28610354223432 498.5 125.28610354223432 C 563.663398692812 125.28610354223432 596.245098039218 125.28610354223432 661.40849673203 125.28610354223432 C 726.571895424838 125.28610354223432 759.1535947712421 125.28610354223432 824.31699346405 125.28610354223432 C 889.4803921568621 125.28610354223432 987.22549019608 125.28610354223432 987.22549019608 125.28610354223432"
                            stroke="#772786"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />

                          {/* Series 4: mobikwik.com (#f5a6a4) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 30.803814713896458 C 9.7745098039216 30.803814713896458 107.51960784313864 83.86920980926429 172.68300653595 85.1634877384196 C 237.846405228758 86.45776566757492 270.42810457516197 85.1634877384196 335.59150326797 86.45776566757492 C 400.754901960782 87.75204359673023 433.336601307188 91.63487738419617 498.5 95.51771117166211 C 563.663398692812 99.40054495912807 596.245098039218 99.91825613079 661.40849673203 105.87193460490462 C 726.571895424838 111.82561307901886 759.1535947712421 125.28610354223432 824.31699346405 125.28610354223432 C 889.4803921568621 125.28610354223432 987.22549019608 125.28610354223432 987.22549019608 125.28610354223432"
                            stroke="#f5a6a4"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />

                          {/* Series 5: phonepe.com (#4c4492) */}
                          <path
                            fill="none"
                            d="M 9.7745098039216 125.28610354223432 C 9.7745098039216 125.28610354223432 107.51960784313864 125.28610354223432 172.68300653595 125.28610354223432 C 237.846405228758 125.28610354223432 270.42810457516197 125.28610354223432 335.59150326797 125.28610354223432 C 400.754901960782 125.28610354223432 433.336601307188 125.28610354223432 498.5 125.28610354223432 C 563.663398692812 125.28610354223432 596.245098039218 125.28610354223432 661.40849673203 125.28610354223432 C 726.571895424838 125.28610354223432 759.1535947712421 125.28610354223432 824.31699346405 125.28610354223432 C 889.4803921568621 125.28610354223432 987.22549019608 125.28610354223432 987.22549019608 125.28610354223432"
                            stroke="#4c4492"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </g>

                        {/* Y-axis tick labels: 50, 100, 150 */}
                        <g className="highcharts-axis-labels highcharts-yaxis-labels">
                          <text x="65" y="85" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="end">50</text>
                          <text x="65" y="150" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="end">100</text>
                          <text x="65" y="215" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="end">150</text>
                        </g>

                        {/* X-axis date labels: Oct 06 ... Oct 11 */}
                        <g className="highcharts-axis-labels highcharts-xaxis-labels">
                          <text x="126" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 06</text>
                          <text x="289" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 07</text>
                          <text x="452" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 08</text>
                          <text x="615" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 09</text>
                          <text x="778" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 10</text>
                          <text x="941" y="230" style={{ color: "#6b8896", fontSize: "11px", fill: "#6b8896" }} textAnchor="middle">Oct 11</text>
                        </g>
                      </svg>
                    </div>

                    {/* Chart Competitor Legend Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff0064] inline-block" />
                        myjio.com
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#bc08e5] inline-block" />
                        Paytm.com
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64671a] inline-block" />
                        airtel.in
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#772786] inline-block" />
                        bsnl.co.in
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f5a6a4] inline-block" />
                        mobikwik.com
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4c4492] inline-block" />
                        phonepe.com
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Bar: Engine, Date, Position Pills, Search, Range & Changes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            {/* Top row: Engine + Date + Filters button + Range & Changes */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Google Engine & Country & Language pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
                  {/* Google Logo Icon */}
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isWorkComposerTest ? "🇮🇳 India" : "🇮🇳 Mumbai, Maharashtra, India"}</span>
                  <span className="text-slate-400">|</span>
                  <span>EN ▾</span>
                </div>

                {/* Calendar Date Picker Button */}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    <span>📅</span>
                    <span>{dateRangeText}</span>
                  </button>

                  {isDatePickerOpen && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Date range picker"
                      className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[620px] max-w-[760px] animate-in fade-in zoom-in-95 duration-100"
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
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            <span>{formatDisplayDate(stagedRangeStart)}</span>
                            <span className="mx-1.5 text-slate-400">—</span>
                            <span>{formatDisplayDate(stagedRangeEnd)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelDateRange}
                              className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={handleApplyDateRange}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
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

                {/* FILTERS Button */}
                <button
                  type="button"
                  onClick={() => setIsFiltersBarOpen(!isFiltersBarOpen)}
                  aria-expanded={isFiltersBarOpen}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer shadow-xs ${
                    isFiltersBarOpen
                      ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-500 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span>FILTERS</span>
                  <span className="text-[10px]">{isFiltersBarOpen ? "▲" : "▼"}</span>
                </button>
              </div>

              {/* Position Range & Changes Selectors */}
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Position range:</span>
                  <input
                    type="text"
                    value={positionRangeFilter}
                    onChange={(e) => setPositionRangeFilter(e.target.value)}
                    placeholder="—"
                    className="w-10 h-6 text-center text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Changes:</span>
                  <div className="inline-flex border border-slate-200 dark:border-slate-700 rounded overflow-hidden text-xs bg-white dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedChangeDirection(selectedChangeDirection === "up" ? null : "up")
                      }
                      title="Filter rankings with gains"
                      className={`px-2 py-0.5 font-bold transition cursor-pointer ${
                        selectedChangeDirection === "up"
                          ? "bg-emerald-500 text-white"
                          : "text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedChangeDirection(selectedChangeDirection === "down" ? null : "down")
                      }
                      title="Filter rankings with drops"
                      className={`px-2 py-0.5 font-bold border-l border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                        selectedChangeDirection === "down"
                          ? "bg-rose-500 text-white"
                          : "text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Filters Toolbar */}
            {isFiltersBarOpen && (
              <div
                data-testid="filters-toolbar"
                className="pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Multi-Mode Tags Dropdown */}
                <div className="relative" ref={tagsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                    aria-expanded={isTagsDropdownOpen}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    <span className="text-slate-400 font-normal">Tags:</span>
                    <span className="font-bold">
                      {selectedTags.length === 0 ? "All Tags" : `${selectedTags.length} selected`}
                    </span>
                    <span className="text-slate-400 text-[10px]">▾</span>
                  </button>

                  {isTagsDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Mode Switcher */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Match:</span>
                        <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                          <button
                            type="button"
                            onClick={() => setTagMatchMode("any")}
                            className={`px-2 py-0.5 font-semibold transition cursor-pointer ${
                              tagMatchMode === "any"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            Any (OR)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTagMatchMode("all")}
                            className={`px-2 py-0.5 font-semibold border-l border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                              tagMatchMode === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            All (AND)
                          </button>
                        </div>
                      </div>

                      {/* Search tags input */}
                      <input
                        type="text"
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="w-full px-2.5 py-1.5 mb-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />

                      {/* Tags checklist */}
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {ALL_KEYWORD_TAGS.filter((t) =>
                          t.toLowerCase().includes(tagSearch.toLowerCase())
                        ).map((tag) => (
                          <label
                            key={tag}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={() => handleToggleTag(tag)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{tag}</span>
                          </label>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        {selectedTags.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTags([])}
                            className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            Clear tags
                          </button>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => setIsTagsDropdownOpen(false)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Filters / Clear Button */}
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-semibold ml-auto"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}

            {/* Position Filter Pills & Table Search Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["ALL", "TOP 1", "TOP 3", "TOP 5", "TOP 10", "TOP 30", ">100"] as PositionFilter[]).map(
                  (tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedPositionTier(tier)}
                      className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                        selectedPositionTier === tier
                          ? "bg-[#252033] dark:bg-[#342e47] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tier}
                    </button>
                  )
                )}
              </div>

              {/* Table search & Column settings & View switcher */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isWorkComposerTest ? "Search 🔍" : "Search"}
                    className="w-48 px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {/* View Mode Switcher Dropdown */}
                <div className="relative" ref={viewModeMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsViewModeMenuOpen(!isViewModeMenuOpen)}
                    aria-expanded={isViewModeMenuOpen}
                    aria-haspopup="menu"
                    aria-label="View mode switcher"
                    title={`View mode: ${tableViewMode.charAt(0).toUpperCase() + tableViewMode.slice(1)}`}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isViewModeMenuOpen
                        ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:border-blue-400 dark:text-blue-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tableViewMode === "standard" && (
                      <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                    {tableViewMode === "compact" && (
                      <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 5h16M4 9h16M4 13h16M4 17h16M4 21h16" />
                      </svg>
                    )}
                    {tableViewMode === "cards" && (
                      <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    )}
                    <span>{tableViewMode.charAt(0).toUpperCase() + tableViewMode.slice(1)}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {isViewModeMenuOpen && (
                    <div
                      role="menu"
                      aria-label="View mode options"
                      className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800"
                    >
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Display Mode
                      </div>

                      <div className="py-1 space-y-1">
                        {/* Standard View */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setTableViewMode("standard");
                            setIsViewModeMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                            tableViewMode === "standard"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">☰</span>
                            <div>
                              <div className="font-medium">Standard view</div>
                              <div className="text-[10px] text-slate-400">Default row height and comfortable spacing</div>
                            </div>
                          </div>
                          {tableViewMode === "standard" && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                          )}
                        </button>

                        {/* Compact View */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setTableViewMode("compact");
                            setIsViewModeMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                            tableViewMode === "compact"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">☵</span>
                            <div>
                              <div className="font-medium">Compact view</div>
                              <div className="text-[10px] text-slate-400">Dense rows for maximum data density</div>
                            </div>
                          </div>
                          {tableViewMode === "compact" && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                          )}
                        </button>

                        {/* Cards View */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setTableViewMode("cards");
                            setIsViewModeMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                            tableViewMode === "cards"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">☷</span>
                            <div>
                              <div className="font-medium">Cards view</div>
                              <div className="text-[10px] text-slate-400">Card grid with competitor comparison chips</div>
                            </div>
                          </div>
                          {tableViewMode === "cards" && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Copy to Clipboard Dropdown (Directly to the left of COLUMNS) */}
                <div className="relative" ref={copyMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)}
                    aria-expanded={isCopyMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Copy to clipboard options"
                    title="Copy to clipboard"
                    className={`rounded-md px-2.5 py-1.5 flex items-center gap-1 cursor-pointer transition text-xs font-semibold ${
                      isCopyMenuOpen
                        ? "bg-[#544f70] text-white shadow-xs"
                        : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    {isCopyMenuOpen ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {isCopyMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Copy to clipboard options"
                      className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Option 1: Copy table */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleCopyTable}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs text-slate-800 dark:text-slate-100 transition text-left"
                      >
                        <span>Copy table</span>
                        <span className="text-slate-400 text-xs select-none">ⓘ</span>
                      </button>

                      {/* Option 2: Copy rows */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={selectedKeywords.length === 0}
                        onClick={handleCopyRows}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition text-left ${
                          selectedKeywords.length === 0
                            ? "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <span>Copy rows</span>
                        <span className="text-slate-400 text-xs select-none">ⓘ</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative" ref={columnsMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                    aria-expanded={isColumnsMenuOpen}
                    aria-haspopup="dialog"
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isColumnsMenuOpen
                        ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:border-blue-400 dark:text-blue-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <span>COLUMNS</span>
                  </button>

                  {isColumnsMenuOpen && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Table columns configuration"
                      className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                          <span>Columns</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({visibleColumns.length}/{AVAILABLE_TABLE_COLUMNS.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsColumnsMenuOpen(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                          aria-label="Close columns menu"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Search input */}
                      <input
                        type="text"
                        placeholder="Search columns..."
                        value={columnSearch}
                        onChange={(e) => setColumnSearch(e.target.value)}
                        className="w-full px-2.5 py-1.5 mb-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />

                      {/* Quick actions */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllColumns}
                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                          >
                            Select all
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            type="button"
                            onClick={handleDeselectAllColumns}
                            className="text-slate-500 hover:underline cursor-pointer"
                          >
                            Deselect all
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetColumns}
                          className="text-slate-500 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Column items list */}
                      <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                        {columnOrder
                          .filter((colId) => {
                            const def = AVAILABLE_TABLE_COLUMNS.find((c) => c.id === colId);
                            if (!def) return false;
                            return def.label.toLowerCase().includes(columnSearch.toLowerCase());
                          })
                          .map((colId) => {
                            const def = AVAILABLE_TABLE_COLUMNS.find((c) => c.id === colId)!;
                            const isVisible = visibleColumns.includes(colId);
                            const isPinned = pinnedColumns.includes(colId);
                            const currentIndex = columnOrder.indexOf(colId);

                            return (
                              <div
                                key={colId}
                                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70 transition text-slate-700 dark:text-slate-200 group"
                              >
                                {/* Reorder Controls */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveColumn(currentIndex, "up")}
                                    disabled={currentIndex === 0}
                                    title={`Move ${def.label} up`}
                                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer text-[10px]"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveColumn(currentIndex, "down")}
                                    disabled={currentIndex === columnOrder.length - 1}
                                    title={`Move ${def.label} down`}
                                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer text-[10px]"
                                  >
                                    ▼
                                  </button>
                                </div>

                                {/* Visibility Checkbox */}
                                <input
                                  type="checkbox"
                                  id={`col-toggle-${colId}`}
                                  checked={isVisible}
                                  disabled={!def.canHide}
                                  onChange={() => handleToggleColumn(colId)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                />

                                {/* Label */}
                                <label
                                  htmlFor={`col-toggle-${colId}`}
                                  className={`flex-1 truncate cursor-pointer select-none text-xs ${
                                    isVisible
                                      ? "font-semibold text-slate-800 dark:text-slate-200"
                                      : "text-slate-400 dark:text-slate-500"
                                  }`}
                                >
                                  {def.label}
                                </label>

                                {/* Pin Button */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePin(colId)}
                                  title={isPinned ? `Unpin ${def.label}` : `Pin ${def.label} to left`}
                                  className={`p-1 rounded text-xs transition cursor-pointer ${
                                    isPinned
                                      ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold"
                                      : "text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                                  }`}
                                >
                                  📌
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400">
                          {pinnedColumns.length > 0 ? `${pinnedColumns.length} pinned` : "0 pinned"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsColumnsMenuOpen(false)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition cursor-pointer shadow-xs"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Keyword Comparison Table or Cards View */}
          {tableViewMode === "cards" ? (
            <div className="space-y-4" data-testid="keyword-cards-view">
              {filteredKeywords.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
                  No keyword comparisons match the selected filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="keyword-cards-grid">
                  {filteredKeywords.map((row) => {
                    const isSelected = selectedKeywords.includes(row.id);
                    return (
                      <div
                        key={row.id}
                        className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition space-y-3.5 border-l-4 ${row.colorStripe} ${
                          isSelected ? "ring-2 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-950/10" : ""
                        }`}
                      >
                        {/* Header: Checkbox + Keyword + Volume */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleRow(row.id)}
                              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label={`Select keyword ${row.keyword}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                                <span className="text-slate-400 text-xs">🌐</span>
                                <span title={row.keyword}>{row.keyword}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {row.group && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                                    {row.group}
                                  </span>
                                )}
                                {row.tags?.map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px]"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                              {row.searchVolumeDisplay}
                            </div>
                            <div className="text-[10px] text-slate-400">vol.</div>
                          </div>
                        </div>

                        {/* Competitors Position Grid */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Competitor Positions
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {/* Dynamic Competitors Grid */}
                            {activeColumns
                              .filter((c) => c.category === "competitor" && visibleColumns.includes(c.id))
                              .map((compCol) => {
                                const compRank = row.ranks[compCol.id];
                                return (
                                  <div
                                    key={compCol.id}
                                    className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800/50"
                                  >
                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[90px]">
                                      {compCol.label}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                      {compRank?.position ?? "—"}
                                      {compRank?.change ? (
                                        <span
                                          className={
                                            compRank.change > 0
                                              ? "text-emerald-500 text-[10px] ml-0.5"
                                              : "text-red-500 text-[10px] ml-0.5"
                                          }
                                        >
                                          {compRank.change > 0
                                            ? `▲${compRank.change}`
                                            : `▼${Math.abs(compRank.change)}`}
                                        </span>
                                      ) : null}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Footer details */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Score: <strong className="text-slate-600 dark:text-slate-300">{row.contentScore ?? 85}</strong></span>
                          <span>CPC: <strong className="text-slate-600 dark:text-slate-300">{row.cpc ?? "$1.20"}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-slate-200 dark:divide-slate-800 ${tableViewMode === "compact" ? "text-[11px]" : "text-xs"}`}>
                  <thead className={`bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${tableViewMode === "compact" ? "text-[10px]" : "text-[11px]"}`}>
                  <tr>
                    <th className={`py-3 px-4 text-left w-10 ${pinnedColumns.length > 0 ? "sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 shadow-xs" : ""}`}>
                      <input
                        type="checkbox"
                        checked={
                          filteredKeywords.length > 0 &&
                          selectedKeywords.length === filteredKeywords.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all keywords"
                      />
                    </th>
                    {columnOrder
                      .filter((colId) => visibleColumns.includes(colId))
                      .map((colId) => {
                        const isPinned = pinnedColumns.includes(colId);
                        const stickyClass = isPinned ? "sticky left-10 bg-slate-50 dark:bg-slate-800 z-20 shadow-xs" : "";
                        const colDef = activeColumns.find((c) => c.id === colId);

                        if (colId === "keywords") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-left font-bold ${stickyClass}`}>
                              SEARCH ENGINES &amp; KEYWORDS
                            </th>
                          );
                        }
                        if (colId === "searchVolume") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-right font-bold ${stickyClass}`}>
                              SEARCH VOL.
                            </th>
                          );
                        }
                        if (colId === "group") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              GROUP
                            </th>
                          );
                        }
                        if (colId === "tags") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              TAGS
                            </th>
                          );
                        }
                        if (colId === "serpFeatures") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              SERP FEATURES
                            </th>
                          );
                        }
                        if (colId === "contentScore") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              CONTENT SCORE
                            </th>
                          );
                        }
                        if (colId === "cpc") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              CPC
                            </th>
                          );
                        }
                        if (colId === "competition") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center font-bold ${stickyClass}`}>
                              COMPETITION
                            </th>
                          );
                        }

                        // Competitor Column Header
                        if (colDef && colDef.category === "competitor") {
                          return (
                            <th key={colId} className={`py-3 px-4 text-center ${stickyClass}`}>
                              <div className="flex items-center justify-center gap-1.5 font-bold uppercase">
                                {colDef.faviconUrl ? (
                                  <img
                                    src={colDef.faviconUrl}
                                    alt=""
                                    className="w-3.5 h-3.5 object-contain rounded-xs shrink-0"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-bold">
                                    {colDef.label.charAt(0).toUpperCase()}
                                  </span>
                                )}
                                <span className="truncate max-w-[130px]">{colDef.label}</span>
                              </div>
                            </th>
                          );
                        }

                        return null;
                      })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={1 + columnOrder.filter((id) => visibleColumns.includes(id)).length} className="py-12 text-center text-slate-500">
                        No keyword comparisons match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredKeywords.map((row) => {
                      const isSelected = selectedKeywords.includes(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition border-l-4 ${
                            row.colorStripe.startsWith("border-") ? row.colorStripe : ""
                          } ${
                            isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                          }`}
                          style={{
                            borderLeftColor: row.colorStripe.startsWith("#") ? row.colorStripe : undefined,
                          }}
                        >
                          <td className={`py-3 px-4 ${pinnedColumns.length > 0 ? "sticky left-0 bg-white dark:bg-slate-900 z-10" : ""}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleRow(row.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label={`Select keyword ${row.keyword}`}
                            />
                          </td>
                          {columnOrder
                            .filter((colId) => visibleColumns.includes(colId))
                            .map((colId) => {
                              const isPinned = pinnedColumns.includes(colId);
                              const stickyClass = isPinned ? "sticky left-10 bg-white dark:bg-slate-900 z-10 shadow-xs" : "";
                              const colDef = activeColumns.find((c) => c.id === colId);

                              if (colId === "keywords") {
                                return (
                                  <td key={colId} className={`py-3 px-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 ${stickyClass}`}>
                                    {row.colorStripe && (
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{
                                          backgroundColor: row.colorStripe.startsWith("#") ? row.colorStripe : undefined,
                                        }}
                                      />
                                    )}
                                    <span className="cursor-pointer hover:text-blue-600 transition-colors">{row.keyword}</span>
                                  </td>
                                );
                              }
                              if (colId === "searchVolume") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300 ${stickyClass}`}>
                                    {row.searchVolumeDisplay}
                                  </td>
                                );
                              }
                              if (colId === "group") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center ${stickyClass}`}>
                                    {row.group ? (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {row.group}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                );
                              }
                              if (colId === "tags") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center ${stickyClass}`}>
                                    {row.tags && row.tags.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 justify-center max-w-[140px] mx-auto">
                                        {row.tags.map((t) => (
                                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                );
                              }
                              if (colId === "serpFeatures") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center text-slate-400 ${stickyClass}`}>
                                    🔍 ⭐
                                  </td>
                                );
                              }
                              if (colId === "contentScore") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center font-bold text-emerald-600 ${stickyClass}`}>
                                    {row.contentScore ?? 85}
                                  </td>
                                );
                              }
                              if (colId === "cpc") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-mono ${stickyClass}`}>
                                    {row.cpc ?? "$1.20"}
                                  </td>
                                );
                              }
                              if (colId === "competition") {
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-mono ${stickyClass}`}>
                                    {row.competition ?? 0.45}
                                  </td>
                                );
                              }

                              // Competitor Rank Cell
                              if (colDef && colDef.category === "competitor") {
                                const rankItem = row.ranks[colId];
                                return (
                                  <td key={colId} className={`py-3 px-4 text-center ${stickyClass}`}>
                                    {rankItem ? (
                                      <span
                                        className={`inline-flex items-center justify-center gap-1 min-w-[28px] ${
                                          rankItem.position !== undefined && rankItem.position <= 10
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold px-2 py-0.5 rounded text-xs"
                                            : "text-slate-800 dark:text-slate-200 font-semibold"
                                        }`}
                                      >
                                        {rankItem.position}
                                        {rankItem.change !== undefined && (
                                          <span
                                            className={`text-[10px] font-bold ${
                                              rankItem.change > 0
                                                ? "text-emerald-700 dark:text-emerald-300"
                                                : "text-rose-600 dark:text-rose-400"
                                            }`}
                                          >
                                            {rankItem.change > 0
                                              ? `▲${rankItem.change}`
                                              : `▼${Math.abs(rankItem.change)}`}
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-semibold">-</span>
                                    )}
                                  </td>
                                );
                              }

                              return null;
                            })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Pagination & Legend & Rows per page */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              {/* Pagination */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded font-bold transition cursor-pointer ${
                    currentPage === 1
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded font-bold transition cursor-pointer ${
                    currentPage === 2
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  2
                </button>
              </div>

              {/* Movement Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Entered Top 10
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Left Top 10
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
                  In Top 10
                </span>
                <span className="flex items-center gap-1.5 text-blue-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Entered Top 100
                </span>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-1">
                <span>View on page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold text-xs cursor-pointer focus:outline-none"
                >
                  <option value={10}>10 ▾</option>
                  <option value={25}>25 ▾</option>
                  <option value={50}>50 ▾</option>
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Managed Competitor Domains Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Active Competitor Domains ({competitors.length}/5)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Domains actively benchmarked for ranking overlap and visibility scores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView("detailed")}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                View Detailed Table →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {competitors.length === 0 ? (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  No active competitors added yet. Click &quot;+ ADD COMPETITOR&quot; above to add your first domain.
                </div>
              ) : (
                competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {comp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {comp.domain}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditCompetitor && onEditCompetitor(comp)}
                          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCompetitor && onDeleteCompetitor(comp)}
                          className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Active Progress Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-xs font-semibold border border-slate-700/50 dark:border-slate-200"
        >
          <svg
            className="w-4 h-4 text-emerald-400 dark:text-emerald-600 animate-spin flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 cursor-pointer text-sm leading-none"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* EXPORT MODAL DIALOG */}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
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
        onCopied={() => setToastMessage("Guest link copied to clipboard!")}
      />
    </div>
  );
}

export default AddedCompetitorsView;
