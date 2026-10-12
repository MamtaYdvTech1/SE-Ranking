"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Sparkles,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Filter,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Left" | "In progress" | "Done";

export interface MarketingSubtask {
  id: string;
  title: string;
  isDone: boolean;
}

export interface MarketingTask {
  id: string;
  stepId: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  subtasks: MarketingSubtask[];
}

export interface MarketingStep {
  id: number;
  title: string;
  subtitle: string;
  icon?: string;
}

const STEPS: MarketingStep[] = [
  { id: 1, title: "1. Strategy & Pre-Launch", subtitle: "Project kickoff and foundational setup" },
  { id: 2, title: "2. Keyword Research & Mapping", subtitle: "Target audience queries and clustering" },
  { id: 3, title: "3. On-Page Optimization", subtitle: "Meta tags, headings, content structure" },
  { id: 4, title: "4. Technical SEO Audit", subtitle: "Core Web Vitals, crawlability, indexing" },
  { id: 5, title: "5. Content Creation & Strategy", subtitle: "Cornerstone guides and editorial plan" },
  { id: 6, title: "6. Off-Page SEO & Link Building", subtitle: "Digital PR, citations, domain trust" },
  { id: 7, title: "7. Analytics & Performance Tracking", subtitle: "KPIs, conversions, weekly monitoring" },
];

