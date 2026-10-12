"use client";

import React, { use } from "react";
import { BacklinkReferringDomainsView } from "@/components/backlink-checker/BacklinkReferringDomainsView";

export default function ProjectBacklinkDomainsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkReferringDomainsView projectId={resolvedParams.id} />
    </div>
  );
}
