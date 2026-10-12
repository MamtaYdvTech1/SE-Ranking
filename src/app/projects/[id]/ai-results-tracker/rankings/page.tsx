"use client";

import React, { use } from "react";
import { RankingsHeader } from "@/components/ai-tracker/RankingsHeader";
import { AiRankingsView } from "@/components/ai-tracker/AiRankingsView";

export default function ProjectAiRankingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <RankingsHeader
        projectId={resolvedParams.id}
        title="AI Overview Rankings"
        description="Monitor keyword visibility and presence across AI Overviews and LLMs"
        activeSubTab="Detailed"
      />
      <AiRankingsView projectId={resolvedParams.id} />
    </div>
  );
}
