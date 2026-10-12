"use client";

import React, { use } from "react";
import { AuditOverviewView } from "@/components/audit/AuditOverviewView";

export default function ProjectAuditOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuditOverviewView projectId={resolvedParams.id} />
    </div>
  );
}
