import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CompetitorGapTab } from "../CompetitorGapTab";
import { api } from "@/lib/api";

const mockUseAuth = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      getGap: vi.fn(),
    },
    keywords: {
      bulkStatus: vi.fn(),
    },
  },
}));

describe("CompetitorGapTab Component", () => {
  const mockGapData = {
    items: [
      {
        keywordId: "kw-gap-1",
        keywordText: "employee monitoring software",
        keywordDifficulty: 70,
        cpcUsd: 4.5,
        isActive: false,
        searchVolume: 14000,
        bestCompetitorId: "comp-1",
        bestCompetitorName: "Hubstaff",
        bestCompetitorDomain: "hubstaff.com",
        bestCompetitorPosition: 3,
        targetPosition: null,
        opportunityScore: 85.0,
      },
      {
        keywordId: "kw-gap-2",
        keywordText: "productivity tools",
        keywordDifficulty: 50,
        cpcUsd: 2.5,
        isActive: true,
        searchVolume: 8000,
        bestCompetitorId: "comp-2",
        bestCompetitorName: "Time Doctor",
        bestCompetitorDomain: "timedoctor.com",
        bestCompetitorPosition: 2,
        targetPosition: 25,
        opportunityScore: 72.0,
      },
    ],
    competitors: [
      { id: "comp-1", name: "Hubstaff", domain: "hubstaff.com" },
      { id: "comp-2", name: "Time Doctor", domain: "timedoctor.com" },
    ],
    totalCount: 2,
    page: 1,
    pageSize: 25,
    isStale: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: "u-1", email: "admin@example.com", role: "SuperAdmin" },
    });
    (api.competitors.getGap as any).mockResolvedValue({
      success: true,
      data: mockGapData,
    });
    (api.keywords.bulkStatus as any).mockResolvedValue({
      success: true,
      data: { updatedCount: 1 },
    });
  });

  it("renders gap analysis table with fetched items", async () => {
    render(<CompetitorGapTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("employee monitoring software")).toBeInTheDocument();
      expect(screen.getByText("productivity tools")).toBeInTheDocument();
    });

    expect(screen.getByText("Hubstaff")).toBeInTheDocument();
    expect(screen.getByText("Time Doctor")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("Unranked (>100)")).toBeInTheDocument();
    expect(screen.getByText("#25")).toBeInTheDocument();
    expect(screen.getByText("85.0")).toBeInTheDocument();
    expect(screen.getByText("72.0")).toBeInTheDocument();
  });

  it("activates an inactive keyword when '+ Add to Tracked' is clicked", async () => {
    render(<CompetitorGapTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "+ Add to Tracked" })).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: "+ Add to Tracked" });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(api.keywords.bulkStatus).toHaveBeenCalledWith("proj-123", ["kw-gap-1"], true);
    });

    await waitFor(() => {
      expect(screen.getByText(/Keyword activated and added to tracked rankings/i)).toBeInTheDocument();
    });
  });

  it("disables add button for Viewer role (read-only mode)", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u-2", email: "viewer@example.com", role: "Viewer" },
    });

    render(<CompetitorGapTab projectId="proj-123" />);

    await waitFor(() => {
      const addBtn = screen.getByRole("button", { name: "+ Add to Tracked" });
      expect(addBtn).toBeDisabled();
      expect(addBtn).toHaveAttribute(
        "title",
        "Viewers cannot activate keywords (read-only mode)"
      );
    });
  });

  it("renders empty state when no items are returned", async () => {
    (api.competitors.getGap as any).mockResolvedValue({
      success: true,
      data: {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 25,
        isStale: false,
      },
    });

    render(<CompetitorGapTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("No Keyword Gaps Detected")).toBeInTheDocument();
    });
  });

  it("shows error alert and provides retry button on failure", async () => {
    (api.competitors.getGap as any).mockResolvedValue({
      success: false,
      message: "Network Error loading gap analysis",
    });

    render(<CompetitorGapTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("Network Error loading gap analysis")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
