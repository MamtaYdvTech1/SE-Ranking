"use client";

import React, { use } from "react";
import { Ga4PerformanceWorkspace } from "@/components/analytics/Ga4PerformanceWorkspace";

export default function ProjectGa4AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Ga4PerformanceWorkspace projectId={resolvedParams.id} />
    </div>
  );
}
