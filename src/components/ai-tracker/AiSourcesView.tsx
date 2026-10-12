"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Gauge,
  ChevronDown,
  ChevronUp,
  RotateCw,
  ExternalLink,
  Settings,
  X,
  Check,
  Download,
  Info,
  Link2,
  Calendar,
  Filter,
  Plus,
  ArrowUpDown,
  Columns,
  ChevronRight,
} from "lucide-react";
import { CalendarYearDropdown } from "../competitors/CalendarYearDropdown";
import { GuestLinkModal } from "../competitors/GuestLinkModal";

const CAL_FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CAL_MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

const formatDisplayDate = (d: Date) => {
  return `${d.getDate()} ${CAL_MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

export interface AiSourcesViewProps {
  projectId: string;
  projectDomain?: string;
}

export type SourceViewMode = "Domains" | "Pages";

export interface BrandCheckboxItem {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  active: boolean;
  x: number; // AI answers mentions (0 - 14)
  y: number; // Sources mentions (0 - 25)
  radius: number;
}

export interface SourcePageItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  categories: string[];
  aiAnswersCount: number;
  aiAnswers: { engine: string; date: string }[];
  promptsCount: number;
  prompts: string[];
  coverage: string;
  domainTrust: string;
  pageTraffic: string;
  isBrandMentioned: boolean;
  mentions: string[];
  hasBacklink: boolean;
  firstSeen?: string;
  lastSeen?: string;
  lastCheck?: string;
}

export interface SourceDomainItem {
  id: string;
  domain: string;
  domainTrust: string;
  pagesCount: number;
  aiAnswersCount: number;
  promptsCount: number;
  coverage: string;
  traffic: string;
  isBrandMentioned: boolean;
  hasBacklink: boolean;
  firstSeen?: string;
  lastSeen?: string;
  lastCheck?: string;
}

const INITIAL_BRAND_CHECKBOXES: BrandCheckboxItem[] = [
  {
    id: "asana",
    name: "Asana",
    color: "#3b82f6",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-300",
    active: true,
    x: 12,
    y: 16,
    radius: 28,
  },
  {
    id: "slack",
    name: "Slack",
    color: "#10b981",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-700 dark:text-emerald-300",
    active: true,
    x: 8,
    y: 12,
    radius: 24,
  },
  {
    id: "jira",
    name: "Jira",
    color: "#f97316",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    textColor: "text-orange-700 dark:text-orange-300",
    active: true,
    x: 8.5,
    y: 12,
    radius: 24,
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    color: "#eab308",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-700 dark:text-amber-300",
    active: true,
    x: 9,
    y: 7,
    radius: 20,
  },
  {
    id: "clickup",
    name: "ClickUp",
    color: "#a855f7",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    textColor: "text-purple-700 dark:text-purple-300",
    active: true,
    x: 10,
    y: 8,
    radius: 22,
  },
  {
    id: "zoho-projects",
    name: "Zoho Projects",
    color: "#ef4444",
    borderColor: "border-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    textColor: "text-red-700 dark:text-red-300",
    active: true,
    x: 9.2,
    y: 7,
    radius: 20,
  },
  {
    id: "notion",
    name: "Notion",
    color: "#8b5cf6",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    textColor: "text-violet-700 dark:text-violet-300",
    active: true,
    x: 5,
    y: 5,
    radius: 16,
  },
  {
    id: "trello",
    name: "Trello",
    color: "#ec4899",
    borderColor: "border-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/40",
    textColor: "text-pink-700 dark:text-pink-300",
    active: true,
    x: 6,
    y: 5,
    radius: 18,
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    color: "#84cc16",
    borderColor: "border-lime-600",
    bgColor: "bg-lime-50 dark:bg-lime-950/40",
    textColor: "text-lime-800 dark:text-lime-300",
    active: true,
    x: 7,
    y: 4,
    radius: 16,
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    color: "#14b8a6",
    borderColor: "border-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
    textColor: "text-teal-700 dark:text-teal-300",
    active: true,
    x: 5.2,
    y: 5,
    radius: 16,
  },
  {
    id: "zoom",
    name: "Zoom",
    color: "#06b6d4",
    borderColor: "border-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    textColor: "text-cyan-700 dark:text-cyan-300",
    active: false,
    x: 4,
    y: 3,
    radius: 15,
  },
  {
    id: "monday-com",
    name: "monday.com",
    color: "#f43f5e",
    borderColor: "border-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    textColor: "text-rose-700 dark:text-rose-300",
    active: false,
    x: 7.5,
    y: 9,
    radius: 20,
  },
  {
    id: "clockify",
    name: "Clockify",
    color: "#0284c7",
    borderColor: "border-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    textColor: "text-sky-700 dark:text-sky-300",
    active: false,
    x: 3.5,
    y: 4,
    radius: 14,
  },
  {
    id: "n8n",
    name: "n8n",
    color: "#ea580c",
    borderColor: "border-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    textColor: "text-orange-800 dark:text-orange-300",
    active: false,
    x: 2.5,
    y: 2,
    radius: 12,
  },
  {
    id: "toggl-track",
    name: "Toggl Track",
    color: "#dc2626",
    borderColor: "border-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    textColor: "text-red-800 dark:text-red-300",
    active: false,
    x: 4.2,
    y: 3.5,
    radius: 14,
  },
  {
    id: "zapier",
    name: "Zapier",
    color: "#ff4f00",
    borderColor: "border-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-800 dark:text-amber-300",
    active: false,
    x: 6.5,
    y: 6,
    radius: 17,
  },
  {
    id: "confluence",
    name: "Confluence",
    color: "#2563eb",
    borderColor: "border-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-800 dark:text-blue-300",
    active: false,
    x: 5.5,
    y: 4.5,
    radius: 15,
  },
  {
    id: "zoho-cliq",
    name: "Zoho Cliq",
    color: "#16a34a",
    borderColor: "border-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    textColor: "text-green-800 dark:text-green-300",
    active: false,
    x: 3,
    y: 2.5,
    radius: 13,
  },
  {
    id: "darwinbox",
    name: "Darwinbox",
    color: "#7c3aed",
    borderColor: "border-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    textColor: "text-purple-800 dark:text-purple-300",
    active: false,
    x: 2,
    y: 1.5,
    radius: 11,
  },
  {
    id: "miro",
    name: "Miro",
    color: "#f59e0b",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    textColor: "text-yellow-800 dark:text-yellow-300",
    active: false,
    x: 4.8,
    y: 3.8,
    radius: 15,
  },
];

export const AVAILABLE_GROUPS = ["General"];

export const ALL_AVAILABLE_PROMPTS = [
  "What are the best tools for enhancing team productivity and collaboration?",
  "What are some reliable work management tools to help my team stay organized?",
  "What are the best tools for improving team communication and collaboration?",
  "What features should I look for in a project management software for my remote team?",
  "I'm looking for a way to automate our team's workflows; can you recommend a solution?",
  "Can you recommend a reliable time tracking software for my remote team?",
  "What are the best remote work tools that help with team collaboration?",
  "What are the best tools for improving employee engagement in our company?",
  "How can I improve resource allocation for my team?",
  "What are the best tools for streamlining my team's workflow?",
];

export const TABLE_FILTER_OPTIONS = [
  { id: "brandsInAiAnswer", label: "Brands in AI answer" },
  { id: "isBrandMentioned", label: "Is brand mentioned?" },
  { id: "hasBacklink", label: "Has backlink?" },
  { id: "brandsInSourcePage", label: "Brands in source page" },
  { id: "trackedCompetitorsCount", label: "Number of tracked competitors in source" },
  { id: "trackedCompetitors", label: "Tracked competitors in source" },
  { id: "sourceFirstSeen", label: "Source first seen" },
  { id: "sourceLastSeen", label: "Source last seen" },
  { id: "type", label: "Type" },
];

export const SOURCE_TABLE_COLUMNS = [
  { id: "url", label: "URL" },
  { id: "aiAnswers", label: "AI answers" },
  { id: "prompts", label: "Prompts" },
  { id: "coverage", label: "Coverage" },
  { id: "domainTrust", label: "Domain Trust" },
  { id: "pageTraffic", label: "Page Traffic" },
  { id: "isBrandMentioned", label: "Is brand mentioned?" },
  { id: "mentions", label: "Mentions" },
  { id: "hasBacklink", label: "Has backlink?" },
  { id: "firstLastSeen", label: "First/Last seen" },
  { id: "lastCheck", label: "Last check" },
];

export const ALL_SOURCE_TYPES = [
  "File",
  "Video",
  "Social",
  "Community/forum",
  "Q&A/knowledge sharing",
  "Wiki",
  "Media",
  "Blog/content",
  "Product page",
  "Jobs/careers",
  "Education/courses",
  "Local/maps",
  "App/SaaS/tools",
  "Search",
  "Homepage",
  "Other",
  "Article",
  "Comparison page",
  "Documentation",
  "FAQ page",
  "How-to guide",
  "Listicle",
];

export const BUILT_IN_FILTER_PRESETS = [
  { id: "Default", label: "Default" },
  { id: "Brand mentioned", label: "Brand mentioned" },
  { id: "Brand not mentioned", label: "Brand not mentioned" },
  { id: "High-impact sources", label: "High-impact sources" },
  { id: "Has backlink", label: "Has backlink" },
  { id: "No backlink", label: "No backlink" },
];

const INITIAL_SOURCE_PAGES: SourcePageItem[] = [
  {
    id: "sp-1",
    title: "The 8 Best Team Communication Tools to Boost Collaboration in 2026",
    url: "https://slack.com/blog/collaboration/team-communication-tools",
    domain: "slack.com",
    categories: ["Blog/content", "Article"],
    aiAnswersCount: 4,
    aiAnswers: [
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-22" },
      { engine: "Google AI Overviews", date: "2026-09-22" },
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-21" },
      { engine: "Google AI Overviews", date: "2026-09-20" },
    ],
    promptsCount: 3,
    prompts: [
      "What are the best tools for enhancing team productivity and collaboration?",
      "Top workplace communication platforms for remote teams",
      "Best messaging apps for enterprise business collaboration",
    ],
    coverage: "13.3%",
    domainTrust: "97",
    pageTraffic: "10.6K",
    isBrandMentioned: false,
    mentions: ["Slack", "Flowace"],
    hasBacklink: false,
  },
  {
    id: "sp-2",
    title: "Best Project Management Software & Productivity Suites 2026 - AppAdvisor",
    url: "https://www.appadvisor.in/best-productivity-tools-2026",
    domain: "appadvisor.in",
    categories: ["Blog/content", "Listicle"],
    aiAnswersCount: 3,
    aiAnswers: [
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-22" },
      { engine: "Perplexity AI", date: "2026-09-22" },
      { engine: "Google AI Overviews", date: "2026-09-21" },
    ],
    promptsCount: 2,
    prompts: [
      "What are the best tools for enhancing team productivity and collaboration?",
      "Leading project task management software in India",
    ],
    coverage: "10%",
    domainTrust: "91",
    pageTraffic: "339",
    isBrandMentioned: false,
    mentions: ["Appadvisor"],
    hasBacklink: false,
  },
  {
    id: "sp-3",
    title: "Microsoft Teams Pricing, Features, and Enterprise Video Calls",
    url: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
    domain: "microsoft.com",
    categories: ["Homepage", "App/SaaS/tools"],
    aiAnswersCount: 3,
    aiAnswers: [
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-22" },
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-21" },
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-20" },
    ],
    promptsCount: 2,
    prompts: [
      "What are the best tools for enhancing team productivity and collaboration?",
      "Microsoft 365 vs Google Workspace suite comparison",
    ],
    coverage: "10%",
    domainTrust: "100",
    pageTraffic: "40K",
    isBrandMentioned: false,
    mentions: ["Microsoft"],
    hasBacklink: false,
  },
  {
    id: "sp-4",
    title: "ClickUp vs Asana: Features, Project Tracking, and Workflows Breakdown",
    url: "https://help.clickup.com/hc/en-us/articles/clickup-vs-asana",
    domain: "clickup.com",
    categories: ["Documentation", "Comparison page"],
    aiAnswersCount: 2,
    aiAnswers: [
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-22" },
      { engine: "Google AI Overviews", date: "2026-09-22" },
    ],
    promptsCount: 2,
    prompts: [
      "What are the best tools for enhancing team productivity and collaboration?",
      "Asana alternative for agile sprint planning",
    ],
    coverage: "6.7%",
    domainTrust: "85",
    pageTraffic: "24K",
    isBrandMentioned: false,
    mentions: ["ClickUp", "Asana"],
    hasBacklink: false,
  },
  {
    id: "sp-5",
    title: "Best Employee Engagement and Collaboration Guide - AppAdvisor India",
    url: "https://www.appadvisor.in/team-collaboration-guide",
    domain: "appadvisor.in",
    categories: ["Blog/content", "How-to guide"],
    aiAnswersCount: 2,
    aiAnswers: [
      { engine: "ChatGPT (GPT-4o)", date: "2026-09-22" },
      { engine: "Perplexity AI", date: "2026-09-20" },
    ],
    promptsCount: 1,
    prompts: ["What are the best tools for enhancing team productivity and collaboration?"],
    coverage: "6.7%",
    domainTrust: "91",
    pageTraffic: "75",
    isBrandMentioned: false,
    mentions: ["Appadvisor"],
    hasBacklink: false,
  },
  {
    id: "sp-6",
    title: "Capacity Planning for IT, Agile Projects, and Enterprise Operations",
    url: "https://www.workday.com/en-us/solutions/capacity-planning.html",
    domain: "workday.com",
    categories: ["Community/forum", "Q&A/knowledge sharing", "Other"],
    aiAnswersCount: 1,
    aiAnswers: [{ engine: "ChatGPT (GPT-4o)", date: "2026-09-22" }],
    promptsCount: 1,
    prompts: ["What are the best tools for enhancing team productivity and collaboration?"],
    coverage: "3.3%",
    domainTrust: "89",
    pageTraffic: "63",
    isBrandMentioned: false,
    mentions: ["N/A"],
    hasBacklink: false,
  },
  {
    id: "sp-7",
    title: "Workforce Capacity Planning & Employee Performance Monitoring Guide",
    url: "https://www.insightful.io/blog/workforce-capacity-planning",
    domain: "insightful.io",
    categories: ["Blog/content", "Education/courses"],
    aiAnswersCount: 1,
    aiAnswers: [{ engine: "Google AI Overviews", date: "2026-09-22" }],
    promptsCount: 1,
    prompts: ["What are the best tools for enhancing team productivity and collaboration?"],
    coverage: "3.3%",
    domainTrust: "83",
    pageTraffic: "11",
    isBrandMentioned: false,
    mentions: ["N/A"],
    hasBacklink: false,
  },
  {
    id: "sp-8",
    title: "Slack Features: Team Messaging, Canvas, and Automation Huddles",
    url: "https://slack.com/features",
    domain: "slack.com",
    categories: ["Product page", "Video"],
    aiAnswersCount: 1,
    aiAnswers: [{ engine: "ChatGPT (GPT-4o)", date: "2026-09-22" }],
    promptsCount: 1,
    prompts: ["What are the best tools for enhancing team productivity and collaboration?"],
    coverage: "3.3%",
    domainTrust: "97",
    pageTraffic: "0",
    isBrandMentioned: false,
    mentions: ["Slack"],
    hasBacklink: false,
  },
  {
    id: "sp-9",
    title: "Capture, organize, and prioritize work with flexible Trello boards",
    url: "https://trello.com/",
    domain: "trello.com",
    categories: ["Homepage", "Jobs/careers"],
    aiAnswersCount: 1,
    aiAnswers: [{ engine: "ChatGPT (GPT-4o)", date: "2026-09-22" }],
    promptsCount: 1,
    prompts: ["What are the best tools for enhancing team productivity and collaboration?"],
    coverage: "3.3%",
    domainTrust: "95",
    pageTraffic: "0",
    isBrandMentioned: false,
    mentions: ["Trello"],
    hasBacklink: false,
  },
];

export function AiSourcesView({
  projectId,
  projectDomain = "workcomposer.com",
}: AiSourcesViewProps) {
  const router = useRouter();
  const baseHref = `/projects/${projectId}`;

  // 1. Top Alert banner dismissal state
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // 2. Speedometer limits modal & guest link modal state
  const [isPromptLimitModalOpen, setIsPromptLimitModalOpen] = useState(false);
  const promptLimitRef = useRef<HTMLDivElement>(null);
  const [isGuestLinkModalOpen, setIsGuestLinkModalOpen] = useState(false);
  const [hideSearchVolume, setHideSearchVolume] = useState(false);
  const [includeFilterSort, setIncludeFilterSort] = useState(true);
  const [guestModules, setGuestModules] = useState<Record<string, boolean>>({
    overview: true,
    rankings: true,
    analytics: true,
    competitors: true,
    aiResultsTracker: true,
    websiteAudit: true,
    marketingPlan: true,
  });

  // 3. Modals: Add Prompts & Export
  const [isAddPromptsOpen, setIsAddPromptsOpen] = useState(false);
  const [newPromptsInput, setNewPromptsInput] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX">("XLSX");

  // 4. Filters Toolbar state
  const [selectedEngine, setSelectedEngine] = useState("All search engines");
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = useState("20 Sep 2026 - 22 Sep 2026");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [stagedRangeStart, setStagedRangeStart] = useState<Date>(new Date(2026, 8, 20));
  const [stagedRangeEnd, setStagedRangeEnd] = useState<Date>(new Date(2026, 8, 22));
  const [appliedRangeStart, setAppliedRangeStart] = useState<Date>(new Date(2026, 8, 20));
  const [appliedRangeEnd, setAppliedRangeEnd] = useState<Date>(new Date(2026, 8, 22));
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(7); // August
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(8); // September
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);
  const [compareByDates, setCompareByDates] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // 4. Groups Filter state
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(AVAILABLE_GROUPS);
  const [stagedSelectedGroups, setStagedSelectedGroups] = useState<string[]>(AVAILABLE_GROUPS);
  const [isGeneralGroupSelected, setIsGeneralGroupSelected] = useState(true);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // 4b. Prompts Filter state
  const [isPromptFilterOpen, setIsPromptFilterOpen] = useState(false);
  const [promptSearchQuery, setPromptSearchQuery] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>(ALL_AVAILABLE_PROMPTS);
  const [stagedSelectedPrompts, setStagedSelectedPrompts] = useState<string[]>(ALL_AVAILABLE_PROMPTS);
  const [selectedPromptFilter, setSelectedPromptFilter] = useState("All prompts");
  const promptFilterRef = useRef<HTMLDivElement>(null);

  // 5. Recommendations accordion state
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);

  // 6. Bubble Scatter Chart state
  const [brandCheckboxes, setBrandCheckboxes] = useState<BrandCheckboxItem[]>(
    INITIAL_BRAND_CHECKBOXES
  );
  const [hoveredBubble, setHoveredBubble] = useState<BrandCheckboxItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // 7. Sources Data Table state
  const [viewMode, setViewMode] = useState<SourceViewMode>("Pages");
  const tableSectionRef = useRef<HTMLDivElement | null>(null);

  const handleRecommendationClick = () => {
    setViewMode("Pages");
    if (tableSectionRef.current && typeof tableSectionRef.current.scrollIntoView === "function") {
      tableSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const [tableSearchQuery, setTableSearchQuery] = useState("");

  // Table filters enabled via "+ Filter"
  const [activeTableFilters, setActiveTableFilters] = useState<Record<string, boolean>>({
    brandsInAiAnswer: true,
    isBrandMentioned: true,
    hasBacklink: false,
    brandsInSourcePage: false,
    trackedCompetitorsCount: false,
    trackedCompetitors: false,
    sourceFirstSeen: false,
    sourceLastSeen: false,
    type: true,
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Brands in AI answer range filter (From / To)
  const [isBrandsInAiAnswerDropdownOpen, setIsBrandsInAiAnswerDropdownOpen] = useState(false);
  const [brandsFromInput, setBrandsFromInput] = useState("");
  const [brandsToInput, setBrandsToInput] = useState("");
  const [appliedBrandsRange, setAppliedBrandsRange] = useState<{
    from: number | null;
    to: number | null;
  }>({
    from: null,
    to: null,
  });
  const brandsInAiAnswerRef = useRef<HTMLDivElement>(null);

  // Is brand mentioned filter (Yes / No)
  const [isBrandMentionedFilter, setIsBrandMentionedFilter] = useState<boolean | null>(false);
  const [isBrandMentionedDropdownOpen, setIsBrandMentionedDropdownOpen] = useState(false);
  const brandMentionedDropdownRef = useRef<HTMLDivElement>(null);

  // Has backlink filter (Yes / No)
  const [hasBacklinkFilter, setHasBacklinkFilter] = useState<boolean | null>(null);
  const [isBacklinkDropdownOpen, setIsBacklinkDropdownOpen] = useState(false);
  const backlinkDropdownRef = useRef<HTMLDivElement>(null);

  // Type filter (Multi-select)
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([]);
  const [stagedSelectedTypes, setStagedSelectedTypes] = useState<string[]>([]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Filter presets & nested save flyout
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>("Default");
  const [customPresets, setCustomPresets] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ai_sources_filter_presets");
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const presetsRef = useRef<HTMLDivElement>(null);

  const [selectedBrandInAnswer, setSelectedBrandInAnswer] = useState<string>("All brands");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    url: true,
    aiAnswers: true,
    prompts: true,
    coverage: true,
    domainTrust: true,
    pageTraffic: true,
    isBrandMentioned: true,
    mentions: true,
    hasBacklink: true,
    firstLastSeen: false,
    lastCheck: true,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);

  // Popover detail modal/dropdown for AI Answers & Prompts badges
  const [activeDetailPopover, setActiveDetailPopover] = useState<{
    id: string;
    type: "answers" | "prompts";
    items: string[] | { engine: string; date: string }[];
  } | null>(null);
  const detailPopoverRef = useRef<HTMLDivElement>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (promptLimitRef.current && !promptLimitRef.current.contains(e.target as Node)) {
        setIsPromptLimitModalOpen(false);
      }
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
      }
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
      if (promptFilterRef.current && !promptFilterRef.current.contains(e.target as Node)) {
        setIsPromptFilterOpen(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
      if (brandsInAiAnswerRef.current && !brandsInAiAnswerRef.current.contains(e.target as Node)) {
        setIsBrandsInAiAnswerDropdownOpen(false);
      }
      if (
        brandMentionedDropdownRef.current &&
        !brandMentionedDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBrandMentionedDropdownOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (backlinkDropdownRef.current && !backlinkDropdownRef.current.contains(e.target as Node)) {
        setIsBacklinkDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
      }
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target as Node)) {
        setIsColumnsDropdownOpen(false);
      }
      if (detailPopoverRef.current && !detailPopoverRef.current.contains(e.target as Node)) {
        setActiveDetailPopover(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPromptLimitModalOpen(false);
        setIsGuestLinkModalOpen(false);
        setIsAddPromptsOpen(false);
        setIsExportModalOpen(false);
        setIsDatePickerOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsEngineDropdownOpen(false);
        setIsGroupDropdownOpen(false);
        setIsPromptFilterOpen(false);
        setIsBrandDropdownOpen(false);
        setIsBrandsInAiAnswerDropdownOpen(false);
        setIsBrandMentionedDropdownOpen(false);
        setIsFilterMenuOpen(false);
        setIsBacklinkDropdownOpen(false);
        setIsTypeDropdownOpen(false);
        setIsPresetsOpen(false);
        setIsSaveFlyoutOpen(false);
        setIsColumnsDropdownOpen(false);
        setActiveDetailPopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered source pages
  const filteredPages = useMemo(() => {
    return INITIAL_SOURCE_PAGES.filter((page) => {
      // Group filter
      if (selectedGroups.length === 0) return false;

      // Prompt filter
      if (selectedPrompts.length === 0) return false;
      if (selectedPrompts.length < ALL_AVAILABLE_PROMPTS.length) {
        const matchesPrompt = page.prompts.some((p) => selectedPrompts.includes(p));
        if (!matchesPrompt) return false;
      }

      // Search filter
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.trim().toLowerCase();
        const matchesText =
          page.title.toLowerCase().includes(q) ||
          page.url.toLowerCase().includes(q) ||
          page.domain.toLowerCase().includes(q) ||
          page.categories.some((c) => c.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Is brand mentioned filter
      if (activeTableFilters.isBrandMentioned && isBrandMentionedFilter !== null) {
        if (page.isBrandMentioned !== isBrandMentionedFilter) return false;
      }

      // Brands in AI answer range filter
      if (
        activeTableFilters.brandsInAiAnswer &&
        (appliedBrandsRange.from !== null || appliedBrandsRange.to !== null)
      ) {
        const count = page.mentions.length;
        if (appliedBrandsRange.from !== null && count < appliedBrandsRange.from) return false;
        if (appliedBrandsRange.to !== null && count > appliedBrandsRange.to) return false;
      }

      // Has backlink filter
      if (activeTableFilters.hasBacklink && hasBacklinkFilter !== null) {
        if (page.hasBacklink !== hasBacklinkFilter) return false;
      }

      // Type filter (multi-select)
      if (activeTableFilters.type && selectedTypeFilters.length > 0) {
        if (!page.categories.some((c) => selectedTypeFilters.includes(c))) return false;
      }

      // Brands in AI answer filter
      if (selectedBrandInAnswer !== "All brands") {
        const hasBrand = page.mentions.some(
          (m) => m.toLowerCase() === selectedBrandInAnswer.toLowerCase()
        );
        if (!hasBrand) return false;
      }

      return true;
    });
  }, [
    tableSearchQuery,
    isBrandMentionedFilter,
    selectedBrandInAnswer,
    selectedGroups,
    selectedPrompts,
    activeTableFilters,
    appliedBrandsRange,
    hasBacklinkFilter,
    selectedTypeFilters,
  ]);

  // Handle apply preset rules
  const handleApplyPreset = (presetName: string) => {
    setActivePreset(presetName);
    setIsPresetsOpen(false);
    setIsSaveFlyoutOpen(false);

    if (presetName === "Default") {
      setIsBrandMentionedFilter(false);
      setAppliedBrandsRange({ from: null, to: null });
      setBrandsFromInput("");
      setBrandsToInput("");
      setHasBacklinkFilter(null);
      setSelectedTypeFilters([]);
      setStagedSelectedTypes([]);
      setTableSearchQuery("");
      setActiveTableFilters({
        brandsInAiAnswer: true,
        isBrandMentioned: true,
        hasBacklink: false,
        brandsInSourcePage: false,
        trackedCompetitorsCount: false,
        trackedCompetitors: false,
        sourceFirstSeen: false,
        sourceLastSeen: false,
        type: true,
      });
      showToast("Default preset applied.");
      return;
    }

    if (presetName === "Brand mentioned") {
      setIsBrandMentionedFilter(true);
      setActiveTableFilters((prev) => ({ ...prev, isBrandMentioned: true }));
      showToast("Preset applied: Brand mentioned.");
      return;
    }

    if (presetName === "Brand not mentioned") {
      setIsBrandMentionedFilter(false);
      setActiveTableFilters((prev) => ({ ...prev, isBrandMentioned: true }));
      showToast("Preset applied: Brand not mentioned.");
      return;
    }

    if (presetName === "High-impact sources") {
      setAppliedBrandsRange({ from: 2, to: null });
      setBrandsFromInput("2");
      setBrandsToInput("");
      setActiveTableFilters((prev) => ({ ...prev, brandsInAiAnswer: true }));
      showToast("Preset applied: High-impact sources.");
      return;
    }

    if (presetName === "Has backlink") {
      setHasBacklinkFilter(true);
      setActiveTableFilters((prev) => ({ ...prev, hasBacklink: true }));
      showToast("Preset applied: Has backlink.");
      return;
    }

    if (presetName === "No backlink") {
      setHasBacklinkFilter(false);
      setActiveTableFilters((prev) => ({ ...prev, hasBacklink: true }));
      showToast("Preset applied: No backlink.");
      return;
    }

    showToast(`Custom preset applied: ${presetName}.`);
  };

  // Handle save custom preset
  const handleSaveCustomPreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPresetName.trim();
    if (!trimmed) {
      showToast("Please enter a preset name.");
      return;
    }
    if (
      customPresets.includes(trimmed) ||
      BUILT_IN_FILTER_PRESETS.some((p) => p.id.toLowerCase() === trimmed.toLowerCase())
    ) {
      showToast("A preset with this name already exists.");
      return;
    }

    const updated = [...customPresets, trimmed];
    setCustomPresets(updated);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ai_sources_filter_presets", JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
    setActivePreset(trimmed);
    setNewPresetName("");
    setIsSaveFlyoutOpen(false);
    setIsPresetsOpen(false);
    showToast(`Preset "${trimmed}" saved successfully.`);
  };

  // Handle delete custom preset
  const handleDeleteCustomPreset = (nameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p !== nameToDelete);
    setCustomPresets(updated);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ai_sources_filter_presets", JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
    if (activePreset === nameToDelete) {
      setActivePreset("Default");
    }
    showToast(`Preset "${nameToDelete}" deleted.`);
  };

  // Aggregate source domains for "Domains" mode
  const aggregatedDomains = useMemo(() => {
    const map = new Map<string, SourceDomainItem>();
    filteredPages.forEach((page) => {
      const existing = map.get(page.domain);
      if (existing) {
        existing.pagesCount += 1;
        existing.aiAnswersCount += page.aiAnswersCount;
        existing.promptsCount = Math.max(existing.promptsCount, page.promptsCount);
      } else {
        map.set(page.domain, {
          id: `dom-${page.domain}`,
          domain: page.domain,
          domainTrust: page.domainTrust,
          pagesCount: 1,
          aiAnswersCount: page.aiAnswersCount,
          promptsCount: page.promptsCount,
          coverage: page.coverage,
          traffic: page.pageTraffic,
          isBrandMentioned: page.isBrandMentioned,
          hasBacklink: page.hasBacklink,
          firstSeen: page.firstSeen || "12 Sep 2026",
          lastSeen: page.lastSeen || "22 Sep 2026",
          lastCheck: page.lastCheck || "22 Sep 2026",
        });
      }
    });
    return Array.from(map.values());
  }, [filteredPages]);

  // Toggle brand checkbox for scatter chart
  const toggleBrandCheckbox = (id: string) => {
    setBrandCheckboxes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  // Calendar click handlers
  const handleDateClick = (date: Date) => {
    if (!selectingEnd) {
      setStagedRangeStart(date);
      setStagedRangeEnd(date);
      setSelectingEnd(true);
      setActivePreset(null);
    } else {
      if (date < stagedRangeStart) {
        setStagedRangeEnd(stagedRangeStart);
        setStagedRangeStart(date);
      } else {
        setStagedRangeEnd(date);
      }
      setSelectingEnd(false);
      setActivePreset(null);
    }
  };

  const applyPreset = (preset: string) => {
    const refDate = new Date(2026, 8, 22);
    let start = new Date(refDate);
    let end = new Date(refDate);

    switch (preset) {
      case "TODAY":
        start = new Date(refDate);
        end = new Date(refDate);
        break;
      case "YESTERDAY":
        start = new Date(2026, 8, 21);
        end = new Date(2026, 8, 21);
        break;
      case "LAST WEEK":
        start = new Date(2026, 8, 8);
        end = new Date(2026, 8, 15);
        break;
      case "LAST MONTH":
        start = new Date(2026, 7, 1);
        end = new Date(2026, 7, 31);
        break;
      case "PAST 7 DAYS":
        start = new Date(2026, 8, 16);
        end = new Date(2026, 8, 22);
        break;
      case "PAST 30 DAYS":
        start = new Date(2026, 7, 24);
        end = new Date(2026, 8, 22);
        break;
      case "PAST 6 MONTHS":
        start = new Date(2026, 2, 22);
        end = new Date(2026, 8, 22);
        break;
      case "YEAR":
        start = new Date(2026, 0, 1);
        end = new Date(2026, 8, 22);
        break;
      default:
        break;
    }

    setStagedRangeStart(start);
    setStagedRangeEnd(end);
    setActivePreset(preset);
    setSelectingEnd(false);
  };

  const applyStagedDates = () => {
    setAppliedRangeStart(stagedRangeStart);
    setAppliedRangeEnd(stagedRangeEnd);
    setDateRange(`${formatDisplayDate(stagedRangeStart)} - ${formatDisplayDate(stagedRangeEnd)}`);
    setIsDatePickerOpen(false);
    showToast("Date range applied successfully.");
  };

  const cancelStagedDates = () => {
    setStagedRangeStart(appliedRangeStart);
    setStagedRangeEnd(appliedRangeEnd);
    setIsDatePickerOpen(false);
    setSelectingEnd(false);
  };

  const renderMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6;

    const cells: React.ReactNode[] = [];

    // Prior month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let p = offset - 1; p >= 0; p--) {
      cells.push(
        <div
          key={`pad-prev-${year}-${month}-${p}`}
          className="h-7 w-7 text-xs flex items-center justify-center text-slate-300 dark:text-slate-600 select-none pointer-events-none"
        >
          {prevMonthDays - p}
        </div>
      );
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const isStart = current.toDateString() === stagedRangeStart.toDateString();
      const isEnd = current.toDateString() === stagedRangeEnd.toDateString();
      const isInRange = current > stagedRangeStart && current < stagedRangeEnd;
      const isHistorical =
        (year === 2026 && month === 8 && (d === 20 || d === 21 || d === 22)) || false;

      let cellStyle =
        "h-7 w-7 text-xs flex items-center justify-center cursor-pointer transition select-none ";
      if (isStart && isEnd) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs";
      } else if (isStart) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-l-xs";
      } else if (isEnd) {
        cellStyle +=
          "border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-r-xs relative pb-1 bg-blue-50/70 dark:bg-blue-950/70";
      } else if (isInRange) {
        cellStyle += "bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-none font-medium";
      } else if (isHistorical) {
        cellStyle += "font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      } else {
        cellStyle += "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
          aria-label={`${d} ${CAL_FULL_MONTHS[month]} ${year}`}
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

    return (
      <div className="w-56 select-none">
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((day, idx) => (
            <span
              key={idx}
              className="h-6 w-7 text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">{cells}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Notice Alert Banner */}
      {!isBannerDismissed && (
        <div
          role="region"
          aria-label="Notice alert"
          className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs leading-relaxed shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400 font-bold text-sm select-none">
              ℹ
            </span>
            <p>
              This tool analyzes LLM results for your prompts of interest. In the LLM answers, it
              tracks your brand&apos;s and website&apos;s presence and positions among mentions and
              source links. You can also view the content of LLM answers for each date, URLs of
              sources provided, and more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBannerDismissed(true)}
            aria-label="Close banner"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-bold p-1 leading-none cursor-pointer transition select-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs & Right Utility Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href={baseHref} className="hover:text-slate-900 dark:hover:text-white font-medium transition">
            {projectDomain}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="hover:text-slate-900 dark:hover:text-white transition">AI Search</span>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <Link
            href={`${baseHref}/ai-results-tracker/rankings`}
            className="hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            AI Results Tracker
          </Link>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="font-semibold text-slate-900 dark:text-white">Sources</span>
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsGuestLinkModalOpen(true)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <span>Guest link</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            type="button"
            onClick={() => showToast("Feedback form submitted.")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <span>Feedback</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Amber Speedometer Pill [ ⏱ ▾ ] */}
          <div className="relative" ref={promptLimitRef}>
            <button
              type="button"
              aria-label="AI Results Tracker limits"
              title="Speedometer: AI Results Tracker usage & limits"
              onClick={() => setIsPromptLimitModalOpen(!isPromptLimitModalOpen)}
              className="bg-[#fde68a] hover:bg-[#fcd34d] dark:bg-amber-900/60 dark:hover:bg-amber-900 text-slate-900 dark:text-amber-100 rounded-lg flex items-center px-2 py-1 gap-1.5 transition cursor-pointer shadow-2xs select-none"
            >
              <Gauge className="w-4 h-4 text-slate-900 dark:text-amber-100" />
              <ChevronDown className="w-3 h-3 text-slate-800 dark:text-amber-200" />
            </button>

            {isPromptLimitModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="AI Results Tracker limits"
                className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Gauge className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
                    <span>AI Results Tracker</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPromptLimitModalOpen(false)}
                    aria-label="Close limits popover"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-0.5"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Provided by Plan</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">10 of 20</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2 mb-1.5">
                    <div className="w-1/2 h-full bg-[#2563eb] rounded-full" />
                  </div>
                  <span className="text-xs font-normal text-[#dc2626] dark:text-red-400 mt-1 mb-5 block">
                    Expires on Sep-29 2026
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                    <RotateCw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Total</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">10 of 20</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Title & Progress Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Sources</span>
            <span
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
              title="Information about AI Sources"
            >
              ℹ
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              100% progress
            </span>
            <Link
              href={`${baseHref}/settings?tab=prompts`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
              title="Manage prompts in Project Settings"
            >
              {selectedPrompts.length} prompt{selectedPrompts.length === 1 ? "" : "s"}
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Last update 2026-09-22
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`${baseHref}/settings?tab=prompts`}
            onClick={() => router.push(`${baseHref}/settings?tab=prompts`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-md shadow-xs transition cursor-pointer"
          >
            <span>+ ADD PROMPTS</span>
          </Link>
        </div>
      </div>

      {/* 4. Filters Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-2.5">
        {/* Engine selector */}
        <div className="relative" ref={engineDropdownRef}>
          <button
            type="button"
            onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
              ✦
            </span>
            <span>{selectedEngine}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isEngineDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1.5 z-40 text-xs">
              {["All search engines", "ChatGPT (GPT-4o)", "Google AI Overviews", "Perplexity AI"].map(
                (eng) => (
                  <button
                    key={eng}
                    type="button"
                    onClick={() => {
                      setSelectedEngine(eng);
                      setIsEngineDropdownOpen(false);
                      showToast(`Engine filtered to ${eng}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md transition ${
                      selectedEngine === eng
                        ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-900/40 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {eng}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Date Range Selector */}
        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            aria-label="Date range selector"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange} ▾</span>
          </button>

          {isDatePickerOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Date range picker"
              className="absolute left-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-50 flex flex-col md:flex-row gap-4"
            >
              {/* Presets Column */}
              <div className="w-36 flex flex-col border-r border-slate-100 dark:border-slate-800 pr-3 space-y-1">
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
                    className={`text-left px-2.5 py-1.5 text-xs rounded-md font-medium transition ${
                      activePreset === preset
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Dual Calendars */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-6">
                  {/* Left Calendar (August) */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-between w-full px-2 mb-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {CAL_FULL_MONTHS[calendarLeftMonth]}
                      </span>
                      <CalendarYearDropdown
                        year={calendarLeftYear}
                        onSelectYear={(y) => setCalendarLeftYear(y)}
                        isOpen={isLeftYearOpen}
                        onToggle={() => {
                          setIsLeftYearOpen(!isLeftYearOpen);
                          setIsRightYearOpen(false);
                        }}
                        onClose={() => setIsLeftYearOpen(false)}
                      />
                    </div>
                    {renderMonthGrid(calendarLeftYear, calendarLeftMonth)}
                  </div>

                  {/* Right Calendar (September) */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-between w-full px-2 mb-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {CAL_FULL_MONTHS[calendarRightMonth]}
                      </span>
                      <CalendarYearDropdown
                        year={calendarRightYear}
                        onSelectYear={(y) => setCalendarRightYear(y)}
                        isOpen={isRightYearOpen}
                        onToggle={() => {
                          setIsRightYearOpen(!isRightYearOpen);
                          setIsLeftYearOpen(false);
                        }}
                        onClose={() => setIsRightYearOpen(false)}
                      />
                    </div>
                    {renderMonthGrid(calendarRightYear, calendarRightMonth)}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compareByDates}
                        onChange={(e) => setCompareByDates(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Compare by dates</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelStagedDates}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyStagedDates}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groups Dropdown */}
        <div className="relative" ref={groupDropdownRef}>
          <button
            type="button"
            aria-label="Groups"
            aria-expanded={isGroupDropdownOpen}
            onClick={() => {
              const next = !isGroupDropdownOpen;
              setIsGroupDropdownOpen(next);
              if (next) {
                setStagedSelectedGroups([...selectedGroups]);
                setGroupSearchQuery("");
                setIsPromptFilterOpen(false);
                setIsDatePickerOpen(false);
                setIsEngineDropdownOpen(false);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
              isGroupDropdownOpen
                ? "bg-slate-200 dark:bg-slate-700 font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>Groups ▾</span>
          </button>

          {isGroupDropdownOpen && (
            <div
              role="dialog"
              aria-label="Groups filter"
              className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Search with prominent blue focus ring */}
              <div className="relative flex items-center border-2 border-blue-500 rounded-lg px-2.5 py-1.5 mb-2 bg-white dark:bg-slate-900 shadow-2xs">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search groups"
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Select all */}
              <div
                onClick={() => {
                  if (stagedSelectedGroups.length === AVAILABLE_GROUPS.length) {
                    setStagedSelectedGroups([]);
                  } else {
                    setStagedSelectedGroups([...AVAILABLE_GROUPS]);
                  }
                }}
                className="py-1 px-1 font-normal text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer select-none text-xs"
              >
                Select all
              </div>

              <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

              {/* Group items */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {AVAILABLE_GROUPS.filter((g) =>
                  g.toLowerCase().includes(groupSearchQuery.toLowerCase())
                ).map((group) => {
                  const isChecked = stagedSelectedGroups.includes(group);
                  return (
                    <label
                      key={group}
                      className="flex items-center gap-2.5 py-1.5 px-1 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStagedSelectedGroups([...stagedSelectedGroups, group]);
                          } else {
                            setStagedSelectedGroups(stagedSelectedGroups.filter((g) => g !== group));
                          }
                        }}
                        className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-normal text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                        {group}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedGroups([...stagedSelectedGroups]);
                  setIsGeneralGroupSelected(stagedSelectedGroups.includes("General"));
                  setIsGroupDropdownOpen(false);
                }}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-2 mt-2.5 rounded-lg text-sm transition cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Prompts Dropdown */}
        <div className="relative" ref={promptFilterRef}>
          <button
            type="button"
            aria-label="Prompts"
            aria-expanded={isPromptFilterOpen}
            onClick={() => {
              const next = !isPromptFilterOpen;
              setIsPromptFilterOpen(next);
              if (next) {
                setStagedSelectedPrompts([...selectedPrompts]);
                setPromptSearchQuery("");
                setIsGroupDropdownOpen(false);
                setIsDatePickerOpen(false);
                setIsEngineDropdownOpen(false);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
              isPromptFilterOpen
                ? "bg-slate-200 dark:bg-slate-700 font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>Prompts ▾</span>
          </button>

          {isPromptFilterOpen && (
            <div
              role="dialog"
              aria-label="Prompts filter"
              className="absolute left-0 top-full mt-1.5 w-[300px] sm:w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Search with prominent blue focus ring */}
              <div className="relative flex items-center border-2 border-blue-500 rounded-lg px-2.5 py-1.5 mb-2 bg-white dark:bg-slate-900 shadow-2xs">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search"
                  value={promptSearchQuery}
                  onChange={(e) => setPromptSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Select all */}
              <div
                onClick={() => {
                  if (stagedSelectedPrompts.length === ALL_AVAILABLE_PROMPTS.length) {
                    setStagedSelectedPrompts([]);
                  } else {
                    setStagedSelectedPrompts([...ALL_AVAILABLE_PROMPTS]);
                  }
                }}
                className="py-1 px-1 font-normal text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer select-none text-xs"
              >
                Select all
              </div>

              <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

              {/* Prompts scrollable checkbox list */}
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {ALL_AVAILABLE_PROMPTS.filter((p) =>
                  p.toLowerCase().includes(promptSearchQuery.toLowerCase())
                ).map((prompt) => {
                  const isChecked = stagedSelectedPrompts.includes(prompt);
                  return (
                    <label
                      key={prompt}
                      className="flex items-center gap-2.5 py-1.5 px-1 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded group"
                      title={prompt}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStagedSelectedPrompts([...stagedSelectedPrompts, prompt]);
                          } else {
                            setStagedSelectedPrompts(stagedSelectedPrompts.filter((p) => p !== prompt));
                          }
                        }}
                        className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span className="truncate text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 font-normal">
                        {prompt}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPrompts([...stagedSelectedPrompts]);
                  setIsPromptFilterOpen(false);
                }}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-2 mt-2.5 rounded-lg text-sm transition cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Metric KPI Cards (4 Top Benchmarks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mention opportunities */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Mention opportunities</span>
              <span className="text-slate-400 text-[11px] cursor-pointer">ℹ</span>
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">32</div>
        </div>

        {/* Card 2: Competitor-only mentions */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Competitor-only mentions</span>
              <span className="text-slate-400 text-[11px] cursor-pointer">ℹ</span>
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">5</div>
        </div>

        {/* Card 3: New opportunities */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>New opportunities</span>
              <span className="text-slate-400 text-[11px] cursor-pointer">ℹ</span>
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">32</div>
        </div>

        {/* Card 4: Mentions without backlinks */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Mentions without backlinks</span>
              <span className="text-slate-400 text-[11px] cursor-pointer">ℹ</span>
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-600 dark:text-slate-400 mt-2">0</div>
        </div>
      </div>

      {/* 6. Collapsible "Recommendations" Accordion */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsRecommendationsOpen(!isRecommendationsOpen)}
          aria-expanded={isRecommendationsOpen}
          className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition select-none"
        >
          <div className="flex items-center">
            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
              <span>Recommendations</span>
              <span className="text-slate-400 text-xs">ℹ</span>
            </span>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-2">
              1
            </span>
          </div>
          <span className="text-slate-400 text-xs font-bold">
            {isRecommendationsOpen ? "▲" : "▼"}
          </span>
        </button>

        {isRecommendationsOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700/60 p-4 bg-slate-50/40 dark:bg-slate-900/30">
            <div
              onClick={handleRecommendationClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRecommendationClick();
                }
              }}
              aria-label="Secure Brand Mentions on High-Impact Sources"
              className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg p-3.5 shadow-2xs hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Secure Brand Mentions on High-Impact Sources
                </h4>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View Pages table ↓
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Some frequently cited pages don’t mention your brand. Prioritize outreach to these
                high-impact sources to secure greater visibility.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 7. Bubble Scatter Chart ("Brand Mentions: AI answers vs Sources") */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Brand Mentions: AI answers vs Sources</span>
            <span className="text-slate-400 text-xs cursor-pointer">ℹ</span>
          </h3>
          <span className="text-xs text-slate-400 select-none">Select area to zoom</span>
        </div>

        {/* 20 Branded Checkbox Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {brandCheckboxes.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => toggleBrandCheckbox(brand.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer select-none ${
                brand.active
                  ? `${brand.borderColor} ${brand.bgColor} ${brand.textColor}`
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/40"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold border"
                style={{
                  borderColor: brand.active ? brand.color : "#cbd5e1",
                  backgroundColor: brand.active ? brand.color : "transparent",
                  color: brand.active ? "#ffffff" : "transparent",
                }}
              >
                {brand.active ? "✓" : ""}
              </span>
              <span>{brand.name}</span>
            </button>
          ))}
        </div>

        {/* Scatter Bubble Plot SVG Area */}
        <div className="relative w-full h-[360px] bg-slate-50/60 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 p-4 select-none overflow-hidden">
          {/* Y-Axis Label */}
          <div className="absolute left-2 top-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Mentions in sources
          </div>

          {/* SVG Plot */}
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
          >
            {/* Gridlines & Ticks: Y-axis (0, 5, 10, 15, 20, 25) */}
            {[
              { val: 25, y: 25 },
              { val: 20, y: 75 },
              { val: 15, y: 125 },
              { val: 10, y: 175 },
              { val: 5, y: 225 },
              { val: 0, y: 275 },
            ].map((tick) => (
              <g key={`y-${tick.val}`}>
                <line
                  x1="50"
                  y1={tick.y}
                  x2="780"
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray={tick.val === 0 ? "none" : "3,3"}
                  strokeWidth="1"
                />
                <text
                  x="42"
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {tick.val}
                </text>
              </g>
            ))}

            {/* Gridlines & Ticks: X-axis (0, 2, 4, 6, 8, 10, 12, 14) */}
            {[
              { val: 0, x: 50 },
              { val: 2, x: 154 },
              { val: 4, x: 258 },
              { val: 6, x: 362 },
              { val: 8, x: 466 },
              { val: 10, x: 570 },
              { val: 12, x: 674 },
              { val: 14, x: 778 },
            ].map((tick) => (
              <g key={`x-${tick.val}`}>
                <line
                  x1={tick.x}
                  y1="25"
                  x2={tick.x}
                  y2="275"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
                <text
                  x={tick.x}
                  y="292"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {tick.val}
                </text>
              </g>
            ))}

            {/* Render Active Bubbles */}
            {brandCheckboxes
              .filter((b) => b.active)
              .map((b) => {
                // Map coordinates: X [0..14] -> [50..778], Y [0..25] -> [275..25]
                const cx = 50 + (b.x / 14) * (778 - 50);
                const cy = 275 - (b.y / 25) * (275 - 25);

                const isHovered = hoveredBubble?.id === b.id;

                return (
                  <g
                    key={b.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      setHoveredBubble(b);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                    }}
                    onMouseLeave={() => {
                      setHoveredBubble(null);
                      setTooltipPos(null);
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? b.radius + 3 : b.radius}
                      fill={b.color}
                      fillOpacity={isHovered ? 0.45 : 0.25}
                      stroke={b.color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    <text
                      x={cx}
                      y={cy + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={b.color}
                      className="pointer-events-none select-none drop-shadow-xs"
                    >
                      {b.name.length > 10 ? b.name.slice(0, 8) + "…" : b.name}
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* X-Axis Label */}
          <div className="absolute right-4 bottom-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Mentions in AI answers
          </div>

          {/* Interactive Hover Tooltip */}
          {hoveredBubble && (
            <div className="absolute top-4 right-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg p-2.5 shadow-xl text-xs z-30 pointer-events-none border border-slate-700 animate-in fade-in duration-150">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: hoveredBubble.color }}
                />
                <span>{hoveredBubble.name}</span>
              </div>
              <div className="text-[11px] text-slate-300 dark:text-slate-600 space-y-0.5">
                <div>Mentions in AI answers: <span className="font-bold text-white dark:text-slate-900">{hoveredBubble.x}</span></div>
                <div>Mentions in sources: <span className="font-bold text-white dark:text-slate-900">{hoveredBubble.y}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 8. Sources Data Table with Domain/Page Views & Filter Tags */}
      <div
        ref={tableSectionRef}
        id="sources-data-table"
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden"
      >
        {/* Toolbar & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Mode Switcher: [ Domains | Pages ] */}
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("Domains")}
                className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer select-none rounded-sm ${
                  viewMode === "Domains"
                    ? "bg-[#544f70] text-white"
                    : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Domains
              </button>
              <button
                type="button"
                onClick={() => setViewMode("Pages")}
                className={`px-3 py-1.5 text-xs font-bold transition cursor-pointer select-none rounded-sm ${
                  viewMode === "Pages"
                    ? "bg-[#544f70] text-white"
                    : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Pages
              </button>
            </div>

            {/* Right: Columns customizer */}
            <div className="relative" ref={columnsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsColumnsDropdownOpen(!isColumnsDropdownOpen)}
                aria-label="Columns"
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Columns className="w-3.5 h-3.5 text-slate-400" />
                <span>Columns ▾</span>
              </button>

              {isColumnsDropdownOpen && (
                <div
                  role="dialog"
                  aria-label="Columns configuration"
                  className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-40 text-xs space-y-0.5"
                >
                  {SOURCE_TABLE_COLUMNS.map((col) => {
                    const isChecked = !!visibleColumns[col.id];
                    return (
                      <label
                        key={col.id}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md cursor-pointer select-none transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [col.id]: e.target.checked,
                            }))
                          }
                          className="sr-only"
                          aria-label={col.label}
                        />
                        <div
                          className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? "bg-[#2563eb] text-white"
                              : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3 stroke-[3]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[13px] text-slate-700 dark:text-slate-200 font-normal">
                          {col.id === "url" && viewMode === "Domains" ? "Domain" : col.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Row - Single Horizontal Line */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1 flex-nowrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap min-w-0">
              {/* Search Input */}
              <div className="relative w-28 sm:w-36 shrink min-w-[100px]">
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search 🔍"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs"
              />
              {tableSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTableSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brands in AI answer filter (Screenshot 1) */}
            {activeTableFilters.brandsInAiAnswer && (
              <div className="relative" ref={brandsInAiAnswerRef}>
                <button
                  type="button"
                  aria-label="Brands in AI answer"
                  aria-expanded={isBrandsInAiAnswerDropdownOpen}
                  onClick={() =>
                    setIsBrandsInAiAnswerDropdownOpen(!isBrandsInAiAnswerDropdownOpen)
                  }
                  className={`px-2.5 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
                    isBrandsInAiAnswerDropdownOpen
                      ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      : appliedBrandsRange.from !== null || appliedBrandsRange.to !== null
                      ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-300"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span>Brands in AI answer</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>

                {isBrandsInAiAnswerDropdownOpen && (
                  <div
                    role="dialog"
                    aria-label="Brands in AI answer range"
                    className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden mb-3 bg-white dark:bg-slate-800">
                      <input
                        type="number"
                        min="0"
                        placeholder="From"
                        value={brandsFromInput}
                        onChange={(e) => setBrandsFromInput(e.target.value)}
                        className="w-1/2 px-3 py-2 text-xs border-r border-slate-300 dark:border-slate-600 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="To"
                        value={brandsToInput}
                        onChange={(e) => setBrandsToInput(e.target.value)}
                        className="w-1/2 px-3 py-2 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const f = brandsFromInput.trim() !== "" ? Number(brandsFromInput) : null;
                        const t = brandsToInput.trim() !== "" ? Number(brandsToInput) : null;
                        setAppliedBrandsRange({ from: f, to: t });
                        setIsBrandsInAiAnswerDropdownOpen(false);
                      }}
                      className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Is brand mentioned? filter (Unified Pill matching Screenshot 2) */}
            {activeTableFilters.isBrandMentioned && (
              <div className="relative inline-flex items-stretch" ref={brandMentionedDropdownRef}>
                {isBrandMentionedFilter === null ? (
                  <button
                    type="button"
                    aria-label="Is brand mentioned"
                    aria-expanded={isBrandMentionedDropdownOpen}
                    onClick={() =>
                      setIsBrandMentionedDropdownOpen(!isBrandMentionedDropdownOpen)
                    }
                    className={`px-2.5 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
                      isBrandMentionedDropdownOpen
                        ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span>Is brand mentioned?</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>
                ) : (
                  <div
                    className={`inline-flex items-stretch border border-blue-500 bg-[#ebf3fe] dark:bg-blue-950/50 rounded-md overflow-hidden text-xs shadow-2xs transition ${
                      isBrandMentionedDropdownOpen ? "ring-2 ring-blue-400/50" : ""
                    }`}
                  >
                    <button
                      type="button"
                      aria-label="Is brand mentioned"
                      aria-expanded={isBrandMentionedDropdownOpen}
                      onClick={() =>
                        setIsBrandMentionedDropdownOpen(!isBrandMentionedDropdownOpen)
                      }
                      className="px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-normal hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition cursor-pointer flex items-center"
                    >
                      <span>Is brand mentioned?: {isBrandMentionedFilter ? "Yes" : "No"}</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove brand mentioned filter"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBrandMentionedFilter(null);
                        setIsBrandMentionedDropdownOpen(false);
                      }}
                      className="border-l border-blue-300 dark:border-blue-600 px-2 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-200/60 dark:hover:bg-blue-800/60 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span className="text-xs leading-none">✕</span>
                    </button>
                  </div>
                )}

                {isBrandMentionedDropdownOpen && (
                  <div
                    role="dialog"
                    aria-label="Is brand mentioned options"
                    className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandMentionedFilter(true);
                        setIsBrandMentionedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition cursor-pointer ${
                        isBrandMentionedFilter === true
                          ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30"
                          : "text-slate-800 dark:text-slate-200 font-normal"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandMentionedFilter(false);
                        setIsBrandMentionedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition cursor-pointer ${
                        isBrandMentionedFilter === false
                          ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30"
                          : "text-slate-800 dark:text-slate-200 font-normal"
                      }`}
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Has backlink? filter (if enabled in + Filter) */}
            {activeTableFilters.hasBacklink && (
              <div className="relative inline-flex items-stretch" ref={backlinkDropdownRef}>
                {hasBacklinkFilter === null ? (
                  <button
                    type="button"
                    aria-label="Has backlink"
                    aria-expanded={isBacklinkDropdownOpen}
                    onClick={() => setIsBacklinkDropdownOpen(!isBacklinkDropdownOpen)}
                    className={`px-3 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
                      isBacklinkDropdownOpen
                        ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span>Has backlink?</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>
                ) : (
                  <div className="inline-flex items-stretch border border-blue-500 bg-[#ebf3fe] dark:bg-blue-950/50 rounded-md overflow-hidden text-xs shadow-2xs">
                    <button
                      type="button"
                      aria-label="Has backlink"
                      aria-expanded={isBacklinkDropdownOpen}
                      onClick={() => setIsBacklinkDropdownOpen(!isBacklinkDropdownOpen)}
                      className="px-3 py-1.5 text-slate-800 dark:text-slate-100 font-normal hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition cursor-pointer flex items-center"
                    >
                      <span>Has backlink?: {hasBacklinkFilter ? "Yes" : "No"}</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove has backlink filter"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasBacklinkFilter(null);
                        setIsBacklinkDropdownOpen(false);
                      }}
                      className="border-l border-blue-300 dark:border-blue-600 px-2.5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-200/60 dark:hover:bg-blue-800/60 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span className="text-xs leading-none">✕</span>
                    </button>
                  </div>
                )}

                {isBacklinkDropdownOpen && (
                  <div
                    role="dialog"
                    aria-label="Has backlink options"
                    className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setHasBacklinkFilter(true);
                        setIsBacklinkDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasBacklinkFilter(false);
                        setIsBacklinkDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Type filter (Multi-select matching Screenshot 1 & 2) */}
            {activeTableFilters.type && (
              <div className="relative inline-flex items-stretch" ref={typeDropdownRef}>
                {selectedTypeFilters.length === 0 ? (
                  <button
                    type="button"
                    aria-label="Type"
                    aria-expanded={isTypeDropdownOpen}
                    onClick={() => {
                      const next = !isTypeDropdownOpen;
                      setIsTypeDropdownOpen(next);
                      if (next) {
                        setStagedSelectedTypes([...selectedTypeFilters]);
                      }
                    }}
                    className={`px-3 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
                      isTypeDropdownOpen
                        ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span>Type</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>
                ) : (
                  <div
                    className={`inline-flex items-stretch border border-blue-500 bg-[#ebf3fe] dark:bg-blue-950/50 rounded-md overflow-hidden text-xs shadow-2xs transition ${
                      isTypeDropdownOpen ? "ring-2 ring-blue-400/50" : ""
                    }`}
                  >
                    <button
                      type="button"
                      aria-label="Type"
                      aria-expanded={isTypeDropdownOpen}
                      onClick={() => {
                        const next = !isTypeDropdownOpen;
                        setIsTypeDropdownOpen(next);
                        if (next) {
                          setStagedSelectedTypes([...selectedTypeFilters]);
                        }
                      }}
                      className="px-3 py-1.5 text-slate-800 dark:text-slate-100 font-normal hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        Type: {selectedTypeFilters.length === 1 ? selectedTypeFilters[0] : `${selectedTypeFilters.length} selected`}
                      </span>
                      <span className="text-[10px] text-slate-400">▾</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove type filter"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTypeFilters([]);
                        setStagedSelectedTypes([]);
                        setIsTypeDropdownOpen(false);
                      }}
                      className="border-l border-blue-300 dark:border-blue-600 px-2.5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-200/60 dark:hover:bg-blue-800/60 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span className="text-xs leading-none">✕</span>
                    </button>
                  </div>
                )}

                {isTypeDropdownOpen && (
                  <div
                    role="dialog"
                    aria-label="Type filter"
                    className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100 overflow-hidden flex flex-col"
                  >
                    {/* Scrollable Checkbox List */}
                    <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                      {/* Select All item */}
                      <label className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded cursor-pointer select-none transition group">
                        <input
                          type="checkbox"
                          checked={
                            ALL_SOURCE_TYPES.length > 0 &&
                            stagedSelectedTypes.length === ALL_SOURCE_TYPES.length
                          }
                          onChange={() => {
                            if (stagedSelectedTypes.length === ALL_SOURCE_TYPES.length) {
                              setStagedSelectedTypes([]);
                            } else {
                              setStagedSelectedTypes([...ALL_SOURCE_TYPES]);
                            }
                          }}
                          className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 font-normal">
                          Select All
                        </span>
                      </label>

                      {ALL_SOURCE_TYPES.map((typeOption) => {
                        const isChecked = stagedSelectedTypes.includes(typeOption);
                        return (
                          <label
                            key={typeOption}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded cursor-pointer select-none transition group"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStagedSelectedTypes((prev) => [...prev, typeOption]);
                                } else {
                                  setStagedSelectedTypes((prev) =>
                                    prev.filter((t) => t !== typeOption)
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 font-normal">
                              {typeOption}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Bottom Apply Button */}
                    <div className="p-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTypeFilters([...stagedSelectedTypes]);
                          setIsTypeDropdownOpen(false);
                        }}
                        className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-sm transition cursor-pointer shadow-xs text-center"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* + Filter button (Screenshot 3) */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                aria-label="Filter"
                aria-expanded={isFilterMenuOpen}
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`px-2.5 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer shadow-2xs transition ${
                  isFilterMenuOpen
                    ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {isFilterMenuOpen && (
                <div
                  role="dialog"
                  aria-label="Filter options"
                  className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
                >
                  {TABLE_FILTER_OPTIONS.map((opt) => {
                    const isChecked = !!activeTableFilters[opt.id];
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center gap-3 px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md cursor-pointer select-none transition group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setActiveTableFilters((prev) => ({
                              ...prev,
                              [opt.id]: !prev[opt.id],
                            }));
                          }}
                          className="w-4 h-4 rounded-xs border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-slate-800 dark:text-slate-200 text-xs font-normal group-hover:text-blue-600">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Presets ▾ Popover & Save Filter Preset Flyout */}
            <div className="relative" ref={presetsRef}>
              <button
                type="button"
                aria-label="Presets"
                aria-expanded={isPresetsOpen}
                onClick={() => {
                  setIsPresetsOpen(!isPresetsOpen);
                  setIsSaveFlyoutOpen(false);
                }}
                className={`px-2.5 py-1.5 border rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer shadow-2xs transition ${
                  isPresetsOpen
                    ? "bg-[#e2e8f0] dark:bg-slate-700 font-semibold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    : activePreset !== "Default"
                    ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 bg-white dark:bg-slate-800"
                }`}
              >
                <span>{activePreset !== "Default" ? `Preset: ${activePreset}` : "Presets"}</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {isPresetsOpen && (
                <div
                  role="dialog"
                  aria-label="Filter presets"
                  className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Presets
                  </div>

                  {/* Built-in Presets */}
                  <div className="space-y-0.5">
                    {BUILT_IN_FILTER_PRESETS.map((preset) => {
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span>{preset.label}</span>
                          {isSelected && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Presets */}
                  {customPresets.length > 0 && (
                    <>
                      <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
                      <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        My Saved Presets
                      </div>
                      <div className="space-y-0.5">
                        {customPresets.map((name) => {
                          const isSelected = activePreset === name;
                          return (
                            <div
                              key={name}
                              onClick={() => handleApplyPreset(name)}
                              className={`px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition cursor-pointer group ${
                                isSelected
                                  ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30"
                                  : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              <span className="truncate pr-2">{name}</span>
                              <div className="flex items-center gap-1.5">
                                {isSelected && (
                                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                                )}
                                <button
                                  type="button"
                                  aria-label={`Delete ${name} preset`}
                                  onClick={(e) => handleDeleteCustomPreset(name, e)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs px-1 cursor-pointer transition"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="my-1.5 border-t border-slate-200 dark:border-slate-700" />

                  {/* Save filter preset item with nested flyout submenu */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsSaveFlyoutOpen(true)}
                  >
                    <button
                      type="button"
                      onClick={() => setIsSaveFlyoutOpen(!isSaveFlyoutOpen)}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition cursor-pointer font-medium ${
                        isSaveFlyoutOpen
                          ? "bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>Save filter preset</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Nested Flyout Submenu */}
                    {isSaveFlyoutOpen && (
                      <div
                        role="dialog"
                        aria-label="Save filter preset"
                        className="absolute left-full top-0 ml-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                        onMouseEnter={() => setIsSaveFlyoutOpen(true)}
                      >
                        <div className="font-semibold text-slate-900 dark:text-white mb-2 text-xs">
                          Save filter preset
                        </div>
                        <input
                          type="text"
                          placeholder="Preset name"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveCustomPreset();
                            }
                          }}
                          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 mb-3"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSaveFlyoutOpen(false);
                              setNewPresetName("");
                            }}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveCustomPreset()}
                            className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-xs"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Horizontally aligned Export & Clear all buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* ⬇ Export */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* ✕ Clear all */}
            {(tableSearchQuery ||
              isBrandMentionedFilter !== null ||
              selectedBrandInAnswer !== "All brands" ||
              appliedBrandsRange.from !== null ||
              appliedBrandsRange.to !== null ||
              hasBacklinkFilter !== null ||
              selectedTypeFilters.length > 0 ||
              activePreset !== "Default") && (
              <button
                type="button"
                onClick={() => {
                  setTableSearchQuery("");
                  setIsBrandMentionedFilter(null);
                  setSelectedBrandInAnswer("All brands");
                  setAppliedBrandsRange({ from: null, to: null });
                  setBrandsFromInput("");
                  setBrandsToInput("");
                  setHasBacklinkFilter(null);
                  setSelectedTypeFilters([]);
                  setStagedSelectedTypes([]);
                  setActivePreset("Default");
                  showToast("All filters cleared.");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium whitespace-nowrap"
              >
                ✕ Clear all
              </button>
            )}
          </div>
        </div>
      </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px]">
          {viewMode === "Pages" ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {visibleColumns.url && <th className="px-4 py-3 min-w-[280px]">URL</th>}
                  {visibleColumns.aiAnswers && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">AI answers</th>
                  )}
                  {visibleColumns.prompts && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">Prompts</th>
                  )}
                  {visibleColumns.coverage && (
                    <th className="px-3 py-3 text-right whitespace-nowrap">Coverage</th>
                  )}
                  {visibleColumns.domainTrust && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">Domain Trust</th>
                  )}
                  {visibleColumns.pageTraffic && (
                    <th className="px-3 py-3 text-right whitespace-nowrap">Page Traffic</th>
                  )}
                  {visibleColumns.isBrandMentioned && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">
                      Is brand mentioned?
                    </th>
                  )}
                  {visibleColumns.mentions && (
                    <th className="px-3 py-3 whitespace-nowrap">Mentions</th>
                  )}
                  {visibleColumns.hasBacklink && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">Has backlink?</th>
                  )}
                  {visibleColumns.firstLastSeen && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">First/Last seen</th>
                  )}
                  {visibleColumns.lastCheck && (
                    <th className="px-3 py-3 text-center whitespace-nowrap">Last check</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPages.length > 0 ? (
                  filteredPages.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition group"
                    >
                      {/* URL column */}
                      {visibleColumns.url && (
                        <td className="px-4 py-3.5 space-y-1">
                          <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {row.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate max-w-md inline-block"
                            >
                              {row.url}
                            </a>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </div>
                          {/* Categories */}
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {row.categories.map((cat) => {
                              const isRed = cat === "Competitor" || cat === "Not available";
                              return (
                                <span
                                  key={cat}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                    isRed
                                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                  }`}
                                >
                                  {cat}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      )}

                      {/* AI Answers badge */}
                      {visibleColumns.aiAnswers && (
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDetailPopover({
                                id: row.id,
                                type: "answers",
                                items: row.aiAnswers,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-200 cursor-pointer shadow-2xs"
                          >
                            <span>{row.aiAnswersCount}</span>
                            <span className="text-[10px] text-slate-400">▾</span>
                          </button>
                        </td>
                      )}

                      {/* Prompts badge */}
                      {visibleColumns.prompts && (
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDetailPopover({
                                id: row.id,
                                type: "prompts",
                                items: row.prompts,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-200 cursor-pointer shadow-2xs"
                          >
                            <span>{row.promptsCount}</span>
                            <span className="text-[10px] text-slate-400">▾</span>
                          </button>
                        </td>
                      )}

                      {/* Coverage */}
                      {visibleColumns.coverage && (
                        <td className="px-3 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {row.coverage}
                        </td>
                      )}

                      {/* Domain Trust */}
                      {visibleColumns.domainTrust && (
                        <td className="px-3 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {row.domainTrust}
                          </span>
                        </td>
                      )}

                      {/* Page Traffic */}
                      {visibleColumns.pageTraffic && (
                        <td className="px-3 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {row.pageTraffic}
                        </td>
                      )}

                      {/* Is Brand Mentioned */}
                      {visibleColumns.isBrandMentioned && (
                        <td className="px-3 py-3.5 text-center">
                          {row.isBrandMentioned ? (
                            <span className="text-emerald-600 font-bold text-sm">✓</span>
                          ) : (
                            <span className="text-red-500 font-bold text-sm select-none">✕</span>
                          )}
                        </td>
                      )}

                      {/* Mentions */}
                      {visibleColumns.mentions && (
                        <td className="px-3 py-3.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {row.mentions.map((m) => (
                              <span
                                key={m}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      {/* Has backlink */}
                      {visibleColumns.hasBacklink && (
                        <td className="px-3 py-3.5 text-center">
                          {row.hasBacklink ? (
                            <span className="text-emerald-600 font-bold text-sm">✓</span>
                          ) : (
                            <span className="text-slate-400 font-bold text-sm select-none">✕</span>
                          )}
                        </td>
                      )}

                      {/* First/Last seen */}
                      {visibleColumns.firstLastSeen && (
                        <td className="px-3 py-3.5 text-center whitespace-nowrap text-slate-600 dark:text-slate-300">
                          <div>{row.firstSeen || "12 Sep 2026"}</div>
                          <div className="text-[10px] text-slate-400">{row.lastSeen || "22 Sep 2026"}</div>
                        </td>
                      )}

                      {/* Last check */}
                      {visibleColumns.lastCheck && (
                        <td className="px-3 py-3.5 text-center whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {row.lastCheck || "22 Sep 2026"}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length || 11} className="text-center py-12 text-slate-400 italic">
                      No sources found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* Domains Mode Table */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {visibleColumns.url && <th className="px-4 py-3">Domain</th>}
                  {visibleColumns.domainTrust && <th className="px-3 py-3 text-center">Domain Trust</th>}
                  <th className="px-3 py-3 text-center">Pages</th>
                  {visibleColumns.aiAnswers && <th className="px-3 py-3 text-center">AI answers</th>}
                  {visibleColumns.prompts && <th className="px-3 py-3 text-center">Prompts</th>}
                  {visibleColumns.coverage && <th className="px-3 py-3 text-right">Coverage</th>}
                  {visibleColumns.pageTraffic && <th className="px-3 py-3 text-right">Traffic</th>}
                  {visibleColumns.isBrandMentioned && <th className="px-3 py-3 text-center">Is brand mentioned?</th>}
                  {visibleColumns.hasBacklink && <th className="px-3 py-3 text-center">Has backlink?</th>}
                  {visibleColumns.firstLastSeen && <th className="px-3 py-3 text-center whitespace-nowrap">First/Last seen</th>}
                  {visibleColumns.lastCheck && <th className="px-3 py-3 text-center whitespace-nowrap">Last check</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {aggregatedDomains.map((dom) => (
                  <tr
                    key={dom.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition"
                  >
                    {visibleColumns.url && (
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-slate-400">🌐</span>
                        <span>{dom.domain}</span>
                      </td>
                    )}
                    {visibleColumns.domainTrust && (
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {dom.domainTrust}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3.5 text-center font-medium">{dom.pagesCount}</td>
                    {visibleColumns.aiAnswers && <td className="px-3 py-3.5 text-center font-medium">{dom.aiAnswersCount}</td>}
                    {visibleColumns.prompts && <td className="px-3 py-3.5 text-center font-medium">{dom.promptsCount}</td>}
                    {visibleColumns.coverage && <td className="px-3 py-3.5 text-right font-medium">{dom.coverage}</td>}
                    {visibleColumns.pageTraffic && <td className="px-3 py-3.5 text-right font-semibold">{dom.traffic}</td>}
                    {visibleColumns.isBrandMentioned && (
                      <td className="px-3 py-3.5 text-center">
                        {dom.isBrandMentioned ? (
                          <span className="text-emerald-600 font-bold text-sm">✓</span>
                        ) : (
                          <span className="text-red-500 font-bold text-sm select-none">✕</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.hasBacklink && (
                      <td className="px-3 py-3.5 text-center">
                        {dom.hasBacklink ? (
                          <span className="text-emerald-600 font-bold text-sm">✓</span>
                        ) : (
                          <span className="text-slate-400 font-bold text-sm select-none">✕</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.firstLastSeen && (
                      <td className="px-3 py-3.5 text-center whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div>{dom.firstSeen || "12 Sep 2026"}</div>
                        <div className="text-[10px] text-slate-400">{dom.lastSeen || "22 Sep 2026"}</div>
                      </td>
                    )}
                    {visibleColumns.lastCheck && (
                      <td className="px-3 py-3.5 text-center whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {dom.lastCheck || "22 Sep 2026"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination & Page Controls */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          {/* Bottom Left: Page input box */}
          <div className="flex items-center gap-1.5">
            <span>Page:</span>
            <input
              type="number"
              aria-label="Page number"
              value={currentPage}
              min={1}
              max={1}
              onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-xs bg-white dark:bg-slate-800 shadow-2xs font-semibold"
            />
            <span>of 1</span>
          </div>

          {/* Bottom Right: Rows selector */}
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              aria-label="Rows per page"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
              className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs font-medium"
            >
              <option value={25}>25 ▾</option>
              <option value={50}>50 ▾</option>
              <option value={100}>100 ▾</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Answers / Prompts details popover dialog */}
      {activeDetailPopover && (
        <div
          ref={detailPopoverRef}
          role="dialog"
          aria-label={activeDetailPopover.type === "answers" ? "AI Answers" : "Prompts"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-100"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-2xl max-w-md w-full space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                {activeDetailPopover.type === "answers"
                  ? "AI Answers referencing this source"
                  : "Prompts referencing this source"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDetailPopover(null)}
                aria-label="Close detail modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {activeDetailPopover.type === "answers"
                ? (activeDetailPopover.items as { engine: string; date: string }[]).map(
                    (ans, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {ans.engine}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">{ans.date}</span>
                      </div>
                    )
                  )
                : (activeDetailPopover.items as string[]).map((prompt, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
                    >
                      {prompt}
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Prompts Modal */}
      {isAddPromptsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Prompts"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-100"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Prompts to AI Results Tracker
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPromptsOpen(false)}
                aria-label="Close add prompts modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter one prompt per line to track in AI results, competitor mentions, and authoritative sources.
            </p>
            <textarea
              rows={4}
              value={newPromptsInput}
              onChange={(e) => setNewPromptsInput(e.target.value)}
              placeholder="e.g. Best team collaboration tools for remote work&#10;Top software alternatives in 2026"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPromptsOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddPromptsOpen(false);
                  setNewPromptsInput("");
                  showToast("Prompts added to tracking schedule successfully.");
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
              >
                Add Prompts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export Sources data"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-100"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Export AI Sources Data
              </h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="Close export modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === "XLSX"}
                      onChange={() => setExportFormat("XLSX")}
                    />
                    <span>Excel (.XLSX)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === "CSV"}
                      onChange={() => setExportFormat("CSV")}
                    />
                    <span>CSV (.csv)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast(`AI Sources exported (${exportFormat}) successfully.`);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
              >
                Download Export
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
        onCopied={(url) => showToast("Guest access link copied to clipboard!")}
      />
    </div>
  );
}
export default AiSourcesView;
