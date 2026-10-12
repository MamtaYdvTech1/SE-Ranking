"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BacklinkCheckerOverview } from "./BacklinkCheckerOverview";
import { api } from "@/lib/api";
import { ProjectDetailDto } from "@/lib/types";

export interface BacklinkCheckerOverviewViewProps {
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

export function BacklinkCheckerOverviewView({
  projectId = "proj-123",
  projectDomain,
  onNavigateTab,
  showSubTabs = true,
}: BacklinkCheckerOverviewViewProps) {
  const router = useRouter();
  const [domain, setDomain] = useState<string>(projectDomain || "workcomposer.com");

  useEffect(() => {
    if (projectDomain) {
      setDomain(projectDomain);
      return;
    }
    if (projectId) {
      let isMounted = true;
      api.projects.get(projectId).then((res) => {
        if (isMounted && res?.data?.primaryDomain) {
          setDomain(res.data.primaryDomain);
        }
      }).catch(() => {
        // Fallback default domain kept
      });
      return () => {
        isMounted = false;
      };
    }
  }, [projectId, projectDomain]);

  const handleTabChange = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      return;
    }
    const target = SUB_TABS.find((t) => t.id === tabId || t.path === tabId);
    const subPath = target ? target.path : tabId;
    router.push(`/projects/${projectId}/backlink-checker/${subPath}`);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sub-tabs bar matching Backlink Referring Domains & SE Ranking specification */}
      {showSubTabs && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8">
          <nav
            className="flex space-x-8 -mb-px overflow-x-auto scrollbar-none"
            aria-label="Backlink Checker Sub-tabs"
            role="tablist"
          >
            {SUB_TABS.map((tab) => {
              const isActive = tab.id === "overview";
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.path)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Backlink Checker Overview Workspace */}
      <div className="flex-1 px-6 sm:px-8 py-5 w-full">
        <BacklinkCheckerOverview
          projectDomain={domain}
          onNavigateTab={handleTabChange}
        />
      </div>
    </div>
  );
}
