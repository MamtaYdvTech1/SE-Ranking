"use client";

import React, { use } from "react";
import { BacklinkCheckerOverviewView } from "@/components/backlink-checker/BacklinkCheckerOverviewView";

export default function ProjectBacklinkCheckerOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkCheckerOverviewView projectId={resolvedParams.id} />
    </div>
  );
}
