"use client";

import React, { use } from "react";
import { BacklinkCheckerWorkspace } from "@/components/backlink-checker/BacklinkCheckerWorkspace";

export default function ProjectBacklinkCheckerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkCheckerWorkspace projectId={resolvedParams.id} initialTab="overview" />
    </div>
  );
}
