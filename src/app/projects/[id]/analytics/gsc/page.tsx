"use client";

import React, { use } from "react";
import { GscPerformanceWorkspace } from "@/components/analytics/GscPerformanceWorkspace";

export default function ProjectGscAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <GscPerformanceWorkspace projectId={resolvedParams.id} />
    </div>
  );
}
