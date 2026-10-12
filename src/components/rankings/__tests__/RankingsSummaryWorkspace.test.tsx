import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RankingsSummaryWorkspace } from "../RankingsSummaryWorkspace";
import { api } from "@/lib/api";
import { ProjectDetailDto, RankingsSummaryDto } from "@/lib/types";

// Mock API
vi.mock("@/lib/api", () => ({
  api: {
    rankings: {
      getSummary: vi.fn(),
    },
    keywords: {
      create: vi.fn(),
    },
  },
}));

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com", role: "Owner" },
    isAuthenticated: true,
    isViewer: false,
    logout: vi.fn(),
  }),
}));

describe("RankingsSummaryWorkspace Component", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-sum-1",
    name: "Apex Digital",
    primaryDomain: "apexdigital.com",
    primaryLocation: "United Kingdom",
    role: "Owner",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  const mockSummaryData: RankingsSummaryDto = {
    totalKeywordsTracked: 50,
    totalKeywordsInSerp: 40,
    searchVisibility: 75.5,
    searchVisibilityChange: 5.2,
    averagePosition: 5.8,
    averagePositionChange: 1.2,
    isStale: false,
    distribution: {
      top1: 5,
      top2_3: 10,
      top4_5: 7,
      top6_10: 8,
      top11_30: 6,
      top31_100: 4,
      greaterThan100: 10,
    },
    movement: {
      jumpedCount: 18,
      jumpedPercentage: 45,
      droppedCount: 8,
      droppedPercentage: 20,
      unchangedCount: 14,
      unchangedPercentage: 35,
      jumpedByBucket: { top1_3: 6, top4_10: 6, top11_30: 4, top31_100: 2 },
      droppedByBucket: { top1_3: 2, top4_10: 2, top11_30: 2, top31_100: 2 },
      unchangedByBucket: { top1_3: 7, top4_10: 4, top11_30: 2, top31_100: 1 },
    },
    topKeywords: [
      { keywordId: "kw-sum-1", keywordText: "b2b seo consulting", searchVolume: 14200, position: 1 },
      { keywordId: "kw-sum-2", keywordText: "enterprise serp audit", searchVolume: 8900, position: 2 },
      { keywordId: "kw-sum-3", keywordText: "saas rank checker", searchVolume: 11000, position: 3 },
    ],
    jumpedKeywords: [
      { keywordId: "kw-sum-1", keywordText: "b2b seo consulting", position: 1, previousPosition: 4, positionChange: 3 },
      { keywordId: "kw-sum-4", keywordText: "rank monitoring software", position: 4, previousPosition: 11, positionChange: 7 },
    ],
    droppedKeywords: [
      { keywordId: "kw-sum-5", keywordText: "free keyword ranking tool", position: 16, previousPosition: 9, positionChange: -7 },
    ],
    topPages: [
      { url: "https://apexdigital.com/services/seo", totalKeywords: 22, averagePosition: 4.1, top10Count: 18 },
      { url: "https://apexdigital.com/blog/serp-tracking", totalKeywords: 12, averagePosition: 7.5, top10Count: 8 },
    ],
    competitors: [
      { competitorId: "comp-1", name: "MarketLeader", domain: "marketleader.com", searchVisibility: 82.0 },
      { competitorId: "comp-2", name: "RankRival", domain: "rankrival.com", searchVisibility: 69.4 },
    ],
    algorithmNotes: [
      {
        id: "alg-sum-1",
        title: "March 2026 Core Algorithm Update",
        category: "Core",
        severity: "warning",
        date: "March 15, 2026",
        description: "Comprehensive SERP ranking recalibration targeting spam and rewarded helpfulness.",
      },
      {
        id: "alg-sum-2",
        title: "Search Quality Review Overhaul",
        category: "Quality",
        severity: "notice",
        date: "February 22, 2026",
        description: "New guidelines rewarding in-depth primary source analysis.",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.rankings.getSummary as any).mockResolvedValue({
      success: true,
      data: mockSummaryData,
    });
  });

  it("renders rankings summary workspace with KPI cards and indicators", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    // Header title and project description
    expect(screen.getByText("Rankings & SERP Intelligence")).toBeInTheDocument();
    expect(screen.getAllByText(/apexdigital.com/).length).toBeGreaterThan(0);

    // Context badges
    expect(screen.getAllByText("Google").length).toBeGreaterThan(0);
    expect(screen.getAllByText("United Kingdom").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Desktop").length).toBeGreaterThan(0);

    // Await API call
    await waitFor(() => {
      expect(api.rankings.getSummary).toHaveBeenCalledWith("proj-sum-1", 30);
    });

    // KPI Cards
    expect(screen.getByText("Search Visibility")).toBeInTheDocument();
    expect(screen.getAllByText("75.5%").length).toBeGreaterThan(0);
    expect(screen.getByText("+5.2%")).toBeInTheDocument();

    expect(screen.getByText("Average Position")).toBeInTheDocument();
    expect(screen.getByText("#5.8")).toBeInTheDocument();

    expect(screen.getByText("In SERP (Top 100)")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("/ 50 tracked")).toBeInTheDocument();

    expect(screen.getByText("Organic Traffic")).toBeInTheDocument();
  });

  it("renders distribution of top positions mini cards", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("Distribution of Top Positions")).toBeInTheDocument();
    });

    // Verify position distribution labels
    expect(screen.getAllByText("Top 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 2-3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 4-5").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 6-10").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 11-30").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 31-100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("> 100").length).toBeGreaterThan(0);

    // Verify period toggle buttons
    const currentBtn = screen.getByRole("button", { name: "CURRENT" });
    const oneMonthBtn = screen.getByRole("button", { name: "1M" });
    expect(currentBtn).toBeInTheDocument();
    expect(oneMonthBtn).toBeInTheDocument();

    fireEvent.click(currentBtn);
    expect(currentBtn.className).toContain("text-blue-600");
  });

  it("renders SERP movement summary, visual bar, and tier matrix", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("SERP Movement Summary")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Movement Evaluated: 40")).toBeInTheDocument();
    expect(screen.getByText("▲ Jumped")).toBeInTheDocument();
    expect(screen.getByText("▼ Dropped")).toBeInTheDocument();
    expect(screen.getByText("— Unchanged")).toBeInTheDocument();

    // Matrix headers
    expect(screen.getByText("SERP Movement Type")).toBeInTheDocument();
    expect(screen.getByText("Top 1–3")).toBeInTheDocument();
    expect(screen.getByText("Top 4–10")).toBeInTheDocument();
    expect(screen.getByText("Top 11–30")).toBeInTheDocument();
    expect(screen.getByText("Top 31–100")).toBeInTheDocument();
  });

  it("renders keyword highlights across top, jumped, and dropped cards", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("Keyword Movement Highlights")).toBeInTheDocument();
    });

    expect(screen.getByText("Top Keywords")).toBeInTheDocument();
    expect(screen.getByText("Top Jumped")).toBeInTheDocument();
    expect(screen.getByText("Top Dropped")).toBeInTheDocument();

    expect(screen.getAllByText("b2b seo consulting").length).toBeGreaterThan(0);
    expect(screen.getByText("enterprise serp audit")).toBeInTheDocument();
    expect(screen.getByText("free keyword ranking tool")).toBeInTheDocument();
  });

  it("renders top ranked pages and competitor share of voice", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("Top Ranked Pages")).toBeInTheDocument();
    });

    expect(screen.getByText("https://apexdigital.com/services/seo")).toBeInTheDocument();
    expect(screen.getByText("Competitor Share of Voice")).toBeInTheDocument();
    expect(screen.getByText("MarketLeader")).toBeInTheDocument();
    expect(screen.getByText("RankRival")).toBeInTheDocument();
  });

  it("renders algorithm notes timeline feed", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText(/Search Engine Algorithm Notes/)).toBeInTheDocument();
    });

    expect(screen.getByText("March 2026 Core Algorithm Update")).toBeInTheDocument();
    expect(screen.getByText("Search Quality Review Overhaul")).toBeInTheDocument();
    expect(screen.getByText("March 15, 2026")).toBeInTheDocument();
  });

  it("reloads data when timeframe select is changed", async () => {
    render(<RankingsSummaryWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(api.rankings.getSummary).toHaveBeenCalledWith("proj-sum-1", 30);
    });

    const timeframeSelect = screen.getByDisplayValue("Last 30 Days");
    fireEvent.change(timeframeSelect, { target: { value: "90" } });

    await waitFor(() => {
      expect(api.rankings.getSummary).toHaveBeenCalledWith("proj-sum-1", 90);
    });
  });
});
