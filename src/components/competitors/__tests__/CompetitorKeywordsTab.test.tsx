import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CompetitorKeywordsTab } from "../CompetitorKeywordsTab";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      getKeywords: vi.fn(),
    },
  },
}));

describe("CompetitorKeywordsTab Component", () => {
  const mockKeywordsData = {
    items: [
      {
        keywordId: "kw-1",
        keywordText: "employee tracking software",
        searchVolume: 18100,
        targetPosition: 4,
        targetPositionChange: 1,
        competitorRanks: {
          "comp-1": { position: 1, positionChange: 0 },
          "comp-2": { position: 3, positionChange: -1 },
        },
      },
      {
        keywordId: "kw-2",
        keywordText: "time tracking with screenshots",
        searchVolume: null,
        targetPosition: null,
        targetPositionChange: null,
        competitorRanks: {
          "comp-1": { position: 5, positionChange: 2 },
          "comp-2": { position: null, positionChange: null },
        },
      },
    ],
    competitors: [
      { id: "comp-1", name: "Hubstaff", domain: "hubstaff.com" },
      { id: "comp-2", name: "Time Doctor", domain: "timedoctor.com" },
    ],
    totalCount: 30,
    pageNumber: 1,
    pageSize: 25,
    isStale: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.competitors.getKeywords as any).mockResolvedValue({
      success: true,
      data: mockKeywordsData,
    });
  });

  it("renders keyword comparison matrix with competitors header", async () => {
    render(<CompetitorKeywordsTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("employee tracking software")).toBeInTheDocument();
      expect(screen.getByText("time tracking with screenshots")).toBeInTheDocument();
    });

    expect(screen.getByText("Primary Domain")).toBeInTheDocument();
    expect(screen.getByText("Hubstaff")).toBeInTheDocument();
    expect(screen.getByText("Time Doctor")).toBeInTheDocument();

    // Ranks and changes
    expect(screen.getByText("#4")).toBeInTheDocument();
    expect(screen.getByText("▲1")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("▼1")).toBeInTheDocument();
  });

  it("renders pagination controls when totalCount > pageSize", async () => {
    render(<CompetitorKeywordsTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 25 of 30/i)).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole("button", { name: "Next" });
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(api.competitors.getKeywords).toHaveBeenCalledWith(
        "proj-123",
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("displays empty state message when no keywords are found", async () => {
    (api.competitors.getKeywords as any).mockResolvedValue({
      success: true,
      data: {
        items: [],
        competitors: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 25,
        isStale: false,
      },
    });

    render(<CompetitorKeywordsTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("No tracked keywords found.")).toBeInTheDocument();
    });
  });

  it("shows error alert on API failure", async () => {
    (api.competitors.getKeywords as any).mockResolvedValue({
      success: false,
      message: "Failed to load matrix data.",
    });

    render(<CompetitorKeywordsTab projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load matrix data.")).toBeInTheDocument();
    });
  });
});
