import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useRankingSettings,
  defaultRankingSettings,
  filterDatesByAmount,
  formatChartNotesSummary,
} from "../useRankingSettings";

describe("useRankingSettings hook & utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default ranking settings", () => {
    const { result } = renderHook(() => useRankingSettings("proj-1"));

    expect(result.current.settings.showCharts).toBe(true);
    expect(result.current.settings.amountOfDisplayedData).toBe(14);
    expect(result.current.settings.defaultChart).toBe("Average position");
  });

  it("updates settings and saves to localStorage", () => {
    const { result } = renderHook(() => useRankingSettings("proj-1"));

    act(() => {
      result.current.updateSettings({ amountOfDisplayedData: 30, showCharts: false });
    });

    expect(result.current.settings.amountOfDisplayedData).toBe(30);
    expect(result.current.settings.showCharts).toBe(false);

    const saved = JSON.parse(localStorage.getItem("ranking_settings_proj-1") || "{}");
    expect(saved.amountOfDisplayedData).toBe(30);
    expect(saved.showCharts).toBe(false);
  });

  it("formatChartNotesSummary summarizes presets accurately", () => {
    expect(formatChartNotesSummary([])).toBe("Disabled");
    expect(
      formatChartNotesSummary([
        "Keyword note",
        "Project note",
        "Google update",
        "Important update",
        "Keywords added",
      ])
    ).toBe("All notes");
    expect(formatChartNotesSummary(["Project note"])).toBe("Project notes only");
    expect(formatChartNotesSummary(["Google update", "Important update"])).toBe("Algorithm updates only");
    expect(formatChartNotesSummary(["Keyword note"])).toBe("Keyword note");
  });

  it("filterDatesByAmount slices date lists properly", () => {
    const dates = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"];
    expect(filterDatesByAmount(dates, 2)).toEqual(["2026-03-03", "2026-03-04"]);
    expect(filterDatesByAmount(dates, "All")).toEqual(dates);
    expect(filterDatesByAmount([], 2)).toEqual([]);
  });
});
