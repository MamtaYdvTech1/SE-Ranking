"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProjectDetailDto } from "@/lib/types";
import { BacklinkCheckerOverview } from "./BacklinkCheckerOverview";
import { BacklinksTableTab } from "./BacklinksTableTab";
import { ReferringDomainsTab } from "./ReferringDomainsTab";
import { AnchorTextsTab } from "./AnchorTextsTab";
import { PagesTab } from "./PagesTab";
import { IpsTab } from "./IpsTab";

export type BacklinkCheckerTabType =
  | "overview"
  | "backlinks"
  | "referring-domains"
  | "anchor-texts"
  | "pages"
  | "ips";

interface BacklinkCheckerWorkspaceProps {
  projectId: string;
  initialTab?: BacklinkCheckerTabType;
}

const TABS: { id: BacklinkCheckerTabType; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "backlinks", label: "Backlinks" },
  { id: "referring-domains", label: "Referring Domains" },
  { id: "anchor-texts", label: "Anchor Texts" },
  { id: "pages", label: "Pages" },
  { id: "ips", label: "IPs" },
];

export function BacklinkCheckerWorkspace({
  projectId,
  initialTab = "overview",
}: BacklinkCheckerWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BacklinkCheckerTabType>(initialTab);
  const [project, setProject] = useState<ProjectDetailDto | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.projects.get(projectId);
        if (res.data) {
          setProject(res.data);
        }
      } catch {
        // Handled silently
      }
    }
    load();
  }, [projectId]);

  const domain = project?.primaryDomain || "workcomposer.com";

  const handleTabChange = (tabId: BacklinkCheckerTabType) => {
    setActiveTab(tabId);
    router.push(`/projects/${projectId}/backlink-checker/${tabId}`, { scroll: false });
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sub-navigation tabs for tabs without integrated subtab headers */}
      {["overview", "backlinks", "referring-domains"].includes(activeTab) && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8">
          <nav
            className="flex space-x-8 -mb-px overflow-x-auto scrollbar-none"
            aria-label="Backlink Checker Tabs"
            role="tablist"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "border-slate-900 text-slate-900 dark:border-white dark:text-white font-semibold"
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

      {/* Main Workspace Body - full width with clean padding matching SE Ranking */}
      <div className="flex-1 px-6 sm:px-8 py-4 w-full">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "overview" && (
            <BacklinkCheckerOverview
              projectDomain={domain}
              onNavigateTab={(tab) => handleTabChange(tab as BacklinkCheckerTabType)}
            />
          )}

          {activeTab === "backlinks" && <BacklinksTableTab projectDomain={domain} />}

          {activeTab === "referring-domains" && <ReferringDomainsTab projectDomain={domain} />}

          {activeTab === "anchor-texts" && (
            <AnchorTextsTab
              projectDomain={domain}
              showSubTabs={true}
              onNavigateTab={(tab) => handleTabChange(tab as BacklinkCheckerTabType)}
            />
          )}

          {activeTab === "pages" && (
            <PagesTab
              projectDomain={domain}
              showSubTabs={true}
              onNavigateTab={(tab) => handleTabChange(tab as BacklinkCheckerTabType)}
            />
          )}

          {activeTab === "ips" && (
            <IpsTab
              projectDomain={domain}
              showSubTabs={true}
              onNavigateTab={(tab) => handleTabChange(tab as BacklinkCheckerTabType)}
            />
          )}
        </div>
      </div>
    </div>
  );
}