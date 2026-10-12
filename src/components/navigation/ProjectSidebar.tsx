"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, TrendingUp, Link2, ShieldCheck } from "lucide-react";
import { ProjectDetailDto } from "../../lib/types";

interface ProjectSidebarProps {
  project: ProjectDetailDto | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavSectionItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isImplemented: boolean;
  phaseLabel?: string;
}

export function ProjectSidebar({ project, isCollapsed, onToggleCollapse }: ProjectSidebarProps) {
  const pathname = usePathname();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);
  const [isRankingsExpanded, setIsRankingsExpanded] = useState(() =>
    pathname.includes("/rankings") || pathname.includes("/projects/")
  );
  const [isCompetitorsExpanded, setIsCompetitorsExpanded] = useState(() =>
    pathname.includes("/competitors")
  );
  const [isAiTrackerExpanded, setIsAiTrackerExpanded] = useState(() =>
    pathname.includes("/ai-results-tracker")
  );
  const [isAuditExpanded, setIsAuditExpanded] = useState(() =>
    pathname.includes("/audit")
  );
  const [isBacklinkMonitorExpanded, setIsBacklinkMonitorExpanded] = useState(() =>
    pathname.includes("/backlink")
  );

  const projectId = project?.id || "";
  const baseHref = `/projects/${projectId}`;

  const navItems: NavSectionItem[] = [
    {
      name: "All Projects",
      href: "/projects",
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Project Overview",
      href: baseHref,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Rankings",
      href: `${baseHref}/rankings`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: "Keywords",
      href: `${baseHref}/keywords`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      name: "Search Console",
      href: `${baseHref}/integrations/gsc`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Analytics & Traffic",
      href: `${baseHref}/analytics`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      name: "My Competitors",
      href: `${baseHref}/competitors`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "AI Results Tracker",
      href: `${baseHref}/ai-results-tracker/rankings`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      name: "Insights",
      href: `${baseHref}/insights`,
      isImplemented: true,
      icon: (
        <TrendingUp className="w-4 h-4" />
      ),
    },
    {
      name: "Backlink Checker",
      href: `${baseHref}/backlink-checker/overview`,
      isImplemented: true,
      icon: (
        <Link2 className="w-4 h-4" />
      ),
    },
    {
      name: "Marketing Plan",
      href: `${baseHref}/marketing-plan`,
      isImplemented: true,
      icon: (
        <CheckSquare className="w-4 h-4" />
      ),
    },
    {
      name: "Website Audit",
      href: `${baseHref}/audit/overview`,
      isImplemented: true,
      icon: (
        <ShieldCheck className="w-4 h-4" />
      ),
    },
    {
      name: "Page Changes Monitor",
      href: `${baseHref}/audit/overview`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: "Backlink Monitor",
      href: `${baseHref}/backlink-checker/overview`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      name: "Project Settings",
      href: `${baseHref}/settings`,
      isImplemented: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  if (isCollapsed) {
    return (
      <div className="w-3 bg-slate-800 border-r border-slate-700 relative flex flex-col justify-start pt-3">
        <button
          onClick={onToggleCollapse}
          title="Expand Project Sidebar"
          className="absolute -right-3 top-3 bg-slate-700 hover:bg-slate-600 text-slate-200 w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs shadow-md z-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          →
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Project Sidebar"
      className="w-60 flex-shrink-0 bg-slate-800 border-r border-slate-700/80 flex flex-col text-slate-300 select-none z-20 transition-all duration-200 ease-in-out"
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-700/80 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Projects
        </span>
        <button
          onClick={onToggleCollapse}
          title="Collapse Project Sidebar"
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Project Selector Dropdown */}
      <div className="p-3 border-b border-slate-700/60 relative">
        <button
          type="button"
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 transition text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            <span className="text-xs font-semibold text-slate-100 truncate">
              {project?.primaryDomain || "Select Project"}
            </span>
          </div>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isProjectDropdownOpen && (
          <div className="absolute top-14 left-3 right-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-1.5 space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase px-2 py-1">
              Current Project
            </div>
            <div className="px-2 py-1.5 text-xs text-white bg-slate-800 rounded font-medium truncate">
              {project?.name} ({project?.primaryDomain})
            </div>
            <Link
              href="/projects"
              onClick={() => setIsProjectDropdownOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-blue-400 hover:bg-slate-800 rounded transition font-medium"
            >
              <span>Switch / All Projects →</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.name === "All Projects"
              ? pathname === "/projects"
              : item.name === "Project Overview"
              ? pathname === baseHref
              : item.name === "Rankings"
              ? pathname.startsWith(`${baseHref}/rankings`)
              : item.name === "Keywords"
              ? pathname.startsWith(`${baseHref}/keywords`)
              : item.name === "Search Console"
              ? pathname.startsWith(`${baseHref}/integrations/gsc`)
              : item.name === "Analytics & Traffic"
              ? pathname.startsWith(`${baseHref}/integrations/ga4`) || pathname.startsWith(`${baseHref}/analytics`)
              : item.name === "My Competitors"
              ? pathname.startsWith(`${baseHref}/competitors`)
              : item.name === "AI Results Tracker"
              ? pathname.startsWith(`${baseHref}/ai-results-tracker`)
              : item.name === "Insights"
              ? pathname.startsWith(`${baseHref}/insights`)
              : item.name === "Backlink Checker"
              ? pathname.startsWith(`${baseHref}/backlink-checker`) || pathname.startsWith(`${baseHref}/backlinks`)
              : item.name === "Marketing Plan"
              ? pathname.startsWith(`${baseHref}/marketing-plan`)
              : item.name === "Website Audit"
              ? pathname.startsWith(`${baseHref}/audit`)
              : item.name === "SEO Tasks"
              ? pathname.startsWith(`${baseHref}/tasks`)
              : item.name === "Project Settings"
              ? pathname.startsWith(`${baseHref}/settings`)
              : false;

          if (!item.isImplemented) {
            return (
              <div
                key={item.name}
                className="group flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-slate-500 hover:bg-slate-800/50 cursor-not-allowed transition"
                title={`${item.name} (${item.phaseLabel})`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="opacity-50 flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                {item.phaseLabel && (
                  <span className="text-[9px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded font-normal flex-shrink-0">
                    {item.phaseLabel}
                  </span>
                )}
              </div>
            );
          }

          const isRankings = item.name === "Rankings";
          if (isRankings) {
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle Rankings menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRankingsExpanded(!isRankingsExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer text-slate-400 hover:text-white"
                  >
                    <span>{isRankingsExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>

                {isRankingsExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                    {[
                      { name: "Summary", href: `${baseHref}/rankings` },
                      { name: "Detailed", href: `${baseHref}/rankings/detailed` },
                      { name: "Historical data", href: `${baseHref}/rankings/historical` },
                    ].map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition ${
                            isSubActive
                              ? "text-blue-400 font-semibold bg-slate-900/80 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          }`}
                        >
                          <span className={isSubActive ? "text-blue-400 font-bold" : "text-slate-500"}>
                            •
                          </span>
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isAnalytics = item.name === "Analytics & Traffic";
          const isCompetitors = item.name === "My Competitors";

          if (isCompetitors) {
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle My Competitors menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCompetitorsExpanded(!isCompetitorsExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer"
                  >
                    <span>{isCompetitorsExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>

                {/* My Competitors 4 Sub-tabs */}
                {isCompetitorsExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                    {[
                      {
                        name: "Added Competitors",
                        href: `${baseHref}/competitors/added`,
                        isActive:
                          pathname === `${baseHref}/competitors` ||
                          pathname === `${baseHref}/competitors/added`,
                      },
                      {
                        name: "SERP Competitors",
                        href: `${baseHref}/competitors/serp`,
                        isActive:
                          pathname === `${baseHref}/competitors/serp` ||
                          pathname === `${baseHref}/competitors/overview`,
                      },
                      {
                        name: "Share of Voice",
                        href: `${baseHref}/competitors/share-of-voice`,
                        isActive:
                          pathname === `${baseHref}/competitors/share-of-voice` ||
                          pathname === `${baseHref}/competitors/keywords`,
                      },
                      {
                        name: "Visibility Rating",
                        href: `${baseHref}/competitors/visibility`,
                        isActive:
                          pathname === `${baseHref}/competitors/visibility` ||
                          pathname === `${baseHref}/competitors/visibility-rating` ||
                          pathname === `${baseHref}/competitors/gap`,
                      },
                    ].map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition ${
                          sub.isActive
                            ? "text-blue-400 font-semibold bg-slate-900/80 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        <span className={sub.isActive ? "text-blue-400 font-bold" : "text-slate-500"}>
                          •
                        </span>
                        <span className="truncate">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isAiTracker = item.name === "AI Results Tracker";
          if (isAiTracker) {
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className={`truncate text-xs font-semibold ${isActive ? "text-white" : "text-slate-300 dark:text-slate-200"}`}>
                      {item.name}
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle AI Results Tracker menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAiTrackerExpanded(!isAiTrackerExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer"
                  >
                    <span>{isAiTrackerExpanded ? "▲" : "▾"}</span>
                  </button>
                </div>

                {/* Sub-item Links Under AI Results Tracker */}
                {isAiTrackerExpanded && (
                  <div className="ml-4 pl-3 border-l border-slate-800/80 space-y-1 mt-1">
                    {[
                      {
                        name: "Rankings",
                        href: `${baseHref}/ai-results-tracker/rankings`,
                      },
                      {
                        name: "Competitors",
                        href: `${baseHref}/ai-results-tracker/competitors`,
                      },
                      {
                        name: "Sources",
                        href: `${baseHref}/ai-results-tracker/sources`,
                      },
                    ].map((sub) => {
                      const isSubActive =
                        pathname === sub.href ||
                        pathname?.startsWith(`${sub.href}/`) ||
                        (sub.name === "Rankings" && pathname === `${baseHref}/ai-results-tracker`);

                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium select-none transition-colors duration-150 ${
                            isSubActive
                              ? "bg-[#0c192c] text-white font-semibold shadow-inner"
                              : "text-slate-400 hover:bg-[#0c192c]/60 hover:text-slate-100"
                          }`}
                        >
                          {/* Bullet Dot */}
                          <span
                            className={`text-sm leading-none transition-colors duration-150 ${
                              isSubActive
                                ? "text-blue-500"
                                : "text-slate-600 group-hover:text-slate-400"
                            }`}
                          >
                            •
                          </span>

                          {/* Item Label */}
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isAnalytics) {
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle Analytics & Traffic menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAnalyticsExpanded(!isAnalyticsExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer"
                  >
                    <span>{isAnalyticsExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>

                {/* Analytics & Traffic 5 Sub-tabs */}
                {isAnalyticsExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                    {[
                      {
                        name: "Overview",
                        href: `${baseHref}/analytics`,
                        isActive:
                          pathname === `${baseHref}/analytics` ||
                          pathname === `${baseHref}/analytics/overview`,
                      },
                      {
                        name: "Traffic",
                        href: `${baseHref}/analytics/traffic`,
                        isActive:
                          pathname === `${baseHref}/analytics/traffic` ||
                          pathname.startsWith(`${baseHref}/integrations/ga4`),
                      },
                      {
                        name: "Snippets",
                        href: `${baseHref}/analytics/snippets`,
                        isActive: pathname === `${baseHref}/analytics/snippets`,
                      },
                      {
                        name: "Google Search Console Data",
                        href: `${baseHref}/analytics/gsc`,
                        isActive: pathname === `${baseHref}/analytics/gsc`,
                      },
                      {
                        name: "SEO potential",
                        href: `${baseHref}/analytics/potential`,
                        isActive: pathname === `${baseHref}/analytics/potential`,
                      },
                    ].map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition ${
                          sub.isActive
                            ? "text-blue-400 font-semibold bg-slate-900/80 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        <span className={sub.isActive ? "text-blue-400 font-bold" : "text-slate-500"}>
                          •
                        </span>
                        <span className="truncate">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isInsights = item.name === "Insights";
          if (isInsights) {
            return (
              <div key={item.name} className="space-y-0.5">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition ${
                    isActive
                      ? "bg-[#0c192c] text-white font-semibold shadow-inner border border-slate-800/80"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium"
                  }`}
                >
                  <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              </div>
            );
          }

          const isMarketingPlan = item.name === "Marketing Plan";
          if (isMarketingPlan) {
            return (
              <div key={item.name} className="space-y-0.5">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition ${
                    isActive
                      ? "bg-[#0c192c] text-white font-bold shadow-inner border border-slate-800/80"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium"
                  }`}
                >
                  <span className={isActive ? "text-blue-400" : "text-slate-400"}>
                    <CheckSquare className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              </div>
            );
          }

          const isAudit = item.name === "Website Audit";
          if (isAudit) {
            const isAuditActive = pathname.startsWith(`${baseHref}/audit`);
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isAuditActive
                      ? "bg-[#0c192c] text-white font-semibold shadow-inner border border-slate-800/80"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isAuditActive ? "text-blue-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle Website Audit menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAuditExpanded(!isAuditExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer text-slate-400 hover:text-white"
                  >
                    <span>{isAuditExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>

                {/* Website Audit 6 Sub-tabs matching reference screenshot */}
                {isAuditExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                    {[
                      {
                        name: "Overview",
                        href: `${baseHref}/audit/overview`,
                        isActive:
                          pathname === `${baseHref}/audit` ||
                          pathname === `${baseHref}/audit/overview`,
                      },
                      {
                        name: "Issue Report",
                        href: `${baseHref}/audit/issues`,
                        isActive: pathname.startsWith(`${baseHref}/audit/issues`),
                      },
                      {
                        name: "Crawled Pages",
                        href: `${baseHref}/audit/pages`,
                        isActive: pathname.startsWith(`${baseHref}/audit/pages`),
                      },
                      {
                        name: "Found Resources",
                        href: `${baseHref}/audit/resources`,
                        isActive: pathname.startsWith(`${baseHref}/audit/resources`),
                      },
                      {
                        name: "Found Links",
                        href: `${baseHref}/audit/links`,
                        isActive: pathname.startsWith(`${baseHref}/audit/links`),
                      },
                      {
                        name: "Crawl Comparison",
                        href: `${baseHref}/audit/compare`,
                        isActive: pathname.startsWith(`${baseHref}/audit/compare`),
                      },
                    ].map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition duration-150 ${
                          sub.isActive
                            ? "bg-slate-700/60 text-white font-medium shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        <span className={`text-[10px] leading-none ${sub.isActive ? "text-white font-bold" : "text-slate-500"}`}>
                          •
                        </span>
                        <span className="truncate">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isBacklinkMonitor = item.name === "Backlink Monitor";
          if (isBacklinkMonitor) {
            return (
              <div key={item.name} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex-1 flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium truncate"
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Toggle Backlink Monitor menu"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsBacklinkMonitorExpanded(!isBacklinkMonitorExpanded);
                    }}
                    className="px-2.5 py-2 text-xs opacity-75 hover:opacity-100 transition cursor-pointer text-slate-400 hover:text-white"
                  >
                    <span>{isBacklinkMonitorExpanded ? "▴" : "▾"}</span>
                  </button>
                </div>

                {isBacklinkMonitorExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                    {[
                      { name: "Backlinks", href: `${baseHref}/backlink-checker/overview` },
                      { name: "Domains", href: `${baseHref}/backlink-checker/domains` },
                      { name: "Anchor Texts", href: `${baseHref}/backlink-checker/overview` },
                      { name: "Pages", href: `${baseHref}/backlink-checker/overview` },
                      { name: "IPs/Subnets", href: `${baseHref}/backlink-checker/overview` },
                      { name: "Disavow", href: `${baseHref}/backlink-checker/overview` },
                    ].map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition duration-150 ${
                            isSubActive
                              ? "bg-slate-700/60 text-white font-medium shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          }`}
                        >
                          <span className={`text-[10px] leading-none ${isSubActive ? "text-white font-bold" : "text-slate-500"}`}>
                            •
                          </span>
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.name} className="space-y-0.5">
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/70"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
