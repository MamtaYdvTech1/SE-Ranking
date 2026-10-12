"use client";

import React, { use, useEffect, useState } from "react";
import { AuditWorkspace } from "@/components/audit/AuditWorkspace";
import { ProjectDetailDto } from "@/lib/types";
import { api } from "@/lib/api";

export default function ProjectAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<ProjectDetailDto | null>(null);

  useEffect(() => {
    let ignore = false;
    api.projects.get(resolvedParams.id).then((res) => {
      if (!ignore && res.data) {
        setProject(res.data);
      }
    });
    return () => {
      ignore = true;
    };
  }, [resolvedParams.id]);

  if (!project) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuditWorkspace project={project} />
    </div>
  );
}
