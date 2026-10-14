import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddedCompetitorsView } from "../AddedCompetitorsView";
import { CompetitorDto } from "@/lib/types";
import { installCompetitorFetchStub, pinClock } from "./competitorFixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("AddedCompetitorsView Component", () => {
  const mockCompetitors: CompetitorDto[] = [
    {
      id: "comp-1",
      name: "Hubstaff",
      domain: "hubstaff.com",
      notes: "Main tracking competitor",
      lastCheckedAt: "2026-09-20T10:00:00Z",
    },
    {
      id: "comp-2",
      name: "Time Doctor",
      domain: "timedoctor.com",
      notes: "Feature parity competitor",
      lastCheckedAt: "2026-09-22T10:00:00Z",
    },
  ];

  const defaultProps = {
    projectId: "proj-123",
    projectDomain: "workcomposer.com",
    competitors: mockCompetitors,
    canEdit: true,
    onAddCompetitor: vi.fn(),
    onEditCompetitor: vi.fn(),
    onDeleteCompetitor: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pinClock();
    installCompetitorFetchStub();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders breadcrumbs, action buttons, and overall graph view by default", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    expect(screen.getAllByText("workcomposer.com")[0]).toBeInTheDocument();
    expect(screen.getByText("Added Competitors")).toBeInTheDocument();
    expect(screen.getByText("AVERAGE POSITION")).toBeInTheDocument();
    expect(screen.getByText("SEARCH VOL.")).toBeInTheDocument();
    expect(screen.getByText("work composer download")).toBeInTheDocument();
  });

  it("switches to detailed view and lists competitors with actions", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByRole("button", { name: "Detailed" }));

    expect(screen.getByText("Tracked Competitor Domains (2/5)")).toBeInTheDocument();
    expect(screen.getByText("Hubstaff")).toBeInTheDocument();
    expect(screen.getByText("hubstaff.com")).toBeInTheDocument();
    expect(screen.getByText("Time Doctor")).toBeInTheDocument();
  });

  it("switches between metric tabs on overall view", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const trafficTab = screen.getByRole("button", { name: "TRAFFIC FORECAST" });
    fireEvent.click(trafficTab);
    expect(trafficTab).toHaveClass("text-blue-600");

    const visTab = screen.getByRole("button", { name: "SEARCH VISIBILITY" });
    fireEvent.click(visTab);
    expect(visTab).toHaveClass("text-blue-600");
  });

  it("filters keywords by search input", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const searchInput = screen.getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "hack" } });

    expect(screen.getByText("work composer hack")).toBeInTheDocument();
    expect(screen.queryByText("work composer download")).not.toBeInTheDocument();
  });

  it("opens and closes the export modal", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const exportButton = screen.getByText("EXPORT");
    fireEvent.click(exportButton);

    expect(screen.getByText("Export data")).toBeInTheDocument();
    expect(screen.getByText("Excel (.xlsx)")).toBeInTheDocument();
    expect(screen.getByText("CSV (.csv)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(screen.queryByText("Export data")).not.toBeInTheDocument();
  });

  it("triggers onAddCompetitor when clicking Add Competitor button", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const addButtons = screen.getAllByRole("button", { name: /\+ ADD COMPETITOR/i });
    fireEvent.click(addButtons[0]);
    expect(defaultProps.onAddCompetitor).toHaveBeenCalled();
  });

  it("renders keyword rows and competitor columns from the keyword matrix", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    expect(screen.getByText("Keywords 10")).toBeInTheDocument();
    expect(screen.getAllByText("hubstaff.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText("timedoctor.com")[0]).toBeInTheDocument();
    expect(screen.getByText("composer download")).toBeInTheDocument();
    expect(screen.getByText("1.9K")).toBeInTheDocument();
  });

  it("filters keywords by competitor position tier TOP 10", async () => {
    render(<AddedCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByRole("button", { name: "TOP 10" }));

    expect(screen.getByText("work composer download")).toBeInTheDocument();
    expect(screen.getByText("work composer")).toBeInTheDocument();
    expect(screen.getByText("work composer hack")).toBeInTheDocument();
    expect(screen.queryByText("idle time tracker")).not.toBeInTheDocument();
  });
});
