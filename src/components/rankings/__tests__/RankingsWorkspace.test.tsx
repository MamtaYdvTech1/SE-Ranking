import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RankingsWorkspace } from "../RankingsWorkspace";
import { rankingsRepository } from "@/lib/rankingsRepository";
import { ProjectDetailDto } from "@/lib/types";
import { RankingOverviewData } from "@/lib/rankingsTypes";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/proj-wk-1/rankings",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com", role: "Owner" },
    isAuthenticated: true,
    isViewer: false,
    canManageProjects: true,
    logout: vi.fn(),
  }),
}));

// Mock rankingsRepository
vi.mock("@/lib/rankingsRepository", () => ({
  rankingsRepository: {
    getOverview: vi.fn(),
  },
}));

describe("RankingsWorkspace Component", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-wk-1",
    name: "Zenith Corp",
    primaryDomain: "zenith.com",
    role: "Owner",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  const mockOverviewData: any = {
    metrics: [
      { id: "average_position", name: "Average Position", status: "supported", formattedValue: "5.2", changeLabel: "+1.1", isPositive: true },
      { id: "visibility", name: "Visibility", status: "supported", formattedValue: "76.8%", changeLabel: "+4.0%", isPositive: true },
      { id: "top_3", name: "Top 3", status: "supported", formattedValue: "15", changeLabel: "+2", isPositive: true },
      { id: "top_5", name: "Top 5", status: "supported", formattedValue: "22", changeLabel: "+3", isPositive: true },
      { id: "top_10", name: "Top 10", status: "supported", formattedValue: "38", changeLabel: "+4", isPositive: true },
      { id: "top_30", name: "Top 30", status: "supported", formattedValue: "60", changeLabel: "+1", isPositive: true },
    ],
    trend: [
      { date: "2026-03-24", value: 6.5, label: "Mar 24" },
      { date: "2026-03-26", value: 5.8, label: "Mar 26" },
      { date: "2026-03-28", value: 5.4, label: "Mar 28" },
      { date: "2026-03-30", value: 5.2, label: "Mar 30" },
    ],
    websites: [
      {
        id: "web-1",
        domain: "zenith.com",
        visibility: 76.8,
        averagePosition: 5.2,
        traffic: 15400,
        keywordsCount: 88,
        top3: 15,
        top10: 38,
        top100: 88,
        change: 1.1,
      },
      {
        id: "web-2",
        domain: "competitor-zenith.com",
        visibility: 58.2,
        averagePosition: 8.4,
        traffic: 8200,
        keywordsCount: 65,
        top3: 9,
        top10: 25,
        top100: 65,
        change: -0.6,
      },
    ],
    totalWebsites: 2,
    lastChecked: "Today, 04:00 UTC",
    lastSynced: "15 mins ago",
    isStale: false,
    dataNotice: "Live data",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (rankingsRepository.getOverview as any).mockResolvedValue(mockOverviewData);
  });

  it("renders RankingsWorkspace with all core modules and loads overview", async () => {
    render(<RankingsWorkspace project={mockProject} />);

    // Subnav tabs
    expect(screen.getByRole("link", { name: /Summary/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Detailed/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Historical Data/i })).toBeInTheDocument();

    // Action Bar & Data Freshness
    expect(screen.getByText("Active websites")).toBeInTheDocument();
    expect(screen.getByText("RECHECK DATA")).toBeInTheDocument();

    // Await API call
    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalledWith(
        "proj-wk-1",
        "week",
        "average_position",
        "zenith.com",
        "populated"
      );
    });

    // Metric Tabs
    expect(screen.getAllByText("Average Position").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Visibility").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top 3").length).toBeGreaterThan(0);

    // Trend chart domain
    expect(screen.getAllByText(/zenith.com/).length).toBeGreaterThan(0);

    // Websites table
    expect(screen.getByText("competitor-zenith.com")).toBeInTheDocument();
  });

  it("switches active metric when a metric tab is clicked", async () => {
    render(<RankingsWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getAllByText("Visibility").length).toBeGreaterThan(0);
    });

    // Click Visibility tab
    const visibilityTab = screen.getByRole("tab", { name: /Visibility/i });
    fireEvent.click(visibilityTab);

    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalledWith(
        "proj-wk-1",
        "week",
        "visibility",
        "zenith.com",
        "populated"
      );
    });
  });

  it("switches time range and granularity controls", async () => {
    render(<RankingsWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalled();
    });

    // Click Month time range button
    const monthBtn = screen.getByRole("button", { name: /^MONTH$/i });
    fireEvent.click(monthBtn);

    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalledWith(
        "proj-wk-1",
        "month",
        "average_position",
        "zenith.com",
        "populated"
      );
    });
  });

  it("filters websites table via search input", async () => {
    render(<RankingsWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText("competitor-zenith.com")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "competitor" } });

    // Competitor matches search
    expect(screen.getByText("competitor-zenith.com")).toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByLabelText("Clear search query");
    fireEvent.click(clearBtn);

    expect(screen.getAllByText(/zenith.com/).length).toBeGreaterThan(0);
  });

  it("handles live simulated recheck", async () => {
    render(<RankingsWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalledTimes(1);
    });

    const recheckBtn = screen.getByRole("button", { name: /Recheck Data/i });
    fireEvent.click(recheckBtn);

    expect(screen.getByText(/RECHECKING/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(rankingsRepository.getOverview).toHaveBeenCalledTimes(2);
    }, { timeout: 2000 });
  });

  it("renders 403 Forbidden restricted state when access is denied", async () => {
    (rankingsRepository.getOverview as any).mockRejectedValue({
      status: 403,
      message: "Forbidden",
    });

    render(<RankingsWorkspace project={mockProject} />);

    await waitFor(() => {
      expect(screen.getByText(/Rankings Access Denied \(403 Forbidden\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Under our enterprise RBAC policy/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Return to Accessible Projects/i })).toBeInTheDocument();
  });
});
