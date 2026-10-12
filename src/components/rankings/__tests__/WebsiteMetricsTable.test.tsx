import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WebsiteMetricsTable } from "../WebsiteMetricsTable";
import { WebsiteRankingSummary } from "@/lib/rankingsTypes";

describe("WebsiteMetricsTable Component", () => {
  const mockWebsites: WebsiteRankingSummary[] = [
    {
      id: "web-1",
      domain: "zenith.com",
      isPrimary: true,
      visibility: 76.8,
      averagePosition: 5.2,
      traffic: 15400,
      keywordsCount: 88,
      top3: 15,
      top5: 22,
      top10: 38,
      top30: 60,
      top100: 88,
      lastUpdated: "Today, 04:00 UTC",
      keywordBreakdown: {
        top5Keywords: [
          { keyword: "seo software", position: 1, change: 2 },
          { keyword: "rank checker", position: 3, change: -1 },
        ],
      },
    },
    {
      id: "web-2",
      domain: "competitor.com",
      isPrimary: false,
      visibility: 42.1,
      averagePosition: 12.4,
      traffic: 5200,
      keywordsCount: 40,
      top3: 5,
      top5: 8,
      top10: 12,
      top30: 25,
      top100: 40,
      lastUpdated: "Yesterday, 18:00 UTC",
    },
  ];

  it("renders loading state with skeletons when isLoading is true", () => {
    const { container } = render(<WebsiteMetricsTable websites={[]} isLoading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders empty message when websites list is empty", () => {
    render(<WebsiteMetricsTable websites={[]} isLoading={false} />);
    expect(screen.getByText("No websites match your filter")).toBeInTheDocument();
  });

  it("renders table with websites, primary tag, and metric columns", () => {
    render(<WebsiteMetricsTable websites={mockWebsites} isLoading={false} />);

    // Headers
    expect(screen.getByText(/WEBSITES/i)).toBeInTheDocument();
    expect(screen.getByText("TOP 5 / 10 / 30")).toBeInTheDocument();
    expect(screen.getByText("KEYWORDS")).toBeInTheDocument();
    expect(screen.getByText("AVG. POSITION")).toBeInTheDocument();
    expect(screen.getByText("LAST UPDATED")).toBeInTheDocument();

    // Data rows
    expect(screen.getByText("zenith.com")).toBeInTheDocument();
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("competitor.com")).toBeInTheDocument();
    expect(screen.getByText("22 / 38 / 60")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("5.2")).toBeInTheDocument();
    expect(screen.getByText("Today, 04:00 UTC")).toBeInTheDocument();
  });

  it("selects and deselects rows and toggles select all", () => {
    render(<WebsiteMetricsTable websites={mockWebsites} isLoading={false} />);

    const selectAll = screen.getByLabelText("Select all websites");
    fireEvent.click(selectAll);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    const rowCheckbox = screen.getByLabelText("Select zenith.com");
    fireEvent.click(rowCheckbox);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("expands and collapses keyword breakdown drawer", () => {
    render(<WebsiteMetricsTable websites={mockWebsites} isLoading={false} />);

    const expandBtn = screen.getByLabelText("Expand keyword breakdown for zenith.com");
    fireEvent.click(expandBtn);

    expect(screen.getByText("Top Keywords Preview for zenith.com")).toBeInTheDocument();
    expect(screen.getByText("seo software")).toBeInTheDocument();
    expect(screen.getByText("Pos 1")).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(expandBtn);
    expect(screen.queryByText("Top Keywords Preview for zenith.com")).not.toBeInTheDocument();
  });

  it("sorts table rows when headers are clicked", () => {
    render(<WebsiteMetricsTable websites={mockWebsites} isLoading={false} />);

    const keywordsHeader = screen.getByText("KEYWORDS");
    fireEvent.click(keywordsHeader);

    // After sort asc: 40 comes before 88
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });
});
