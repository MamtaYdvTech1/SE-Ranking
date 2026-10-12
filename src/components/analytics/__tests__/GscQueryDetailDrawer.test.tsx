import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { GscQueryDetailDrawer } from "../GscQueryDetailDrawer";
import { api } from "@/lib/api";
import { GscQueryDetailDto } from "@/lib/types";

describe("GscQueryDetailDrawer Component", () => {
  const mockDetail: GscQueryDetailDto = {
    query: "work composer download",
    totalClicks: 1240,
    totalImpressions: 14500,
    averageCtr: 0.0855,
    averagePosition: 2.1,
    topPages: [
      "https://example.com/downloads",
      "https://example.com/features/work-composer",
    ],
    history: [
      { date: "2026-03-01", clicks: 150, impressions: 1800, ctr: 0.0833, position: 2.3 },
      { date: "2026-03-02", clicks: 180, impressions: 2100, ctr: 0.0857, position: 2.0 },
    ],
  };

  const defaultProps = {
    projectId: "proj-123",
    queryText: "work composer download",
    isOpen: true,
    onClose: vi.fn(),
    startDate: "2026-02-01",
    endDate: "2026-02-28",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when isOpen is false", () => {
    render(<GscQueryDetailDrawer {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("gsc-query-drawer")).not.toBeInTheDocument();
  });

  it("handles null queryText without crashing and displays fallback title", () => {
    render(<GscQueryDetailDrawer {...defaultProps} queryText={null} />);
    expect(screen.getByText("Query Details")).toBeInTheDocument();
  });

  it("renders loading skeleton when fetching query history", async () => {
    vi.spyOn(api.gsc, "getQueryHistory").mockImplementation(() => new Promise(() => {}));

    render(<GscQueryDetailDrawer {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId("gsc-drawer-loading")).toBeInTheDocument();
    });
  });

  it("renders error alert when API call fails", async () => {
    vi.spyOn(api.gsc, "getQueryHistory").mockRejectedValue(
      new Error("Network timeout loading query history.")
    );

    render(<GscQueryDetailDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("gsc-drawer-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Network timeout loading query history.")).toBeInTheDocument();
  });

  it("renders detail content with KPIs, top landing pages, and history table", async () => {
    vi.spyOn(api.gsc, "getQueryHistory").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockDetail,
    });

    render(<GscQueryDetailDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Query: work composer download")).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getAllByText("8.6%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2.1")).toBeInTheDocument();

    // Check top landing pages
    expect(screen.getByText("https://example.com/downloads")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/features/work-composer")).toBeInTheDocument();

    // Check history table rows
    expect(screen.getByText("2026-03-01")).toBeInTheDocument();
    expect(screen.getByText("2026-03-02")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    vi.spyOn(api.gsc, "getQueryHistory").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockDetail,
    });

    const onClose = vi.fn();
    render(<GscQueryDetailDrawer {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText("Query: work composer download")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: "✕" });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("renders empty history fallback row when history is empty", async () => {
    vi.spyOn(api.gsc, "getQueryHistory").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        ...mockDetail,
        history: [],
      },
    });

    render(<GscQueryDetailDrawer {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("No daily history records found for this query.")
      ).toBeInTheDocument();
    });
  });
});
