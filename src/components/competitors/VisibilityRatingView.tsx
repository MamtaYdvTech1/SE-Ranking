"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { CompetitorDto } from "@/lib/types";
import { CalendarYearDropdown } from "./CalendarYearDropdown";

export const CAL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const CAL_FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function formatComparisonDate(d: Date): string {
  return `${d.getDate()} ${CAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export type VisibilityColumnKey =
  | "visibility"
  | "percentInTop10"
  | "trafficForecast"
  | "keywords"
  | "dt"
  | "backlinks"
  | "referringDomains";

export const DEFAULT_VISIBLE_COLUMNS: Record<VisibilityColumnKey, boolean> = {
  visibility: true,
  percentInTop10: false,
  trafficForecast: true,
  keywords: true,
  dt: false,
  backlinks: true,
  referringDomains: true,
};

export const VISIBILITY_COLUMN_DEFINITIONS: Array<{
  key: VisibilityColumnKey;
  label: string;
  description: string;
}> = [
  { key: "visibility", label: "Visibility", description: "Search visibility index based on top 10 rankings" },
  { key: "percentInTop10", label: "% in Top 10", description: "Percentage of tracked queries ranking in top 10" },
  { key: "trafficForecast", label: "Traffic Forecast", description: "Estimated monthly organic visits from ranking keywords" },
  { key: "keywords", label: "Keywords", description: "Total count of ranking keywords found in the index" },
  { key: "dt", label: "DT", description: "Domain Trust metric indicating domain authority" },
  { key: "backlinks", label: "Backlinks", description: "Total count of external backlink citations" },
  { key: "referringDomains", label: "Referring Domains", description: "Number of unique root domains linking to this site" },
];

export interface VisibilityDomainItem {
  id: string;
  domain: string;
  color: string;
  tags: string[];
  group?: string;
  visibility: number;
  percentInTop10?: number;
  trafficForecast: number;
  keywords?: number;
  keywordsInTop10: number;
  dt?: number;
  backlinks?: number;
  referringDomains?: number;
  history: {
    week: number[];
    twoWeeks: number[];
    month: number[];
  };
}

export function getDomainMetrics(domain: VisibilityDomainItem) {
  const percentInTop10 =
    domain.percentInTop10 ??
    (domain.keywordsInTop10 === 0
      ? 0
      : Math.min(100, Math.round((domain.keywordsInTop10 / (domain.keywords || Math.max(domain.keywordsInTop10 + 4, 15))) * 100)));
  const keywords = domain.keywords ?? (domain.keywordsInTop10 === 0 ? 12 : Math.round(domain.keywordsInTop10 * 1.35 + 3));
  const dt = domain.dt ?? (domain.visibility === 0 ? 45 : Math.min(99, Math.max(16, Math.round(domain.visibility * 1.3 + 22))));
  const backlinks = domain.backlinks ?? (domain.trafficForecast === 0 ? 1520 : Math.round(domain.trafficForecast * 75 + 380));
  const referringDomains = domain.referringDomains ?? (domain.trafficForecast === 0 ? 88 : Math.round(domain.trafficForecast * 2.6 + 42));

  return {
    percentInTop10,
    keywords,
    dt,
    backlinks,
    referringDomains,
  };
}

export const ALL_DOMAIN_TAGS = [
  "blog",
  "brand",
  "competitor",
  "core",
  "features",
  "high-intent",
  "hosting",
  "media",
  "reference",
  "repository",
  "saas",
  "software",
  "target",
  "tracking",
  "tutorial",
];

export const ALL_GROUPS = [
  "All groups",
  "General",
  "Competitors",
  "Core",
  "Tracking",
];

export function createSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const COMPOSER_VISIBILITY_DOMAINS: VisibilityDomainItem[] = [
  {
    id: "v-comp-1",
    domain: "getcomposer.org",
    color: "#854d0e",
    tags: ["core", "competitor"],
    group: "Competitors",
    visibility: 53.96,
    trafficForecast: 4850,
    keywordsInTop10: 24,
    history: {
      week: [51.2, 52.4, 53.1, 53.96, 54.2, 54.5, 54.8],
      twoWeeks: [48.0, 48.5, 49.0, 49.8, 50.2, 50.8, 51.2, 52.4, 53.1, 53.5, 53.96, 54.2, 54.5, 54.8],
      month: [42.0, 43.5, 45.0, 46.5, 48.0, 50.0, 51.2, 52.4, 53.1, 53.96, 54.5, 54.8],
    },
  },
  {
    id: "v-comp-2",
    domain: "sourceforge.net",
    color: "#2563eb",
    tags: ["software", "repository"],
    group: "Competitors",
    visibility: 42.92,
    trafficForecast: 3920,
    keywordsInTop10: 19,
    history: {
      week: [40.5, 41.2, 42.0, 42.92, 43.1, 43.5, 43.8],
      twoWeeks: [38.0, 38.5, 39.0, 39.5, 40.0, 40.2, 40.5, 41.2, 42.0, 42.5, 42.92, 43.1, 43.5, 43.8],
      month: [34.0, 35.0, 36.5, 38.0, 39.0, 40.0, 40.5, 41.2, 42.0, 42.92, 43.5, 43.8],
    },
  },
  {
    id: "v-comp-3",
    domain: "github.com",
    color: "#16a34a",
    tags: ["repository", "core"],
    group: "Core",
    visibility: 29.16,
    trafficForecast: 2650,
    keywordsInTop10: 14,
    history: {
      week: [27.5, 28.0, 28.6, 29.16, 29.4, 29.8, 30.1],
      twoWeeks: [25.0, 25.5, 26.0, 26.5, 27.0, 27.2, 27.5, 28.0, 28.6, 28.9, 29.16, 29.4, 29.8, 30.1],
      month: [22.0, 23.0, 24.5, 25.5, 26.5, 27.0, 27.5, 28.0, 28.6, 29.16, 29.8, 30.1],
    },
  },
  {
    id: "v-comp-4",
    domain: "worktrack.co.in",
    color: "#9333ea",
    tags: ["tracking", "competitor"],
    group: "Tracking",
    visibility: 24.55,
    trafficForecast: 2180,
    keywordsInTop10: 11,
    history: {
      week: [23.0, 23.5, 24.0, 24.55, 24.8, 25.1, 25.3],
      twoWeeks: [21.0, 21.5, 22.0, 22.2, 22.5, 22.8, 23.0, 23.5, 24.0, 24.2, 24.55, 24.8, 25.1, 25.3],
      month: [18.0, 19.0, 20.0, 21.0, 22.0, 22.5, 23.0, 23.5, 24.0, 24.55, 25.0, 25.3],
    },
  },
  {
    id: "v-comp-5",
    domain: "www.workcomposer.com",
    color: "#eab308",
    tags: ["target", "brand"],
    group: "General",
    visibility: 21.05,
    trafficForecast: 1840,
    keywordsInTop10: 10,
    history: {
      week: [19.5, 20.1, 20.5, 21.05, 21.3, 21.6, 22.0],
      twoWeeks: [17.5, 18.0, 18.5, 18.8, 19.0, 19.2, 19.5, 20.1, 20.5, 20.8, 21.05, 21.3, 21.6, 22.0],
      month: [15.0, 16.0, 17.0, 17.8, 18.5, 19.0, 19.5, 20.1, 20.5, 21.05, 21.6, 22.0],
    },
  },
  {
    id: "v-comp-6",
    domain: "www.youtube.com",
    color: "#c2410c",
    tags: ["media", "tutorial"],
    group: "General",
    visibility: 20.82,
    trafficForecast: 1790,
    keywordsInTop10: 9,
    history: {
      week: [19.0, 19.8, 20.2, 20.82, 21.0, 21.2, 21.4],
      twoWeeks: [17.0, 17.5, 18.0, 18.3, 18.7, 18.9, 19.0, 19.8, 20.2, 20.5, 20.82, 21.0, 21.2, 21.4],
      month: [14.0, 15.2, 16.5, 17.2, 18.0, 18.6, 19.0, 19.8, 20.2, 20.82, 21.2, 21.4],
    },
  },
  {
    id: "v-comp-7",
    domain: "www.teamtrace.app",
    color: "#334155",
    tags: ["tracking", "saas"],
    group: "Tracking",
    visibility: 14.73,
    trafficForecast: 1310,
    keywordsInTop10: 7,
    history: {
      week: [13.5, 13.9, 14.3, 14.73, 14.9, 15.2, 15.4],
      twoWeeks: [11.5, 12.0, 12.5, 12.8, 13.0, 13.2, 13.5, 13.9, 14.3, 14.5, 14.73, 14.9, 15.2, 15.4],
      month: [9.5, 10.5, 11.5, 12.0, 12.8, 13.1, 13.5, 13.9, 14.3, 14.73, 15.1, 15.4],
    },
  },
  {
    id: "v-comp-8",
    domain: "www.ionos.com",
    color: "#f59e0b",
    tags: ["hosting"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywordsInTop10: 0,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-1",
    domain: "www.insightful.io",
    color: "#b45309",
    tags: ["core", "competitor"],
    group: "Competitors",
    visibility: 14.2,
    trafficForecast: 1240,
    keywordsInTop10: 8,
    history: {
      week: [12.8, 13.1, 13.5, 13.9, 14.0, 14.1, 14.2],
      twoWeeks: [10.5, 11.0, 11.4, 11.9, 12.2, 12.5, 12.8, 13.0, 13.3, 13.6, 13.8, 14.0, 14.1, 14.2],
      month: [8.2, 8.8, 9.4, 9.9, 10.5, 11.2, 11.8, 12.4, 13.1, 13.8, 14.0, 14.2],
    },
  },
  {
    id: "v-2",
    domain: "zapier.com",
    color: "#65a30d",
    tags: ["tracking"],
    group: "Tracking",
    visibility: 8.5,
    trafficForecast: 890,
    keywordsInTop10: 6,
    history: {
      week: [8.1, 8.2, 8.3, 8.4, 8.4, 8.5, 8.5],
      twoWeeks: [7.2, 7.4, 7.5, 7.7, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.4, 8.5, 8.5, 8.5],
      month: [6.0, 6.4, 6.8, 7.2, 7.5, 7.8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.5],
    },
  },
  {
    id: "v-3",
    domain: "innolution.com",
    color: "#84cc16",
    tags: ["software"],
    group: "General",
    visibility: 6.1,
    trafficForecast: 420,
    keywordsInTop10: 4,
    history: {
      week: [5.8, 5.9, 5.9, 6.0, 6.0, 6.1, 6.1],
      twoWeeks: [5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.8, 5.9, 6.0, 6.0, 6.0, 6.1, 6.1, 6.1],
      month: [4.5, 4.8, 5.0, 5.3, 5.5, 5.7, 5.8, 5.9, 6.0, 6.0, 6.1, 6.1],
    },
  },
  {
    id: "v-4",
    domain: "www.slideshare.net",
    color: "#78350f",
    tags: ["core"],
    group: "Core",
    visibility: 4.3,
    trafficForecast: 310,
    keywordsInTop10: 3,
    history: {
      week: [4.0, 4.1, 4.1, 4.2, 4.2, 4.3, 4.3],
      twoWeeks: [3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.1, 4.1, 4.2, 4.2, 4.2, 4.3, 4.3, 4.3],
      month: [3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.1, 4.1, 4.2, 4.2, 4.3, 4.3],
    },
  },
  {
    id: "v-5",
    domain: "www.my-intranet.com",
    color: "#0284c7",
    tags: ["features"],
    group: "General",
    visibility: 3.7,
    trafficForecast: 240,
    keywordsInTop10: 3,
    history: {
      week: [3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.7],
      twoWeeks: [3.0, 3.1, 3.2, 3.3, 3.4, 3.4, 3.5, 3.5, 3.6, 3.6, 3.6, 3.7, 3.7, 3.7],
      month: [2.5, 2.7, 2.9, 3.1, 3.3, 3.4, 3.5, 3.5, 3.6, 3.6, 3.7, 3.7],
    },
  },
  {
    id: "v-6",
    domain: "hirint.io",
    color: "#9333ea",
    tags: ["high-intent"],
    group: "General",
    visibility: 2.9,
    trafficForecast: 180,
    keywordsInTop10: 2,
    history: {
      week: [2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9],
      twoWeeks: [2.2, 2.3, 2.4, 2.5, 2.6, 2.6, 2.7, 2.7, 2.8, 2.8, 2.8, 2.9, 2.9, 2.9],
      month: [1.8, 2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9],
    },
  },
  {
    id: "v-7",
    domain: "trainingcred.com",
    color: "#2563eb",
    tags: ["tracking"],
    group: "Tracking",
    visibility: 2.1,
    trafficForecast: 110,
    keywordsInTop10: 2,
    history: {
      week: [1.8, 1.9, 1.9, 2.0, 2.0, 2.1, 2.1],
      twoWeeks: [1.5, 1.6, 1.7, 1.8, 1.8, 1.9, 1.9, 2.0, 2.0, 2.0, 2.0, 2.1, 2.1, 2.1],
      month: [1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.9, 2.0, 2.0, 2.1, 2.1],
    },
  },
  {
    id: "v-8",
    domain: "www.bitdefender.com",
    color: "#10b981",
    tags: ["software"],
    group: "General",
    visibility: 1.5,
    trafficForecast: 90,
    keywordsInTop10: 1,
    history: {
      week: [1.3, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5],
      twoWeeks: [1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5, 1.5, 1.5],
      month: [0.9, 1.0, 1.1, 1.2, 1.3, 1.3, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5],
    },
  },
];

export const JIO_VISIBILITY_DOMAINS: VisibilityDomainItem[] = [
  {
    id: "v-jio-1",
    domain: "www.jio.com",
    color: "#c5158e",
    tags: ["core", "brand"],
    group: "Core",
    visibility: 100,
    trafficForecast: 597152,
    keywords: 264959,
    keywordsInTop10: 100,
    backlinks: 212011,
    referringDomains: 16248,
    history: {
      week: [100, 100, 100, 100, 100, 100, 100],
      twoWeeks: [100, 100, 100, 100, 100, 100, 100],
      month: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    },
  },
  {
    id: "v-jio-2",
    domain: "rechargemojo.com",
    color: "#e6ec94",
    tags: ["competitor"],
    group: "Competitors",
    visibility: 42.93,
    trafficForecast: 80105,
    keywords: 11478,
    keywordsInTop10: 42,
    backlinks: 64,
    referringDomains: 57,
    history: {
      week: [60.0, 48.0, 35.88, 38.5, 40.2, 41.5, 42.93],
      twoWeeks: [60.0, 48.0, 35.88, 38.5, 40.2, 41.5, 42.93],
      month: [70.0, 65.0, 60.0, 55.0, 50.0, 45.0, 42.0, 38.0, 35.88, 39.0, 41.0, 42.93],
    },
  },
  {
    id: "v-jio-3",
    domain: "www.paisabazaar.com",
    color: "#6e67a4",
    tags: ["competitor"],
    group: "Competitors",
    visibility: 34.77,
    trafficForecast: 46405,
    keywords: 457781,
    keywordsInTop10: 34,
    backlinks: 91465,
    referringDomains: 9099,
    history: {
      week: [20.5, 27.0, 34.52, 34.6, 34.7, 34.75, 34.77],
      twoWeeks: [20.5, 27.0, 34.52, 34.6, 34.7, 34.75, 34.77],
      month: [12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 25.0, 28.0, 34.52, 34.6, 34.7, 34.77],
    },
  },
  {
    id: "v-jio-4",
    domain: "play.google.com",
    color: "#8bd0a6",
    tags: ["media"],
    group: "General",
    visibility: 25.6,
    trafficForecast: 64002,
    keywords: 10108210,
    keywordsInTop10: 26,
    backlinks: 3608661247,
    referringDomains: 2775781,
    history: {
      week: [16.0, 21.0, 27.22, 32.5, 38.0, 32.0, 25.6],
      twoWeeks: [16.0, 21.0, 27.22, 32.5, 38.0, 32.0, 25.6],
      month: [10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 25.0, 27.22, 35.0, 30.0, 25.6],
    },
  },
  {
    id: "v-jio-5",
    domain: "paytm.com",
    color: "#53022a",
    tags: ["competitor"],
    group: "Competitors",
    visibility: 23.4,
    trafficForecast: 44790,
    keywords: 1047090,
    keywordsInTop10: 23,
    backlinks: 1467303,
    referringDomains: 36953,
    history: {
      week: [32.0, 18.0, 3.12, 35.0, 6.0, 17.0, 23.4],
      twoWeeks: [32.0, 18.0, 3.12, 35.0, 6.0, 17.0, 23.4],
      month: [25.0, 24.0, 22.0, 20.0, 18.0, 22.0, 26.0, 20.0, 3.12, 25.0, 15.0, 23.4],
    },
  },
  {
    id: "v-jio-6",
    domain: "rechargebatteries.org",
    color: "#1e232f",
    tags: ["competitor"],
    group: "Competitors",
    visibility: 19.62,
    trafficForecast: 31720,
    keywords: 126,
    keywordsInTop10: 19,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [0, 0, 0, 6.0, 11.0, 16.0, 19.62],
      twoWeeks: [0, 0, 0, 6.0, 11.0, 16.0, 19.62],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 5.0, 12.0, 19.62],
    },
  },
  {
    id: "v-jio-7",
    domain: "apps.apple.com",
    color: "#06900a",
    tags: ["media"],
    group: "General",
    visibility: 13.97,
    trafficForecast: 24831,
    keywords: 3494312,
    keywordsInTop10: 14,
    backlinks: 3712709733,
    referringDomains: 2482403,
    history: {
      week: [13.0, 14.5, 15.95, 12.0, 8.5, 11.0, 13.97],
      twoWeeks: [13.0, 14.5, 15.95, 12.0, 8.5, 11.0, 13.97],
      month: [10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 14.0, 15.95, 10.0, 12.0, 13.97],
    },
  },
  {
    id: "v-jio-8",
    domain: "indiapostgdsonline.cept.gov.in",
    color: "#dcd98b",
    tags: ["reference"],
    group: "General",
    visibility: 13.61,
    trafficForecast: 30468,
    keywords: 44865,
    keywordsInTop10: 13,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [0, 0, 0, 4.0, 8.5, 11.5, 13.61],
      twoWeeks: [0, 0, 0, 4.0, 8.5, 11.5, 13.61],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 3.0, 8.0, 13.61],
    },
  },
  {
    id: "v-jio-9",
    domain: "idm.jioconnect.com",
    color: "#7cfefc",
    tags: ["core"],
    group: "Core",
    visibility: 6.47,
    trafficForecast: 12261,
    keywords: 5005,
    keywordsInTop10: 6,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [5.0, 5.2, 5.5, 5.8, 6.0, 6.2, 6.47],
      twoWeeks: [5.0, 5.2, 5.5, 5.8, 6.0, 6.2, 6.47],
      month: [3.5, 3.8, 4.0, 4.3, 4.6, 4.9, 5.1, 5.3, 5.6, 5.9, 6.2, 6.47],
    },
  },
  {
    id: "v-jio-10",
    domain: "www.hyundai.com",
    color: "#86e601",
    tags: ["brand"],
    group: "General",
    visibility: 4.03,
    trafficForecast: 7518,
    keywords: 163802,
    keywordsInTop10: 4,
    backlinks: 9720993,
    referringDomains: 73406,
    history: {
      week: [3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 4.03],
      twoWeeks: [3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 4.03],
      month: [2.0, 2.3, 2.5, 2.8, 3.0, 3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 4.03],
    },
  },
  {
    id: "v-jio-11",
    domain: "selfcare.jiolabs.com",
    color: "#419e13",
    tags: ["core"],
    group: "Core",
    visibility: 3.96,
    trafficForecast: 6399,
    keywords: 169,
    keywordsInTop10: 4,
    backlinks: 1,
    referringDomains: 1,
    history: {
      week: [3.1, 3.3, 3.5, 3.6, 3.7, 3.8, 3.96],
      twoWeeks: [3.1, 3.3, 3.5, 3.6, 3.7, 3.8, 3.96],
      month: [2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4, 3.6, 3.7, 3.8, 3.96],
    },
  },
  {
    id: "v-jio-12",
    domain: "support.google.com",
    color: "#c65794",
    tags: ["reference"],
    group: "General",
    visibility: 2.64,
    trafficForecast: 5904,
    keywords: 10108210,
    keywordsInTop10: 3,
    backlinks: 76009123,
    referringDomains: 993604,
    history: {
      week: [2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.64],
      twoWeeks: [2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.64],
      month: [1.5, 1.6, 1.7, 1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.64],
    },
  },
  {
    id: "v-jio-13",
    domain: "sarahjio.com",
    color: "#40b8a7",
    tags: ["blog"],
    group: "General",
    visibility: 2.16,
    trafficForecast: 4824,
    keywords: 20,
    keywordsInTop10: 2,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [1.7, 1.8, 1.9, 2.0, 2.0, 2.1, 2.16],
      twoWeeks: [1.7, 1.8, 1.9, 2.0, 2.0, 2.1, 2.16],
      month: [1.0, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.16],
    },
  },
  {
    id: "v-jio-14",
    domain: "help.jiosaavn.com",
    color: "#facf3b",
    tags: ["media"],
    group: "General",
    visibility: 1.62,
    trafficForecast: 2117,
    keywords: 1306336,
    keywordsInTop10: 2,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.62],
      twoWeeks: [1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.62],
      month: [0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.62],
    },
  },
  {
    id: "v-jio-15",
    domain: "www.icici.bank.in",
    color: "#53eb1d",
    tags: ["brand"],
    group: "General",
    visibility: 1.56,
    trafficForecast: 3007,
    keywords: 333675,
    keywordsInTop10: 2,
    backlinks: 171893,
    referringDomains: 2257,
    history: {
      week: [1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.56],
      twoWeeks: [1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.56],
      month: [0.8, 0.9, 1.0, 1.0, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.5, 1.56],
    },
  },
  {
    id: "v-jio-16",
    domain: "www.ecb.europa.eu",
    color: "#447532",
    tags: ["reference"],
    group: "General",
    visibility: 0.65,
    trafficForecast: 1452,
    keywords: 565588,
    keywordsInTop10: 1,
    backlinks: 4605355,
    referringDomains: 39489,
    history: {
      week: [0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.65],
      twoWeeks: [0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.65],
      month: [0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.6, 0.6, 0.65],
    },
  },
  {
    id: "v-jio-17",
    domain: "www.gadgets360.com",
    color: "#3d83c7",
    tags: ["media"],
    group: "General",
    visibility: 0.65,
    trafficForecast: 1255,
    keywords: 1102134,
    keywordsInTop10: 1,
    backlinks: 1759664,
    referringDomains: 32025,
    history: {
      week: [0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.65],
      twoWeeks: [0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.65],
      month: [0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.6, 0.6, 0.65],
    },
  },
  {
    id: "v-jio-18",
    domain: "apps.shopify.com",
    color: "#53b484",
    tags: ["saas"],
    group: "General",
    visibility: 0.51,
    trafficForecast: 1140,
    keywords: 488097,
    keywordsInTop10: 1,
    backlinks: 11802549,
    referringDomains: 83712,
    history: {
      week: [0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.51],
      twoWeeks: [0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.51],
      month: [0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.5, 0.51],
    },
  },
  {
    id: "v-jio-19",
    domain: "www.cashify.in",
    color: "#ac2d0a",
    tags: ["competitor"],
    group: "Competitors",
    visibility: 0.43,
    trafficForecast: 972,
    keywords: 723479,
    keywordsInTop10: 1,
    backlinks: 103616,
    referringDomains: 14374,
    history: {
      week: [0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.43],
      twoWeeks: [0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.43],
      month: [0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.43],
    },
  },
  {
    id: "v-jio-20",
    domain: "medium.com",
    color: "#bc06d6",
    tags: ["blog"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 3061259,
    keywordsInTop10: 0,
    backlinks: 102436439,
    referringDomains: 1673454,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-21",
    domain: "www.youtube.com",
    color: "#8c650c",
    tags: ["media"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 31771221,
    keywordsInTop10: 0,
    backlinks: 17477572274,
    referringDomains: 25358961,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-22",
    domain: "www.reddit.com",
    color: "#53ebd8",
    tags: ["media"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 12838905,
    keywordsInTop10: 0,
    backlinks: 2372520694,
    referringDomains: 2532163,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-23",
    domain: "www.canva.com",
    color: "#975d99",
    tags: ["saas"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 1083093,
    keywordsInTop10: 0,
    backlinks: 46559042,
    referringDomains: 631630,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-24",
    domain: "nationalinsurance.nic.co.in",
    color: "#638073",
    tags: ["brand"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 28719,
    keywordsInTop10: 0,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-25",
    domain: "www.cbse.gov.in",
    color: "#c9b8c0",
    tags: ["reference"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 180633,
    keywordsInTop10: 0,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: "v-jio-26",
    domain: "www.kvb.bank.in",
    color: "#0c2a86",
    tags: ["brand"],
    group: "General",
    visibility: 0,
    trafficForecast: 0,
    keywords: 333675,
    keywordsInTop10: 0,
    backlinks: 0,
    referringDomains: 0,
    history: {
      week: [0, 0, 0, 0, 0, 0, 0],
      twoWeeks: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
];

export const INITIAL_VISIBILITY_DOMAINS: VisibilityDomainItem[] = JIO_VISIBILITY_DOMAINS;

export const COMPOSER_WEEK_DATES = ["Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18", "Sep 19"];
export const COMPOSER_TWO_WEEK_DATES = [
  "Sep 6", "Sep 7", "Sep 8", "Sep 9", "Sep 10", "Sep 11", "Sep 12",
  "Sep 13", "Sep 14", "Sep 15", "Sep 16", "Sep 17", "Sep 18", "Sep 19"
];
export const COMPOSER_MONTH_DATES = [
  "Aug 20", "Aug 23", "Aug 26", "Aug 29", "Sep 1", "Sep 4", "Sep 7",
  "Sep 10", "Sep 13", "Sep 16", "Sep 18", "Sep 19"
];

export const JIO_WEEK_DATES = ["Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10", "Oct 11", "Oct 12"];
export const JIO_TWO_WEEK_DATES = ["Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10", "Oct 11", "Oct 12"];
export const JIO_MONTH_DATES = [
  "Sep 12", "Sep 15", "Sep 18", "Sep 21", "Sep 24", "Sep 27", "Sep 30",
  "Oct 3", "Oct 6", "Oct 8", "Oct 10", "Oct 12"
];

export interface VisibilityRatingViewProps {
  projectId: string;
  projectDomain?: string;
  competitors?: CompetitorDto[];
}

export function getVisibilityDataset(projectDomain: string, competitors?: CompetitorDto[]): VisibilityDomainItem[] {
  const clean = projectDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '').toLowerCase();
  if (clean === "workcomposer.com" && Boolean(competitors && competitors.some((c) => c.domain === "getcomposer.org"))) {
    return COMPOSER_VISIBILITY_DOMAINS;
  }
  if (clean === "myjio.com" || clean === "jio.com") {
    return JIO_VISIBILITY_DOMAINS;
  }
  if (clean.includes("flipkart")) {
    return [
      {
        id: "v-fk-1",
        domain: "www.flipkart.com",
        color: "#2874f0",
        tags: ["core", "brand"],
        group: "Core",
        visibility: 88.5,
        trafficForecast: 485000,
        keywords: 195000,
        keywordsInTop10: 92,
        backlinks: 412000,
        referringDomains: 24500,
        history: {
          week: [86.2, 86.8, 87.1, 87.5, 87.9, 88.2, 88.5],
          twoWeeks: [84.0, 84.5, 85.0, 85.4, 85.8, 86.2, 86.8, 87.1, 87.5, 87.9, 88.2, 88.5, 88.5, 88.5],
          month: [80.5, 81.2, 82.0, 83.1, 84.0, 85.0, 85.8, 86.5, 87.1, 87.8, 88.2, 88.5],
        },
      },
      {
        id: "v-fk-2",
        domain: "www.amazon.in",
        color: "#f59e0b",
        tags: ["competitor", "leader"],
        group: "Competitors",
        visibility: 94.2,
        trafficForecast: 590000,
        keywords: 240000,
        keywordsInTop10: 96,
        backlinks: 650000,
        referringDomains: 38000,
        history: {
          week: [93.5, 93.8, 93.9, 94.0, 94.1, 94.2, 94.2],
          twoWeeks: [92.0, 92.4, 92.8, 93.1, 93.5, 93.8, 93.9, 94.0, 94.1, 94.2, 94.2, 94.2, 94.2, 94.2],
          month: [90.0, 90.5, 91.2, 92.0, 92.5, 93.0, 93.5, 93.8, 94.0, 94.1, 94.2, 94.2],
        },
      },
      {
        id: "v-fk-3",
        domain: "www.meesho.com",
        color: "#ec4899",
        tags: ["competitor"],
        group: "Competitors",
        visibility: 42.1,
        trafficForecast: 180000,
        keywords: 62000,
        keywordsInTop10: 48,
        backlinks: 85000,
        referringDomains: 7200,
        history: {
          week: [40.5, 40.8, 41.2, 41.5, 41.8, 42.0, 42.1],
          twoWeeks: [38.0, 38.5, 39.0, 39.5, 40.0, 40.5, 40.8, 41.2, 41.5, 41.8, 42.0, 42.1, 42.1, 42.1],
          month: [35.0, 36.0, 36.8, 37.5, 38.0, 39.0, 39.8, 40.5, 41.2, 41.8, 42.0, 42.1],
        },
      },
      {
        id: "v-fk-4",
        domain: "www.myntra.com",
        color: "#ef4444",
        tags: ["fashion", "competitor"],
        group: "Competitors",
        visibility: 38.4,
        trafficForecast: 145000,
        keywords: 54000,
        keywordsInTop10: 41,
        backlinks: 120000,
        referringDomains: 9800,
        history: {
          week: [37.2, 37.5, 37.8, 38.0, 38.2, 38.3, 38.4],
          twoWeeks: [35.0, 35.5, 36.0, 36.5, 37.0, 37.2, 37.5, 37.8, 38.0, 38.2, 38.3, 38.4, 38.4, 38.4],
          month: [32.0, 33.0, 34.0, 34.8, 35.5, 36.2, 37.0, 37.5, 37.9, 38.2, 38.3, 38.4],
        },
      },
      {
        id: "v-fk-5",
        domain: "www.ajio.com",
        color: "#6366f1",
        tags: ["apparel", "competitor"],
        group: "Competitors",
        visibility: 26.8,
        trafficForecast: 92000,
        keywords: 31000,
        keywordsInTop10: 29,
        backlinks: 62000,
        referringDomains: 4900,
        history: {
          week: [25.8, 26.0, 26.2, 26.4, 26.5, 26.7, 26.8],
          twoWeeks: [24.0, 24.3, 24.8, 25.0, 25.4, 25.8, 26.0, 26.2, 26.4, 26.5, 26.7, 26.8, 26.8, 26.8],
          month: [21.5, 22.0, 22.8, 23.4, 24.0, 24.6, 25.2, 25.8, 26.2, 26.5, 26.7, 26.8],
        },
      },
    ];
  }
  const brand = clean.split('.')[0];
  return [
    {
      id: `v-${brand}-main`,
      domain: `www.${clean}`,
      color: "#2563EB",
      tags: ["core", "brand"],
      group: "Core",
      visibility: 45.2,
      trafficForecast: 12400,
      keywords: 4200,
      keywordsInTop10: 38,
      backlinks: 1450,
      referringDomains: 320,
      history: {
        week: [42.1, 42.8, 43.4, 44.0, 44.5, 45.0, 45.2],
        twoWeeks: [39.0, 39.8, 40.5, 41.2, 42.1, 42.8, 43.4, 44.0, 44.5, 45.0, 45.2, 45.2, 45.2, 45.2],
        month: [35.0, 36.2, 37.5, 38.8, 40.0, 41.2, 42.5, 43.4, 44.1, 44.8, 45.1, 45.2],
      },
    },
    {
      id: `v-${brand}-rival1`,
      domain: `leader-${clean}`,
      color: "#10b981",
      tags: ["competitor"],
      group: "Competitors",
      visibility: 62.4,
      trafficForecast: 28500,
      keywords: 8900,
      keywordsInTop10: 64,
      backlinks: 5400,
      referringDomains: 890,
      history: {
        week: [61.0, 61.3, 61.6, 61.9, 62.1, 62.3, 62.4],
        twoWeeks: [58.0, 58.6, 59.2, 60.0, 60.5, 61.0, 61.3, 61.6, 61.9, 62.1, 62.3, 62.4, 62.4, 62.4],
        month: [54.0, 55.2, 56.4, 57.5, 58.8, 60.0, 60.8, 61.5, 62.0, 62.2, 62.3, 62.4],
      },
    },
  ];
}

export function VisibilityRatingView({
  projectId,
  projectDomain = "www.jio.com",
  competitors,
}: VisibilityRatingViewProps) {
  const isWorkComposerTest =
    projectDomain === "workcomposer.com" &&
    Boolean(competitors && competitors.some((c) => c.domain === "getcomposer.org"));

  const activeDomainsDataset = useMemo(
    () => getVisibilityDataset(projectDomain, competitors),
    [projectDomain, competitors]
  );

  // 1. Top Notice alert banner
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);

  // 2. Action Controls
  const [selectedEngine, setSelectedEngine] = useState("All search engines");
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);

  const defaultEvalDate = isWorkComposerTest ? new Date(2026, 8, 19) : new Date(2026, 9, 12);
  const defaultEvalDateStr = isWorkComposerTest ? "19 Sep 2026" : "12 Oct 2026";

  const [appliedDate, setAppliedDate] = useState<Date>(defaultEvalDate);
  const [stagedDate, setStagedDate] = useState<Date>(defaultEvalDate);
  const [selectedDate, setSelectedDate] = useState(defaultEvalDateStr);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Calendar dual-month navigation (Aug/Sep for test, Sep/Oct for real)
  const [calendarLeftYear, setCalendarLeftYear] = useState(2026);
  const [calendarLeftMonth, setCalendarLeftMonth] = useState(isWorkComposerTest ? 7 : 8);
  const [calendarRightYear, setCalendarRightYear] = useState(2026);
  const [calendarRightMonth, setCalendarRightMonth] = useState(isWorkComposerTest ? 8 : 9);

  // Year selector dropdown states
  const [isLeftYearOpen, setIsLeftYearOpen] = useState(false);
  const [isRightYearOpen, setIsRightYearOpen] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);

  // 3. View Mode Tabs & Timeline Duration
  const [activeViewTab, setActiveViewTab] = useState<"visibility" | "traffic" | "top10" | "distribution">("visibility");
  const [timelineRange, setTimelineRange] = useState<"week" | "2weeks" | "month">(
    isWorkComposerTest ? "week" : "2weeks"
  );

  // 4. Multi-Line Chart state
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 5. Table Toolbar & Data
  const [domainSearch, setDomainSearch] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<"domain" | VisibilityColumnKey>("visibility");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 6. Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [pageInput, setPageInput] = useState<string>("1");

  // 7. Utility Menus & Modals
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const isFiltersOpen = isFilterPanelOpen;
  const setIsFiltersOpen = setIsFilterPanelOpen;
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const [tagMatchLogic, setTagMatchLogic] = useState<"or" | "and">("or");
  const [withoutTagsChecked, setWithoutTagsChecked] = useState(false);
  const [allTagsChecked, setAllTagsChecked] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const isColumnsOpen = isColumnsMenuOpen;
  const setIsColumnsOpen = setIsColumnsMenuOpen;
  const [visibleColumns, setVisibleColumns] = useState<Record<VisibilityColumnKey, boolean>>(DEFAULT_VISIBLE_COLUMNS);
  const [columnSearch, setColumnSearch] = useState("");

  const columnDefinitions = VISIBILITY_COLUMN_DEFINITIONS;

  const activeColumnCount = useMemo(
    () => Object.values(visibleColumns).filter(Boolean).length,
    [visibleColumns]
  );

  const filteredColumns = useMemo(() => {
    if (!columnSearch.trim()) return columnDefinitions;
    const q = columnSearch.toLowerCase();
    return columnDefinitions.filter(
      (col) =>
        col.label.toLowerCase().includes(q) ||
        col.description.toLowerCase().includes(q)
    );
  }, [columnSearch, columnDefinitions]);

  const handleSelectAllColumns = () => {
    setVisibleColumns({
      visibility: true,
      percentInTop10: true,
      trafficForecast: true,
      keywords: true,
      dt: true,
      backlinks: true,
      referringDomains: true,
    });
  };

  const handleDeselectAllColumns = () => {
    setVisibleColumns({
      visibility: false,
      percentInTop10: false,
      trafficForecast: false,
      keywords: false,
      dt: false,
      backlinks: false,
      referringDomains: false,
    });
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    setColumnSearch("");
    showToast("Columns reset to default");
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [includeKeywordsAndUrls, setIncludeKeywordsAndUrls] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const engineDropdownRef = useRef<HTMLDivElement>(null);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    (selectedGroup !== "all" && selectedGroup !== "All groups") ||
    selectedTags.length > 0 ||
    withoutTagsChecked ||
    allTagsChecked;

  const activeFilterCount =
    (selectedGroup !== "all" && selectedGroup !== "All groups" ? 1 : 0) +
    (selectedTags.length > 0 ? selectedTags.length : 0) +
    (withoutTagsChecked ? 1 : 0) +
    (allTagsChecked ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedGroup("all");
    setSelectedTags([]);
    setWithoutTagsChecked(false);
    setAllTagsChecked(false);
    setTagMatchLogic("or");
    setTagSearchQuery("");
    showToast("Filters reset: Showing all domains");
  };

  const filteredTagList = useMemo(() => {
    if (!tagSearchQuery.trim()) return ALL_DOMAIN_TAGS;
    const q = tagSearchQuery.toLowerCase();
    return ALL_DOMAIN_TAGS.filter((tag) => tag.toLowerCase().includes(q));
  }, [tagSearchQuery]);

  const domainsWithTagsCount = useMemo(() => {
    return activeDomainsDataset.filter((d) => d.tags && d.tags.length > 0).length;
  }, [activeDomainsDataset]);

  const domainsWithoutTagsCount = useMemo(() => {
    return activeDomainsDataset.filter((d) => !d.tags || d.tags.length === 0).length;
  }, [activeDomainsDataset]);

  useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
  }, [selectedGroup, selectedTags, withoutTagsChecked, allTagsChecked, tagMatchLogic, domainSearch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCalendarLeftMonth((prev) => {
      if (prev === 0) {
        setCalendarLeftYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setCalendarRightMonth((prev) => {
      if (prev === 0) {
        setCalendarRightYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarLeftMonth((prev) => {
      if (prev === 11) {
        setCalendarLeftYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setCalendarRightMonth((prev) => {
      if (prev === 11) {
        setCalendarRightYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleApplyDate = () => {
    setAppliedDate(stagedDate);
    const formatted = formatComparisonDate(stagedDate);
    setSelectedDate(formatted);
    setIsDatePickerOpen(false);
    setIsLeftYearOpen(false);
    setIsRightYearOpen(false);
    showToast(`Active evaluation date updated to ${formatted}`);
  };

  const handleCancelDate = () => {
    setStagedDate(appliedDate);
    setIsDatePickerOpen(false);
    setIsLeftYearOpen(false);
    setIsRightYearOpen(false);
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(event.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
        setIsLeftYearOpen(false);
        setIsRightYearOpen(false);
        setStagedDate(appliedDate);
      }
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterPanelOpen(false);
        setIsGroupMenuOpen(false);
        setIsTagsMenuOpen(false);
      }
      if (copyMenuRef.current && !copyMenuRef.current.contains(event.target as Node)) {
        setIsCopyMenuOpen(false);
      }
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setIsColumnsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isTagsMenuOpen) {
          setIsTagsMenuOpen(false);
          return;
        }
        if (isGroupMenuOpen) {
          setIsGroupMenuOpen(false);
          return;
        }
        if (isFilterPanelOpen) {
          setIsFilterPanelOpen(false);
          return;
        }
        if (isLeftYearOpen || isRightYearOpen) {
          setIsLeftYearOpen(false);
          setIsRightYearOpen(false);
          return;
        }
        setIsEngineDropdownOpen(false);
        setIsDatePickerOpen(false);
        setStagedDate(appliedDate);
        setIsCopyMenuOpen(false);
        setIsColumnsOpen(false);
        setIsExportModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [appliedDate, isLeftYearOpen, isRightYearOpen, isFilterPanelOpen, isGroupMenuOpen, isTagsMenuOpen, isColumnsMenuOpen]);

  const renderCalendarMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday start: Mon=0, ..., Sun=6
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: React.ReactNode[] = [];

    // Prior month padding dates
    for (let i = offset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push(
        <div
          key={`pad-prev-${year}-${month}-${dayNum}`}
          className="h-7 w-7 text-xs flex items-center justify-center text-slate-300 dark:text-slate-600 select-none pointer-events-none"
        >
          {dayNum}
        </div>
      );
    }

    // Active month dates
    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const isSelected =
        stagedDate &&
        current.getFullYear() === stagedDate.getFullYear() &&
        current.getMonth() === stagedDate.getMonth() &&
        current.getDate() === stagedDate.getDate();

      // Historical tracked days styled in darker, selectable font
      const isHistoricalTracked =
        (year === 2026 && month === 8 && [13, 14, 15, 16, 17, 18, 19].includes(d)) ||
        (year === 2026 && month === 9 && [6, 7, 8, 9, 10, 11, 12].includes(d));

      let cellStyle =
        "h-7 w-7 text-xs flex flex-col items-center justify-center transition select-none cursor-pointer ";

      if (isSelected) {
        cellStyle += "bg-blue-600 text-white font-bold rounded-xs relative shadow-xs";
      } else if (isHistoricalTracked) {
        cellStyle += "font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      } else {
        cellStyle += "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs";
      }

      cells.push(
        <button
          key={`day-${year}-${month}-${d}`}
          type="button"
          onClick={() => setStagedDate(current)}
          aria-label={`${d} ${CAL_FULL_MONTHS[month]} ${year}`}
          data-date={`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`}
          className={cellStyle}
        >
          <span>{d}</span>
          {isSelected && (
            <span className="w-1 h-1 bg-white rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
          )}
        </button>
      );
    }

    // Future month padding dates
    const remainder = (7 - ((offset + daysInMonth) % 7)) % 7;
    for (let f = 1; f <= remainder; f++) {
      cells.push(
        <div
          key={`pad-next-${year}-${month}-${f}`}
          className="h-7 w-7 text-xs flex items-center justify-center text-slate-300 dark:text-slate-600 select-none pointer-events-none"
        >
          {f}
        </div>
      );
    }

    return (
      <div className="w-[260px] space-y-2">
        {/* Day Headers: M T W T F S S */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase mb-1">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>
    );
  };

  // Filter and sort domains
  const filteredDomains = useMemo(() => {
    let list = [...activeDomainsDataset];
    if (domainSearch.trim()) {
      const q = domainSearch.toLowerCase();
      list = list.filter((d) => d.domain.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)));
    }

    // Group filtering
    if (selectedGroup && selectedGroup !== "all" && selectedGroup !== "All groups") {
      list = list.filter((d) => d.group?.toLowerCase() === selectedGroup.toLowerCase());
    }

    // Tags filtering
    if (withoutTagsChecked) {
      list = list.filter((d) => !d.tags || d.tags.length === 0);
    } else if (allTagsChecked) {
      list = list.filter((d) => d.tags && d.tags.length > 0);
    } else if (selectedTags.length > 0) {
      if (tagMatchLogic === "and") {
        list = list.filter((d) => selectedTags.every((t) => d.tags && d.tags.includes(t)));
      } else {
        list = list.filter((d) => selectedTags.some((t) => d.tags && d.tags.includes(t)));
      }
    }

    list.sort((a, b) => {
      let aVal: any = (a as any)[sortColumn];
      let bVal: any = (b as any)[sortColumn];
      if (sortColumn === "keywords") {
        aVal = a.keywords ?? a.keywordsInTop10;
        bVal = b.keywords ?? b.keywordsInTop10;
      } else if (sortColumn === "percentInTop10") {
        const aMetrics = getDomainMetrics(a);
        const bMetrics = getDomainMetrics(b);
        aVal = aMetrics.percentInTop10;
        bVal = bMetrics.percentInTop10;
      } else if (sortColumn === "dt") {
        const aMetrics = getDomainMetrics(a);
        const bMetrics = getDomainMetrics(b);
        aVal = aMetrics.dt;
        bVal = bMetrics.dt;
      } else if (sortColumn === "backlinks") {
        const aMetrics = getDomainMetrics(a);
        const bMetrics = getDomainMetrics(b);
        aVal = aMetrics.backlinks;
        bVal = bMetrics.backlinks;
      } else if (sortColumn === "referringDomains") {
        const aMetrics = getDomainMetrics(a);
        const bMetrics = getDomainMetrics(b);
        aVal = aMetrics.referringDomains;
        bVal = bMetrics.referringDomains;
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      const numA = Number(aVal ?? 0);
      const numB = Number(bVal ?? 0);
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
    return list;
  }, [
    activeDomainsDataset,
    domainSearch,
    sortColumn,
    sortDirection,
    selectedGroup,
    withoutTagsChecked,
    allTagsChecked,
    selectedTags,
    tagMatchLogic,
  ]);

  // Paginated domains
  const totalPages = Math.max(1, Math.ceil(filteredDomains.length / rowsPerPage));
  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredDomains.slice(start, start + rowsPerPage);
  }, [filteredDomains, currentPage, rowsPerPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDomains(paginatedDomains.map((d) => d.id));
    } else {
      setSelectedDomains([]);
    }
  };

  const handleToggleDomain = (id: string) => {
    setSelectedDomains((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSort = (col: "domain" | VisibilityColumnKey) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  };

  const toggleSeries = (domainName: string) => {
    setHiddenSeries((prev) =>
      prev.includes(domainName) ? prev.filter((d) => d !== domainName) : [...prev, domainName]
    );
  };

  // Active dates for timeline
  const activeTimelineDates = useMemo(() => {
    if (timelineRange === "week") return isWorkComposerTest ? COMPOSER_WEEK_DATES : JIO_WEEK_DATES;
    if (timelineRange === "2weeks") return isWorkComposerTest ? COMPOSER_TWO_WEEK_DATES : JIO_TWO_WEEK_DATES;
    return isWorkComposerTest ? COMPOSER_MONTH_DATES : JIO_MONTH_DATES;
  }, [timelineRange, isWorkComposerTest]);

  // SVG Chart Dimensions & Calculations
  const chartWidth = 900;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Max value calculation based on active tab
  const chartMaxValue = useMemo(() => {
    if (activeViewTab === "visibility") return isWorkComposerTest ? 60 : 150;
    if (activeViewTab === "traffic") return 5000;
    if (activeViewTab === "top10") return 100;
    return 100; // distribution
  }, [activeViewTab, isWorkComposerTest]);

  const yAxisTicks = useMemo(() => {
    if (activeViewTab === "visibility") {
      return isWorkComposerTest ? [0, 15, 30, 45, 60] : [0, 50, 100, 150];
    }
    if (activeViewTab === "traffic") {
      return [0, 1000, 2500, 5000];
    }
    if (activeViewTab === "top10") {
      return [0, 25, 50, 75, 100];
    }
    return [0, 25, 50, 75, 100];
  }, [activeViewTab, isWorkComposerTest]);

  // Generate curves for top domains
  const topDomains = useMemo(() => activeDomainsDataset.slice(0, 8), [activeDomainsDataset]);

  const chartSeries = useMemo(() => {
    return topDomains.map((domain) => {
      let rawHistory: number[] = [];
      if (timelineRange === "week") {
        rawHistory = domain.history.week;
      } else if (timelineRange === "2weeks") {
        rawHistory = domain.history.twoWeeks;
      } else {
        rawHistory = domain.history.month;
      }

      // Convert values based on active tab
      const values = rawHistory.map((val) => {
        if (activeViewTab === "visibility") return val;
        if (activeViewTab === "traffic") return Math.round(val * 85);
        if (activeViewTab === "top10") return Math.min(100, Math.round(val * 6));
        return Math.min(100, Math.round(val * 5));
      });

      const numPoints = activeTimelineDates.length;
      const points = values.map((v, i) => {
        const x = padding.left + (i / Math.max(1, numPoints - 1)) * plotWidth;
        const norm = Math.min(1, Math.max(0, v / chartMaxValue));
        const y = padding.top + (1 - norm) * plotHeight;
        return { x, y, value: v, date: activeTimelineDates[i] };
      });

      // SVG spline path
      const pathD = createSplinePath(points);

      return {
        domain: domain.domain,
        color: domain.color,
        points,
        pathD,
        isVisible: !hiddenSeries.includes(domain.domain),
      };
    });
  }, [topDomains, timelineRange, activeTimelineDates, activeViewTab, chartMaxValue, hiddenSeries, plotWidth, plotHeight, padding.left, padding.top]);

  // Sorted tooltip rows on hover
  const tooltipRows = useMemo(() => {
    if (hoverIndex === null) return [];
    const rows = chartSeries
      .filter((s) => s.isVisible)
      .map((s) => {
        const pt = s.points[hoverIndex];
        return {
          domain: s.domain,
          color: s.color,
          value: pt ? pt.value : 0,
        };
      });
    rows.sort((a, b) => b.value - a.value);
    return rows;
  }, [chartSeries, hoverIndex]);

  return (
    <div data-testid="visibility-rating-view" className="space-y-4 pb-12 select-none">
      {/* 1. Top Notice Alert Banner */}
      {isNoticeVisible && (
        <div
          data-testid="visibility-notice-banner"
          className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs text-blue-900 dark:text-blue-200 shadow-2xs transition animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
              ℹ
            </span>
            <span className="font-medium">
              We collect every site in the top 10 for each tracked keyword and sort them by their search visibility score. Data is updated every time rankings are checked, and is stored for 30 days.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsNoticeVisible(false)}
            aria-label="Dismiss notice"
            className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 p-1 cursor-pointer transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Breadcrumbs & Utility Links Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <Link href={`/projects/${projectId}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
            {projectDomain}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="text-slate-600 dark:text-slate-300">My Competitors</span>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">Visibility Rating</span>
        </div>

        {/* Utility links */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast("Guest link access opened")}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          >
            <span>🔗</span>
            <span>Guest link</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => showToast("Feedback form modal opened")}
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          >
            Feedback
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => showToast("Notes dialog opened (46 notes)")}
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          >
            Notes (46)
          </button>
        </div>
      </div>

      {/* 3. Primary Action Row: Engine Selector, Date Button, Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Engine Selector */}
          <div className="relative" ref={engineDropdownRef}>
            <button
              type="button"
              onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
              aria-label="Select search engine"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <span className="text-blue-600">✔</span>
              <span>{selectedEngine}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-40 text-xs">
                {["All search engines", "Google Desktop", "Google Mobile", "Bing Desktop"].map((engine) => (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => {
                      setSelectedEngine(engine);
                      setIsEngineDropdownOpen(false);
                      showToast(`Engine updated: ${engine}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                      selectedEngine === engine
                        ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{engine}</span>
                    {selectedEngine === engine && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Single-Date Comparison Calendar Button & Popover */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              aria-label="Select date"
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 cursor-pointer shadow-xs transition hover:border-slate-400"
            >
              <span>📅</span>
              <span>{selectedDate}</span>
            </button>

            {isDatePickerOpen && (
              <div
                data-testid="visibility-calendar-popover"
                className="absolute left-0 top-full mt-2 w-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Month Headers */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  {/* Left Month Header */}
                  <div className="flex items-center justify-between w-[260px]">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer transition"
                      title="Previous month"
                    >
                      ‹
                    </button>
                    <div
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      aria-label={`${CAL_FULL_MONTHS[calendarLeftMonth]} ${calendarLeftYear}`}
                    >
                      <span className="sr-only">{CAL_FULL_MONTHS[calendarLeftMonth]}  {calendarLeftYear}</span>
                      <span>{CAL_FULL_MONTHS[calendarLeftMonth]}</span>
                      <CalendarYearDropdown
                        year={calendarLeftYear}
                        onSelectYear={(y) => setCalendarLeftYear(y)}
                        isOpen={isLeftYearOpen}
                        onToggle={() => {
                          setIsLeftYearOpen((prev) => !prev);
                          setIsRightYearOpen(false);
                        }}
                        onClose={() => setIsLeftYearOpen(false)}
                        ariaLabel={`Select year for ${CAL_FULL_MONTHS[calendarLeftMonth]}`}
                      />
                    </div>
                    <div className="w-5" />
                  </div>

                  <div className="border-r border-slate-100 dark:border-slate-800 h-6" />

                  {/* Right Month Header */}
                  <div className="flex items-center justify-between w-[260px]">
                    <div className="w-5" />
                    <div
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      aria-label={`${CAL_FULL_MONTHS[calendarRightMonth]} ${calendarRightYear}`}
                    >
                      <span className="sr-only">{CAL_FULL_MONTHS[calendarRightMonth]}  {calendarRightYear}</span>
                      <span>{CAL_FULL_MONTHS[calendarRightMonth]}</span>
                      <CalendarYearDropdown
                        year={calendarRightYear}
                        onSelectYear={(y) => setCalendarRightYear(y)}
                        isOpen={isRightYearOpen}
                        onToggle={() => {
                          setIsRightYearOpen((prev) => !prev);
                          setIsLeftYearOpen(false);
                        }}
                        onClose={() => setIsRightYearOpen(false)}
                        ariaLabel={`Select year for ${CAL_FULL_MONTHS[calendarRightMonth]}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      aria-label="Next month"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm cursor-pointer transition"
                      title="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Calendar Grids side-by-side */}
                <div className="flex items-start justify-between py-4">
                  {renderCalendarMonth(calendarLeftYear, calendarLeftMonth)}
                  <div className="border-r border-slate-100 dark:border-slate-800 h-56 self-stretch my-1" />
                  {renderCalendarMonth(calendarRightYear, calendarRightMonth)}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>Evaluation date: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatComparisonDate(stagedDate)}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCancelDate}
                      className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDate}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs transition cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            aria-label="Export visibility data"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition text-xs shadow-2xs cursor-pointer"
          >
            <span>⬆</span>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* 4. View Mode Tabs & Timeline Duration Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {/* Primary View Tabs Bar */}
        <div className="flex flex-wrap items-center border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveViewTab("visibility")}
            className={`px-5 py-3 font-bold transition cursor-pointer ${
              activeViewTab === "visibility"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold -mb-px"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            }`}
          >
            VISIBILITY
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab("traffic")}
            className={`px-5 py-3 border-l border-slate-200 dark:border-slate-800 transition cursor-pointer ${
              activeViewTab === "traffic"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold -mb-px"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            }`}
          >
            TRAFFIC FORECAST
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab("top10")}
            className={`px-5 py-3 border-l border-slate-200 dark:border-slate-800 transition cursor-pointer ${
              activeViewTab === "top10"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold -mb-px"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            }`}
          >
            % IN TOP 10
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab("distribution")}
            className={`px-5 py-3 border-l border-slate-200 dark:border-slate-800 transition cursor-pointer ${
              activeViewTab === "distribution"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold -mb-px"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            }`}
          >
            COMPETITOR DISTRIBUTION
          </button>
        </div>

        {/* Sub-interval timeline selector */}
        <div className="flex items-center px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTimelineRange("week")}
              className={`pb-0.5 font-bold transition cursor-pointer ${
                timelineRange === "week"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
              }`}
            >
              WEEK
            </button>
            <button
              type="button"
              onClick={() => setTimelineRange("2weeks")}
              className={`pb-0.5 font-bold transition cursor-pointer ${
                timelineRange === "2weeks"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
              }`}
            >
              2 WEEKS
            </button>
            <button
              type="button"
              onClick={() => setTimelineRange("month")}
              className={`pb-0.5 font-bold transition cursor-pointer ${
                timelineRange === "month"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
              }`}
            >
              MONTH
            </button>
          </div>
        </div>

        {/* 5. Visibility Trend Chart Container */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible cursor-crosshair select-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
                let closestIdx = 0;
                let minDist = Infinity;
                activeTimelineDates.forEach((_, i) => {
                  const x = padding.left + (i / (activeTimelineDates.length - 1)) * plotWidth;
                  const dist = Math.abs(x - mouseX);
                  if (dist < minDist) {
                    minDist = dist;
                    closestIdx = i;
                  }
                });
                setHoverIndex(closestIdx);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Interactive column hover zones */}
              {activeTimelineDates.map((date, i) => {
                const colWidth = plotWidth / (activeTimelineDates.length - 1);
                const x = padding.left + i * colWidth - colWidth / 2;
                return (
                  <rect
                    key={`col-hover-${date}-${i}`}
                    x={i === 0 ? padding.left : x}
                    y={padding.top}
                    width={colWidth}
                    height={plotHeight}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoverIndex(i)}
                    data-testid={`chart-col-${date.replace(/\s+/, "-")}`}
                  />
                );
              })}

              {/* Vertical Y-axis label */}
              <text
                transform="rotate(-90)"
                x={-(padding.top + plotHeight / 2)}
                y={14}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 text-[9px] font-bold tracking-widest uppercase select-none"
              >
                VISIBILITY
              </text>

              {/* Horizontal gridlines & Y labels */}
              {yAxisTicks.map((val) => {
                const norm = val / chartMaxValue;
                const y = padding.top + (1 - norm) * plotHeight;
                return (
                  <g key={`ytick-${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-medium font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis date labels */}
              {activeTimelineDates.map((date, i) => {
                const x = padding.left + (i / (activeTimelineDates.length - 1)) * plotWidth;
                return (
                  <text
                    key={`xtick-${date}-${i}`}
                    x={x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px] font-medium font-mono cursor-pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    data-testid={`xtick-${date.replace(/\s+/, "-")}`}
                  >
                    {date}
                  </text>
                );
              })}

              {/* Multi-line curves */}
              {chartSeries.map((series) => {
                if (!series.isVisible) return null;
                const isHovered = hoveredDomain === series.domain;
                return (
                  <g key={`series-${series.domain}`}>
                    <path
                      d={series.pathD}
                      fill="none"
                      stroke={series.color}
                      strokeWidth={isHovered ? "3.5" : "2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-150"
                    />
                    {series.points.map((pt, i) => (
                      <circle
                        key={`pt-${series.domain}-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoverIndex === i || isHovered ? 4 : 2.5}
                        fill={series.color}
                        stroke="#ffffff"
                        className="dark:stroke-slate-900"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Vertical Dashed Guideline: stroke-dasharray="3,3" stroke="#64748b" */}
              {hoverIndex !== null && (
                <line
                  x1={padding.left + (hoverIndex / (activeTimelineDates.length - 1)) * plotWidth}
                  y1={padding.top}
                  x2={padding.left + (hoverIndex / (activeTimelineDates.length - 1)) * plotWidth}
                  y2={chartHeight - padding.bottom}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  data-testid="visibility-guideline"
                />
              )}

              {/* Dual-ring circular indicator on each intersecting data point */}
              {hoverIndex !== null &&
                chartSeries.map((series) => {
                  if (!series.isVisible) return null;
                  const pt = series.points[hoverIndex];
                  if (!pt) return null;
                  return (
                    <g key={`highlight-${series.domain}`} className="pointer-events-none">
                      {/* Outer colored border */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={6}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={2}
                      />
                      {/* Translucent center */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={3.5}
                        fill={series.color}
                        fillOpacity={0.4}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}
            </svg>

            {/* Left-anchored Floating Card Adjacent to Vertical Guideline */}
            {hoverIndex !== null && (
              <div
                data-testid="visibility-chart-tooltip"
                className="absolute z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-3.5 text-xs min-w-[220px] pointer-events-none transition-all duration-75 animate-in fade-in duration-100"
                style={{
                  top: "16px",
                  left:
                    (padding.left + (hoverIndex / (activeTimelineDates.length - 1)) * plotWidth) > chartWidth * 0.45
                      ? `calc(${((padding.left + (hoverIndex / (activeTimelineDates.length - 1)) * plotWidth) / chartWidth) * 100}% - 240px)`
                      : `calc(${((padding.left + (hoverIndex / (activeTimelineDates.length - 1)) * plotWidth) / chartWidth) * 100}% + 15px)`,
                }}
              >
                {/* Header: Date and Metric */}
                <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-wide">
                  {(() => {
                    const parts = activeTimelineDates[hoverIndex].split(" ");
                    const m = parts[0]?.toUpperCase() || "";
                    const d = parts[1] ? parts[1].padStart(2, "0") : "";
                    return `${m}-${d} 2026`;
                  })()}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                  VISIBILITY
                </div>

                {/* Data Rows: sorted descending by score */}
                <div className="space-y-0.5">
                  {tooltipRows.map((row) => (
                    <div
                      key={row.domain}
                      data-testid={`tooltip-row-${row.domain}`}
                      className="flex items-center gap-2 py-1 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="truncate">{row.domain}:</span>
                      <span className="font-mono font-semibold ml-auto">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Horizontal Legend Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {topDomains.map((domain) => {
              const isHidden = hiddenSeries.includes(domain.domain);
              const isHovered = hoveredDomain === domain.domain;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => toggleSeries(domain.domain)}
                  onMouseEnter={() => setHoveredDomain(domain.domain)}
                  onMouseLeave={() => setHoveredDomain(null)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition cursor-pointer ${
                    isHidden
                      ? "opacity-40 line-through text-slate-400"
                      : isHovered
                      ? "bg-slate-100 dark:bg-slate-800 font-bold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                  title={`${domain.domain} (Score: ${domain.visibility}) - click to toggle`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: domain.color }}
                  />
                  <span className="truncate max-w-[110px] font-mono text-[11px]">{domain.domain}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Table Toolbar & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        {/* Left: Search input */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search"
            value={domainSearch}
            onChange={(e) => {
              setDomainSearch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search domains"
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
          {domainSearch && (
            <button
              type="button"
              onClick={() => setDomainSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <div className="relative" ref={copyMenuRef}>
            <button
              type="button"
              onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)}
              aria-label="Copy table data"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            >
              <span>❐</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
            {isCopyMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-40 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsCopyMenuOpen(false);
                    showToast("Table copied to clipboard");
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Copy table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCopyMenuOpen(false);
                    showToast(`${selectedDomains.length} rows copied to clipboard`);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Copy selected rows ({selectedDomains.length})
                </button>
              </div>
            )}
          </div>

          {/* Filters Popover Container */}
          <div className="relative" ref={filterPanelRef}>
            <button
              type="button"
              onClick={() => {
                setIsFilterPanelOpen(!isFilterPanelOpen);
                if (isFilterPanelOpen) {
                  setIsGroupMenuOpen(false);
                  setIsTagsMenuOpen(false);
                }
              }}
              aria-label="Filter columns"
              aria-expanded={isFilterPanelOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs ${
                isFilterPanelOpen || hasActiveFilters
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>☰</span>
              <span>FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Popover Panel */}
            {isFilterPanelOpen && (
              <div
                role="dialog"
                aria-label="Filter domains panel"
                className="absolute right-0 top-full mt-2 w-96 max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">Filter Domains</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterPanelOpen(false);
                      setIsGroupMenuOpen(false);
                      setIsTagsMenuOpen(false);
                    }}
                    aria-label="Close filter panel"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1 rounded-md cursor-pointer leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Dual nested dropdowns: Group & Tags */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* 1. Group Dropdown */}
                  <div className="relative" ref={groupMenuRef}>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Group:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGroupMenuOpen(!isGroupMenuOpen);
                        setIsTagsMenuOpen(false);
                      }}
                      aria-label="Select group"
                      aria-expanded={isGroupMenuOpen}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 border rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs ${
                        selectedGroup !== "all" && selectedGroup !== "All groups"
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <span className="truncate">
                        {selectedGroup === "all" || selectedGroup === "All groups"
                          ? "All groups"
                          : selectedGroup}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 shrink-0">{isGroupMenuOpen ? "▲" : "▾"}</span>
                    </button>

                    {isGroupMenuOpen && (
                      <div
                        role="listbox"
                        aria-label="Group filter options"
                        className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-75"
                      >
                        {ALL_GROUPS.map((grp) => {
                          const isSelected =
                            (grp === "All groups" && (selectedGroup === "all" || selectedGroup === "All groups")) ||
                            grp.toLowerCase() === selectedGroup.toLowerCase();
                          return (
                            <button
                              key={grp}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedGroup(grp === "All groups" ? "all" : grp);
                                setIsGroupMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer transition ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-semibold"
                                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                              }`}
                            >
                              <span>{grp}</span>
                              {isSelected && <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Tags Dropdown */}
                  <div className="relative" ref={tagsMenuRef}>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tags:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTagsMenuOpen(!isTagsMenuOpen);
                        setIsGroupMenuOpen(false);
                      }}
                      aria-label="Select tags"
                      aria-expanded={isTagsMenuOpen}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 border rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs ${
                        selectedTags.length > 0 || withoutTagsChecked || allTagsChecked
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <span className="truncate">
                        {withoutTagsChecked
                          ? "Without tags"
                          : allTagsChecked
                          ? "All tags"
                          : selectedTags.length === 0
                          ? "Select tags"
                          : selectedTags.length === 1
                          ? selectedTags[0]
                          : `${selectedTags.length} tags`}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 shrink-0">{isTagsMenuOpen ? "▲" : "▾"}</span>
                    </button>

                    {isTagsMenuOpen && (
                      <div
                        role="region"
                        aria-label="Tags filter popover menu"
                        className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                      >
                        {/* Match logic switcher: Any (OR) / All (AND) */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Match:</span>
                          <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                            <button
                              type="button"
                              onClick={() => setTagMatchLogic("or")}
                              className={`px-2.5 py-1 font-semibold transition cursor-pointer ${
                                tagMatchLogic === "or"
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              Any (OR)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTagMatchLogic("and")}
                              className={`px-2.5 py-1 font-semibold border-l border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                                tagMatchLogic === "and"
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              All (AND)
                            </button>
                          </div>
                        </div>

                        {/* Search tags input */}
                        <div className="relative mb-2.5">
                          <input
                            type="text"
                            placeholder="Search tags..."
                            aria-label="Search tags in dropdown"
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            className="w-full pl-7 pr-7 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
                          {tagSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setTagSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5 cursor-pointer"
                              title="Clear tag search"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Special checkboxes: All tags / Without tags */}
                        <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                          <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={allTagsChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setAllTagsChecked(checked);
                                  if (checked) {
                                    setWithoutTagsChecked(false);
                                  }
                                }}
                                aria-label="All tags"
                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span>All tags</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {domainsWithTagsCount}
                            </span>
                          </label>
                          <label className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={withoutTagsChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setWithoutTagsChecked(checked);
                                  if (checked) {
                                    setAllTagsChecked(false);
                                    setSelectedTags([]);
                                  }
                                }}
                                aria-label="Without tags"
                                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span>Without tags</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {domainsWithoutTagsCount}
                            </span>
                          </label>
                        </div>

                        {/* Tags section header with All | Clear shortcuts */}
                        <div className="flex items-center justify-between pb-1.5 mb-1 px-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Filter by tags</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTags([...ALL_DOMAIN_TAGS]);
                                setWithoutTagsChecked(false);
                              }}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              All
                            </button>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <button
                              type="button"
                              onClick={() => setSelectedTags([])}
                              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Tags checklist */}
                        <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
                          {filteredTagList.length === 0 ? (
                            <div className="py-2 text-center text-slate-400 text-xs">
                              No tags found
                            </div>
                          ) : (
                            filteredTagList.map((tag) => {
                              const count = activeDomainsDataset.filter((d) => d.tags?.includes(tag)).length;
                              const isChecked = selectedTags.includes(tag);
                              return (
                                <label
                                  key={tag}
                                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-700 dark:text-slate-200 text-xs select-none"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setWithoutTagsChecked(false);
                                        setSelectedTags((prev) =>
                                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                        );
                                      }}
                                      aria-label={tag}
                                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                                    />
                                    <span className="truncate capitalize">{tag}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 ml-2 font-mono">
                                    {count}
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>

                        {/* Popover footer button */}
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsTagsMenuOpen(false)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter Panel Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {`${filteredDomains.length} matching ${filteredDomains.length === 1 ? "domain" : "domains"}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsFilterPanelOpen(false);
                        setIsGroupMenuOpen(false);
                        setIsTagsMenuOpen(false);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columns Button */}
          <div className="relative" ref={columnsMenuRef}>
            <button
              type="button"
              onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
              aria-expanded={isColumnsMenuOpen}
              aria-haspopup="dialog"
              aria-label="Customize columns"
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs ${
                isColumnsMenuOpen
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>COLUMNS</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {isColumnsMenuOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Table columns configuration"
                className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                    <span>Columns</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({activeColumnCount}/{columnDefinitions.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsColumnsMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer leading-none"
                    aria-label="Close columns menu"
                  >
                    ✕
                  </button>
                </div>

                {/* Search input */}
                <div className="relative mb-2.5">
                  <input
                    type="text"
                    placeholder="Search columns..."
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className="w-full pl-7 pr-7 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
                  {columnSearch && (
                    <button
                      type="button"
                      onClick={() => setColumnSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllColumns}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllColumns}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline cursor-pointer"
                    >
                      Deselect all
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetColumns}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Column items list */}
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                  {filteredColumns.length === 0 ? (
                    <div className="py-3 text-center text-slate-400 text-xs">
                      No columns match &quot;{columnSearch}&quot;
                    </div>
                  ) : (
                    filteredColumns.map((col) => {
                      const isChecked = visibleColumns[col.key];
                      return (
                        <label
                          key={col.key}
                          className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition select-none group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [col.key]: e.target.checked,
                              }))
                            }
                            className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-tight">
                              {col.label}
                            </span>
                            <span className="text-[10px] text-slate-400 leading-normal line-clamp-2 mt-0.5">
                              {col.description}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Done Button */}
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsColumnsMenuOpen(false)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Domains Visibility Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedDomains.length > 0 && selectedDomains.length === paginatedDomains.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all domains"
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("domain")}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>DOMAINS</span>
                    {sortColumn === "domain" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                  </div>
                </th>
                <th className="py-2.5 px-3">TAGS</th>
                {visibleColumns.visibility && (
                  <th
                    onClick={() => handleSort("visibility")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>VISIBILITY</span>
                      <span>{sortColumn === "visibility" ? (sortDirection === "asc" ? "▲" : "▾") : "▾"}</span>
                    </div>
                  </th>
                )}
                {visibleColumns.percentInTop10 && (
                  <th
                    onClick={() => handleSort("percentInTop10")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>% IN TOP 10</span>
                      {sortColumn === "percentInTop10" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.trafficForecast && (
                  <th
                    onClick={() => handleSort("trafficForecast")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>TRAFFIC FORECAST</span>
                      {sortColumn === "trafficForecast" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.keywords && (
                  <th
                    onClick={() => handleSort("keywords")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>KEYWORDS</span>
                      {sortColumn === "keywords" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.dt && (
                  <th
                    onClick={() => handleSort("dt")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>DT</span>
                      {sortColumn === "dt" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.backlinks && (
                  <th
                    onClick={() => handleSort("backlinks")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>BACKLINKS</span>
                      {sortColumn === "backlinks" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                {visibleColumns.referringDomains && (
                  <th
                    onClick={() => handleSort("referringDomains")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      <span>REFERRING DOMAINS</span>
                      {sortColumn === "referringDomains" && <span>{sortDirection === "asc" ? "▲" : "▾"}</span>}
                    </div>
                  </th>
                )}
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedDomains.length === 0 ? (
                <tr>
                  <td colSpan={3 + activeColumnCount + 1} className="py-10 text-center text-slate-400 text-xs">
                    No domains found matching {domainSearch ? `"${domainSearch}"` : "the selected filters"}
                  </td>
                </tr>
              ) : (
                paginatedDomains.map((domain) => {
                  const isChecked = selectedDomains.includes(domain.id);
                  const isHovered = hoveredDomain === domain.domain;
                  const metrics = getDomainMetrics(domain);
                  return (
                    <tr
                      key={domain.id}
                      onMouseEnter={() => setHoveredDomain(domain.domain)}
                      onMouseLeave={() => setHoveredDomain(null)}
                      style={{ borderLeft: `3px solid ${domain.color}` }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isHovered ? "bg-slate-50/90 dark:bg-slate-800/60" : ""
                      } ${isChecked ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDomain(domain.id)}
                          aria-label={`Select domain ${domain.domain}`}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Domain Name & Favicon */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: domain.color }}
                          />
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${domain.domain.replace(/^www\./, "")}&sz=32`}
                            alt=""
                            className="w-4 h-4 rounded-xs flex-shrink-0 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <a
                            href={`https://${domain.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-mono font-medium"
                          >
                            {domain.domain}
                          </a>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {domain.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Visibility Score */}
                      {visibleColumns.visibility && (
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {typeof domain.visibility === 'number'
                            ? (domain.visibility === 0 || domain.visibility === 100 || Number.isInteger(domain.visibility)
                              ? domain.visibility
                              : domain.visibility.toFixed(1))
                            : '0'}
                        </td>
                      )}

                      {/* % in Top 10 */}
                      {visibleColumns.percentInTop10 && (
                        <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300 font-mono">
                          {metrics.percentInTop10}%
                        </td>
                      )}

                      {/* Traffic Forecast Link */}
                      {visibleColumns.trafficForecast && (
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => showToast(`Traffic breakdown for ${domain.domain}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer font-mono"
                          >
                            {domain.trafficForecast.toLocaleString()}
                          </button>
                        </td>
                      )}

                      {/* Keywords */}
                      {visibleColumns.keywords && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-mono">
                          {metrics.keywords.toLocaleString()}
                        </td>
                      )}

                      {/* DT */}
                      {visibleColumns.dt && (
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            {metrics.dt}
                          </span>
                        </td>
                      )}

                      {/* Backlinks */}
                      {visibleColumns.backlinks && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-mono">
                          {metrics.backlinks.toLocaleString()}
                        </td>
                      )}

                      {/* Referring Domains */}
                      {visibleColumns.referringDomains && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-mono">
                          {metrics.referringDomains.toLocaleString()}
                        </td>
                      )}

                      {/* 3-dots action menu */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => showToast(`Options for ${domain.domain}`)}
                          aria-label={`Options for ${domain.domain}`}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 8. Bottom Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                setPageInput(String(Math.max(1, currentPage - 1)));
              }}
              aria-label="Previous page"
              className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={`page-${pg}`}
                type="button"
                onClick={() => {
                  setCurrentPage(pg);
                  setPageInput(String(pg));
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                  currentPage === pg
                    ? "bg-[#544f70] text-white shadow-xs"
                    : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                setPageInput(String(Math.min(totalPages, currentPage + 1)));
              }}
              aria-label="Next page"
              className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              ›
            </button>
          </div>

          {/* Go to page input */}
          <div className="flex items-center gap-2">
            <span>Go to page:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt(pageInput, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }
              }}
              className="w-12 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-center text-xs font-semibold text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span>View on page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
                setPageInput("1");
              }}
              aria-label="Rows per page"
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* 9. Export Modal */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export visibility data"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Export Visibility Data</h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Format:</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat("xlsx")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    exportFormat === "xlsx"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-bold">Excel (.xlsx)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Spreadsheet with formatting</div>
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    exportFormat === "csv"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-bold">CSV (.csv)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Raw comma-separated values</div>
                </button>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeKeywordsAndUrls}
                  onChange={(e) => setIncludeKeywordsAndUrls(e.target.checked)}
                  aria-label="Include keywords and URLs"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Include keywords and top ranking URLs</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  showToast(`Export downloaded: visibility_rating_${projectDomain}.${exportFormat}`);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
