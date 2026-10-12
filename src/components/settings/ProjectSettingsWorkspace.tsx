"use client";

import React from "react";
import { ProjectSettingsWizard, ProjectSettingsWizardProps } from "./ProjectSettingsWizard";

export { ProjectSettingsWizard };
export type {
  SettingsTabId,
  ProjectSearchEngineItem,
  PromptItem,
  ProjectSettingsWizardProps,
} from "./ProjectSettingsWizard";

export type ProjectSettingsWorkspaceProps = ProjectSettingsWizardProps;

export function ProjectSettingsWorkspace(props: ProjectSettingsWorkspaceProps) {
  return <ProjectSettingsWizard {...props} />;
}

export default ProjectSettingsWorkspace;
