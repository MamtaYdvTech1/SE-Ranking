import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RankingsDetailedWorkspace } from "../RankingsDetailedWorkspace";
import { api } from "@/lib/api";
import { ProjectDetailDto } from "@/lib/types";

// Mock API
vi.mock("@/lib/api", () => ({
  api: {
    rankings: {
      getDetailed: vi.fn(),
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

describe("RankingsDetailedWorkspace Component", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-abc",
    name: "Acme Corp",
    primaryDomain: "acme.com",
    role: "Owner",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  const mockResponseData = {
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
      droppedCount: 0,
      droppedPercentage: 0,
    },
    historyDates: ["2026-03-28", "2026-03-29", "2026-03-30"],
    keywords: {
      items: [
        {
          keywordId: "kw-1",
          keywordText: "cloud accounting software",
          isCannibalized: false,
          groupName: "Finance",
          rankedUrl: "https://acme.com/accounting",
          targetUrl: "https://acme.com/accounting",
          isTargetUrlMatched: true,
          monthlySearchVolume: 14500,
          serpFeatures: ["Snippet", "Local Pack"],
          contentScore: 85,
          lastCheckedDate: "2026-03-30",
          currentPosition: 1,
          previousPosition: 2,
          positionChange: 1,
          device: "desktop",
          countryCode: "US",
          searchEngine: "google",
          dailyPositions: [
            { date: "2026-03-28", position: 2, positionChange: 0 },
            { date: "2026-03-29", position: 2, positionChange: 0 },
            { date: "2026-03-30", position: 1, positionChange: 1 },
          ],
        },
        {
          keywordId: "kw-2",
          keywordText: "invoice generator tool",
          isCannibalized: true,
          groupName: "Billing",
          rankedUrl: "https://acme.com/invoices",
          targetUrl: "https://acme.com/generator",
          isTargetUrlMatched: false,
          monthlySearchVolume: 8200,
          serpFeatures: ["Stars", "Video"],
          contentScore: 68,
          lastCheckedDate: "2026-03-30",
          currentPosition: 3,
          previousPosition: 3,
          positionChange: 0,
          device: "desktop",
          countryCode: "US",
          searchEngine: "google",
          dailyPositions: [
            { date: "2026-03-28", position: 3, positionChange: 0 },
            { date: "2026-03-29", position: 3, positionChange: 0 },
            { date: "2026-03-30", position: 3, positionChange: 0 },
          ],
        },
      ],
      pageNumber: 1,
      pageSize: 100,
      totalCount: 2,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    overviewMetrics: {
      averagePosition: 2.0,
      averagePositionChange: 0.5,
      searchVisibility: 85.0,
      trend: [
        { date: "2026-03-28", label: "03-28", value: 2.5 },
        { date: "2026-03-29", label: "03-29", value: 2.5 },
        { date: "2026-03-30", label: "03-30", value: 2.0 },
      ],
    },
    insights: [
      {
        id: "ins-1",
        type: "Cannibalization",
        title: "Keyword Cannibalization Detected",
        description: "Competing URLs detected for invoice generator tool",
        actionLabel: "Filter Cannibalized",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.rankings.getDetailed as any).mockResolvedValue({
      success: true,
      data: mockResponseData,
    });
  });

  it("renders keywords and table headers when loaded", async () => {
    render(<RankingsDetailedWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("cloud accounting software")).toBeInTheDocument();
      expect(screen.getByText("invoice generator tool")).toBeInTheDocument();
    });

    // Check position badges and URL
    expect(screen.getByText("acme.com/accounting")).toBeInTheDocument();
    expect(screen.getByText("Cannibalized")).toBeInTheDocument();
    expect(screen.getByText("Snippet")).toBeInTheDocument();
  });

  it("toggles row selection checkbox and header select all", async () => {
    render(<RankingsDetailedWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("cloud accounting software")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is header select-all
    const selectAllCheckbox = checkboxes[0];
    fireEvent.click(selectAllCheckbox);

    await waitFor(() => {
      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    // Deselect all
    fireEvent.click(selectAllCheckbox);
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });

  it("expands keyword details drawer on chevron click", async () => {
    render(<RankingsDetailedWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("cloud accounting software")).toBeInTheDocument();
    });

    const expandButtons = screen.getAllByTitle("Toggle keyword details");
    fireEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Target URL")).toBeInTheDocument();
      expect(screen.getByText("✓ Target URL matched ranked URL")).toBeInTheDocument();
      expect(screen.getByText(/Device:/)).toBeInTheDocument();
    });
  });

  it("toggles insights banner expansion", async () => {
    render(<RankingsDetailedWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText(/insight found for the keywords below/i)).toBeInTheDocument();
    });

    // Collapse insights
    const collapseButton = screen.getByText("Collapse");
    fireEvent.click(collapseButton);

    expect(screen.getByText("Expand")).toBeInTheDocument();
  });

  it("triggers filter by position when TOP 1 bucket button is clicked", async () => {
    render(<RankingsDetailedWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("cloud accounting software")).toBeInTheDocument();
    });

    const top1Button = screen.getByText("TOP 1");
    fireEvent.click(top1Button);

    await waitFor(() => {
      expect(api.rankings.getDetailed).toHaveBeenCalledWith(
        "proj-abc",
        expect.objectContaining({ positionFilter: "top1" })
      );
    });
  });
});
