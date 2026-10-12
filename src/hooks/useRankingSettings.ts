import { useState, useEffect } from "react";

export interface RankingSettingsState {
  showCharts?: boolean;
  showAllSearchEngines?: boolean;
  defaultChart?: string;
  defaultSection?: string;
  keywordsPerPage?: number;
  webPageUrlDisplay?: string;
  selectedColumns?: string[];
  tableColumns?: string;
  rankingsDataAlignment?: string;
  amountOfDisplayedData?: number | string;
  defaultTableViewMode?: string;
  sortByColumn?: string;
  chartNotes?: string;
  selectedChartNotes?: string[];
  [key: string]: any;
}

export const ALL_TABLE_COLUMNS: string[] = [
  "URL",
  "Search vol.",
  "SERP features",
  "Content Score",
  "Dynamics",
  "Tags",
  "Group",
  "Date added",
  "Competition",
  "CPC",
  "Results",
  "Traffic Forecast",
  "Visibility",
  "Notes",
  "Clicks",
];

export const DEFAULT_SELECTED_COLUMNS: string[] = [
  "URL",
  "Search vol.",
  "SERP features",
  "Content Score",
  "Dynamics",
];

export const DEFAULT_CHART_OPTIONS: string[] = [
  "Average position",
  "Traffic forecast",
  "Search visibility",
  "SERP features",
  "% in Top 10",
  "Selected keywords",
];

export const DEFAULT_SECTION_OPTIONS: string[] = [
  "Detailed",
  "Summary",
  "Historical Data",
  "Competitors",
];

export const AMOUNT_OF_DATA_OPTIONS: (number | string)[] = [
  7,
  14,
  30,
  60,
  90,
  180,
  "All",
];

export const DEFAULT_TABLE_VIEW_MODE_OPTIONS: string[] = [
  "Default",
  "By Groups",
  "By Pages",
  "By Tags",
];

export const SORT_BY_COLUMN_OPTIONS: string[] = [
  "Default",
  "Keywords",
  "Position",
  "Change",
  "Search volume",
  "URL",
  "Date added",
];

export interface NoteTypeOption {
  id: string;
  label: string;
  icon?: string;
}

export const NOTE_TYPE_OPTIONS: NoteTypeOption[] = [
  { id: "Keyword note", label: "Keyword note" },
  { id: "Project note", label: "Project note" },
  { id: "Google update", label: "Google update" },
  { id: "Important update", label: "Important update" },
  { id: "Keywords added", label: "Keywords added" },
];

export const DEFAULT_SELECTED_CHART_NOTES: string[] = [
  "Keyword note",
  "Project note",
  "Google update",
  "Important update",
  "Keywords added",
];

export const CHART_NOTES_PRESETS: string[] = [
  "All notes",
  "Project notes only",
  "Algorithm updates only",
  "Disabled",
  "Keyword note, Project note, Google update, Important update...",
];

export function formatChartNotesSummary(notes?: string[]): string {
  if (!notes || notes.length === 0) return "Disabled";
  if (
    notes.length === DEFAULT_SELECTED_CHART_NOTES.length &&
    DEFAULT_SELECTED_CHART_NOTES.every((n) => notes.includes(n))
  ) {
    return "All notes";
  }
  if (notes.length === 1 && notes[0] === "Project note") {
    return "Project notes only";
  }
  if (
    notes.length === 2 &&
    notes.includes("Google update") &&
    notes.includes("Important update")
  ) {
    return "Algorithm updates only";
  }
  return notes.join(", ");
}

export function filterDatesByAmount(dates: string[], amount?: string | number): string[] {
  if (!dates || dates.length === 0) return [];
  if (!amount || amount === "all" || amount === "All") return dates;
  const count = typeof amount === "number" ? amount : parseInt(String(amount).replace(/\D/g, ""), 10);
  if (isNaN(count) || count <= 0) return dates;
  return dates.slice(-count);
}

export const defaultRankingSettings: RankingSettingsState = {
  showCharts: true,
  showAllSearchEngines: false,
  defaultChart: "Average position",
  defaultSection: "Detailed",
  keywordsPerPage: 100,
  webPageUrlDisplay: "Full URL",
  selectedColumns: DEFAULT_SELECTED_COLUMNS,
  tableColumns: DEFAULT_SELECTED_COLUMNS.join(", "),
  rankingsDataAlignment: "Left to right",
  amountOfDisplayedData: 14,
  defaultTableViewMode: "Default",
  sortByColumn: "Default",
  chartNotes: "All notes",
  selectedChartNotes: DEFAULT_SELECTED_CHART_NOTES,
};

export function useRankingSettings(projectId?: string) {
  const [settings, setSettings] = useState<RankingSettingsState>(defaultRankingSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!projectId || typeof window === "undefined" || !window.localStorage) return;
    try {
      const stored = localStorage.getItem(`ranking_settings_${projectId}`);
      if (stored) {
        setSettings({ ...defaultRankingSettings, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, [projectId]);

  const updateSettings = (newSettings: Partial<RankingSettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (projectId && typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem(`ranking_settings_${projectId}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  return { settings, updateSettings, isLoaded };
}
