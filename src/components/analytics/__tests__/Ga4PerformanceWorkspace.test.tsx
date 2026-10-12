import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Ga4PerformanceWorkspace } from "../Ga4PerformanceWorkspace";
import { api } from "@/lib/api";
import { Ga4ConnectionDto, Ga4OverviewDto, Ga4PageRowDto, PaginatedList } from "@/lib/types";

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

describe("Ga4PerformanceWorkspace Component", { timeout: 15000 }, () => {
  const mockStatus: Ga4ConnectionDto = {
    propertyIdentifier: "properties/318492041",
    syncStatus: "Active",
    lastSyncedAt: "2026-09-19T10:00:00Z",
  };

  const mockOverview: Ga4OverviewDto = {
    totalSessions: 48920,
    totalActiveUsers: 39410,
    averageEngagementRate: 0.6482,
    totalConversions: 1840,
    totalRevenue: 34850.0,
    dailySeries: [
      { date: "2026-09-15", sessions: 1820, activeUsers: 1540 },
      { date: "2026-09-16", sessions: 1790, activeUsers: 1480 },
      { date: "2026-09-17", sessions: 1910, activeUsers: 1620 },
    ],
  };

  const mockPages: PaginatedList<Ga4PageRowDto> = {
    items: [
      {
        landingPage: "/",
        sessions: 18450,
        activeUsers: 14900,
        engagementRate: 0.684,
        conversions: 890,
        revenue: 16820.0,
      },
      {
        landingPage: "/features/team-tracking",
        sessions: 8920,
        activeUsers: 7210,
        engagementRate: 0.612,
        conversions: 410,
        revenue: 8200.0,
      },
      {
        landingPage: "/pricing",
        sessions: 6410,
        activeUsers: 5320,
        engagementRate: 0.745,
        conversions: 320,
        revenue: 6400.0,
      },
    ],
    totalCount: 3,
    pageNumber: 1,
    pageSize: 50,
    totalPages: 2,
    hasPreviousPage: false,
    hasNextPage: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRole = "SuperAdmin";
  });

  it("renders loading skeleton initially while fetching GA4 data", async () => {
    vi.spyOn(api.ga4, "getStatus").mockImplementation(() => new Promise(() => {}));
    vi.spyOn(api.ga4, "getOverview").mockImplementation(() => new Promise(() => {}));
    vi.spyOn(api.ga4, "getPages").mockImplementation(() => new Promise(() => {}));

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    expect(screen.getByTestId("ga4-loading")).toBeInTheDocument();
  });

  it("renders not connected state when GA4 property is unbound", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: null,
        syncStatus: "Disconnected",
        lastSyncedAt: null,
      },
    });
    vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-not-connected")).toBeInTheDocument();
    });

    expect(screen.getByText("Google Analytics 4 Not Connected")).toBeInTheDocument();
    const configLink = screen.getByRole("link", { name: /Configure GA4 Integration Settings/i });
    expect(configLink).toHaveAttribute("href", "/projects/proj-123/settings/integrations/ga4");
  });

  it("renders error alert when API call rejects", async () => {
    vi.spyOn(api.ga4, "getStatus").mockRejectedValue(new Error("API rate limit exceeded"));
    vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-feedback-error")).toBeInTheDocument();
      expect(screen.getByText("API rate limit exceeded")).toBeInTheDocument();
    });
  });

  it("renders populated GA4 workspace with KPIs, trend chart, and landing pages table", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockStatus,
    });
    vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-workspace")).toBeInTheDocument();
    });

    // Header & Badge
    expect(screen.getByText("Google Analytics 4")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("properties/318492041")).toBeInTheDocument();

    // Freshness
    expect(screen.getByTestId("ga4-freshness")).toHaveTextContent("Last Synced:");

    // 5 KPI Cards
    const kpis = screen.getByTestId("ga4-kpis");
    expect(kpis).toHaveTextContent("Organic Sessions");
    expect(kpis).toHaveTextContent("Active Users");
    expect(kpis).toHaveTextContent("Avg Engagement Rate");
    expect(kpis).toHaveTextContent("64.82%");
    expect(kpis).toHaveTextContent("Total Conversions");
    expect(kpis).toHaveTextContent("Total Revenue");

    // Trend Chart
    const trendChart = screen.getByTestId("ga4-trend-chart");
    expect(trendChart).toHaveTextContent("Daily Organic Sessions & Active Users");
    expect(trendChart).toHaveTextContent("Sessions");
    expect(trendChart).toHaveTextContent("Active Users");

    // Landing Pages Table
    const pagesTable = screen.getByTestId("ga4-pages-table");
    expect(pagesTable).toHaveTextContent("Organic Landing Pages");
    expect(pagesTable).toHaveTextContent("/");
    expect(pagesTable).toHaveTextContent("/features/team-tracking");
    expect(pagesTable).toHaveTextContent("/pricing");
    expect(pagesTable).toHaveTextContent("68.40%");

    // Pagination
    expect(screen.getByText(/Showing Page 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("handles timeframe selector switching (7d, 28d, 90d)", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockStatus,
    });
    const getOverviewSpy = vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-workspace")).toBeInTheDocument();
    });

    // Switch to Last 7 Days
    const sevenDaysBtn = screen.getByRole("button", { name: "Last 7 Days" });
    fireEvent.click(sevenDaysBtn);

    await waitFor(() => {
      expect(getOverviewSpy).toHaveBeenCalledTimes(2);
    });

    // Switch to Last 90 Days
    const ninetyDaysBtn = screen.getByRole("button", { name: "Last 90 Days" });
    fireEvent.click(ninetyDaysBtn);

    await waitFor(() => {
      expect(getOverviewSpy).toHaveBeenCalledTimes(3);
    });
  });

  it("triggers GA4 sync when clicking Sync Now button", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockStatus,
    });
    vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });
    const syncSpy = vi.spyOn(api.ga4, "triggerSync").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { queued: true },
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-workspace")).toBeInTheDocument();
    });

    const syncBtn = screen.getByRole("button", { name: /Sync Now/i });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledWith("proj-123");
      expect(screen.getByTestId("ga4-feedback-success")).toBeInTheDocument();
      expect(
        screen.getByText("GA4 organic traffic sync job queued successfully in background.")
      ).toBeInTheDocument();
    });
  });

  it("handles table search filter input and table column sorting", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockStatus,
    });
    vi.spyOn(api.ga4, "getOverview").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockOverview,
    });
    const getPagesSpy = vi.spyOn(api.ga4, "getPages").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockPages,
    });

    render(<Ga4PerformanceWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("ga4-workspace")).toBeInTheDocument();
    });

    // Search input
    const searchInput = screen.getByPlaceholderText("Search landing page URL...");
    fireEvent.change(searchInput, { target: { value: "pricing" } });

    await waitFor(() => {
      expect(getPagesSpy).toHaveBeenCalledWith(
        "proj-123",
        expect.objectContaining({ search: "pricing", page: 1 })
      );
    });

    // Click on Landing Page URL column header
    const landingPageHeader = screen.getByText("Landing Page URL");
    fireEvent.click(landingPageHeader);

    await waitFor(() => {
      expect(getPagesSpy).toHaveBeenCalledWith(
        "proj-123",
        expect.objectContaining({ sortBy: "landingpage", sortDescending: false })
      );
    });
  });
});
