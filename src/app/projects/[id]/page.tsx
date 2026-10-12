"use client";

import React, { use } from "react";
import { ProjectDashboardWorkspace } from "@/components/dashboard/ProjectDashboardWorkspace";

export default function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ProjectDashboardWorkspace projectId={resolvedParams.id} />
    </div>
  );
}
