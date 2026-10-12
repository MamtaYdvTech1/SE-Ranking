import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CompetitorOverviewTab } from "../CompetitorOverviewTab";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      getVisibility: vi.fn(),
      getOverview: vi.fn(),
    },
  },
}));

describe("CompetitorOverviewTab Component", () => {
  const mockOverviewData = {
    totalKeywordsCount: 50,
    isStale: false,
    lastCheckedAt: "2026-09-30T06:00:00Z",
    summaries: [
      {
        competitorId: null,
        name: "WorkComposer",
        domain: "workcomposer.com",
        isTargetDomain: true,
        currentVisibility: 42.5,
        currentAveragePosition: 8.2,
        currentRankedCount: 38,
        top20OverlapCount: 28,
        top20OverlapPercentage: 56,
        top3Count: 6,
        top10Count: 16,
        top20Count: 28,
        top100Count: 38,
        unrankedCount: 12,
      },
      {
        competitorId: "comp-1",
        name: "Hubstaff",
        domain: "hubstaff.com",
        isTargetDomain: false,
        currentVisibility: 68.4,
        currentAveragePosition: 4.8,
        currentRankedCount: 46,
        top20OverlapCount: 24,
        top20OverlapPercentage: 48,
        top3Count: 14,
        top10Count: 26,
        top20Count: 36,
        top100Count: 46,
        unrankedCount: 4,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.competitors.getVisibility as any).mockResolvedValue({
      success: true,
      data: mockOverviewData,
    });
  });

  it("renders competitor visibility cards and distribution table", async () => {
    render(<CompetitorOverviewTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("Competitor Visibility Comparison")).toBeInTheDocument();
      expect(screen.getAllByText("WorkComposer").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Hubstaff").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("42.5%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("68.4%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#8.2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#4.8").length).toBeGreaterThan(0);
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });

  it("reloads overview when changing timeframe selector", async () => {
    render(<CompetitorOverviewTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "90" } });

    await waitFor(() => {
      expect(api.competitors.getVisibility).toHaveBeenCalledWith("proj-123", 90);
    });
  });

  it("renders empty state when no metrics are available", async () => {
    (api.competitors.getVisibility as any).mockResolvedValue({
      success: true,
      data: {
        totalKeywordsCount: 0,
        summaries: [],
      },
    });

    render(<CompetitorOverviewTab projectId="proj-123" />);

    await waitFor(() => {
      expect(
        screen.getByText("No visibility metrics available yet")
      ).toBeInTheDocument();
    });
  });

  it("renders error alert with retry button on failure", async () => {
    (api.competitors.getVisibility as any).mockResolvedValue({
      success: false,
      message: "Network Error loading visibility.",
    });

    render(<CompetitorOverviewTab projectId="proj-123" />);

    await waitFor(() => {
      expect(
        screen.getByText("Network Error loading visibility.")
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
