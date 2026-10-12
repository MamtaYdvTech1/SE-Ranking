"use client";

import React, { use } from "react";
import { MarketingPlanView } from "@/components/marketing-plan/MarketingPlanView";

export default function ProjectMarketingPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <MarketingPlanView projectId={resolvedParams.id} />
    </div>
  );
}
