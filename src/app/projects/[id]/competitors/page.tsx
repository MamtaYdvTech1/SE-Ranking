"use client";

import React, { use } from "react";
import { CompetitorWorkspace } from "@/components/competitors/CompetitorWorkspace";

export default function ProjectCompetitorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CompetitorWorkspace projectId={projectId} />
    </div>
  );
}
