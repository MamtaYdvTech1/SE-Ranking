"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface RankingsSubnavProps {
  projectId: string;
}

export function RankingsSubnav({ projectId }: RankingsSubnavProps) {
  const pathname = usePathname() || "";

  const isDetailed = pathname.includes("/rankings/detailed");
  const isHistorical = pathname.includes("/rankings/historical");
  const isSummary = !isDetailed && !isHistorical;

  const baseHref = `/projects/${projectId}/rankings`;

  const tabs = [
    {
      id: "summary",
      name: "Summary",
      href: baseHref,
      isActive: isSummary,
      icon: (
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "detailed",
      name: "Detailed",
      href: `${baseHref}/detailed`,
      isActive: isDetailed,
      icon: (
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "historical",
      name: "Historical Data",
      href: `${baseHref}/historical`,
      isActive: isHistorical,
      icon: (
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 bg-white dark:bg-slate-900 px-4 pt-2 rounded-t-lg shadow-xs">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`flex items-center py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab.isActive
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
          }`}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </Link>
      ))}
    </div>
  );
}
