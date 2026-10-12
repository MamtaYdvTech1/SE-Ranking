import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  RankingsHeader,
  filterDatesByAmount,
  DEFAULT_SELECTED_COLUMNS,
  defaultRankingSettings,
} from "../RankingsHeader";
import { ProjectDetailDto } from "@/lib/types";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com", role: "Owner" },
    isAuthenticated: true,
    isViewer: false,
    logout: vi.fn(),
  }),
}));

describe("RankingsHeader Component", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-123",
    name: "Test Project",
    primaryDomain: "example.com",
    role: "Owner",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  it("renders header title, badge, description, and keywords quota badge", () => {
    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
        title="Detailed Rankings"
        description="Comprehensive matrix view"
        badge="Live SERP"
        badgeColor="blue"
        keywordsCount={48}
        totalKeywordsLimit={750}
      />
    );

    expect(screen.getByText("Detailed Rankings")).toBeInTheDocument();
    expect(screen.getByText("Live SERP")).toBeInTheDocument();
    expect(screen.getByText("Comprehensive matrix view")).toBeInTheDocument();
    expect(screen.getByText(/Keyword limits: 48 \/ 750/)).toBeInTheDocument();
  });

  it("renders subtabs via RankingsSubnav", () => {
    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
      />
    );

    expect(screen.getByRole("link", { name: /Summary/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Detailed/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Historical Data/i })).toBeInTheDocument();
  });

  it("triggers onRecheck and onAddKeywords actions", () => {
    const handleRecheck = vi.fn();
    const handleAddKeywords = vi.fn();

    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
        onRecheck={handleRecheck}
        onAddKeywords={handleAddKeywords}
      />
    );

    fireEvent.click(screen.getByText("Recheck Data"));
    expect(handleRecheck).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("+ Add Keywords"));
    expect(handleAddKeywords).toHaveBeenCalledTimes(1);
  });

  it("opens ranking settings modal and allows toggling columns", () => {
    const handleSaveSettings = vi.fn();

    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
        onSaveRankingSettings={handleSaveSettings}
      />
    );

    // Open settings dropdown gear
    const gearBtn = screen.getByTitle("Rankings Module Settings");
    fireEvent.click(gearBtn);

    // Click "Ranking settings"
    fireEvent.click(screen.getByText("Ranking settings"));
    expect(screen.getByRole("heading", { name: "Ranking settings" })).toBeInTheDocument();

    // Navigate to Table columns sub-view
    fireEvent.click(screen.getByTitle("Configure visible table columns"));
    expect(screen.getByRole("heading", { name: "Table columns" })).toBeInTheDocument();

    // Toggle a column, e.g. "Notes"
    fireEvent.click(screen.getByText("Notes"));

    // Click APPLY in Table columns footer
    const applyButtons = screen.getAllByText("APPLY");
    fireEvent.click(applyButtons[0]);

    expect(handleSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedColumns: expect.arrayContaining(["Notes"]),
      })
    );
  });

  it("opens dual calendar date picker and applies a preset", () => {
    const handleDateRangeChange = vi.fn();

    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
        onDateRangeChange={handleDateRangeChange}
      />
    );

    const datePickerBtn = screen.getByTitle("Click to choose comparison date range");
    fireEvent.click(datePickerBtn);

    expect(screen.getByText("Select Date Range")).toBeInTheDocument();

    // Click PAST 7 DAYS preset
    fireEvent.click(screen.getByText("PAST 7 DAYS"));

    // Click APPLY
    fireEvent.click(screen.getByText("APPLY"));
    expect(handleDateRangeChange).toHaveBeenCalledTimes(1);
  });

  it("opens export modal dialog and executes export", () => {
    const handleExport = vi.fn();

    render(
      <RankingsHeader
        project={mockProject}
        activeSubTab="Detailed"
        onExport={handleExport}
      />
    );

    fireEvent.click(screen.getByTitle("Export rankings data"));
    expect(screen.getByRole("heading", { name: "Export data" })).toBeInTheDocument();

    // Click EXPORT inside modal
    const exportBtns = screen.getAllByRole("button", { name: "EXPORT" });
    fireEvent.click(exportBtns[exportBtns.length - 1]);

    expect(handleExport).toHaveBeenCalledWith("xlsx");
  });

  it("filterDatesByAmount utility functions properly", () => {
    const dates = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05"];

    expect(filterDatesByAmount(dates, 3)).toEqual(["2026-03-03", "2026-03-04", "2026-03-05"]);
    expect(filterDatesByAmount(dates, "2")).toEqual(["2026-03-04", "2026-03-05"]);
    expect(filterDatesByAmount(dates, "all")).toEqual(dates);
    expect(filterDatesByAmount([], 5)).toEqual([]);
  });
});
