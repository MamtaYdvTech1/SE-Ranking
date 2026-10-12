"use client";

import React, { use } from "react";
import {
  BacklinkCheckerWorkspace,
  BacklinkCheckerTabType,
} from "@/components/backlink-checker/BacklinkCheckerWorkspace";

export default function ProjectBacklinkCheckerSubTabPage({
  params,
}: {
  params: Promise<{ id: string; tab: string }>;
}) {
  const resolvedParams = use(params);
  const validTabs: BacklinkCheckerTabType[] = [
    "overview",
    "backlinks",
    "referring-domains",
    "anchor-texts",
    "pages",
    "ips",
  ];

  // Map route aliases if user visits /domains -> /referring-domains etc.
  let tabParam = resolvedParams.tab as BacklinkCheckerTabType;
  if (resolvedParams.tab === "domains") {
    tabParam = "referring-domains";
  }

  const currentTab = validTabs.includes(tabParam) ? tabParam : "overview";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkCheckerWorkspace projectId={resolvedParams.id} initialTab={currentTab} />
    </div>
  );
}
