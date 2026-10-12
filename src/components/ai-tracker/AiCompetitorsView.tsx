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
  Copy,
  Download,
  Info,
  Link2,
  Link2Off,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { CalendarYearDropdown } from "../competitors/CalendarYearDropdown";

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

export interface AiCompetitorsViewProps {
  projectId: string;
  projectDomain?: string;
}

export type LinkDisplayMode = "DOMAIN" | "URL";

interface MentionItem {
  rank: number;
  name: string;
}

interface SourceLinkItem {
  id: string;
  domain: string;
  url: string;
  title: string;
  brand: "microsoft" | "appadvisor" | "google" | "slack" | "zoho" | "taskwith" | "pib" | "other";
}

interface DateColumnData {
  dateKey: string;
  displayDate: string;
  mentions: MentionItem[];
  sources: SourceLinkItem[];
  answerText: string;
  cachedSnapshot: string;
}

export interface PromptSource {
  id: string;
  domain: string;
  url: string;
  title: string;
  brand?: string;
}

export interface PromptItem {
  id: string;
  text: string;
  sourcesCount?: number;
  sources?: PromptSource[];
}

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

export const PROMPT_ITEMS: PromptItem[] = [
  {
    id: "prompt-1",
    text: "What are the best tools for enhancing team productivity and collaboration?",
    sourcesCount: 5,
    sources: [
      {
        id: "p1-s1",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
        title: "Microsoft Teams | Group Chat, Video Calls & Collaboration",
        brand: "microsoft",
      },
      {
        id: "p1-s2",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/en-us/microsoft-365/business",
        title: "Microsoft 365 for Business Suite",
        brand: "microsoft",
      },
      {
        id: "p1-s3",
        domain: "appadvisor.in",
        url: "https://appadvisor.in/best-productivity-tools-2026",
        title: "Best Team Productivity Tools 2026 - AppAdvisor",
        brand: "appadvisor",
      },
      {
        id: "p1-s4",
        domain: "slack.com",
        url: "https://slack.com/solutions/team-productivity",
        title: "Slack: Productivity Platform for Next-Gen Teams",
        brand: "slack",
      },
      {
        id: "p1-s5",
        domain: "asana.com",
        url: "https://asana.com/guide/collaboration-productivity",
        title: "Asana Enterprise Collaboration & Team Productivity",
        brand: "asana",
      },
    ],
  },
  {
    id: "prompt-2",
    text: "What are some reliable work management tools to help my team?",
    sourcesCount: 4,
    sources: [
      {
        id: "p2-s1",
        domain: "asana.com",
        url: "https://asana.com/product/work-management",
        title: "Asana Work Management & Project Coordination",
        brand: "asana",
      },
      {
        id: "p2-s2",
        domain: "monday.com",
        url: "https://monday.com/work-management",
        title: "Monday.com: Work OS for High-Performance Teams",
        brand: "monday",
      },
      {
        id: "p2-s3",
        domain: "clickup.com",
        url: "https://clickup.com/features/work-management",
        title: "ClickUp All-in-One Team Work Management",
        brand: "clickup",
      },
      {
        id: "p2-s4",
        domain: "trello.com",
        url: "https://trello.com/en/tour",
        title: "Trello Visual Boards & Team Workflow Automation",
        brand: "trello",
      },
    ],
  },
  {
    id: "prompt-3",
    text: "Best workforce management tools for remote engineering teams",
    sourcesCount: 6,
    sources: [
      {
        id: "p3-s1",
        domain: "www.atlassian.com",
        url: "https://www.atlassian.com/software/jira",
        title: "Jira Software | Issue & Project Tracking for Agile Teams",
        brand: "jira",
      },
      {
        id: "p3-s2",
        domain: "linear.app",
        url: "https://linear.app/method",
        title: "Linear: The Issue Tracker Built for High-Speed Software Teams",
        brand: "linear",
      },
      {
        id: "p3-s3",
        domain: "github.com",
        url: "https://github.com/features/issues",
        title: "GitHub Issues & Projects for Distributed Engineering",
        brand: "github",
      },
      {
        id: "p3-s4",
        domain: "about.gitlab.com",
        url: "https://about.gitlab.com/solutions/remote",
        title: "GitLab Remote Engineering Platform Guide",
        brand: "gitlab",
      },
      {
        id: "p3-s5",
        domain: "slack.com",
        url: "https://slack.com/solutions/remote-work",
        title: "Slack for Remote Engineering Communication",
        brand: "slack",
      },
      {
        id: "p3-s6",
        domain: "notion.so",
        url: "https://www.notion.so/product/wikis",
        title: "Notion Engineering Wikis and Async Docs",
        brand: "notion",
      },
    ],
  },
  {
    id: "prompt-4",
    text: "Leading cloud collaboration software for enterprises",
    sourcesCount: 5,
    sources: [
      {
        id: "p4-s1",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/en-us/microsoft-365/enterprise",
        title: "Microsoft 365 Enterprise Cloud Collaboration",
        brand: "microsoft",
      },
      {
        id: "p4-s2",
        domain: "workspace.google.com",
        url: "https://workspace.google.com/solutions/collaboration",
        title: "Google Workspace Cloud Collaboration for Enterprise",
        brand: "google",
      },
      {
        id: "p4-s3",
        domain: "slack.com",
        url: "https://slack.com/enterprise",
        title: "Slack Enterprise Grid: Secure Digital Headquarters",
        brand: "slack",
      },
      {
        id: "p4-s4",
        domain: "box.com",
        url: "https://www.box.com/content-cloud",
        title: "Box Enterprise Content Management & Collaboration",
        brand: "box",
      },
      {
        id: "p4-s5",
        domain: "dropbox.com",
        url: "https://www.dropbox.com/business",
        title: "Dropbox Business Secure Team Collaboration",
        brand: "dropbox",
      },
    ],
  },
  {
    id: "prompt-5",
    text: "I'm looking for a way to automate our team's workflows; can you help?",
    sourcesCount: 3,
    sources: [
      {
        id: "p5-s1",
        domain: "zapier.com",
        url: "https://zapier.com/workflows",
        title: "Zapier: Workflow Automation for Business",
        brand: "zapier",
      },
      {
        id: "p5-s2",
        domain: "make.com",
        url: "https://www.make.com/en/platform",
        title: "Make.com: Visual Workflow Automation Engine",
        brand: "make",
      },
      {
        id: "p5-s3",
        domain: "powerautomate.microsoft.com",
        url: "https://powerautomate.microsoft.com",
        title: "Microsoft Power Automate: Enterprise Process Automation",
        brand: "microsoft",
      },
    ],
  },
  {
    id: "prompt-6",
    text: "Can you recommend a reliable time tracking software for my company?",
    sourcesCount: 4,
    sources: [
      {
        id: "p6-s1",
        domain: "clockify.me",
        url: "https://clockify.me/features",
        title: "Clockify: Free Employee Time Tracker & Timesheet",
        brand: "clockify",
      },
      {
        id: "p6-s2",
        domain: "toggl.com",
        url: "https://toggl.com/track",
        title: "Toggl Track: Effortless Time Tracking & Reporting",
        brand: "toggl",
      },
      {
        id: "p6-s3",
        domain: "getharvest.com",
        url: "https://www.getharvest.com",
        title: "Harvest: Time Tracking, Invoicing, & Expense Logging",
        brand: "harvest",
      },
      {
        id: "p6-s4",
        domain: "quickbooks.intuit.com",
        url: "https://quickbooks.intuit.com/time-tracking",
        title: "QuickBooks Time: GPS & Mobile Time Clock System",
        brand: "quickbooks",
      },
    ],
  },
  {
    id: "prompt-7",
    text: "What are the best tools for improving team communication and workflow?",
    sourcesCount: 4,
    sources: [
      {
        id: "p7-s1",
        domain: "slack.com",
        url: "https://slack.com/features",
        title: "Slack Channels and Huddles for Modern Teams",
        brand: "slack",
      },
      {
        id: "p7-s2",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/teams",
        title: "Microsoft Teams: Instant Video, Chat, & Meetings",
        brand: "microsoft",
      },
      {
        id: "p7-s3",
        domain: "zoom.us",
        url: "https://zoom.us/products/team-chat",
        title: "Zoom Team Chat & Workspace Collaboration",
        brand: "zoom",
      },
      {
        id: "p7-s4",
        domain: "notion.so",
        url: "https://notion.so/product",
        title: "Notion: Connected Workspace for Wiki, Docs & Projects",
        brand: "notion",
      },
    ],
  },
  {
    id: "prompt-8",
    text: "What are the best tools for improving employee engagement and culture?",
    sourcesCount: 4,
    sources: [
      {
        id: "p8-s1",
        domain: "cultureamp.com",
        url: "https://www.cultureamp.com/platform",
        title: "Culture Amp: Employee Engagement & Performance Management",
        brand: "cultureamp",
      },
      {
        id: "p8-s2",
        domain: "15five.com",
        url: "https://www.15five.com",
        title: "15Five: Holistic Performance & Continuous Feedback",
        brand: "15five",
      },
      {
        id: "p8-s3",
        domain: "lattice.com",
        url: "https://lattice.com/products/engagement",
        title: "Lattice: People Management & Engagement Platform",
        brand: "lattice",
      },
      {
        id: "p8-s4",
        domain: "bonus.ly",
        url: "https://bonus.ly",
        title: "Bonusly: Peer-to-Peer Recognition and Rewards",
        brand: "bonusly",
      },
    ],
  },
  {
    id: "prompt-9",
    text: "Best time tracking software for remote workers",
    sourcesCount: 4,
    sources: [
      {
        id: "p9-s1",
        domain: "hubstaff.com",
        url: "https://hubstaff.com/remote-work-time-tracker",
        title: "Hubstaff: Remote Team Monitoring & Time Tracking",
        brand: "hubstaff",
      },
      {
        id: "p9-s2",
        domain: "timedoctor.com",
        url: "https://www.timedoctor.com",
        title: "Time Doctor: Employee Productivity & Work Insights",
        brand: "timedoctor",
      },
      {
        id: "p9-s3",
        domain: "toggl.com",
        url: "https://toggl.com/track/remote",
        title: "Toggl Track for Distributed & Freelance Teams",
        brand: "toggl",
      },
      {
        id: "p9-s4",
        domain: "clockify.me",
        url: "https://clockify.me/remote-teams",
        title: "Clockify for Remote Teams & Contractor Billing",
        brand: "clockify",
      },
    ],
  },
  {
    id: "prompt-10",
    text: "How can I improve resource allocation for my team?",
    sourcesCount: 4,
    sources: [
      {
        id: "p10-s1",
        domain: "float.com",
        url: "https://www.float.com",
        title: "Float: Resource Management and Capacity Planning",
        brand: "float",
      },
      {
        id: "p10-s2",
        domain: "runn.io",
        url: "https://www.runn.io/resource-planning",
        title: "Runn.io: Real-Time Resource & Forecasting Platform",
        brand: "runn",
      },
      {
        id: "p10-s3",
        domain: "resourceguruapp.com",
        url: "https://resourceguruapp.com",
        title: "Resource Guru: Fast Team Scheduling & Booking Calendar",
        brand: "resourceguru",
      },
      {
        id: "p10-s4",
        domain: "smartsheet.com",
        url: "https://www.smartsheet.com/resource-management",
        title: "Smartsheet Resource Management & Project Allocation",
        brand: "smartsheet",
      },
    ],
  },
];

