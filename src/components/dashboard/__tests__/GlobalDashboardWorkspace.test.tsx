import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { GlobalDashboardWorkspace } from "../GlobalDashboardWorkspace";
import { api } from "@/lib/api";
import { GlobalDashboardDto } from "@/lib/types";

describe("GlobalDashboardWorkspace Component", { timeout: 15000 }, () => {
  const mockDashboardData: GlobalDashboardDto = {
    totalProjects: 3,
    totalTrackedKeywords: 950,
    averageHealthScore: 69,
    totalOpenTasks: 15,
    totalOverdueTasks: 4,
    projects: [
      {
        projectId: "proj-1",
        name: "WorkComposer Enterprise",
        primaryDomain: "workcomposer.com",
        healthScore: 88,
        trackedKeywords: 450,
        openTasks: 5,
        overdueTasks: 1,
        gscSyncStatus: "Active",
      },
      {
        projectId: "proj-2",
        name: "Time Doctor Competitor",
        primaryDomain: "timedoctor.com",
        healthScore: 76,
        trackedKeywords: 320,
        openTasks: 2,
        overdueTasks: 0,
        gscSyncStatus: "Active",
      },
      {
        projectId: "proj-3",
        name: "Hubstaff Tracker",
        primaryDomain: "hubstaff.com",
        healthScore: 42,
        trackedKeywords: 180,
        openTasks: 8,
        overdueTasks: 3,
        gscSyncStatus: "Inactive",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially while fetching global dashboard", async () => {
    vi.spyOn(api.dashboard, "getGlobalDashboard").mockImplementation(
      () => new Promise(() => {}) // never resolves to keep loading
    );

    render(<GlobalDashboardWorkspace />);

    expect(screen.getByTestId("global-dashboard-loading")).toBeInTheDocument();
  });

  it("renders error state when API call fails and recovers on Retry", async () => {
    const getDashboardSpy = vi
      .spyOn(api.dashboard, "getGlobalDashboard")
      .mockRejectedValueOnce(new Error("Network connection error"));

    render(<GlobalDashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard-error")).toBeInTheDocument();
      expect(screen.getByText("Network connection error")).toBeInTheDocument();
    });

    // Mock successful response on retry
    getDashboardSpy.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockDashboardData,
    });

    const retryBtn = screen.getByRole("button", { name: "Retry" });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard")).toBeInTheDocument();
      expect(screen.getByText("Portfolio Overview")).toBeInTheDocument();
    });
  });

  it("renders populated dashboard with KPI cards and projects table", async () => {
    vi.spyOn(api.dashboard, "getGlobalDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockDashboardData,
    });

    render(<GlobalDashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard")).toBeInTheDocument();
    });

    // Header elements
    expect(screen.getByText("Portfolio Overview")).toBeInTheDocument();
    expect(
      screen.getByText(/Consolidated enterprise health, rankings, and task remediation/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Projects" })).toBeInTheDocument();

    // 4 KPI Cards
    const kpiProjects = screen.getByTestId("global-kpi-projects");
    expect(kpiProjects).toHaveTextContent("Total Projects");
    expect(kpiProjects).toHaveTextContent("3");
    expect(kpiProjects).toHaveTextContent("Managed");

    const kpiKeywords = screen.getByTestId("global-kpi-keywords");
    expect(kpiKeywords).toHaveTextContent("Tracked Keywords");
    expect(kpiKeywords).toHaveTextContent("950");
    expect(kpiKeywords).toHaveTextContent("Portfolio");

    const kpiHealth = screen.getByTestId("global-kpi-health");
    expect(kpiHealth).toHaveTextContent("Average SEO Health");
    expect(kpiHealth).toHaveTextContent("69");
    expect(kpiHealth).toHaveTextContent("/ 100");

    const kpiTasks = screen.getByTestId("global-kpi-tasks");
    expect(kpiTasks).toHaveTextContent("Open Tasks");
    expect(kpiTasks).toHaveTextContent("15");
    expect(kpiTasks).toHaveTextContent("4 Overdue");

    // Table
    const table = screen.getByTestId("global-projects-table");
    expect(table).toHaveTextContent("Managed Project Portfolio");
    expect(table).toHaveTextContent("WorkComposer Enterprise");
    expect(table).toHaveTextContent("workcomposer.com");
    expect(table).toHaveTextContent("Time Doctor Competitor");
    expect(table).toHaveTextContent("Hubstaff Tracker");

    // Project links
    const enterpriseLink = screen.getByRole("link", { name: "WorkComposer Enterprise" });
    expect(enterpriseLink).toHaveAttribute("href", "/projects/proj-1");

    // Health Score styling
    expect(screen.getByText("88 / 100")).toHaveClass("text-emerald-400");
    expect(screen.getByText("76 / 100")).toHaveClass("text-amber-400");
    expect(screen.getByText("42 / 100")).toHaveClass("text-rose-400");

    // Dashboard action button
    const actionButtons = screen.getAllByRole("button", { name: /Dashboard/i });
    expect(actionButtons.length).toBe(3);
  });

  it("handles zero overdue tasks and missing average health score", async () => {
    const zeroOverdueData: GlobalDashboardDto = {
      totalProjects: 1,
      totalTrackedKeywords: 100,
      averageHealthScore: null,
      totalOpenTasks: 2,
      totalOverdueTasks: 0,
      projects: [
        {
          projectId: "proj-10",
          name: "Clean SEO Site",
          primaryDomain: "cleanseo.io",
          healthScore: null,
          trackedKeywords: 100,
          openTasks: 2,
          overdueTasks: 0,
          gscSyncStatus: "Active",
        },
      ],
    };

    vi.spyOn(api.dashboard, "getGlobalDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: zeroOverdueData,
    });

    render(<GlobalDashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard")).toBeInTheDocument();
    });

    // Zero overdue
    expect(screen.getByText("0 Overdue")).toBeInTheDocument();

    // Fallback dashes for null health score
    const healthElements = screen.getAllByText("—");
    expect(healthElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state message when projects list is empty", async () => {
    const emptyData: GlobalDashboardDto = {
      totalProjects: 0,
      totalTrackedKeywords: 0,
      averageHealthScore: null,
      totalOpenTasks: 0,
      totalOverdueTasks: 0,
      projects: [],
    };

    vi.spyOn(api.dashboard, "getGlobalDashboard").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: emptyData,
    });

    render(<GlobalDashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("No projects assigned or accessible.")).toBeInTheDocument();
  });

  it("triggers data reload when Refresh button is clicked", async () => {
    const getDashboardSpy = vi
      .spyOn(api.dashboard, "getGlobalDashboard")
      .mockResolvedValue({
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: mockDashboardData,
      });

    render(<GlobalDashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByTestId("global-dashboard")).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(getDashboardSpy).toHaveBeenCalledTimes(2);
    });
  });
});
