"use client";

import React from "react";
import { BacklinkReferringDomainsView } from "./BacklinkReferringDomainsView";

export function ReferringDomainsTab({ projectId, projectDomain = "" }: { projectId?: string; projectDomain?: string }) {
  return <BacklinkReferringDomainsView projectId={projectId} projectDomain={projectDomain} showSubTabs={false} />;
}
