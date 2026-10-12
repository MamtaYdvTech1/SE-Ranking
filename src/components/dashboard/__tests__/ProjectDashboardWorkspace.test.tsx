import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ProjectDashboardWorkspace } from "../ProjectDashboardWorkspace";
import { api } from "@/lib/api";
import { ProjectDashboardDto } from "@/lib/types";

describe("ProjectDashboardWorkspace Component", { timeout: 15000 }, () => {
  const mockProjectDashboard: ProjectDashboardDto = {
    projectId: "proj-123",
    projectName: "WorkComposer Enterprise",
    primaryDomain: "workcomposer.com",
    freshness: {
      isRankingsStale: false,
      lastRankCheckAt: "2026-09-19T08:00:00Z",
      lastAuditCrawlAt: "2026-09-18T12:00:00Z",
      lastGscSyncAt: "2026-09-19T10:00:00Z",
      gscSyncStatus: "Active",
    },
    health: {
      healthScore: 88,
      errorsCount: 4,
      warningsCount: 18,
      totalUrlsCrawled: 245,
    },
    rankings: {
      totalKeywords: 450,
      averagePosition: 8.4,
      searchVisibility: 52.8,
      top3Count: 24,
      top10Count: 82,
      top20Count: 145,
      top100Count: 388,
      improvedCount: 38,
      declinedCount: 12,
      unchangedCount: 400,
    },
    gsc: {
      syncStatus: "Active",
      lastSyncedAt: "2026-09-19T10:00:00Z",
      totalClicks: 14850,
      totalImpressions: 215400,
      averageCtr: 0.0689,
      averagePosition: 6.2,
      startDate: "2026-08-20",
      endDate: "2026-09-17",
      dailySeries: [
        { date: "09-15", clicks: 520, impressions: 7800 },
        { date: "09-16", clicks: 560, impressions: 8400 },
        { date: "09-17", clicks: 610, impressions: 9150 },
      ],
    },
    tasks: {
      totalCount: 18,
      openCount: 5,
      inProgressCount: 4,
      readyForVerificationCount: 3,
      closedCount: 6,
      overdueCount: 1,
    },
    criticalIssues: [
      {
        id: "issue-1",
        ruleCode: "HTTP_5XX_SERVER_ERROR",
        firstSeenAt: "2026-09-18T09:30:00Z",
        affectedUrl: "https://workcomposer.com/api/v1/health-check",
      },
      {
        id: "issue-2",
        ruleCode: "CANONICAL_POINTS_TO_404",
        firstSeenAt: "2026-09-17T14:15:00Z",
        affectedUrl: "https://workcomposer.com/features/team-tracking",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton while fetching project dashboard", async () => {
    vi.spyOn(api.dashboard, "getProjectDashboard").mockImplementation(
      () => new Promise(() => {}) // never resolves to keep loading
    );

    render(<ProjectDashboardWorkspace projectId="proj-123" />);

    expect(screen.getByTestId("dashboard-loading")).toBeInTheDocument();
  });

  it("renders error state when API fails and recovers on Retry", async () => {
    const getDashboardSpy = vi
      .spyOn(api.dashboard, "getProjectDashboard")
      .mockRejectedValueOnce(new Error("Database connection timed out"));

    render(<ProjectDashboardWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-error")).toBeInTheDocument();
      expect(screen.getByText("Database connection timed out")).toBeInTheDocument();
    });

    getDashboardSpy.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockProjectDashboard,
    });

    const retryBtn = screen.getByRole("button", { name: "Retry" });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId("project-dashboard")).toBeInTheDocument();
      expect(screen.getByText("WorkComposer Enterprise")).toBeInTheDocument();
    });
  });

  it("renders populated project command center with freshness bar and 4 KPI cards", async () => {
    vi.spyOn(api.dashboard, "getProjectDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockProjectDashboard,
    });

    render(<ProjectDashboardWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-dashboard")).toBeInTheDocument();
    });

    // Header
    expect(screen.getByText("WorkComposer Enterprise")).toBeInTheDocument();
    expect(screen.getByText("workcomposer.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();

    // Freshness Bar
    const freshnessBar = screen.getByTestId("freshness-bar");
    expect(freshnessBar).toHaveTextContent("Rank Check:");
    expect(freshnessBar).toHaveTextContent("Audit Crawl:");
    expect(freshnessBar).toHaveTextContent("GSC Sync:");
    expect(freshnessBar).toHaveTextContent("Active");

    // 4 KPI Cards
    const kpiHealth = screen.getByTestId("kpi-health");
    expect(kpiHealth).toHaveTextContent("Technical Health");
    expect(kpiHealth).toHaveTextContent("88");
    expect(kpiHealth).toHaveTextContent("4 Errors");
    expect(kpiHealth).toHaveTextContent("18 Warnings");
    expect(kpiHealth).toHaveTextContent("245 URLs");

    const kpiRankings = screen.getByTestId("kpi-rankings");
    expect(kpiRankings).toHaveTextContent("Keywords Tracked");
    expect(kpiRankings).toHaveTextContent("450");
    expect(kpiRankings).toHaveTextContent("Avg Pos 8.4");
    expect(kpiRankings).toHaveTextContent("52.8%");
    expect(kpiRankings).toHaveTextContent("Top 10: 82");

    const kpiGsc = screen.getByTestId("kpi-gsc");
    expect(kpiGsc).toHaveTextContent("GSC 28-Day Clicks");
    expect(kpiGsc).toHaveTextContent("6.9% CTR");
    expect(kpiGsc).toHaveTextContent("Impressions");

    const kpiTasks = screen.getByTestId("kpi-tasks");
    expect(kpiTasks).toHaveTextContent("Remediation Tasks");
    expect(kpiTasks).toHaveTextContent("9"); // 5 open + 4 inProgress
    expect(kpiTasks).toHaveTextContent("3 Ready for verify");
    expect(kpiTasks).toHaveTextContent("1 Overdue");
  });

  it("renders rank distribution, GSC sparkline, and remediation breakdown", async () => {
    vi.spyOn(api.dashboard, "getProjectDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockProjectDashboard,
    });

    render(<ProjectDashboardWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-dashboard")).toBeInTheDocument();
    });

    // Rank Distribution Card
    const rankingsDetail = screen.getByTestId("card-rankings-detail");
    expect(rankingsDetail).toHaveTextContent("Rank Distribution & Movements");
    expect(rankingsDetail).toHaveTextContent("Top 3");
    expect(rankingsDetail).toHaveTextContent("24");
    expect(rankingsDetail).toHaveTextContent("Top 10");
    expect(rankingsDetail).toHaveTextContent("82");
    expect(rankingsDetail).toHaveTextContent("Top 20");
    expect(rankingsDetail).toHaveTextContent("145");
    expect(rankingsDetail).toHaveTextContent("Top 100");
    expect(rankingsDetail).toHaveTextContent("388");
    expect(rankingsDetail).toHaveTextContent("38"); // improved
    expect(rankingsDetail).toHaveTextContent("12"); // declined
    expect(rankingsDetail).toHaveTextContent("400"); // unchanged

    // GSC Trend Card
    const gscDetail = screen.getByTestId("card-gsc-detail");
    expect(gscDetail).toHaveTextContent("First-Party Search Trend");
    expect(gscDetail).toHaveTextContent("2026-08-20");
    expect(gscDetail).toHaveTextContent("2026-09-17 (48h latency)");

    // Critical Issues Card
    const criticalIssues = screen.getByTestId("card-critical-issues");
    expect(criticalIssues).toHaveTextContent("Critical Audit Issues");
    expect(criticalIssues).toHaveTextContent("HTTP_5XX_SERVER_ERROR");
    expect(criticalIssues).toHaveTextContent("https://workcomposer.com/api/v1/health-check");
    expect(criticalIssues).toHaveTextContent("CANONICAL_POINTS_TO_404");
    expect(criticalIssues).toHaveTextContent("https://workcomposer.com/features/team-tracking");

    // Tasks Breakdown Card
    const tasksBreakdown = screen.getByTestId("card-tasks-breakdown");
    expect(tasksBreakdown).toHaveTextContent("Remediation Status");
    expect(tasksBreakdown).toHaveTextContent("Open");
    expect(tasksBreakdown).toHaveTextContent("5");
    expect(tasksBreakdown).toHaveTextContent("In Progress");
    expect(tasksBreakdown).toHaveTextContent("4");
    expect(tasksBreakdown).toHaveTextContent("Ready to Verify");
    expect(tasksBreakdown).toHaveTextContent("3");
    expect(tasksBreakdown).toHaveTextContent("Closed");
    expect(tasksBreakdown).toHaveTextContent("6");
  });

  it("handles disconnected GSC, stale rankings badge, and empty issue states", async () => {
    const disconnectedDashboard: ProjectDashboardDto = {
      projectId: "proj-456",
      projectName: "Unconnected Site",
      primaryDomain: "unconnected.org",
      freshness: {
        isRankingsStale: true,
        lastRankCheckAt: null,
        lastAuditCrawlAt: null,
        lastGscSyncAt: null,
        gscSyncStatus: "Disconnected",
      },
      health: {
        healthScore: null,
        errorsCount: 0,
        warningsCount: 0,
        totalUrlsCrawled: 0,
      },
      rankings: {
        totalKeywords: 0,
        averagePosition: null,
        searchVisibility: null,
        top3Count: 0,
        top10Count: 0,
        top20Count: 0,
        top100Count: 0,
        improvedCount: 0,
        declinedCount: 0,
        unchangedCount: 0,
      },
      gsc: {
        syncStatus: "Disconnected",
        lastSyncedAt: null,
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
        averagePosition: 0,
        startDate: "",
        endDate: "",
        dailySeries: [],
      },
      tasks: {
        totalCount: 0,
        openCount: 0,
        inProgressCount: 0,
        readyForVerificationCount: 0,
        closedCount: 0,
        overdueCount: 0,
      },
      criticalIssues: [],
    };

    vi.spyOn(api.dashboard, "getProjectDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: disconnectedDashboard,
    });

    render(<ProjectDashboardWorkspace projectId="proj-456" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-dashboard")).toBeInTheDocument();
    });

    // Stale warning badge
    expect(screen.getByText("Stale (>48h)")).toBeInTheDocument();
    expect(screen.getByText("Not checked yet")).toBeInTheDocument();
    expect(screen.getByText("No crawl completed")).toBeInTheDocument();

    // GSC Disconnected badges and prompt
    const disconnectedElements = screen.getAllByText("Disconnected");
    expect(disconnectedElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Connect Google Account")).toBeInTheDocument();
    expect(screen.getByText("Google Search Console is not connected.")).toBeInTheDocument();

    // Empty keywords message
    expect(screen.getByText("No keywords tracked yet.")).toBeInTheDocument();

    // Empty critical errors message
    expect(screen.getByText("No Critical Errors Found")).toBeInTheDocument();

    // Empty tasks message
    expect(screen.getByText("No remediation tasks created for this project.")).toBeInTheDocument();
  });

  it("reloads dashboard data when Refresh button is clicked", async () => {
    const getDashboardSpy = vi
      .spyOn(api.dashboard, "getProjectDashboard")
      .mockResolvedValue({
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: mockProjectDashboard,
      });

    render(<ProjectDashboardWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("project-dashboard")).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(getDashboardSpy).toHaveBeenCalledTimes(2);
    });
  });
});
