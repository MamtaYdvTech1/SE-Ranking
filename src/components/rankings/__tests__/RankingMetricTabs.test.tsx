import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankingMetricTabs } from "../RankingMetricTabs";
import { RankingMetric } from "@/lib/rankingsTypes";

describe("RankingMetricTabs Component", () => {
  const mockMetrics: RankingMetric[] = [
    {
      id: "average_position",
      name: "Avg Position",
      status: "supported",
      formattedValue: "14.2",
      changeLabel: "+2.4",
      isPositive: true,
    },
    {
      id: "visibility",
      name: "Search Visibility",
      status: "supported",
      formattedValue: "42.8%",
      changeLabel: "-1.1%",
      isPositive: false,
    },
    {
      id: "traffic",
      name: "Traffic Forecast",
      status: "future_ready",
      formattedValue: "18.5K",
    },
    {
      id: "share_of_voice",
      name: "Share of Voice",
      status: "coming_soon",
      formattedValue: "—",
      phaseLabel: "Phase 4",
    },
  ];

  it("renders all metric tabs with labels and values", () => {
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={vi.fn()}
      />
    );

    expect(screen.getByRole("tablist", { name: /Ranking Metrics/i })).toBeInTheDocument();
    expect(screen.getByText("Avg Position")).toBeInTheDocument();
    expect(screen.getByText("14.2")).toBeInTheDocument();
    expect(screen.getByText("Search Visibility")).toBeInTheDocument();
    expect(screen.getByText("42.8%")).toBeInTheDocument();
    expect(screen.getByText("Phase 4")).toBeInTheDocument();
  });

  it("marks active metric with aria-selected=true", () => {
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={vi.fn()}
      />
    );

    const activeTab = screen.getByRole("tab", { name: /Avg Position/i });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    const inactiveTab = screen.getByRole("tab", { name: /Search Visibility/i });
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelectMetric when clicking an inactive supported metric", () => {
    const handleSelect = vi.fn();
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={handleSelect}
      />
    );

    const visibilityTab = screen.getByRole("tab", { name: /Search Visibility/i });
    fireEvent.click(visibilityTab);

    expect(handleSelect).toHaveBeenCalledWith("visibility");
  });

  it("calls onSelectMetric when clicking a future_ready metric", () => {
    const handleSelect = vi.fn();
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={handleSelect}
      />
    );

    const trafficTab = screen.getByRole("tab", { name: /Traffic Forecast/i });
    fireEvent.click(trafficTab);

    expect(handleSelect).toHaveBeenCalledWith("traffic");
  });

  it("disables coming_soon metric and does not trigger onSelectMetric", () => {
    const handleSelect = vi.fn();
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={handleSelect}
      />
    );

    const comingSoonTab = screen.getByRole("tab", { name: /Share of Voice/i });
    expect(comingSoonTab).toBeDisabled();
    expect(comingSoonTab).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(comingSoonTab);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("renders change labels with positive and negative indicators", () => {
    render(
      <RankingMetricTabs
        metrics={mockMetrics}
        activeMetric="average_position"
        onSelectMetric={vi.fn()}
      />
    );

    const positiveLabel = screen.getByText("+2.4");
    expect(positiveLabel.className).toContain("text-emerald-600");

    const negativeLabel = screen.getByText("-1.1%");
    expect(negativeLabel.className).toContain("text-red-600");
  });
});
