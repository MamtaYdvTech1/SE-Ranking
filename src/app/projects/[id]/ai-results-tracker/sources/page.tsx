"use client";

import React, { use } from "react";
import { AiSourcesView } from "@/components/ai-tracker/AiSourcesView";

export default function ProjectAiSourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AiSourcesView projectId={resolvedParams.id} />
    </div>
  );
}
