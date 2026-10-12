import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddedCompetitorsView } from "../AddedCompetitorsView";
import { CompetitorDto } from "@/lib/types";

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
  });

  it("renders breadcrumbs, action buttons, and overall graph view by default", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    expect(screen.getAllByText("workcomposer.com")[0]).toBeInTheDocument();
    expect(screen.getByText("Added Competitors")).toBeInTheDocument();
    expect(screen.getByText("AVERAGE POSITION")).toBeInTheDocument();
    expect(screen.getByText("SEARCH VOL.")).toBeInTheDocument();
    expect(screen.getByText("work composer download")).toBeInTheDocument();
  });

  it("switches to detailed view and lists competitors with actions", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Detailed" }));

    expect(screen.getByText("Tracked Competitor Domains (2/5)")).toBeInTheDocument();
    expect(screen.getByText("Hubstaff")).toBeInTheDocument();
    expect(screen.getByText("hubstaff.com")).toBeInTheDocument();
    expect(screen.getByText("Time Doctor")).toBeInTheDocument();
  });

  it("switches between metric tabs on overall view", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    const trafficTab = screen.getByRole("button", { name: "TRAFFIC FORECAST" });
    fireEvent.click(trafficTab);
    expect(trafficTab).toHaveClass("text-blue-600");

    const visTab = screen.getByRole("button", { name: "SEARCH VISIBILITY" });
    fireEvent.click(visTab);
    expect(visTab).toHaveClass("text-blue-600");
  });

  it("filters keywords by search input", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search 🔍");
    fireEvent.change(searchInput, { target: { value: "hack" } });

    expect(screen.getByText("work composer hack")).toBeInTheDocument();
    expect(screen.queryByText("work composer download")).not.toBeInTheDocument();
  });

  it("opens and closes the export modal", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    const exportButton = screen.getByText("EXPORT");
    fireEvent.click(exportButton);

    expect(screen.getByText("Export data")).toBeInTheDocument();
    expect(screen.getByText("Excel (.xlsx)")).toBeInTheDocument();
    expect(screen.getByText("CSV (.csv)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(screen.queryByText("Export data")).not.toBeInTheDocument();
  });

  it("triggers onAddCompetitor when clicking Add Competitor button", () => {
    render(<AddedCompetitorsView {...defaultProps} />);

    const addButtons = screen.getAllByRole("button", { name: /\+ ADD COMPETITOR/i });
    fireEvent.click(addButtons[0]);
    expect(defaultProps.onAddCompetitor).toHaveBeenCalled();
  });

  it("renders real myjio.com dataset with real keywords and competitor columns", () => {
    render(<AddedCompetitorsView projectId="proj-jio" projectDomain="myjio.com" competitors={[]} />);

    // Header limits, notes, and domain
    expect(screen.getAllByText("myjio.com")[0]).toBeInTheDocument();
    expect(screen.getByText("Notes (49)")).toBeInTheDocument();
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    expect(screen.getByText("Keywords 10")).toBeInTheDocument();

    // Competitor column headers and chart legend
    expect(screen.getAllByText("Paytm.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText("airtel.in")[0]).toBeInTheDocument();
    expect(screen.getAllByText("bsnl.co.in")[0]).toBeInTheDocument();
    expect(screen.getAllByText("mobikwik.com")[0]).toBeInTheDocument();
    expect(screen.getAllByText("phonepe.com")[0]).toBeInTheDocument();

    // Real keywords and volumes
    expect(screen.getByText("myjio")).toBeInTheDocument();
    expect(screen.getByText("246K")).toBeInTheDocument();
    expect(screen.getByText("jio recharge")).toBeInTheDocument();
    expect(screen.getByText("1.22M")).toBeInTheDocument();
    expect(screen.getByText("jio prepaid recharge")).toBeInTheDocument();
    expect(screen.getByText("40.5K")).toBeInTheDocument();
  });

  it("filters myjio keywords by position tier TOP 10", () => {
    render(<AddedCompetitorsView projectId="proj-jio" projectDomain="myjio.com" competitors={[]} />);

    const top10Button = screen.getByRole("button", { name: "TOP 10" });
    fireEvent.click(top10Button);

    // Keywords with rank <= 10 should be visible
    expect(screen.getByText("jio recharge")).toBeInTheDocument();
    expect(screen.getByText("jio recharge online")).toBeInTheDocument();
    expect(screen.getByText("jio mobile recharge")).toBeInTheDocument();
    expect(screen.getByText("jio prepaid recharge")).toBeInTheDocument();

    // Keywords without rank <= 10 should not be visible
    expect(screen.queryByText("myjio login")).not.toBeInTheDocument();
    expect(screen.queryByText("myjio account")).not.toBeInTheDocument();
  });
});
