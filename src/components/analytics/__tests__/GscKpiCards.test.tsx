import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GscKpiCards } from "../GscKpiCards";

describe("GscKpiCards Component", () => {
  const defaultProps = {
    totalClicks: 14850,
    totalImpressions: 215400,
    averageCtr: 0.0689,
    averagePosition: 6.2,
  };

  it("renders all 4 GSC KPI cards with values and subtitles", () => {
    render(<GscKpiCards {...defaultProps} />);

    expect(screen.getByTestId("gsc-kpi-cards")).toBeInTheDocument();

    // 1. Total Clicks
    const clicksCard = screen.getByTestId("kpi-clicks");
    expect(clicksCard).toHaveTextContent("Total Clicks");
    expect(clicksCard).toHaveTextContent("First-party search clicks");

    // 2. Total Impressions
    const impressionsCard = screen.getByTestId("kpi-impressions");
    expect(impressionsCard).toHaveTextContent("Total Impressions");
    expect(impressionsCard).toHaveTextContent("Search result appearances");

    // 3. Average CTR
    const ctrCard = screen.getByTestId("kpi-ctr");
    expect(ctrCard).toHaveTextContent("Average CTR");
    expect(ctrCard).toHaveTextContent("6.9%");
    expect(ctrCard).toHaveTextContent("Click-through rate");

    // 4. GSC Avg. Position
    const positionCard = screen.getByTestId("kpi-position");
    expect(positionCard).toHaveTextContent("GSC Avg. Position");
    expect(positionCard).toHaveTextContent("6.2");
    expect(positionCard).toHaveTextContent("1st-Party Google Data");
  });

  it("renders dash fallback when average position is zero or negative", () => {
    render(
      <GscKpiCards
        totalClicks={0}
        totalImpressions={0}
        averageCtr={0}
        averagePosition={0}
      />
    );

    const positionCard = screen.getByTestId("kpi-position");
    expect(positionCard).toHaveTextContent("—");
  });

  it("formats fractional position correctly", () => {
    render(
      <GscKpiCards
        totalClicks={500}
        totalImpressions={10000}
        averageCtr={0.05}
        averagePosition={14.82}
      />
    );

    const positionCard = screen.getByTestId("kpi-position");
    expect(positionCard).toHaveTextContent("14.8");
  });
});
