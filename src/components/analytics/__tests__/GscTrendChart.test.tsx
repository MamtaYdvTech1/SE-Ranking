import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GscTrendChart } from "../GscTrendChart";
import { GscDailyPointDto } from "@/lib/types";

describe("GscTrendChart Component", () => {
  const mockSeries: GscDailyPointDto[] = [
    { date: "2026-03-01", clicks: 420, impressions: 6800, ctr: 0.0617, averagePosition: 6.4 },
    { date: "2026-03-02", clicks: 510, impressions: 7900, ctr: 0.0645, averagePosition: 6.1 },
    { date: "2026-03-03", clicks: 480, impressions: 7400, ctr: 0.0648, averagePosition: 6.3 },
  ];

  it("renders empty fallback message when series is empty", () => {
    render(<GscTrendChart series={[]} />);

    expect(
      screen.getByText("No Search Console daily performance records available for this date window.")
    ).toBeInTheDocument();
  });

  it("renders header, metric switcher, SVG paths, and dates", () => {
    render(<GscTrendChart series={mockSeries} />);

    expect(screen.getByText("Performance Over Time")).toBeInTheDocument();
    expect(screen.getByText("Daily Google Search Console trends")).toBeInTheDocument();

    // Metric buttons
    expect(screen.getByRole("button", { name: "clicks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "impressions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CTR" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avg. Pos" })).toBeInTheDocument();

    // Dates
    expect(screen.getByText("2026-03-01")).toBeInTheDocument();
    expect(screen.getByText("2026-03-02")).toBeInTheDocument();
    expect(screen.getByText("2026-03-03")).toBeInTheDocument();
  });

  it("switches active metric and updates active button state", () => {
    render(<GscTrendChart series={mockSeries} />);

    const ctrBtn = screen.getByRole("button", { name: "CTR" });
    fireEvent.click(ctrBtn);
    expect(ctrBtn).toHaveClass("bg-slate-800");

    const posBtn = screen.getByRole("button", { name: "Avg. Pos" });
    fireEvent.click(posBtn);
    expect(posBtn).toHaveClass("bg-slate-800");

    const impBtn = screen.getByRole("button", { name: "impressions" });
    fireEvent.click(impBtn);
    expect(impBtn).toHaveClass("bg-slate-800");
  });
});
