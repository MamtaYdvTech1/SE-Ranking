"use client";

import React, { use } from "react";
import { AnalyticsWorkspace } from "@/components/analytics/AnalyticsWorkspace";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AnalyticsWorkspace projectId={resolvedParams.id} initialTab="overview" />
    </div>
  );
}
