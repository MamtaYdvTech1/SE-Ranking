import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { GscPerformanceWorkspace } from "../GscPerformanceWorkspace";
import { api } from "@/lib/api";
import {
  GscCountryStatDto,
  GscDeviceStatDto,
  GscPageRowDto,
  GscPerformanceOverviewDto,
  GscQueryRowDto,
  PaginatedList,
} from "@/lib/types";

let mockUserRole = "SuperAdmin";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "usr-1",
      email: "admin@workcomposer.com",
      name: "Admin User",
      role: mockUserRole,
    },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

describe("GscPerformanceWorkspace Component", { timeout: 15000 }, () => {
  const mockOverview: GscPerformanceOverviewDto = {
    syncStatus: "Active",
    lastSyncedAt: "2026-09-19T10:00:00Z",
    totalClicks: 14850,
    totalImpressions: 215400,
    averageCtr: 0.0689,
    averagePosition: 6.2,
    dailySeries: [
      { date: "2026-09-15", clicks: 450, impressions: 7200, ctr: 0.0625, averagePosition: 6.1 },
      { date: "2026-09-16", clicks: 520, impressions: 8100, ctr: 0.0642, averagePosition: 5.9 },
    ],
  };

  const mockQueries: PaginatedList<GscQueryRowDto> = {
    items: [
      { queryText: "work composer download", query: "work composer download", clicks: 1240, impressions: 14500, ctr: 0.0855, position: 2.1, averagePosition: 2.1 },
      { queryText: "employee monitoring software", query: "employee monitoring software", clicks: 890, impressions: 18200, ctr: 0.0489, position: 4.8, averagePosition: 4.8 },
    ],
    pageNumber: 1,
    pageSize: 50,
    totalCount: 2,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const mockPages: PaginatedList<GscPageRowDto> = {
    items: [
      {
        pageUrl: "https://example.com/",
        clicks: 5420,
        impressions: 68000,
        ctr: 0.0797,
        averagePosition: 4.1,
        queryCount: 210,
      },
    ],
    pageNumber: 1,
    pageSize: 50,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const mockDevices: GscDeviceStatDto[] = [
    { device: "Desktop", clicks: 9420, impressions: 124000, ctr: 0.0759, averagePosition: 5.4, clickShare: 0.634 },
    { device: "Mobile", clicks: 4980, impressions: 84000, ctr: 0.0592, averagePosition: 6.8, clickShare: 0.335 },
  ];

  const mockCountries: GscCountryStatDto[] = [
    { countryCode: "USA", countryName: "United States", clicks: 6850, impressions: 89000, ctr: 0.0769, averagePosition: 4.8 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRole = "SuperAdmin";

    vi.spyOn(api.gsc, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });

    vi.spyOn(api.gsc, "getQueries").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockQueries,
    });

    vi.spyOn(api.gsc, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    vi.spyOn(api.gsc, "getDeviceBreakdown").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockDevices,
    });

    vi.spyOn(api.gsc, "getCountryBreakdown").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockCountries,
    });

    vi.spyOn(api.gsc, "triggerSync").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { queued: true },
    });
  });

  it("renders loading skeleton initially when overview is not yet loaded", () => {
    vi.spyOn(api.gsc, "getOverview").mockImplementation(() => new Promise(() => {}));

    render(<GscPerformanceWorkspace projectId="proj-123" />);
    expect(screen.getByTestId("gsc-loading")).toBeInTheDocument();
  });

  it("renders disconnected state when Search Console is not connected", async () => {
    vi.spyOn(api.gsc, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        ...mockOverview,
        syncStatus: "Disconnected",
        lastSyncedAt: undefined,
      },
    });

    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-disconnected")).toBeInTheDocument();
    });

    expect(screen.getByText("Google Search Console Not Connected")).toBeInTheDocument();
    expect(screen.getByText("Not Connected")).toBeInTheDocument();
  });

  it("renders full workspace with KPI cards and trend chart when connected", async () => {
    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-workspace")).toBeInTheDocument();
    });

    expect(screen.getByText("Google Search Console")).toBeInTheDocument();
    expect(screen.getByText("Active Sync")).toBeInTheDocument();

    // Check KPI cards
    expect(screen.getByTestId("gsc-kpi-cards")).toBeInTheDocument();
    expect(screen.getByText("Total Clicks")).toBeInTheDocument();

    // Check trend chart
    expect(screen.getByTestId("gsc-trend-chart")).toBeInTheDocument();

    // Default queries tab is active
    expect(screen.getByTestId("gsc-query-table")).toBeInTheDocument();
    expect(screen.getByText("work composer download")).toBeInTheDocument();
  });

  it("switches across sub-tabs: Queries, Landing Pages, and Devices & Markets", async () => {
    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-workspace")).toBeInTheDocument();
    });

    // Switch to Landing Pages tab
    const pagesTab = screen.getByRole("button", { name: /Landing Pages/ });
    fireEvent.click(pagesTab);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-page-table")).toBeInTheDocument();
    });
    expect(screen.getByText("https://example.com/")).toBeInTheDocument();

    // Switch to Devices & Markets tab
    const devicesTab = screen.getByRole("button", { name: /Devices & Markets/ });
    fireEvent.click(devicesTab);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-breakdown")).toBeInTheDocument();
    });
    expect(screen.getByTestId("device-breakdown")).toBeInTheDocument();
    expect(screen.getByTestId("country-breakdown")).toBeInTheDocument();
  });

  it("switches date range filter and triggers data reload", async () => {
    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-workspace")).toBeInTheDocument();
    });

    const last7DaysBtn = screen.getByRole("button", { name: "Last 7 Days" });
    fireEvent.click(last7DaysBtn);

    await waitFor(() => {
      expect(api.gsc.getOverview).toHaveBeenCalledTimes(2);
    });
  });

  it("triggers manual sync and displays success message", async () => {
    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-workspace")).toBeInTheDocument();
    });

    const syncButton = screen.getByRole("button", { name: /Sync Now/ });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(api.gsc.triggerSync).toHaveBeenCalledWith("proj-123");
      expect(
        screen.getByText("Background Search Console daily sync initiated. Reloading data...")
      ).toBeInTheDocument();
    });
  });

  it("opens and closes Screen 33 Query Detail Drawer when clicking a query row", async () => {
    render(<GscPerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-query-table")).toBeInTheDocument();
    });

    // Click query row
    const queryRow = screen.getByText("work composer download");
    fireEvent.click(queryRow);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-query-drawer")).toBeInTheDocument();
    });
    expect(screen.getByText(/Query Drilldown/)).toBeInTheDocument();

    // Close drawer via close button
    const closeBtn = screen.getByRole("button", { name: "✕" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("gsc-query-drawer")).not.toBeInTheDocument();
    });
  });
});
