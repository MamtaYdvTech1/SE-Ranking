"use client";

import React from "react";
import {
  RankingsHeader as BaseRankingsHeader,
  RankingsHeaderProps as BaseRankingsHeaderProps,
} from "../rankings/RankingsHeader";
import { ProjectDetailDto } from "@/lib/types";

export interface RankingsHeaderProps extends Omit<BaseRankingsHeaderProps, "project"> {
  project?: ProjectDetailDto;
  projectId?: string;
}

export function RankingsHeader(props: RankingsHeaderProps) {
  const defaultProject: ProjectDetailDto = {
    id: props.projectId || "proj-default",
    name: "WorkComposer Main",
    primaryDomain: "workcomposer.com",
    protocol: "https",
    countryCode: "US",
    languageCode: "en",
    timezone: "UTC",
    defaultSearchEngine: "Google",
    defaultDevice: "Desktop",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 3,
  };

  const project = props.project || defaultProject;

  return (
    <BaseRankingsHeader
      {...props}
      project={project}
      activeSubTab={props.activeSubTab || "Detailed"}
    />
  );
}

export * from "../rankings/RankingsHeader";
