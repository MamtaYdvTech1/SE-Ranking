import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { VisibilityRatingView } from "../VisibilityRatingView";
import { CompetitorDto } from "@/lib/types";

describe("VisibilityRatingView Component", { timeout: 15000 }, () => {
  const mockCompetitors: CompetitorDto[] = [
    {
      id: "comp-1",
      name: "GetComposer",
      domain: "getcomposer.org",
    },
    {
      id: "comp-2",
      name: "SourceForge",
      domain: "sourceforge.net",
    },
  ];

  const defaultProps = {
    projectId: "proj-123",
    projectDomain: "workcomposer.com",
    competitors: mockCompetitors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== "undefined") {
      window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders notice banner, breadcrumbs, action controls, view tabs, chart, and table by default", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    expect(screen.getByTestId("visibility-rating-view")).toBeInTheDocument();
    expect(screen.getByTestId("visibility-notice-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/We collect every site in the top 10 for each tracked keyword/i)
    ).toBeInTheDocument();

    // Breadcrumbs
    expect(screen.getByText("My Competitors")).toBeInTheDocument();
    expect(screen.getByText("Visibility Rating")).toBeInTheDocument();

    // Action controls
    expect(screen.getByRole("button", { name: "Select search engine" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export visibility data" })).toBeInTheDocument();

    // Primary View Tabs
    expect(screen.getByRole("button", { name: "VISIBILITY" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "TRAFFIC FORECAST" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "% IN TOP 10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "COMPETITOR DISTRIBUTION" })).toBeInTheDocument();

    // Timeline buttons
    expect(screen.getByRole("button", { name: "WEEK" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2 WEEKS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MONTH" })).toBeInTheDocument();

    // Table headers by default
    const table = screen.getByRole("table");
    expect(within(table).getByText("DOMAINS")).toBeInTheDocument();
    expect(within(table).getByText("TAGS")).toBeInTheDocument();
    expect(within(table).getByText("VISIBILITY")).toBeInTheDocument();
    expect(within(table).getByText("TRAFFIC FORECAST")).toBeInTheDocument();
    expect(within(table).getByText("KEYWORDS")).toBeInTheDocument();
    expect(within(table).getByText("BACKLINKS")).toBeInTheDocument();
    expect(within(table).getByText("REFERRING DOMAINS")).toBeInTheDocument();

    // Table rows
    expect(within(table).getByText("getcomposer.org")).toBeInTheDocument();
    expect(within(table).getByText("sourceforge.net")).toBeInTheDocument();
  });

  it("dismisses the top notice alert banner when clicking close button", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const dismissBtn = screen.getByLabelText("Dismiss notice");
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId("visibility-notice-banner")).not.toBeInTheDocument();
  });

  it("switches search engine via dropdown", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const engineBtn = screen.getByRole("button", { name: "Select search engine" });
    fireEvent.click(engineBtn);

    const googleDesktopOption = screen.getByRole("button", { name: "Google Desktop" });
    fireEvent.click(googleDesktopOption);

    expect(screen.getByText("Google Desktop")).toBeInTheDocument();
    expect(screen.getByText("Engine updated: Google Desktop")).toBeInTheDocument();
  });

  it("opens single-date comparison calendar, navigates months, selects a day, and applies it", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const dateBtn = screen.getByRole("button", { name: "Select date" });
    fireEvent.click(dateBtn);

    const popover = screen.getByTestId("visibility-calendar-popover");
    expect(popover).toBeInTheDocument();

    // Month headers and navigation
    const prevMonthBtn = screen.getByRole("button", { name: "Previous month" });
    fireEvent.click(prevMonthBtn);

    const nextMonthBtn = screen.getByRole("button", { name: "Next month" });
    fireEvent.click(nextMonthBtn);

    // Select date 18 Sep 2026
    const day18 = screen.getByRole("button", { name: "18 September 2026" });
    fireEvent.click(day18);

    // Click Apply
    const applyBtn = screen.getByRole("button", { name: "APPLY" });
    fireEvent.click(applyBtn);

    expect(screen.queryByTestId("visibility-calendar-popover")).not.toBeInTheDocument();
    expect(screen.getByText("18 Sep 2026")).toBeInTheDocument();
    expect(screen.getByText("Active evaluation date updated to 18 Sep 2026")).toBeInTheDocument();
  });

  it("discards staged date when clicking CANCEL in calendar popover", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const dateBtn = screen.getByRole("button", { name: "Select date" });
    fireEvent.click(dateBtn);

    const day15 = screen.getByRole("button", { name: "15 September 2026" });
    fireEvent.click(day15);

    const cancelBtn = screen.getByRole("button", { name: "CANCEL" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId("visibility-calendar-popover")).not.toBeInTheDocument();
    expect(screen.getByText("19 Sep 2026")).toBeInTheDocument();
  });

  it("switches primary view tabs and sub-interval timeline duration", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    // Click Traffic Forecast tab
    const trafficTab = screen.getByRole("button", { name: "TRAFFIC FORECAST" });
    fireEvent.click(trafficTab);
    expect(trafficTab).toHaveClass("text-blue-600");

    // Click % in Top 10 tab
    const top10Tab = screen.getByRole("button", { name: "% IN TOP 10" });
    fireEvent.click(top10Tab);
    expect(top10Tab).toHaveClass("text-blue-600");

    // Click Competitor Distribution tab
    const distTab = screen.getByRole("button", { name: "COMPETITOR DISTRIBUTION" });
    fireEvent.click(distTab);
    expect(distTab).toHaveClass("text-blue-600");

    // Switch timeline
    const twoWeeksBtn = screen.getByRole("button", { name: "2 WEEKS" });
    fireEvent.click(twoWeeksBtn);
    expect(twoWeeksBtn).toHaveClass("text-blue-600");

    const monthBtn = screen.getByRole("button", { name: "MONTH" });
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveClass("text-blue-600");
  });

  it("displays guideline and floating tooltip on chart tick hover, and toggles legend series", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    expect(screen.queryByTestId("visibility-guideline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("visibility-chart-tooltip")).not.toBeInTheDocument();

    // Hover over X tick
    const tickSep16 = screen.getByTestId("xtick-Sep-16");
    fireEvent.mouseEnter(tickSep16);

    expect(screen.getByTestId("visibility-guideline")).toBeInTheDocument();
    const tooltip = screen.getByTestId("visibility-chart-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(within(tooltip).getByText(/SEP-16 2026/i)).toBeInTheDocument();
    expect(within(tooltip).getByText("VISIBILITY")).toBeInTheDocument();

    // Toggle legend item for getcomposer.org
    const legendBtn = screen.getByTitle(/getcomposer.org.*click to toggle/i);
    fireEvent.click(legendBtn);
    expect(legendBtn).toHaveClass("opacity-40", "line-through");

    // Clicking again restores series
    fireEvent.click(legendBtn);
    expect(legendBtn).not.toHaveClass("opacity-40");
  });

  it("filters domains via search input and clears search", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const searchInput = screen.getByRole("textbox", { name: "Search domains" });
    fireEvent.change(searchInput, { target: { value: "github" } });

    const table = screen.getByRole("table");
    expect(within(table).getByText("github.com")).toBeInTheDocument();
    expect(within(table).queryByText("getcomposer.org")).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByRole("button", { name: "✕" });
    fireEvent.click(clearBtn);

    expect(within(table).getByText("getcomposer.org")).toBeInTheDocument();
  });

  it("filters domains by group and by tags using the FILTERS popover panel", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const filterBtn = screen.getByRole("button", { name: "Filter columns" });
    fireEvent.click(filterBtn);

    expect(screen.getByRole("dialog", { name: "Filter domains panel" })).toBeInTheDocument();

    // 1. Filter by Group: select 'Competitors'
    const groupDropdownBtn = screen.getByRole("button", { name: "Select group" });
    fireEvent.click(groupDropdownBtn);

    const competitorsOption = screen.getByRole("option", { name: "Competitors" });
    fireEvent.click(competitorsOption);

    // Verify filter badge on FILTERS button
    expect(within(filterBtn).getByText("1")).toBeInTheDocument();

    // 2. Filter by Tags: open tags dropdown
    const tagsDropdownBtn = screen.getByRole("button", { name: "Select tags" });
    fireEvent.click(tagsDropdownBtn);

    const coreTagCheckbox = screen.getByRole("checkbox", { name: "core" });
    fireEvent.click(coreTagCheckbox);

    // Click Done on tags menu
    const doneTagBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneTagBtn);

    // Close filter panel
    const closePanelBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closePanelBtn);

    expect(screen.queryByRole("dialog", { name: "Filter domains panel" })).not.toBeInTheDocument();

    // Reopen and reset filters
    fireEvent.click(filterBtn);
    const resetFiltersBtn = screen.getByRole("button", { name: "Reset filters" });
    fireEvent.click(resetFiltersBtn);

    expect(screen.getByText("Filters reset: Showing all domains")).toBeInTheDocument();
  });

  it("configures table columns via COLUMNS dropdown menu", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const columnsBtn = screen.getByRole("button", { name: "Customize columns" });
    fireEvent.click(columnsBtn);

    const columnsModal = screen.getByRole("dialog", { name: "Table columns configuration" });
    expect(columnsModal).toBeInTheDocument();

    // Toggle '% in Top 10'
    const percentInTop10Checkbox = within(columnsModal).getByRole("checkbox", { name: /% in Top 10/i });
    fireEvent.click(percentInTop10Checkbox);

    // Header '% IN TOP 10' should now be visible in table
    const table = screen.getByRole("table");
    expect(within(table).getByText("% IN TOP 10")).toBeInTheDocument();

    // Click 'Deselect all'
    const deselectAllBtn = screen.getByRole("button", { name: "Deselect all" });
    fireEvent.click(deselectAllBtn);

    // Click 'Select all'
    const selectAllBtn = screen.getByRole("button", { name: "Select all" });
    fireEvent.click(selectAllBtn);

    // Click 'Reset'
    const resetBtn = screen.getByRole("button", { name: "Reset" });
    fireEvent.click(resetBtn);
    expect(screen.getByText("Columns reset to default")).toBeInTheDocument();

    // Close columns dropdown
    const doneBtn = within(columnsModal).getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);
    expect(screen.queryByRole("dialog", { name: "Table columns configuration" })).not.toBeInTheDocument();
  });

  it("handles master and individual checkbox domain selection", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const selectAllCheckbox = screen.getByRole("checkbox", { name: "Select all domains" });
    fireEvent.click(selectAllCheckbox);

    const domainCheckbox = screen.getByRole("checkbox", { name: "Select domain getcomposer.org" });
    expect(domainCheckbox).toBeChecked();

    // Uncheck master
    fireEvent.click(selectAllCheckbox);
    expect(domainCheckbox).not.toBeChecked();

    // Check individual domain
    fireEvent.click(domainCheckbox);
    expect(domainCheckbox).toBeChecked();
  });

  it("copies table and selected rows via Copy dropdown", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const copyBtn = screen.getByRole("button", { name: "Copy table data" });
    fireEvent.click(copyBtn);

    const copyTableBtn = screen.getByRole("button", { name: "Copy table" });
    fireEvent.click(copyTableBtn);
    expect(screen.getByText("Table copied to clipboard")).toBeInTheDocument();

    // Copy selected rows
    fireEvent.click(copyBtn);
    const copySelectedBtn = screen.getByRole("button", { name: /Copy selected rows/i });
    fireEvent.click(copySelectedBtn);
    expect(screen.getByText(/0 rows copied to clipboard/i)).toBeInTheDocument();
  });

  it("sorts table columns when headers are clicked", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const table = screen.getByRole("table");
    const domainsHeader = within(table).getByText("DOMAINS");
    fireEvent.click(domainsHeader);

    // Sort by visibility
    const visibilityHeader = within(table).getByText("VISIBILITY");
    fireEvent.click(visibilityHeader);
  });

  it("triggers traffic breakdown and row options toasts", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const trafficLink = screen.getByRole("button", { name: "4,850" });
    fireEvent.click(trafficLink);
    expect(screen.getByText("Traffic breakdown for getcomposer.org")).toBeInTheDocument();

    const optionsBtn = screen.getByRole("button", { name: "Options for getcomposer.org" });
    fireEvent.click(optionsBtn);
    expect(screen.getByText("Options for getcomposer.org")).toBeInTheDocument();
  });

  it("handles pagination controls", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    // Change rows per page to 25
    const rowsSelect = screen.getByRole("combobox", { name: "Rows per page" });
    fireEvent.change(rowsSelect, { target: { value: "25" } });
    expect(rowsSelect).toHaveValue("25");

    // Next page
    const nextBtn = screen.getByRole("button", { name: "Next page" });
    expect(nextBtn).toBeDisabled(); // All items fit on 1 page with 25 rows (total 16 items)
  });

  it("opens export modal, selects format, toggles options, and downloads export", () => {
    render(<VisibilityRatingView {...defaultProps} />);

    const exportBtn = screen.getByRole("button", { name: "Export visibility data" });
    fireEvent.click(exportBtn);

    const modal = screen.getByRole("dialog", { name: "Export visibility data" });
    expect(modal).toBeInTheDocument();

    // Select CSV format
    const csvBtn = screen.getByRole("button", { name: /CSV \(\.csv\)/i });
    fireEvent.click(csvBtn);

    // Toggle include keywords and URLs
    const includeCheckbox = screen.getByRole("checkbox", { name: "Include keywords and URLs" });
    fireEvent.click(includeCheckbox);
    expect(includeCheckbox).toBeChecked();

    // Click Export
    const modalExportBtn = within(modal).getByRole("button", { name: "EXPORT" });
    fireEvent.click(modalExportBtn);

    expect(screen.queryByRole("dialog", { name: "Export visibility data" })).not.toBeInTheDocument();
    expect(screen.getByText(/Export downloaded: visibility_rating_workcomposer.com.csv/i)).toBeInTheDocument();
  });
});
