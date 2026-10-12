import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RankingsHistoricalWorkspace } from "../RankingsHistoricalWorkspace";
import { api } from "@/lib/api";
import { ProjectDetailDto } from "@/lib/types";

// Mock API
vi.mock("@/lib/api", () => ({
  api: {
    rankings: {
      getHistorical: vi.fn(),
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

describe("RankingsHistoricalWorkspace Component", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-historical-1",
    name: "Alpha Corp",
    primaryDomain: "alphacorp.com",
    role: "Owner",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  const mockHistoricalData = {
    dateFrom: "2026-03-15",
    dateTo: "2026-03-30",
    availableDates: ["2026-03-01", "2026-03-15", "2026-03-22", "2026-03-30"],
    header: {
      all: { count: 3, percentage: 100, delta: 1 },
      top1: { count: 1, percentage: 33, delta: 1 },
      top3: { count: 2, percentage: 67, delta: 0 },
      top5: { count: 2, percentage: 67, delta: 0 },
      top10: { count: 3, percentage: 100, delta: 1 },
      top30: { count: 3, percentage: 100, delta: 0 },
      over100: { count: 0, percentage: 0, delta: 0 },
      jumpedCount: 2,
      jumpedPercentage: 67,
      droppedCount: 1,
      droppedPercentage: 33,
    },
    metrics: {
      averagePosition: { currentValue: 4.2, baselineValue: 5.8, change: 1.6 },
      trafficForecast: { currentValue: 18500, baselineValue: 14200, change: 4300 },
      searchVisibility: { currentValue: 82.4, baselineValue: 71.0, change: 11.4 },
      percentInTop10: { currentValue: 85, baselineValue: 65, change: 20 },
    },
    trajectory: [
      { date: "2026-03-01", formattedDate: "03-01", averagePosition: 6.5, trafficForecast: 13000, searchVisibility: 65, percentInTop10: 60 },
      { date: "2026-03-15", formattedDate: "03-15", averagePosition: 5.8, trafficForecast: 14200, searchVisibility: 71, percentInTop10: 65 },
      { date: "2026-03-22", formattedDate: "03-22", averagePosition: 4.9, trafficForecast: 16800, searchVisibility: 78, percentInTop10: 75 },
      { date: "2026-03-30", formattedDate: "03-30", averagePosition: 4.2, trafficForecast: 18500, searchVisibility: 82.4, percentInTop10: 85 },
    ],
    keywords: {
      items: [
        {
          keywordId: "kw-hist-1",
          keywordText: "enterprise crm solution",
          groupName: "Enterprise",
          rankedUrl: "https://alphacorp.com/enterprise-crm",
          targetUrl: "https://alphacorp.com/enterprise-crm",
          isTargetUrlMatched: true,
          monthlySearchVolume: 18200,
          serpFeatures: ["Snippet", "Local Pack", "Sitelinks"],
          contentScore: 92,
          currentPosition: 1,
          baselinePosition: 3,
          positionChange: 2,
          device: "desktop",
          countryCode: "US",
          searchEngine: "google",
        },
        {
          keywordId: "kw-hist-2",
          keywordText: "cloud crm pricing",
          groupName: "Pricing",
          rankedUrl: "https://alphacorp.com/pricing",
          targetUrl: "https://alphacorp.com/plans",
          isTargetUrlMatched: false,
          monthlySearchVolume: 9400,
          serpFeatures: ["Snippet", "Stars"],
          contentScore: 78,
          currentPosition: 3,
          baselinePosition: 2,
          positionChange: -1,
          device: "desktop",
          countryCode: "US",
          searchEngine: "google",
        },
        {
          keywordId: "kw-hist-3",
          keywordText: "sales pipeline management",
          groupName: "Features",
          rankedUrl: "https://alphacorp.com/pipeline",
          targetUrl: "https://alphacorp.com/pipeline",
          isTargetUrlMatched: true,
          monthlySearchVolume: 4200,
          serpFeatures: ["Video"],
          contentScore: 45,
          currentPosition: 8,
          baselinePosition: 8,
          positionChange: 0,
          device: "desktop",
          countryCode: "US",
          searchEngine: "google",
        },
      ],
      pageNumber: 1,
      pageSize: 100,
      totalCount: 3,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.rankings.getHistorical as any).mockResolvedValue({
      success: true,
      data: mockHistoricalData,
    });
  });

  it("renders the historical rankings workspace with comparison mode badge and dates", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    // Header and comparison badge
    expect(screen.getByText("Historical Rankings")).toBeInTheDocument();
    expect(screen.getByText("Comparison Mode")).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(api.rankings.getHistorical).toHaveBeenCalledWith(
        mockProject.id,
        expect.any(Object)
      );
    });

    // Verify comparison dates text
    expect(screen.getByText(/Comparing/)).toBeInTheDocument();
    expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    expect(screen.getByText("cloud crm pricing")).toBeInTheDocument();
    expect(screen.getByText("sales pipeline management")).toBeInTheDocument();
  });

  it("displays metric selector cards and switches active metric tab", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    });

    // Check 4 metric cards
    expect(screen.getByText("AVERAGE POSITION")).toBeInTheDocument();
    expect(screen.getByText("TRAFFIC FORECAST")).toBeInTheDocument();
    expect(screen.getByText("SEARCH VISIBILITY")).toBeInTheDocument();
    expect(screen.getByText("% IN TOP 10")).toBeInTheDocument();

    // Verify initial values
    expect(screen.getByText("4.2")).toBeInTheDocument(); // avg pos current
    expect(screen.getByText("18.5K")).toBeInTheDocument(); // traffic current
    expect(screen.getByText("82.4%")).toBeInTheDocument(); // visibility current

    // Click on Traffic Forecast tab
    fireEvent.click(screen.getByText("TRAFFIC FORECAST"));
    // Verify Red Line Trajectory chart header
    expect(screen.getByText("Red Line Trajectory Comparison")).toBeInTheDocument();
  });

  it("filters keywords using position bucket buttons", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    });

    // Click TOP 1 bucket button
    const top1Label = screen.getByText("TOP 1");
    const top1Btn = top1Label.closest("button")!;
    fireEvent.click(top1Btn);

    await waitFor(() => {
      expect(api.rankings.getHistorical).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({ positionFilter: "top1" })
      );
    });
  });

  it("allows selecting keywords with checkboxes and toggling all", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    });

    // Checkboxes exist (1 header checkbox + 3 row checkboxes)
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(4);

    // Click first keyword row checkbox
    fireEvent.click(checkboxes[1]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    // Click header select all checkbox
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText("3 selected")).toBeInTheDocument();

    // Click header select all again to deselect all
    fireEvent.click(checkboxes[0]);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("expands keyword details drawer to show target URL vs ranked URL comparison", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    });

    // Find expand toggle button on the first keyword row
    const expandButtons = screen.getAllByTitle("Toggle keyword details");
    expect(expandButtons.length).toBe(3);

    // Expand the first row
    fireEvent.click(expandButtons[0]);

    // Drawer should show target vs ranked URL matching
    expect(screen.getByText("✓ Target URL matched")).toBeInTheDocument();
    expect(screen.getByText("Rank Movement")).toBeInTheDocument();
    expect(screen.getByText("Comparison Window")).toBeInTheDocument();

    // Expand the second row (where target is diverged)
    fireEvent.click(expandButtons[1]);
    expect(screen.getByText("⚠️ Target diverged")).toBeInTheDocument();
  });

  it("handles changes filter (up / down)", async () => {
    render(<RankingsHistoricalWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("enterprise crm solution")).toBeInTheDocument();
    });

    // Click ▲ jumped filter button from Changes section
    const changesSection = screen.getByText("Changes:").closest("div");
    const changeButtons = changesSection?.querySelectorAll("button") || [];
    expect(changeButtons.length).toBe(2);

    const jumpedBtn = changeButtons[0];
    fireEvent.click(jumpedBtn);

    await waitFor(() => {
      expect(api.rankings.getHistorical).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({ changesOnly: "up" })
      );
    });

    // Reset filters
    const resetBtn = screen.getByText("Reset Filters");
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(api.rankings.getHistorical).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({ positionFilter: "all", changesOnly: undefined })
      );
    });
  });
});