export const AVAILABLE_PROMPTS = PROMPT_ITEMS.map((p) => p.text);

const MULTI_DATE_DATA: Record<string, DateColumnData> = {
  "Sep-20 2026": {
    dateKey: "Sep-20 2026",
    displayDate: "Sep-20 2026",
    mentions: [
      { rank: 1, name: "Microsoft Teams" },
      { rank: 2, name: "Slack" },
      { rank: 3, name: "Google Workspace" },
      { rank: 4, name: "Zoho Cliq" },
      { rank: 5, name: "Asana" },
      { rank: 6, name: "Miro" },
      { rank: 7, name: "ClickUp" },
      { rank: 8, name: "Notion" },
      { rank: 9, name: "Zoho Workplace" },
    ],
    sources: [
      {
        id: "s-20-1",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
        title: "Microsoft Teams | Group Chat, Video Calls & Collaboration",
        brand: "microsoft",
      },
      {
        id: "s-20-2",
        domain: "www.microsoft.com",
        url: "https://www.microsoft.com/en-us/microsoft-365/business",
        title: "Microsoft 365 for Business Suite",
        brand: "microsoft",
      },
      {
        id: "s-20-3",
        domain: "appadvisor.in",
        url: "https://appadvisor.in/best-productivity-tools-2026",
        title: "Best Team Productivity Tools 2026 - AppAdvisor",
        brand: "appadvisor",
      },
      {
        id: "s-20-4",
        domain: "appadvisor.in",
        url: "https://appadvisor.in/team-collaboration-guide",
        title: "Complete Team Collaboration Guide - AppAdvisor India",
        brand: "appadvisor",
      },
    ],
    answerText:
      "When evaluating the best tools for enhancing team productivity and collaboration in 2026, leading organizations rely on comprehensive digital workplace platforms.\n\n1. Microsoft Teams & Microsoft 365: Central hub for communication, document co-authoring, and enterprise governance.\n2. Slack: Exceptional real-time channel communication with deep workflow automations.\n3. Asana & ClickUp: Robust task planning, milestone tracking, and sprint coordination.\n4. Notion: Flexible knowledge bases, wikis, and team documentation.\n5. Zoho Workplace & Zoho Cliq: Integrated suite with cost-effective suite pricing.\n6. Google Workspace: Cloud-native real-time document editing and video meetings.",
    cachedSnapshot: JSON.stringify(
      {
        engine: "ChatGPT (GPT-4o)",
        region: "India (en-IN)",
        crawledAt: "2026-09-20T08:30:00Z",
        prompt: "What are the best tools for enhancing team productivity and collaboration?",
        mentionsCount: 9,
        sourcesCount: 4,
      },
      null,
      2
    ),
  },
  "Sep-21 2026": {
    dateKey: "Sep-21 2026",
    displayDate: "Sep-21 2026",
    mentions: [
      { rank: 1, name: "Microsoft Teams" },
    ],
    sources: [], // Empty state
    answerText:
      "The top productivity ecosystem remains Microsoft 365, combining Teams for instant conferencing, Outlook for enterprise messaging, Word, Excel, and PowerPoint for content authoring, and OneDrive for secure cloud synchronization.",
    cachedSnapshot: JSON.stringify(
      {
        engine: "ChatGPT (GPT-4o)",
        region: "India (en-IN)",
        crawledAt: "2026-09-21T08:30:00Z",
        prompt: "What are the best tools for enhancing team productivity and collaboration?",
        mentionsCount: 1,
        sourcesCount: 0,
      },
      null,
      2
    ),
  },
  "Sep-22 2026": {
    dateKey: "Sep-22 2026",
    displayDate: "Sep-22 2026",
    mentions: [
      { rank: 1, name: "Microsoft Teams" },
      { rank: 2, name: "Slack" },
      { rank: 3, name: "Google Workspace" },
      { rank: 4, name: "Asana" },
      { rank: 5, name: "ClickUp" },
      { rank: 6, name: "Zoom" },
      { rank: 7, name: "Trello" },
      { rank: 8, name: "Jira" },
      { rank: 9, name: "Confluence" },
      { rank: 10, name: "Zoho Projects" },
    ],
    sources: [
      {
        id: "s-22-1",
        domain: "www.zoho.com",
        url: "https://www.zoho.com/workplace",
        title: "Zoho Workplace Collaboration Suite",
        brand: "zoho",
      },
      {
        id: "s-22-2",
        domain: "www.appadvisor.in",
        url: "https://appadvisor.in/collaboration-tools-2026",
        title: "AppAdvisor: Top Team Collaboration Tools 2026",
        brand: "appadvisor",
      },
      {
        id: "s-22-3",
        domain: "www.taskwith.ai",
        url: "https://www.taskwith.ai",
        title: "TaskWith.ai: AI Smart Task Coordination",
        brand: "taskwith",
      },
      {
        id: "s-22-4",
        domain: "www.pib.gov.in",
        url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2026",
        title: "Press Information Bureau: Digital Workplaces in India",
        brand: "pib",
      },
      {
        id: "s-22-5",
        domain: "www.pib.gov.in",
        url: "https://pib.gov.in/digital-workplaces",
        title: "PIB Portal: Digital Governance & Engineering Collaboration",
        brand: "pib",
      },
      {
        id: "s-22-6",
        domain: "www.appadvisor.in",
        url: "https://appadvisor.in/guide",
        title: "AppAdvisor Guide: Choosing Modern Software",
        brand: "appadvisor",
      },
    ],
    answerText:
      "Top tools for workplace productivity and collaboration include Microsoft Teams and Microsoft 365 for end-to-end enterprise synergy, Google Workspace for rapid web collaboration, Slack for agile messaging, Asana, Notion, and Trello for team workflows, ClickUp for all-in-one workspaces, and Atlassian Jira and Confluence for technical teams.",
    cachedSnapshot: JSON.stringify(
      {
        engine: "ChatGPT (GPT-4o)",
        region: "India (en-IN)",
        crawledAt: "2026-09-22T08:30:00Z",
        prompt: "What are the best tools for enhancing team productivity and collaboration?",
        mentionsCount: 12,
        sourcesCount: 2,
      },
      null,
      2
    ),
  },
};

