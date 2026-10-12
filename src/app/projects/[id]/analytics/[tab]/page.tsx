"use client";

import React, { use } from "react";
import { AnalyticsWorkspace, AnalyticsSubTab } from "@/components/analytics/AnalyticsWorkspace";

export default function ProjectAnalyticsSubTabPage({
  params,
}: {
  params: Promise<{ id: string; tab: string }>;
}) {
  const resolvedParams = use(params);
  const validTabs: AnalyticsSubTab[] = ["overview", "traffic", "snippets", "gsc", "potential"];
  const currentTab = validTabs.includes(resolvedParams.tab as AnalyticsSubTab)
    ? (resolvedParams.tab as AnalyticsSubTab)
    : "overview";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AnalyticsWorkspace projectId={resolvedParams.id} initialTab={currentTab} />
    </div>
  );
}