const INITIAL_TASKS: MarketingTask[] = [
  // Step 1: Strategy & Pre-Launch (8 tasks: 1 High, 7 Med, 0 Low)
  {
    id: "task-1",
    stepId: 1,
    title: "Define primary business goals & target audience KPIs",
    description: "Align SEO targets with organic revenue, lead volume, and brand search metrics.",
    priority: "High",
    status: "Left",
    notes: "",
    subtasks: [
      { id: "sub-1-1", title: "Document organic traffic baseline", isDone: false },
      { id: "sub-1-2", title: "Identify primary revenue-generating services", isDone: false },
    ],
  },
  {
    id: "task-2",
    stepId: 1,
    title: "Configure Google Analytics 4 & Google Tag Manager",
    description: "Ensure event tracking, enhanced measurement, and conversions are configured.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [{ id: "sub-2-1", title: "Verify GTM container code in head and body", isDone: false }],
  },
  {
    id: "task-3",
    stepId: 1,
    title: "Verify Google Search Console & submit XML sitemap",
    description: "Claim domain property via DNS verification and submit production sitemap.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [{ id: "sub-3-1", title: "Check sitemap index status", isDone: false }],
  },
  {
    id: "task-4",
    stepId: 1,
    title: "Install SSL certificate and enforce HTTPS redirect",
    description: "Ensure all HTTP requests 301 redirect to HTTPS without mixed content warnings.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-5",
    stepId: 1,
    title: "Set up canonical domain (non-www to www or vice versa)",
    description: "Prevent duplicate domain indexing by choosing a single preferred host.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-6",
    stepId: 1,
    title: "Review brand name search results & claim social profiles",
    description: "Protect brand SERP by claiming relevant social profiles and knowledge panels.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-7",
    stepId: 1,
    title: "Set up robots.txt file with proper crawl directives",
    description: "Disallow admin routes and specify XML sitemap location for web crawlers.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-8",
    stepId: 1,
    title: "Configure custom 404 error page with helpful navigation",
    description: "Provide search bar and key links on not-found pages to retain visitor engagement.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 2: Keyword Research & Mapping (12 tasks: 1 High, 11 Med, 0 Low)
  {
    id: "task-9",
    stepId: 2,
    title: "Conduct seed keyword research for primary services",
    description: "Gather high-intent search terms with consistent monthly volume.",
    priority: "High",
    status: "Left",
    notes: "",
    subtasks: [{ id: "sub-9-1", title: "Export seed list from Keyword Research Tool", isDone: false }],
  },
  {
    id: "task-10",
    stepId: 2,
    title: "Analyze top 10 search competitors' keyword portfolios",
    description: "Inspect competitor ranking distributions and identify ranking overlaps.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-11",
    stepId: 2,
    title: "Filter keywords by search intent (informational, commercial, transactional)",
    description: "Segment queries so content formats match exact user search intent.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-12",
    stepId: 2,
    title: "Cluster keywords into thematic topical topic groups",
    description: "Group similar semantic terms together to avoid keyword cannibalization.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-13",
    stepId: 2,
    title: "Identify low-competition long-tail keyword opportunities",
    description: "Target specific 3-5 word phrases that offer rapid ranking velocity.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-14",
    stepId: 2,
    title: "Map target keywords to existing website URLs",
    description: "Assign 1 primary keyword and 3-5 secondary keywords per page.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-15",
    stepId: 2,
    title: "Determine primary and secondary keywords for core landing pages",
    description: "Optimize high-converting product pages with commercial terms.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-16",
    stepId: 2,
    title: "Identify seasonal keyword trends and quarterly peaks",
    description: "Plan publication calendars ahead of seasonal demand spikes.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-17",
    stepId: 2,
    title: "Discover questions people ask (People Also Ask / SERP features)",
    description: "Extract FAQs and rich snippet triggers from search engine results.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-18",
    stepId: 2,
    title: "Find keyword gaps where competitors rank and you do not",
    description: "Capitalize on underserved high-opportunity ranking niches.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-19",
    stepId: 2,
    title: "Establish keyword difficulty benchmarks for quick wins",
    description: "Prioritize terms with KD < 35 for first 90-day momentum.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-20",
    stepId: 2,
    title: "Organize keyword list into tracking groups in SE Ranking",
    description: "Tag keywords by product line, region, and buyer stage.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 3: On-Page Optimization (15 tasks: 1 High, 13 Med, 1 Low)
  {
    id: "task-21",
    stepId: 3,
    title: "Craft unique, compelling title tags under 60 characters for core pages",
    description: "Place primary keyword near the beginning with brand identifier at the end.",
    priority: "High",
    status: "Left",
    notes: "",
    subtasks: [{ id: "sub-21-1", title: "Audit title tags across homepage and services", isDone: false }],
  },
  {
    id: "task-22",
    stepId: 3,
    title: "Write engaging meta descriptions with clear call-to-actions",
    description: "Keep descriptions between 140-160 characters with secondary keywords.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-23",
    stepId: 3,
    title: "Ensure single H1 tag per page aligned with primary keyword",
    description: "Verify template does not inject multiple H1s or duplicate titles.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-24",
    stepId: 3,
    title: "Structure subheadings with proper H2-H4 hierarchy",
    description: "Break long content into digestible subsections with semantic subheaders.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-25",
    stepId: 3,
    title: "Optimize image alt text and descriptive filenames",
    description: "Include relevant context without keyword stuffing; use lowercase hyphens.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-26",
    stepId: 3,
    title: "Add descriptive internal links between related service pages",
    description: "Use contextual anchor text to pass page authority and guide visitors.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-27",
    stepId: 3,
    title: "Implement breadcrumb navigation markup across all pages",
    description: "Enhance SERP snippet appearance and improve site architecture hierarchy.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-28",
    stepId: 3,
    title: "Optimize URL slugs to be clean, short, and keyword-rich",
    description: "Remove stop words, numbers, and dates from static permanent URLs.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-29",
    stepId: 3,
    title: "Format content with bulleted lists, tables, and scannable blocks",
    description: "Increase dwell time and eligibility for featured snippet lists.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-30",
    stepId: 3,
    title: "Add FAQ schema markup to service and landing pages",
    description: "Implement structured JSON-LD FAQ blocks for SERP accordion visibility.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-31",
    stepId: 3,
    title: "Add Organization and LocalBusiness JSON-LD structured data",
    description: "Clarify entity ownership, logo, phone, address, and social links.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-32",
    stepId: 3,
    title: "Check and fix any orphaned pages without inbound links",
    description: "Ensure every indexed page receives at least 2 internal links.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-33",
    stepId: 3,
    title: "Eliminate duplicate or near-duplicate body content",
    description: "Use canonical tags or consolidate thin pages with 301 redirects.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-34",
    stepId: 3,
    title: "Add social open graph and Twitter card meta tags",
    description: "Control snippet title, image, and description when shared on social.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-35",
    stepId: 3,
    title: "Optimize outbound external links to open securely in new tabs",
    description: "Add rel=\"noopener noreferrer\" to authoritative outbound references.",
    priority: "Low",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 4: Technical SEO Audit (14 tasks: 0 High, 14 Med, 0 Low)
  {
    id: "task-36",
    stepId: 4,
    title: "Audit and fix all 4xx client errors and broken internal links",
    description: "Scan site crawl logs and resolve dead links with 301 redirects.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-37",
    stepId: 4,
    title: "Eliminate redirect chains and 301/302 redirect loops",
    description: "Point internal links directly to destination URLs to preserve link equity.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-38",
    stepId: 4,
    title: "Optimize Core Web Vitals: Largest Contentful Paint (LCP < 2.5s)",
    description: "Preload hero banners, optimize critical rendering path, and reduce server TTFB.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-39",
    stepId: 4,
    title: "Optimize Core Web Vitals: Interaction to Next Paint (INP < 200ms)",
    description: "Break long JavaScript tasks into smaller asynchronous microtasks.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-40",
    stepId: 4,
    title: "Optimize Core Web Vitals: Cumulative Layout Shift (CLS < 0.1)",
    description: "Specify explicit width and height dimensions on all images and ad frames.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-41",
    stepId: 4,
    title: "Compress and serve next-gen image formats (WebP/AVIF)",
    description: "Implement responsive srcset and modern image compression pipelines.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-42",
    stepId: 4,
    title: "Enable HTTP/2 or HTTP/3 server response protocol",
    description: "Allow multiplexing of network requests to accelerate asset loading.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-43",
    stepId: 4,
    title: "Implement browser caching headers for static assets",
    description: "Set Cache-Control: max-age=31536000, immutable for versioned files.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-44",
    stepId: 4,
    title: "Minify CSS, JavaScript, and HTML resources",
    description: "Strip unneeded whitespace, comments, and unused code blocks.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-45",
    stepId: 4,
    title: "Ensure mobile responsiveness and touch-friendly tap targets",
    description: "Verify viewport meta tag and check spacing between interactive elements.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-46",
    stepId: 4,
    title: "Audit hreflang tags if multi-regional or multilingual",
    description: "Ensure bidirectional reciprocal hreflang annotations exist for all locales.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-47",
    stepId: 4,
    title: "Fix mixed content warnings (HTTP assets on HTTPS pages)",
    description: "Update insecure scripts, images, and fonts to HTTPS endpoints.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-48",
    stepId: 4,
    title: "Ensure XML sitemaps do not exceed 50,000 URLs or 50MB",
    description: "Split large sitemaps into sub-sitemaps referenced in a parent sitemap index.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-49",
    stepId: 4,
    title: "Review log files to identify bot crawl budget waste",
    description: "Block Googlebot from crawling faceted navigation parameters or admin paths.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 5: Content Creation & Strategy (10 tasks: 0 High, 10 Med, 0 Low)
  {
    id: "task-50",
    stepId: 5,
    title: "Create content calendar aligned with target audience queries",
    description: "Schedule 2-4 comprehensive articles per month focused on high-intent themes.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-51",
    stepId: 5,
    title: "Draft comprehensive cornerstone pillar guide for main industry topic",
    description: "Produce definitive 3,000+ word resource establishing domain authority.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-52",
    stepId: 5,
    title: "Publish supporting cluster blog posts linking back to pillar page",
    description: "Build semantic topic clusters that channel authority toward the pillar.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-53",
    stepId: 5,
    title: "Refresh and update outdated blog content with recent data",
    description: "Update statistics, examples, and publish dates on decaying articles.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-54",
    stepId: 5,
    title: "Incorporate original research, statistics, and industry benchmarks",
    description: "Publish proprietary survey findings that naturally attract organic backlinks.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-55",
    stepId: 5,
    title: "Add expert quotes and author bios demonstrating E-E-A-T",
    description: "Display verifiable author credentials, LinkedIn links, and editorial guidelines.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-56",
    stepId: 5,
    title: "Design infographics and visual assets for key conceptual topics",
    description: "Create original visual charts that readers and bloggers want to embed.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-57",
    stepId: 5,
    title: "Implement video embeds with video object schema markup",
    description: "Add video summaries to increase page engagement and video search presence.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-58",
    stepId: 5,
    title: "Conduct content audit to identify decaying pages losing traffic",
    description: "Compare year-over-year clicks in GSC to pinpoint articles needing revision.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-59",
    stepId: 5,
    title: "Repurpose top-performing articles into downloadable guides / PDFs",
    description: "Generate gated lead magnets while capturing search interest.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 6: Off-Page SEO & Link Building (9 tasks: 0 High, 8 Med, 1 Low)
  {
    id: "task-60",
    stepId: 6,
    title: "Analyze competitor backlink profiles to identify link sources",
    description: "Find domains linking to 2 or more competitors using Backlink Checker.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-61",
    stepId: 6,
    title: "Reclaim broken backlinks pointing to 404 pages on your domain",
    description: "Redirect previously acquired external links to current relevant pages.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-62",
    stepId: 6,
    title: "Reach out to industry blogs for guest contribution opportunities",
    description: "Pitch unique case studies or tactical workflows to relevant industry editors.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-63",
    stepId: 6,
    title: "Create linkable assets: free calculators, cheat sheets, templates",
    description: "Build interactive utility tools that industry peers organically link to.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-64",
    stepId: 6,
    title: "Submit company profile to reputable niche directories and citations",
    description: "Ensure consistent NAP (Name, Address, Phone) details across all listings.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-65",
    stepId: 6,
    title: "Monitor unlinked brand mentions and request attribution links",
    description: "Contact publishers who mention your brand without hyperlinking.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-66",
    stepId: 6,
    title: "Connect with industry journalists via HARO and Connectively",
    description: "Provide expert commentary to national publications looking for sources.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-67",
    stepId: 6,
    title: "Disavow spammy or toxic links harming domain trust",
    description: "Generate and submit a clean disavow file for penalized scraper domains.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-68",
    stepId: 6,
    title: "Monitor backlink velocity to avoid unnatural spikes",
    description: "Maintain a steady, organic pace of referring domain acquisition.",
    priority: "Low",
    status: "Left",
    notes: "",
    subtasks: [],
  },

  // Step 7: Analytics & Performance Tracking (6 tasks: 0 High, 6 Med, 0 Low)
  {
    id: "task-69",
    stepId: 7,
    title: "Set up weekly automated ranking reports and alert notifications",
    description: "Receive email notifications when top keywords move by more than 3 spots.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-70",
    stepId: 7,
    title: "Monitor organic traffic trends and goal conversion events in GA4",
    description: "Correlate position improvements with bottom-line lead submissions.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-71",
    stepId: 7,
    title: "Review search query impression spikes and drops in Search Console",
    description: "Detect sudden ranking shifts or algorithmic updates impacting clicks.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-72",
    stepId: 7,
    title: "Track share of voice against primary market competitors",
    description: "Benchmark overall SERP visibility against top 5 rival domains.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-73",
    stepId: 7,
    title: "Review click-through rates (CTR) on keywords ranking in top 5",
    description: "Optimize title tags and descriptions for terms underperforming average CTR.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
  {
    id: "task-74",
    stepId: 7,
    title: "Schedule monthly SEO performance reviews and roadmap adjustments",
    description: "Review progress with stakeholders and prioritize the next sprint's backlog.",
    priority: "Medium",
    status: "Left",
    notes: "",
    subtasks: [],
  },
];

export interface MarketingPlanViewProps {
  projectId?: string;
  projectDomain?: string;
}

export function MarketingPlanView({
  projectId = "proj-123",
  projectDomain = "workcomposer.com",
}: MarketingPlanViewProps) {
  const [tasks, setTasks] = useState<MarketingTask[]>(INITIAL_TASKS);
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TaskPriority>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [isAiSuggestionsActive, setIsAiSuggestionsActive] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  // Calculate high-level stats
  const totalTasks = tasks.length; // 74
  const doneTasks = tasks.filter((t) => t.status === "Done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In progress").length;
  const leftTasks = tasks.filter((t) => t.status === "Left").length;

  const highPriority = tasks.filter((t) => t.priority === "High").length;
  const mediumPriority = tasks.filter((t) => t.priority === "Medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "Low").length;

  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Drawer task reference
  const drawerTask = useMemo(() => {
    return tasks.find((t) => t.id === drawerTaskId) || null;
  }, [tasks, drawerTaskId]);

  // Handle task status toggle via checkbox
  const handleToggleTaskDone = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: TaskStatus = t.status === "Done" ? "Left" : "Done";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Handle status select change
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Handle priority pill change
  const handlePriorityChange = (taskId: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
  };

  // Handle note change
  const handleNoteChange = (taskId: string, noteText: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes: noteText } : t))
    );
  };

  // Toggle subtask in drawer
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isDone: !s.isDone } : s
          );
          return { ...t, subtasks: updatedSubs };
        }
        return t;
      })
    );
  };

  // Add new subtask to task
  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskInput.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSub: MarketingSubtask = {
            id: `sub-${Date.now()}`,
            title: newSubtaskInput.trim(),
            isDone: false,
          };
          return { ...t, subtasks: [...t.subtasks, newSub] };
        }
        return t;
      })
    );
    setNewSubtaskInput("");
  };

  // Filter tasks for current active step
  const currentStepTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.stepId !== activeStepId) return false;
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, activeStepId, priorityFilter, statusFilter, searchQuery]);

  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header / Breadcrumbs Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Marketing Plan
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {projectDomain}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 7-step SEO implementation roadmap with progress tracking
            </p>
          </div>
        </div>

        {/* Search & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-52"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Progress Card Matching Specification */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Radial Gauge Percentage */}
            <div className="md:col-span-3 flex items-center gap-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-5 md:pb-0 md:pr-6">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Fill */}
                  <path
                    className="text-blue-600 dark:text-blue-500 transition-all duration-500"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Plan Progress
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {doneTasks} of {totalTasks} tasks completed
                </p>
                <span className="text-[11px] text-slate-400">
                  {leftTasks} remaining to execute
                </span>
              </div>
            </div>

            {/* Middle: Status Counts (Total: 74, Done: 0, In progress: 0, Left: 74) */}
            <div className="md:col-span-5 grid grid-cols-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-5 md:pb-0 md:pr-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {totalTasks}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Done
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {doneTasks}
                </span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center border border-blue-100 dark:border-blue-900/30">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mb-0.5">
                  In progress
                </span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {inProgressTasks}
                </span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-center border border-amber-100 dark:border-amber-900/30">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">
                  Left
                </span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {leftTasks}
                </span>
              </div>
            </div>

            {/* Right: Priority Breakdown (High: 3, Medium: 69, Low: 2) */}
            <div className="md:col-span-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">
                  Priority Breakdown
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-center cursor-pointer hover:bg-rose-100 transition"
                    onClick={() => setPriorityFilter(priorityFilter === "High" ? "All" : "High")}
                  >
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                      High: {highPriority}
                    </span>
                  </div>
                  <div
                    className="flex-1 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-center cursor-pointer hover:bg-amber-100 transition"
                    onClick={() => setPriorityFilter(priorityFilter === "Medium" ? "All" : "Medium")}
                  >
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                      Medium: {mediumPriority}
                    </span>
                  </div>
                  <div
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:bg-slate-200 transition"
                    onClick={() => setPriorityFilter(priorityFilter === "Low" ? "All" : "Low")}
                  >
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                      Low: {lowPriority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Sticky Left Sidebar for 7 SEO Steps + Main Task Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sticky Left Sidebar (7 SEO implementation steps) */}
          <aside className="lg:col-span-4 sticky top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
            <div className="px-3 py-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Implementation Steps
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete all 7 phases for optimal ranking growth
              </p>
            </div>

            {STEPS.map((step) => {
              const isActive = activeStepId === step.id;
              const stepTasks = tasks.filter((t) => t.stepId === step.id);
              const stepDone = stepTasks.filter((t) => t.status === "Done").length;
              const stepTotal = stepTasks.length;
              const stepPercent = stepTotal > 0 ? Math.round((stepDone / stepTotal) * 100) : 0;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 font-semibold shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate">
                      {step.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                      {stepDone}/{stepTotal} done ({stepPercent}%)
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isActive ? "text-blue-600 dark:text-blue-400 translate-x-0.5" : ""
                    }`}
                  />
                </button>
              );
            })}
          </aside>

          {/* Main Content Area: Step Header, Filter Bar, Task Cards, and Teaser Card */}
          <main className="lg:col-span-8 space-y-4">
            {/* Step Header & Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeStep.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeStep.subtitle} • {currentStepTasks.length} tasks
                </p>
              </div>

              {/* Status and Priority Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Filter */}
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
                  {(["All", "Left", "In progress", "Done"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        statusFilter === st
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Priority Filter Reset if filtered */}
                {priorityFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setPriorityFilter("All")}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    Priority: {priorityFilter}
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Task Cards List */}
            <div className="space-y-3">
              {currentStepTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No tasks match the selected filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("All");
                      setPriorityFilter("All");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                currentStepTasks.map((task) => {
                  const isDone = task.status === "Done";
                  const isInProgress = task.status === "In progress";
                  const isNoteOpen = expandedNotes[task.id];

                  return (
                    <div
                      key={task.id}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition shadow-xs ${
                        isDone
                          ? "border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Interactive Checkbox Toggle */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={`Mark "${task.title}" as ${isDone ? "incomplete" : "done"}`}
                          onClick={() => handleToggleTaskDone(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition cursor-pointer shrink-0 ${
                            isDone
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Title and Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-xs font-bold leading-snug ${
                                isDone
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            {task.description}
                          </p>

                          {/* Action Toolbar: Priority Pill Changer, Status Selector, Subtasks Button, Notes Button */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {/* Priority Pill Changer */}
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                handlePriorityChange(task.id, e.target.value as TaskPriority)
                              }
                              aria-label={`Change priority for ${task.title}`}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-hidden ${
                                task.priority === "High"
                                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                                  : task.priority === "Medium"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <option value="High">High Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="Low">Low Priority</option>
                            </select>

                            {/* Status Changer Pill */}
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task.id, e.target.value as TaskStatus)
                              }
                              aria-label={`Change status for ${task.title}`}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
                            >
                              <option value="Left">Left</option>
                              <option value="In progress">In progress</option>
                              <option value="Done">Done</option>
                            </select>

                            {/* Subtasks Drawer Trigger */}
                            <button
                              type="button"
                              onClick={() => setDrawerTaskId(task.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <span>Subtasks ({task.subtasks.length})</span>
                            </button>

                            {/* Notes Toggle Input Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedNotes((prev) => ({
                                  ...prev,
                                  [task.id]: !prev[task.id],
                                }))
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium cursor-pointer transition ${
                                task.notes
                                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-600 dark:text-blue-400"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>{task.notes ? "Edit Note" : "Add Note"}</span>
                            </button>
                          </div>

                          {/* Expandable Note Input */}
                          {isNoteOpen && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                              <label
                                htmlFor={`note-input-${task.id}`}
                                className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block"
                              >
                                Task Notes:
                              </label>
                              <textarea
                                id={`note-input-${task.id}`}
                                value={task.notes}
                                onChange={(e) => handleNoteChange(task.id, e.target.value)}
                                placeholder="Write internal notes or execution links for this task..."
                                rows={2}
                                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* "Daily Task suggestions" Teaser Card with Unlock link at the bottom of each step */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-5 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">
                      Daily Task suggestions
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/20">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/80 mt-1 max-w-xl leading-relaxed">
                    Automate your daily SEO workflow with intelligent micro-actions generated
                    from position fluctuations, search engine updates, and competitive shifts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUnlockModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition shadow-sm cursor-pointer shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Daily Suggestions</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Subtasks Drawer Component */}
      {drawerTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDrawerTaskId(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 id="drawer-title" className="text-sm font-bold text-slate-900 dark:text-white">
                      Task Subtasks
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerTaskId(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Task Context */}
                <div className="py-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {drawerTask.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {drawerTask.description}
                  </p>
                </div>

                {/* Subtask Checklist */}
                <div className="space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Checklist:
                  </span>
                  {drawerTask.subtasks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                      No subtasks added yet. Add one below!
                    </div>
                  ) : (
                    drawerTask.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                      >
                        <input
                          type="checkbox"
                          checked={sub.isDone}
                          onChange={() => handleToggleSubtask(drawerTask.id, sub.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs flex-1 ${
                            sub.isDone ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {sub.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Subtask Input */}
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubtask(drawerTask.id);
                    }}
                    placeholder="New subtask name..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubtask(drawerTask.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Close Drawer Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDrawerTaskId(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Daily Suggestions Modal */}
      {unlockModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unlock Daily Task Suggestions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Daily Task Suggestions actively analyze your connected Google Search Console,
              competitor crawls, and daily ranking shifts to automatically generate prioritized
              micro-tasks tailored to <strong>{projectDomain}</strong>.
            </p>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <span className="font-bold block">Included in Enterprise Plan:</span>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Automated daily task queue based on SERP movements</li>
                <li>Content decay detection & immediate rewrite prompts</li>
                <li>Competitor new backlink alerts with outreach suggestions</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAiSuggestionsActive(true);
                  setUnlockModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-xs"
              >
                Activate AI Suggestions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
