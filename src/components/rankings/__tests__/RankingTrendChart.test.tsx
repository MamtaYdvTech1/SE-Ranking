import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankingTrendChart, DEFAULT_TIMELINE_NOTES } from "../RankingTrendChart";

describe("RankingTrendChart Component", () => {
  const mockData = [
    { date: "2026-03-24", value: 6.5, label: "Mar 24" },
    { date: "2026-03-26", value: 5.8, label: "Mar 26" },
    { date: "2026-03-28", value: 5.4, label: "Mar 28" },
    { date: "2026-03-30", value: 5.2, label: "Mar 30" },
  ];

  it("renders loading state with skeletons when isLoading is true", () => {
    const { container } = render(
      <RankingTrendChart
        data={[]}
        metric="average_position"
        metricName="AVERAGE POSITION"
        domain="zenith.com"
        isLoading={true}
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders error state with retry button when error is provided", () => {
    const onRetry = vi.fn();
    render(
      <RankingTrendChart
        data={[]}
        metric="average_position"
        metricName="AVERAGE POSITION"
        domain="zenith.com"
        error="Failed to load trend data"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText("Failed to load trend data")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /Retry Loading Chart Data/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when data is empty", () => {
    render(
      <RankingTrendChart
        data={[]}
        metric="average_position"
        metricName="AVERAGE POSITION"
        domain="zenith.com"
      />
    );

    expect(screen.getByText("No ranking data recorded")).toBeInTheDocument();
    expect(
      screen.getByText("No historical position snapshots match the selected time range or metric.")
    ).toBeInTheDocument();
  });

  it("renders SVG chart with points, Y-axis label, domain, and timeline notes", () => {
    render(
      <RankingTrendChart
        data={mockData}
        metric="average_position"
        metricName="AVERAGE POSITION"
        domain="zenith.com"
      />
    );

    // Metric label & Domain in legend
    expect(screen.getAllByText("AVERAGE POSITION").length).toBeGreaterThan(0);
    expect(screen.getAllByText("zenith.com").length).toBeGreaterThan(0);

    // Date labels
    expect(screen.getAllByText("Mar 24").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mar 30").length).toBeGreaterThan(0);

    // Notes displayed
    expect(screen.getByText("Timeline notes:")).toBeInTheDocument();
  });

  it("filters notes when selectedChartNotes is supplied", () => {
    render(
      <RankingTrendChart
        data={mockData}
        metric="average_position"
        metricName="AVERAGE POSITION"
        domain="zenith.com"
        selectedChartNotes={["Google update"]}
      />
    );

    expect(screen.getByText("Google update")).toBeInTheDocument();
    expect(screen.queryByText("Keywords added")).not.toBeInTheDocument();
  });
});