export const AI_GUEST_MODULE_DEFINITIONS = [
  { key: "projectOverview", label: "Project Overview", icon: "📊", description: "Summary metrics and project visibility" },
  { key: "rankings", label: "Rankings", icon: "📈", description: "Detailed keyword positions and search engine ranks" },
  { key: "analyticsAndTraffic", label: "Analytics & Traffic", icon: "📉", description: "Traffic share and search trends" },
  { key: "myCompetitors", label: "My Competitors", icon: "⚔️", description: "Added competitors and SERP competitor overlap" },
  { key: "aiResultsTracker", label: "AI Results Tracker", icon: "🤖", description: "AI Overview rankings and citations" },
  { key: "websiteAudit", label: "Website Audit", icon: "🔍", description: "Technical health and crawl issue reports" },
  { key: "marketingPlan", label: "Marketing Plan", icon: "🎯", description: "SEO task checklists and roadmaps" },
];

export function AiCompetitorsView({
  projectId,
  projectDomain = "workcomposer.com",
}: AiCompetitorsViewProps) {
  const router = useRouter();
  const baseHref = `/projects/${projectId}`;

  // Top Alert Banner State
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Speedometer usage limits popover state
  const [isPromptLimitModalOpen, setIsPromptLimitModalOpen] = useState(false);
  const promptLimitRef = useRef<HTMLDivElement>(null);

  // Guest Link Modal state
  const [isGuestLinkModalOpen, setIsGuestLinkModalOpen] = useState(false);
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);
  const [guestLinkAllowExport, setGuestLinkAllowExport] = useState(true);
  const [guestLinkDisplaySettings, setGuestLinkDisplaySettings] = useState(true);
  const [enabledGuestModules, setEnabledGuestModules] = useState<Record<string, boolean>>({
    projectOverview: true,
    rankings: true,
    analyticsAndTraffic: true,
    myCompetitors: true,
    aiResultsTracker: true,
    websiteAudit: true,
    marketingPlan: true,
  });

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX">("XLSX");
  const [exportPromptScope, setExportPromptScope] = useState<"SELECTED" | "ALL">("SELECTED");
  const [isExportPromptDropdownOpen, setIsExportPromptDropdownOpen] = useState(false);
  const exportPromptDropdownRef = useRef<HTMLDivElement>(null);

  // Filter toolbar state
  const [selectedEngine, setSelectedEngine] = useState("ChatGPT");
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [compareByDates, setCompareByDates] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(AVAILABLE_GROUPS);
  const [stagedSelectedGroups, setStagedSelectedGroups] = useState<string[]>(AVAILABLE_GROUPS);
  const [isGeneralGroupSelected, setIsGeneralGroupSelected] = useState(true);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // Toolbar Prompts filter state
  const [isToolbarPromptFilterOpen, setIsToolbarPromptFilterOpen] = useState(false);
  const [toolbarPromptSearchQuery, setToolbarPromptSearchQuery] = useState("");
  const [toolbarSelectedPrompts, setToolbarSelectedPrompts] = useState<string[]>(ALL_AVAILABLE_PROMPTS);
  const [toolbarStagedSelectedPrompts, setToolbarStagedSelectedPrompts] = useState<string[]>(ALL_AVAILABLE_PROMPTS);
  const toolbarPromptFilterRef = useRef<HTMLDivElement>(null);

  // Analyzed Prompt strip state
  const [isPromptDropdownOpen, setIsPromptDropdownOpen] = useState(false);
  const [promptFilterQuery, setPromptFilterQuery] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<string>("prompt-1");
  const promptDropdownRef = useRef<HTMLDivElement>(null);
  const promptSearchInputRef = useRef<HTMLInputElement>(null);

  const selectedPrompt = useMemo(() => {
    return PROMPT_ITEMS.find((p) => p.id === selectedPromptId)?.text || PROMPT_ITEMS[0].text;
  }, [selectedPromptId]);

  const filteredPromptItems = useMemo(() => {
    const q = promptFilterQuery.trim().toLowerCase();
    if (!q) return PROMPT_ITEMS;
    return PROMPT_ITEMS.filter((p) => p.text.toLowerCase().includes(q));
  }, [promptFilterQuery]);

  useEffect(() => {
    if (isPromptDropdownOpen) {
      setTimeout(() => promptSearchInputRef.current?.focus(), 50);
    }
  }, [isPromptDropdownOpen]);

  const [displayLinksBy, setDisplayLinksBy] = useState<LinkDisplayMode>("DOMAIN");
  const [searchQuery, setSearchQuery] = useState("");

  // Highlighted competitor mention across all multi-date columns (defaults to "Microsoft Teams" matching reference design)
  const [highlightedMention, setHighlightedMention] = useState<string | null>("Microsoft Teams");

  // Modals for AI answer text & Cached copy
  const [viewingAnswerDate, setViewingAnswerDate] = useState<string | null>(null);
  const [viewingCachedDate, setViewingCachedDate] = useState<string | null>(null);
  const [viewingPromptSources, setViewingPromptSources] = useState<PromptItem | null>(null);

  // Source item 3-dots actions menu state
  const [activeSourceMenu, setActiveSourceMenu] = useState<{
    dateKey: string;
    sourceId: string;
  } | null>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const guestUrl = `https://${projectDomain}/guest/ai-tracker?token=sec_live_ai_${projectId.slice(0, 8)}`;

  // Click outside and Escape key handler
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
      if (
        toolbarPromptFilterRef.current &&
        !toolbarPromptFilterRef.current.contains(e.target as Node)
      ) {
        setIsToolbarPromptFilterOpen(false);
      }
      if (promptDropdownRef.current && !promptDropdownRef.current.contains(e.target as Node)) {
        setIsPromptDropdownOpen(false);
      }
      if (
        exportPromptDropdownRef.current &&
        !exportPromptDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportPromptDropdownOpen(false);
      }
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setActiveSourceMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPromptLimitModalOpen(false);
        setIsGuestLinkModalOpen(false);
        setIsExportModalOpen(false);
        setIsExportPromptDropdownOpen(false);
        setIsEngineDropdownOpen(false);
        setIsDatePickerOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setIsGroupDropdownOpen(false);
        setIsToolbarPromptFilterOpen(false);
        setIsPromptDropdownOpen(false);
        setActiveSourceMenu(null);
        setViewingAnswerDate(null);
        setViewingCachedDate(null);
        setViewingPromptSources(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    setDateRange(formatted);
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
      const isHistorical = [15, 16, 17, 18, 19].includes(d) && month === 8 && year === 2026;

      let cellStyle =
        "h-7 w-7 text-xs flex flex-col items-center justify-center transition select-none cursor-pointer relative ";

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
        {/* Day-of-week headers */}
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

  // Filtered columns based on search query
  const filteredColumns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: Record<string, { mentions: MentionItem[]; sources: SourceLinkItem[] }> = {};

    Object.keys(MULTI_DATE_DATA).forEach((dateKey) => {
      const col = MULTI_DATE_DATA[dateKey];
      const filteredMentions = q
        ? col.mentions.filter((m) => m.name.toLowerCase().includes(q))
        : col.mentions;

      const filteredSources = q
        ? col.sources.filter(
            (s) =>
              s.domain.toLowerCase().includes(q) ||
              s.url.toLowerCase().includes(q) ||
              s.title.toLowerCase().includes(q)
          )
        : col.sources;

      result[dateKey] = {
        mentions: filteredMentions,
        sources: filteredSources,
      };
    });

    return result;
  }, [searchQuery]);

  const handleCopyGuestLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(guestUrl);
    }
    setCopiedGuestLink(true);
    showToast("Link copied to clipboard successfully!");
    setTimeout(() => setCopiedGuestLink(false), 2500);
  };

  const handleExportDownload = () => {
    setIsExportModalOpen(false);
    setIsExportPromptDropdownOpen(false);
    const scopeLabel = exportPromptScope === "SELECTED" ? "Selected prompt" : "All prompts";
    showToast(`AI Competitors export (${exportFormat} - ${scopeLabel}) downloaded successfully.`);
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
          <span className="font-semibold text-slate-900 dark:text-white">Competitors</span>
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

            {/* Compact Limits Popover Card */}
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

                <div className="border-t border-slate-100 dark:border-slate-800 my-4" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Prompt limit can be increased by upgrading your{" "}
                  <Link
                    href="/billing/pricing"
                    onClick={() => setIsPromptLimitModalOpen(false)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium underline"
                  >
                    pricing plan
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Title & Progress Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Competitors</span>
            <span
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
              title="Information about AI Competitors"
            >
              ℹ
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              100% progress
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
              10 prompts
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Last update 2026-09-22
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`${baseHref}/settings?tab=prompts`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-md shadow-xs transition cursor-pointer"
          >
            <span>+ ADD PROMPTS</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            aria-label="⬆ EXPORT"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase rounded-md shadow-xs transition cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 1.5L13 6.5H9.5V11H6.5V6.5H3L8 1.5Z" />
              <rect x="2" y="13" width="12" height="2" rx="0.5" />
            </svg>
            <span>EXPORT</span>
          </button>

          <Link
            href={`${baseHref}/settings`}
            aria-label="Settings"
            title="Settings"
            className="p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            <Settings className="w-4 h-4" />
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
            <span>🇮🇳 India</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isEngineDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1.5 z-40 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedEngine("ChatGPT");
                  setIsEngineDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  selectedEngine === "ChatGPT" ? "font-bold text-blue-600" : ""
                }`}
              >
                <span>ChatGPT (India)</span>
                {selectedEngine === "ChatGPT" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedEngine("Google AI Overviews");
                  setIsEngineDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  selectedEngine === "Google AI Overviews" ? "font-bold text-blue-600" : ""
                }`}
              >
                <span>Google AI Overviews (US)</span>
                {selectedEngine === "Google AI Overviews" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedEngine("Perplexity");
                  setIsEngineDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  selectedEngine === "Perplexity" ? "font-bold text-blue-600" : ""
                }`}
              >
                <span>Perplexity (India)</span>
                {selectedEngine === "Perplexity" && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Date picker */}
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
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>📅 {dateRange} ▾</span>
          </button>

          {isDatePickerOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Date range picker"
              className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-5 min-w-[640px] max-w-[780px] animate-in fade-in zoom-in-95 duration-100 text-xs"
            >
              {/* Left & Middle: Dual-Month Side-by-Side Calendar Grids */}
              <div className="flex-1 space-y-3">
                {/* Headers row */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 relative z-30">
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
                      <span className="sr-only">
                        {CAL_FULL_MONTHS[calendarLeftMonth]} {calendarLeftYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLeftYearOpen((prev) => !prev);
                          setIsRightYearOpen(false);
                        }}
                        className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer select-none"
                      >
                        {CAL_FULL_MONTHS[calendarLeftMonth]}
                      </button>
                      <CalendarYearDropdown
                        year={calendarLeftYear}
                        onSelectYear={(y) => {
                          setCalendarLeftYear(y);
                          setCalendarRightYear(calendarLeftMonth === 11 ? y + 1 : y);
                        }}
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
                      <span className="sr-only">
                        {CAL_FULL_MONTHS[calendarRightMonth]} {calendarRightYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRightYearOpen((prev) => !prev);
                          setIsLeftYearOpen(false);
                        }}
                        className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer select-none"
                      >
                        {CAL_FULL_MONTHS[calendarRightMonth]}
                      </button>
                      <CalendarYearDropdown
                        year={calendarRightYear}
                        onSelectYear={(y) => {
                          setCalendarRightYear(y);
                          setCalendarLeftYear(calendarRightMonth === 0 ? y - 1 : y);
                        }}
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
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>{formatDisplayDate(stagedRangeStart)}</span>
                    <span className="mx-1.5 text-slate-400">—</span>
                    <span>{formatDisplayDate(stagedRangeEnd)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelDateRange}
                      className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDateRange}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Shortcuts Sidebar (Right Panel) */}
              <div className="w-48 pl-4 space-y-1.5 border-l border-slate-100 dark:border-slate-800 select-none flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
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
                    className={`w-full border py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition text-center cursor-pointer ${
                      activePreset === preset
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}

                {/* "Compare by dates" Toggle */}
                <div
                  className="flex items-center gap-2.5 pt-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  onClick={() => setCompareByDates(!compareByDates)}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-label="Compare by dates"
                    aria-checked={compareByDates}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCompareByDates(!compareByDates);
                    }}
                    className={`w-8 h-4 rounded-full relative transition cursor-pointer flex-shrink-0 ${
                      compareByDates ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out absolute top-0.5 ${
                        compareByDates ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span className="select-none">Compare by dates</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groups filter */}
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
                setIsToolbarPromptFilterOpen(false);
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

        {/* Prompts filter */}
        <div className="relative" ref={toolbarPromptFilterRef}>
          <button
            type="button"
            aria-label="Prompts"
            aria-expanded={isToolbarPromptFilterOpen}
            onClick={() => {
              const next = !isToolbarPromptFilterOpen;
              setIsToolbarPromptFilterOpen(next);
              if (next) {
                setToolbarStagedSelectedPrompts([...toolbarSelectedPrompts]);
                setToolbarPromptSearchQuery("");
                setIsGroupDropdownOpen(false);
                setIsDatePickerOpen(false);
                setIsEngineDropdownOpen(false);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition ${
              isToolbarPromptFilterOpen
                ? "bg-slate-200 dark:bg-slate-700 font-semibold border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                : "bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>Prompts ▾</span>
          </button>

          {isToolbarPromptFilterOpen && (
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
                  value={toolbarPromptSearchQuery}
                  onChange={(e) => setToolbarPromptSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Select all */}
              <div
                onClick={() => {
                  if (toolbarStagedSelectedPrompts.length === ALL_AVAILABLE_PROMPTS.length) {
                    setToolbarStagedSelectedPrompts([]);
                  } else {
                    setToolbarStagedSelectedPrompts([...ALL_AVAILABLE_PROMPTS]);
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
                  p.toLowerCase().includes(toolbarPromptSearchQuery.toLowerCase())
                ).map((prompt) => {
                  const isChecked = toolbarStagedSelectedPrompts.includes(prompt);
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
                            setToolbarStagedSelectedPrompts([...toolbarStagedSelectedPrompts, prompt]);
                          } else {
                            setToolbarStagedSelectedPrompts(
                              toolbarStagedSelectedPrompts.filter((p) => p !== prompt)
                            );
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
                  setToolbarSelectedPrompts([...toolbarStagedSelectedPrompts]);
                  setIsToolbarPromptFilterOpen(false);
                }}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-2 mt-2.5 rounded-lg text-sm transition cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. "Analyzed Prompt" Control Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-5 shadow-xs">
        {/* Section Title */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Analyzed prompt
        </h3>

        {/* Single Horizontal Flex Row with Vertical Divider */}
        <div className="flex items-end gap-5 flex-wrap">
          {/* Left: Prompt Selector with Prompt (left) and Sources (right) labels */}
          <div className="flex-1 min-w-[340px] max-w-xl">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-0.5">
              <span>Prompt</span>
              <span>Sources</span>
            </div>
            <div className="relative" ref={promptDropdownRef}>
              <div
                className={`w-full flex items-center justify-between border bg-white dark:bg-slate-800 rounded-lg shadow-2xs transition ${
                  isPromptDropdownOpen
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                }`}
              >
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={isPromptDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Select analyzed prompt"
                  onClick={() => setIsPromptDropdownOpen((prev) => !prev)}
                  className="flex-1 flex items-center justify-between px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer truncate text-left select-none"
                >
                  <span className="truncate pr-2 font-bold text-slate-900 dark:text-slate-100">
                    {selectedPrompt}
                  </span>
                </button>
                <div className="flex items-center gap-1.5 pr-2.5 text-slate-500 dark:text-slate-400 shrink-0">
                  <button
                    type="button"
                    aria-label="View sources for selected prompt"
                    title="View sources for selected prompt"
                    onClick={() => {
                      const cur =
                        PROMPT_ITEMS.find((p) => p.id === selectedPromptId) || PROMPT_ITEMS[0];
                      setViewingPromptSources(cur);
                    }}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Toggle prompt dropdown"
                    onClick={() => setIsPromptDropdownOpen((prev) => !prev)}
                    className="p-0.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-150 ${
                        isPromptDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isPromptDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Available prompts"
                  className="absolute left-0 top-full mt-1.5 w-full min-w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs space-y-2"
                >
                  {/* Search Bar inside Popover */}
                  <div className="relative">
                    <input
                      ref={promptSearchInputRef}
                      type="text"
                      value={promptFilterQuery}
                      onChange={(e) => setPromptFilterQuery(e.target.value)}
                      placeholder="Search prompts..."
                      className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-blue-500 ring-1 ring-blue-500 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {promptFilterQuery && (
                        <button
                          type="button"
                          onClick={() => setPromptFilterQuery("")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          aria-label="Clear prompt search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <Search className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Prompts List with Link Option under Sources */}
                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                    {filteredPromptItems.length === 0 ? (
                      <div className="py-5 text-center text-xs text-slate-400 dark:text-slate-500">
                        No prompts match &ldquo;{promptFilterQuery}&rdquo;
                      </div>
                    ) : (
                      filteredPromptItems.map((item) => {
                        const isSelected = item.id === selectedPromptId;
                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedPromptId(item.id);
                              setIsPromptDropdownOpen(false);
                              setPromptFilterQuery("");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition flex items-center justify-between gap-3 text-xs select-none ${
                              isSelected
                                ? "bg-[#f0f3f8] dark:bg-slate-800/90 text-blue-700 dark:text-blue-300 font-semibold"
                                : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
                            }`}
                          >
                            <span className="truncate pr-2">{item.text}</span>
                            <button
                              type="button"
                              aria-label={`View sources for ${item.text}`}
                              title={`View sources (${item.sourcesCount || item.sources?.length || 4} links)`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPromptSources(item);
                              }}
                              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer shrink-0"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer status row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px] text-slate-400 px-1">
                    <div className="flex items-center justify-between">
                      <span>
                        {filteredPromptItems.length} of {PROMPT_ITEMS.length} prompts
                      </span>
                      {promptFilterQuery && (
                        <button
                          type="button"
                          onClick={() => setPromptFilterQuery("")}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      These are all the prompts for the selected search engine
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thin Vertical Divider between Prompt and Display Links / Search */}
          <div className="hidden sm:block w-[1px] h-12 bg-slate-200 dark:bg-slate-700 self-end -mb-0.5" />

          {/* Right: Display links by toggle & Search input */}
          <div className="flex items-end gap-3 shrink-0">
            {/* Display links by Toggle */}
            <div>
              <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Display links by
              </span>
              <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setDisplayLinksBy("DOMAIN")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase transition cursor-pointer select-none ${
                    displayLinksBy === "DOMAIN"
                      ? "bg-[#544f70] text-white"
                      : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  DOMAIN
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLinksBy("URL")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase transition border-l border-slate-300 dark:border-slate-700 cursor-pointer select-none ${
                    displayLinksBy === "URL"
                      ? "bg-[#544f70] text-white"
                      : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  URL
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-44">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Multi-Date Column Grid (Sep-20 2026, Sep-21 2026, Sep-22 2026) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Sep-20 2026", "Sep-21 2026", "Sep-22 2026"].map((dateKey) => {
          const colData = MULTI_DATE_DATA[dateKey];
          const filtered = filteredColumns[dateKey] || { mentions: [], sources: [] };

          return (
            <div key={dateKey} className="flex flex-col space-y-3">
              {/* Column Date Header */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {colData.displayDate}
                </span>
                <button
                  type="button"
                  onClick={() => setViewingCachedDate(dateKey)}
                  className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-2xs"
                >
                  Cached copy ↗
                </button>
              </div>

              {/* Top Card: AI Mentions (@ Al mentions) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col relative overflow-visible">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 px-3.5 py-2.5">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>@</span>
                    <span>Al mentions</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingAnswerDate(dateKey)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer select-none"
                  >
                    Al answer text
                  </button>
                </div>

                {/* Mentions Ranked List */}
                <div className="min-h-[290px] flex flex-col justify-start">
                  {filtered.mentions.length > 0 ? (
                    filtered.mentions.map((m) => {
                      const isHighlighted =
                        highlightedMention?.trim().toLowerCase() === m.name.trim().toLowerCase();

                      // Find next column connection
                      const nextDateKey =
                        dateKey === "Sep-20 2026"
                          ? "Sep-21 2026"
                          : dateKey === "Sep-21 2026"
                          ? "Sep-22 2026"
                          : null;
                      const nextColMentions = nextDateKey
                        ? filteredColumns[nextDateKey]?.mentions || MULTI_DATE_DATA[nextDateKey]?.mentions
                        : null;
                      const nextMention =
                        isHighlighted && nextColMentions
                          ? nextColMentions.find(
                              (nm) => nm.name.trim().toLowerCase() === m.name.trim().toLowerCase()
                            )
                          : null;
                      const rankDiff = nextMention ? m.rank - nextMention.rank : 0;

                      return (
                        <div
                          key={`${dateKey}-${m.rank}-${m.name}`}
                          data-mention-row="true"
                          data-highlighted={isHighlighted ? "true" : "false"}
                          onClick={() =>
                            setHighlightedMention((prev) =>
                              prev?.trim().toLowerCase() === m.name.trim().toLowerCase()
                                ? null
                                : m.name
                            )
                          }
                          className={`relative flex items-center gap-3 py-2 px-3.5 text-xs transition cursor-pointer select-none ${
                            isHighlighted
                              ? "bg-[#544f70] text-white font-medium"
                              : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                          }`}
                        >
                          <span
                            className={`w-3.5 text-left font-normal select-none ${
                              isHighlighted ? "text-white" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {m.rank}
                          </span>
                          <span className="font-semibold truncate flex-1">{m.name}</span>

                          {/* Inter-column connector between adjacent cards */}
                          {isHighlighted && nextMention && (
                            <div
                              data-testid={`rank-connector-${dateKey}-${nextDateKey}`}
                              className="hidden md:flex absolute -right-4 w-4 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none z-30"
                              style={{ height: "18px" }}
                              aria-label={`Rank change: ${
                                rankDiff === 0
                                  ? "same rank"
                                  : rankDiff > 0
                                  ? `up ${rankDiff}`
                                  : `down ${Math.abs(rankDiff)}`
                              }`}
                            >
                              <svg
                                width="16"
                                height="18"
                                viewBox="0 0 16 18"
                                className="overflow-visible"
                              >
                                {/* Left vertical tick */}
                                <line x1="0" y1="4" x2="0" y2="14" stroke="#36b37e" strokeWidth="1.5" />
                                {/* Connecting line left */}
                                <line x1="0" y1="9" x2="4.5" y2="9" stroke="#36b37e" strokeWidth="1.5" />

                                {rankDiff === 0 ? (
                                  <>
                                    {/* Equals sign: two horizontal lines */}
                                    <line
                                      x1="5.5"
                                      y1="7.5"
                                      x2="10.5"
                                      y2="7.5"
                                      stroke="#36b37e"
                                      strokeWidth="1.5"
                                    />
                                    <line
                                      x1="5.5"
                                      y1="10.5"
                                      x2="10.5"
                                      y2="10.5"
                                      stroke="#36b37e"
                                      strokeWidth="1.5"
                                    />
                                  </>
                                ) : (
                                  <text
                                    x="8"
                                    y="9"
                                    fill="#36b37e"
                                    fontSize="9"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                  >
                                    {rankDiff > 0 ? `▲${rankDiff}` : `▼${Math.abs(rankDiff)}`}
                                  </text>
                                )}

                                {/* Connecting line right */}
                                <line
                                  x1="11.5"
                                  y1="9"
                                  x2="16"
                                  y2="9"
                                  stroke="#36b37e"
                                  strokeWidth="1.5"
                                />
                                {/* Right vertical tick */}
                                <line
                                  x1="16"
                                  y1="4"
                                  x2="16"
                                  y2="14"
                                  stroke="#36b37e"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 italic">
                      No mentions found
                    </div>
                  )}

                  {/* Fill subtle diagonal stripes for Sep-21 2026 remaining space */}
                  {dateKey === "Sep-21 2026" && (
                    <div
                      aria-hidden="true"
                      className="mx-3.5 my-2 flex-1 min-h-[220px] rounded-lg border border-dashed border-slate-200 dark:border-slate-700/80 bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_8px,#f1f5f9_8px,#f1f5f9_16px)] dark:bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_8px,#1e293b_8px,#1e293b_16px)]"
                    />
                  )}
                </div>
              </div>

              {/* Bottom Card: AI Source Links (🔗 Al source links) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-2.5">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {filtered.sources.length > 0 ? (
                      <Link2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    ) : (
                      <Link2Off className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                    <span>Al source links</span>
                  </span>
                </div>

                {/* Source Items / Empty State */}
                <div className="min-h-[180px] flex flex-col justify-start">
                  {filtered.sources.length > 0 ? (
                    <div className="space-y-1.5">
                      {filtered.sources.map((s, idx) => {
                        const isMenuOpen =
                          activeSourceMenu?.dateKey === dateKey &&
                          activeSourceMenu?.sourceId === s.id;

                        return (
                          <div
                            key={s.id}
                            className={`relative flex items-center gap-2 py-1.5 px-2 rounded-lg border text-xs transition group ${
                              isMenuOpen
                                ? "bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600"
                                : "hover:bg-slate-50 dark:hover:bg-slate-700/40 border-slate-100 dark:border-slate-700/50"
                            }`}
                          >
                            <span className="w-4 text-slate-400 font-medium text-[11px] select-none">
                              {idx + 1}.
                            </span>

                            {/* Brand Logo Icon */}
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                              {s.brand === "microsoft" ? (
                                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5" title="Microsoft">
                                  <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
                                </div>
                              ) : s.brand === "zoho" ? (
                                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5" title="Zoho">
                                  <div className="bg-[#e42528] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#219653] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#2f80ed] w-1.5 h-1.5 rounded-xs" />
                                  <div className="bg-[#f2c94c] w-1.5 h-1.5 rounded-xs" />
                                </div>
                              ) : s.brand === "taskwith" ? (
                                <div
                                  className="w-3.5 h-3.5 rounded bg-sky-500 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs"
                                  title="TaskWith.ai"
                                >
                                  ✓
                                </div>
                              ) : s.brand === "pib" ? (
                                <div
                                  className="w-3.5 h-3.5 rounded bg-emerald-700 text-amber-300 font-bold text-[8px] flex items-center justify-center border border-amber-400/50"
                                  title="PIB (Gov of India)"
                                >
                                  🇮🇳
                                </div>
                              ) : s.brand === "appadvisor" ? (
                                <div
                                  className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs"
                                  title="AppAdvisor"
                                >
                                  A
                                </div>
                              ) : (
                                <div
                                  className="w-3.5 h-3.5 rounded bg-slate-600 text-white font-bold text-[8px] flex items-center justify-center"
                                  title={s.domain}
                                >
                                  {s.domain.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Domain or URL */}
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium truncate flex-1 hover:underline"
                              title={s.title}
                            >
                              {displayLinksBy === "DOMAIN" ? s.domain : s.url}
                            </a>

                            {/* 3-dots More Actions Button & Popover Menu */}
                            <div
                              className="relative shrink-0"
                              ref={isMenuOpen ? sourceMenuRef : undefined}
                            >
                              <button
                                type="button"
                                aria-label={`Actions for ${s.domain}`}
                                title="More options"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSourceMenu((prev) =>
                                    prev?.dateKey === dateKey && prev?.sourceId === s.id
                                      ? null
                                      : { dateKey, sourceId: s.id }
                                  );
                                }}
                                className={`p-1 rounded-md border text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0 ${
                                  isMenuOpen
                                    ? "border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs"
                                }`}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Menu Popover */}
                              {isMenuOpen && (
                                <div
                                  role="menu"
                                  aria-label={`Options for ${s.domain}`}
                                  className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-normal"
                                >
                                  {/* 1. Research domain */}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSourceMenu(null);
                                      showToast(`Opening domain research for ${s.domain}`);
                                      window.open(
                                        `/projects/${projectId}/competitors/serp?domain=${encodeURIComponent(s.domain)}`,
                                        "_blank",
                                        "noopener,noreferrer"
                                      );
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                                  >
                                    <span>Research domain</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  </button>

                                  {/* 2. Analyze domain */}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSourceMenu(null);
                                      showToast(`Analyzing domain ${s.domain}`);
                                      window.open(
                                        `/projects/${projectId}/competitors?domain=${encodeURIComponent(s.domain)}`,
                                        "_blank",
                                        "noopener,noreferrer"
                                      );
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                                  >
                                    <span>Analyze domain</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  </button>

                                  {/* 3. Open URL */}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSourceMenu(null);
                                      window.open(s.url, "_blank", "noopener,noreferrer");
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                                  >
                                    <span>Open URL</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  </button>

                                  {/* 4. Copy URL */}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSourceMenu(null);
                                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                                        navigator.clipboard.writeText(s.url);
                                      }
                                      showToast("Source URL copied to clipboard!");
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                                  >
                                    <span>Copy URL</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Diagonal stripes pattern below Sep-22 2026 rows */}
                      {dateKey === "Sep-22 2026" && (
                        <div
                          aria-hidden="true"
                          className="mt-2 h-14 rounded-lg border border-dashed border-slate-200 dark:border-slate-700/80 bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_8px,#f1f5f9_8px,#f1f5f9_16px)] dark:bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_8px,#1e293b_8px,#1e293b_16px)]"
                        />
                      )}
                    </div>
                  ) : (
                    /* Sep-21 2026 Empty State: No links */
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-1 shadow-2xs">
                        <Link2Off className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5">No links</h3>
                      <p className="text-[11px] text-slate-500 text-center max-w-[200px] mt-1 leading-normal">
                        There are no links in the LLM results for the selected prompt on this date
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Answer Text Modal */}
      {viewingAnswerDate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`AI Answer Text - ${viewingAnswerDate}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Al answer text</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {viewingAnswerDate}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  Prompt: {selectedPrompt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingAnswerDate(null)}
                aria-label="Close answer modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 max-h-96 overflow-y-auto font-sans">
              {MULTI_DATE_DATA[viewingAnswerDate]?.answerText}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingAnswerDate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cached Copy Modal */}
      {viewingCachedDate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Cached LLM Snapshot - ${viewingCachedDate}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Cached Copy Snapshot</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {viewingCachedDate}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Engine: ChatGPT (India) | Status: Verified Crawled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCachedDate(null)}
                aria-label="Close cached copy modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-400 rounded-xl p-4 text-xs font-mono max-h-96 overflow-y-auto leading-relaxed">
              <pre>{MULTI_DATE_DATA[viewingCachedDate]?.cachedSnapshot}</pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingCachedDate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Sources Modal */}
      {viewingPromptSources && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`AI Source Links - ${viewingPromptSources.text}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Al source links
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingPromptSources.sources?.length || viewingPromptSources.sourcesCount || 4} sources
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-normal">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Prompt: </span>
                  {viewingPromptSources.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPromptSources(null)}
                aria-label="Close sources modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Sources List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {viewingPromptSources.sources && viewingPromptSources.sources.length > 0 ? (
                viewingPromptSources.sources.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold text-slate-400 select-none">
                        {idx + 1}.
                      </span>
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {s.brand === "microsoft" ? (
                          <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                            <div className="bg-[#f25022] w-1.5 h-1.5 rounded-2xs" />
                            <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-2xs" />
                            <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-2xs" />
                            <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-2xs" />
                          </div>
                        ) : s.brand === "google" ? (
                          <span className="font-bold text-blue-600 text-xs">G</span>
                        ) : s.brand === "slack" ? (
                          <span className="font-bold text-purple-600 text-xs">#</span>
                        ) : (
                          <span className="font-bold text-blue-600 text-[10px]">
                            {s.domain.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {s.title}
                        </div>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          {displayLinksBy === "DOMAIN" ? s.domain : s.url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        title="Copy link"
                        aria-label={`Copy source link ${s.url}`}
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(s.url);
                          }
                          showToast("Source link copied to clipboard!");
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in new tab"
                        aria-label={`Open source ${s.url}`}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No source links recorded for this prompt.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const link = `${guestUrl}&prompt=${viewingPromptSources.id}`;
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(link);
                  }
                  showToast("Prompt deep link copied to clipboard!");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy prompt link</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPromptId(viewingPromptSources.id);
                    setViewingPromptSources(null);
                    setIsPromptDropdownOpen(false);
                    showToast(`Selected prompt: "${viewingPromptSources.text.slice(0, 35)}..."`);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                >
                  Select in tracker
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPromptSources(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  setIsExportPromptDropdownOpen(false);
                }}
                aria-label="Close export modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Prompt Selector Section */}
            <div className="space-y-1.5 relative" ref={exportPromptDropdownRef}>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Prompt
              </label>
              <button
                type="button"
                onClick={() => setIsExportPromptDropdownOpen((prev) => !prev)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between hover:border-slate-400 cursor-pointer shadow-2xs"
              >
                <span className="truncate pr-2">
                  {exportPromptScope === "SELECTED"
                    ? `Selected prompt (${selectedPrompt.length > 36 ? selectedPrompt.slice(0, 36) + "..." : selectedPrompt})`
                    : "All prompts in the list"}
                </span>
                {isExportPromptDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </button>

              {isExportPromptDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Select export prompt scope"
                  className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl z-20 py-1 text-xs"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={exportPromptScope === "SELECTED"}
                    onClick={() => {
                      setExportPromptScope("SELECTED");
                      setIsExportPromptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 cursor-pointer transition truncate ${
                      exportPromptScope === "SELECTED"
                        ? "bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                    }`}
                  >
                    Selected prompt ({selectedPrompt.length > 40 ? selectedPrompt.slice(0, 40) + "..." : selectedPrompt})
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected={exportPromptScope === "ALL"}
                    onClick={() => {
                      setExportPromptScope("ALL");
                      setIsExportPromptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 cursor-pointer transition ${
                      exportPromptScope === "ALL"
                        ? "bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                    }`}
                  >
                    All prompts in the list
                  </button>
                </div>
              )}
            </div>

            {/* Format Selection Cards (Excel vs CSV) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Excel (.xlsx) Card */}
              <button
                type="button"
                onClick={() => setExportFormat("XLSX")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition cursor-pointer text-center select-none ${
                  exportFormat === "XLSX"
                    ? "bg-[#484263] border-[#484263] text-white shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Excel Document Icon with folded corner and bold X */}
                <svg
                  className="w-6 h-7 mb-1.5"
                  viewBox="0 0 24 30"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 3a2 2 0 0 1 2-2h11l7 7v19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3z"
                    fill={exportFormat === "XLSX" ? "white" : "#f8fafc"}
                    stroke={exportFormat === "XLSX" ? "none" : "#cbd5e1"}
                    strokeWidth={exportFormat === "XLSX" ? 0 : 1.5}
                  />
                  <path
                    d="M15 1v6a1 1 0 0 0 1 1h6"
                    fill={exportFormat === "XLSX" ? "#e2e8f0" : "#cbd5e1"}
                  />
                  <text
                    x="12"
                    y="22"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fill={exportFormat === "XLSX" ? "#484263" : "#475569"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    X
                  </text>
                </svg>
                <span className="font-bold text-xs mt-0.5">Excel (.xlsx)</span>
                <span
                  className={`italic text-[11px] mt-0.5 ${
                    exportFormat === "XLSX"
                      ? "text-slate-200"
                      : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  Max. 10K rows
                </span>
              </button>

              {/* CSV (.csv) Card */}
              <button
                type="button"
                onClick={() => setExportFormat("CSV")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition cursor-pointer text-center select-none ${
                  exportFormat === "CSV"
                    ? "bg-[#484263] border-[#484263] text-white shadow-md"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* CSV Document Icon with folded corner and bold CSV */}
                <svg
                  className="w-6 h-7 mb-1.5"
                  viewBox="0 0 24 30"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 3a2 2 0 0 1 2-2h11l7 7v19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3z"
                    fill="#008688"
                  />
                  <path
                    d="M15 1v6a1 1 0 0 0 1 1h6"
                    fill="#5eead4"
                  />
                  <text
                    x="12"
                    y="20"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="900"
                    fill="white"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="0.5"
                  >
                    CSV
                  </text>
                </svg>
                <span className="font-bold text-xs mt-0.5">CSV (.csv)</span>
                <span
                  className={`italic text-[11px] mt-0.5 ${
                    exportFormat === "CSV"
                      ? "text-slate-200"
                      : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  Max. 100K rows.
                </span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  setIsExportPromptDropdownOpen(false);
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleExportDownload}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      {isGuestLinkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Get access to guest links"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Get access to guest links
              </h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkModalOpen(false)}
                aria-label="Close guest link modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Shareable guest URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={guestUrl}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyGuestLink}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedGuestLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Visible modules
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AI_GUEST_MODULE_DEFINITIONS.map((mod) => (
                    <label
                      key={mod.key}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!enabledGuestModules[mod.key]}
                        onChange={(e) =>
                          setEnabledGuestModules((prev) => ({
                            ...prev,
                            [mod.key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsGuestLinkModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
