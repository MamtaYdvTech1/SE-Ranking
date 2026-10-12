import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankingTimeRangeControls } from "../RankingTimeRangeControls";

describe("RankingTimeRangeControls Component", () => {
  it("renders time ranges, group by dropdown, and view filter toggles", () => {
    const onTimeRangeChange = vi.fn();
    const onGroupByChange = vi.fn();
    const onViewFilterChange = vi.fn();

    render(
      <RankingTimeRangeControls
        timeRange="week"
        onTimeRangeChange={onTimeRangeChange}
        groupBy="days"
        onGroupByChange={onGroupByChange}
        viewFilter="all"
        onViewFilterChange={onViewFilterChange}
      />
    );

    // Time ranges
    expect(screen.getByRole("button", { name: "WEEK" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MONTH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3 MONTHS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6 MONTHS" })).toBeInTheDocument();

    // Group By
    const groupBySelect = screen.getByLabelText("Group by granularity") as HTMLSelectElement;
    expect(groupBySelect).toBeInTheDocument();
    expect(groupBySelect.value).toBe("days");

    // View filters
    expect(screen.getByRole("button", { name: "ALL" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "WEBSITES" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GROUPS" })).toBeInTheDocument();
  });

  it("triggers callbacks when options are clicked or changed", () => {
    const onTimeRangeChange = vi.fn();
    const onGroupByChange = vi.fn();
    const onViewFilterChange = vi.fn();

    render(
      <RankingTimeRangeControls
        timeRange="week"
        onTimeRangeChange={onTimeRangeChange}
        groupBy="days"
        onGroupByChange={onGroupByChange}
        viewFilter="all"
        onViewFilterChange={onViewFilterChange}
      />
    );

    // Click 3 MONTHS
    fireEvent.click(screen.getByRole("button", { name: "3 MONTHS" }));
    expect(onTimeRangeChange).toHaveBeenCalledWith("3months");

    // Change group by
    const groupBySelect = screen.getByLabelText("Group by granularity");
    fireEvent.change(groupBySelect, { target: { value: "weeks" } });
    expect(onGroupByChange).toHaveBeenCalledWith("weeks");

    // Click WEBSITES
    fireEvent.click(screen.getByRole("button", { name: "WEBSITES" }));
    expect(onViewFilterChange).toHaveBeenCalledWith("websites");
  });
});
