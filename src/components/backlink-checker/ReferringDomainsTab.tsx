"use client";

import React from "react";
import { BacklinkReferringDomainsView } from "./BacklinkReferringDomainsView";

export function ReferringDomainsTab({ projectDomain = "workcomposer.com" }: { projectDomain?: string }) {
  return <BacklinkReferringDomainsView projectDomain={projectDomain} showSubTabs={false} />;
}