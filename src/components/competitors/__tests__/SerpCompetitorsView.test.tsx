import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { SerpCompetitorsView } from "../SerpCompetitorsView";
import { CompetitorDto } from "@/lib/types";
import { installCompetitorFetchStub, pinClock } from "./competitorFixtures";

describe("SerpCompetitorsView Component", () => {
  const mockCompetitors: CompetitorDto[] = [
    {
      id: "comp-1",
      name: "Hubstaff",
      domain: "hubstaff.com",
      notes: "Main competitor",
    },
    {
      id: "comp-2",
      name: "Time Doctor",
      domain: "timedoctor.com",
    },
  ];

  const defaultProps = {
    projectId: "proj-123",
    projectDomain: "workcomposer.com",
    competitors: mockCompetitors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pinClock();
    installCompetitorFetchStub();
    if (typeof window !== "undefined") {
      window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders notice banner, breadcrumb, action buttons, and keywords list by default", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    expect(screen.getByTestId("serp-competitors-view")).toBeInTheDocument();
    expect(screen.getByText(/This section contains brief information on the top 100 websites/i)).toBeInTheDocument();
    expect(screen.getAllByText("workcomposer.com").length).toBeGreaterThan(0);
    expect(screen.getByText("ADVANCED SERP ANALYSIS")).toBeInTheDocument();
    expect(screen.getByText("EXPORT")).toBeInTheDocument();
    expect(screen.getByText("Keywords (10)")).toBeInTheDocument();
    expect(screen.getByText("work composer download")).toBeInTheDocument();
    expect(screen.getByText("work composer")).toBeInTheDocument();
  });

  it("dismisses the notice banner when clicking dismiss button", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const dismissBtn = screen.getByLabelText("Dismiss notice banner");
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/This section contains brief information on the top 100 websites/i)).not.toBeInTheDocument();
  });

  it("switches active keyword when clicking a keyword item", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const kwButton = screen.getByRole("button", { name: /work composer hack/i });
    fireEvent.click(kwButton);

    expect(kwButton).toHaveClass("bg-blue-50");
  });

  it("filters keywords using the search input", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const searchInput = screen.getByPlaceholderText("Search keyword 🔍");
    fireEvent.change(searchInput, { target: { value: "hack" } });

    expect(screen.getByText("work composer hack")).toBeInTheDocument();
    expect(screen.queryByText("work composer download")).not.toBeInTheDocument();
    expect(screen.getByText("Keywords (1)")).toBeInTheDocument();
  });

  it("selects keyword group from dropdown", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const groupDropdownBtn = screen.getByRole("button", { name: /Select keyword group/i });
    fireEvent.click(groupDropdownBtn);

    const generalOption = screen.getByRole("menuitem", { name: /General/i });
    fireEvent.click(generalOption);

    expect(groupDropdownBtn).toHaveTextContent("General");
    expect(screen.getByText("Keywords (2)")).toBeInTheDocument();
  });

  it("toggles display mode between DOMAIN and URL", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const urlBtn = screen.getByRole("button", { name: "URL" });
    const domainBtn = screen.getByRole("button", { name: "DOMAIN" });

    expect(domainBtn).toHaveClass("bg-[#544f70]");

    fireEvent.click(urlBtn);
    expect(urlBtn).toHaveClass("bg-[#544f70]");

    fireEvent.click(domainBtn);
    expect(domainBtn).toHaveClass("bg-[#544f70]");
  });

  it("changes depth tier pills to filter SERP rows", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const top10Btn = screen.getByRole("button", { name: "TOP 10" });
    fireEvent.click(top10Btn);

    expect(top10Btn).toHaveClass("bg-[#544f70]");
    expect(screen.getAllByText("10 results").length).toBeGreaterThan(0);
  });

  it("toggles highlight competitors switch", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const switchBtn = screen.getByRole("switch", { name: /Highlight competitors/i });
    expect(switchBtn).toHaveAttribute("aria-checked", "false");

    const compBadgesBefore = screen.queryAllByText("Competitor").length;

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute("aria-checked", "true");
    const compBadgesAfter = screen.queryAllByText("Competitor").length;
    expect(compBadgesAfter).toBeGreaterThan(compBadgesBefore);

    fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute("aria-checked", "false");
    expect(screen.queryAllByText("Competitor").length).toBe(compBadgesBefore);
  });

  it("opens, uses, and closes the filter by tags dropdown", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const tagsBtn = screen.getByTestId("serp-filter-by-tags-btn");
    fireEvent.click(tagsBtn);

    expect(screen.getByText("Match:")).toBeInTheDocument();
    expect(screen.getByText("All tags")).toBeInTheDocument();
    expect(screen.getByText("Without tags")).toBeInTheDocument();

    const brandedCheckbox = screen.getByLabelText(/branded/i);
    fireEvent.click(brandedCheckbox);

    expect(tagsBtn).toHaveTextContent("branded");

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Match:")).not.toBeInTheDocument();
  });

  it("opens and closes the column fullscreen modal", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const expandButtons = screen.getAllByTitle("Expand to fullscreen");
    fireEvent.click(expandButtons[0]);

    expect(screen.getByText(/Full SERP Rankings — #/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Full SERP Rankings — #/i)).not.toBeInTheDocument();
  });

  it("opens, switches format, and executes export modal", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    const exportBtn = screen.getByRole("button", { name: /EXPORT/i });
    fireEvent.click(exportBtn);

    const modal = screen.getByRole("dialog", { name: /Export data/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Excel (.xlsx)")).toBeInTheDocument();
    expect(within(modal).getByText("CSV (.csv)")).toBeInTheDocument();

    const csvCard = within(modal).getByRole("button", { name: /CSV \(\.csv\)/i });
    fireEvent.click(csvCard);

    // Click EXPORT inside modal
    const modalExportBtn = within(modal).getByRole("button", { name: "EXPORT" });
    fireEvent.click(modalExportBtn);

    expect(screen.queryByRole("dialog", { name: /Export data/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Export downloaded/i)).toBeInTheDocument();
  });

  it("opens and closes Advanced SERP Analysis modal", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByRole("button", { name: /ADVANCED SERP ANALYSIS/i }));

    expect(screen.getByText("Total Tracked URLs in SERP:")).toBeInTheDocument();
    expect(screen.getByText("Competitor Presence Rate:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Total Tracked URLs in SERP:")).not.toBeInTheDocument();
  });

  it("opens and closes Notes modal", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByRole("button", { name: /Notes \(46\)/i }));

    expect(screen.getByRole("heading", { name: "Notes (46)" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("heading", { name: "Notes (46)" })).not.toBeInTheDocument();
  });

  it("opens and closes Feedback modal", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByRole("button", { name: /Feedback/i }));

    expect(screen.getByRole("heading", { name: "Send Feedback" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Send Feedback" })).not.toBeInTheDocument();
  });

  it("opens Guest Link Modal when clicking Guest link", async () => {
    render(<SerpCompetitorsView {...defaultProps} />);
    await screen.findAllByText("work composer download");

    fireEvent.click(screen.getByTitle("Get access to guest links"));

    expect(screen.getByRole("dialog", { name: /Guest link/i })).toBeInTheDocument();
  });
});
