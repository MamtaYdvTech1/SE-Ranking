import { ProjectAccessLevel, ProjectStatus } from "./types";

export function isProjectActive(status: ProjectStatus): boolean {
  return status === "Active" || status === 1;
}

export function formatProjectStatus(status: ProjectStatus): string {
  return isProjectActive(status) ? "Active" : "Paused";
}

export function formatAccessLevel(level: ProjectAccessLevel): string {
  if (level === "Owner" || level === 1) return "Owner";
  if (level === "Member" || level === 2) return "Member";
  return "ReadOnly";
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(num?: number | null): string {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(num?: number | null, digits: number = 1): string {
  if (num === null || num === undefined) return "0.0%";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}
