"use client";

import React, { use } from "react";
import { AiCompetitorsView } from "@/components/ai-tracker/AiCompetitorsView";

export default function ProjectAiCompetitorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AiCompetitorsView projectId={resolvedParams.id} />
    </div>
  );
}
