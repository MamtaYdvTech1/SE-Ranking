"use client";

import React, { use } from "react";
import { ProjectInsightsView } from "@/components/insights";

export default function ProjectInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <ProjectInsightsView projectId={resolvedParams.id} />;
}
