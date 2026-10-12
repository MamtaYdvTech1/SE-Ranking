import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ShareOfVoiceView } from "../ShareOfVoiceView";
import { CompetitorDto } from "@/lib/types";

describe("ShareOfVoiceView Component", () => {
  const mockCompetitors: CompetitorDto[] = [
    {
      id: "comp-1",
      name: "Hubstaff",
      domain: "hubstaff.com",
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
    if (typeof window !== "undefined") {
      window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders notice banner, breadcrumbs, action buttons, KPI cards, and domain table by default", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    expect(screen.getByTestId("share-of-voice-view")).toBeInTheDocument();
    expect(
      screen.getByText(/This section shows the shares of your site and its competitors/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("workcomposer.com").length).toBeGreaterThan(0);
    expect(screen.getByText("All search engines")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select comparison dates" })).toBeInTheDocument();
    expect(screen.getByText("TOTAL TRAFFIC FORECAST")).toBeInTheDocument();
    expect(screen.getAllByText("SHARE OF VOICE").length).toBeGreaterThan(0);
    expect(screen.getByText("getcomposer.org")).toBeInTheDocument();
    expect(screen.getByText("Target site")).toBeInTheDocument();
  });

  it("dismisses the top notice alert banner", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const dismissBtn = screen.getByLabelText("Dismiss notice banner");
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/This section shows the shares of your site and its competitors/i)
    ).not.toBeInTheDocument();
  });

  it("selects search engine from dropdown", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const engineBtn = screen.getByText("All search engines");
    fireEvent.click(engineBtn);

    const mobileOption = screen.getByText("Google Mobile (US)");
    fireEvent.click(mobileOption);

    expect(screen.getByText("Google Mobile (US)")).toBeInTheDocument();
  });

  it("opens, interacts with, and closes the two-date comparison calendar", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const dateBtn = screen.getByRole("button", { name: "Select comparison dates" });
    fireEvent.click(dateBtn);

    expect(screen.getByRole("dialog", { name: "Two-date comparison calendar" })).toBeInTheDocument();
    expect(
      screen.getByText("Select two dates to measure changes between them.")
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: "CANCEL" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole("dialog", { name: "Two-date comparison calendar" })).not.toBeInTheDocument();
  });

  it("toggles the keyword selection section visibility", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const toggleBtn = screen.getByLabelText("Toggle keyword selection panel");
    expect(screen.getByLabelText("Select keywords")).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByLabelText("Select keywords")).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByLabelText("Select keywords")).toBeInTheDocument();
  });

  it("opens keywords dropdown and filters by search", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const kwDropdownBtn = screen.getByLabelText("Select keywords");
    fireEvent.click(kwDropdownBtn);

    expect(screen.getByRole("region", { name: "Keywords selector menu" })).toBeInTheDocument();

    const searchInput = screen.getByLabelText("Search keywords in dropdown");
    fireEvent.change(searchInput, { target: { value: "hack" } });

    expect(screen.getByText("work composer hack")).toBeInTheDocument();
    expect(screen.queryByText("work composer download")).not.toBeInTheDocument();
  });

  it("opens tags dropdown, selects tag, and applies filters", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const tagsBtn = screen.getByLabelText("Select tags");
    fireEvent.click(tagsBtn);

    expect(screen.getByRole("region", { name: "Tags selector menu" })).toBeInTheDocument();

    const coreTag = screen.getByLabelText("core");
    fireEvent.click(coreTag);

    expect(tagsBtn).toHaveTextContent("core");

    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    const applyBtn = screen.getByRole("button", { name: /APPLY FILTERS/i });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/Filters applied:/i)).toBeInTheDocument();
  });

  it("resets filters when clicking CLEAR ALL", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const clearBtn = screen.getByRole("button", { name: /CLEAR ALL/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText(/Filters reset: Showing all keywords/i)).toBeInTheDocument();
  });

  it("filters domain table by domain search input", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const domainSearch = screen.getByPlaceholderText("Search domain 🔍");
    fireEvent.change(domainSearch, { target: { value: "timedoctor" } });

    expect(screen.getByText("timedoctor.com")).toBeInTheDocument();
    expect(screen.queryByText("getcomposer.org")).not.toBeInTheDocument();
  });

  it("expands and collapses domain row to view nested URLs", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    // Initially getcomposer.org is expanded (id domain-1)
    expect(screen.getByText("https://getcomposer.org/download/")).toBeInTheDocument();

    // Click row to collapse
    const composerRow = screen.getByText("getcomposer.org");
    fireEvent.click(composerRow);

    expect(screen.queryByText("https://getcomposer.org/download/")).not.toBeInTheDocument();

    // Click again to re-expand
    fireEvent.click(composerRow);
    expect(screen.getByText("https://getcomposer.org/download/")).toBeInTheDocument();
  });

  it("opens export modal, toggles detailed breakdown, and executes export", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    const exportBtn = screen.getByRole("button", { name: /EXPORT/i });
    fireEvent.click(exportBtn);

    const modal = screen.getByRole("dialog", { name: /Export data/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Excel (.xlsx)")).toBeInTheDocument();
    expect(within(modal).getByText("CSV (.csv)")).toBeInTheDocument();

    // Check include keywords and URLs
    const includeCheckbox = screen.getByLabelText("Include keywords and URLs");
    fireEvent.click(includeCheckbox);

    // Switch to CSV
    const csvCard = within(modal).getByRole("button", { name: /CSV \(\.csv\)/i });
    fireEvent.click(csvCard);

    // Click EXPORT inside modal
    const modalExportBtn = within(modal).getByRole("button", { name: "EXPORT" });
    fireEvent.click(modalExportBtn);

    expect(screen.queryByRole("dialog", { name: /Export data/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Export downloaded/i)).toBeInTheDocument();
  });

  it("opens and closes Feedback modal", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Feedback/i }));

    expect(screen.getByText("Share of Voice Feedback")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Share of Voice Feedback")).not.toBeInTheDocument();
  });

  it("opens and closes Notes modal", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Notes \(46\)/i }));

    expect(screen.getByText("Project Notes (46)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Project Notes (46)")).not.toBeInTheDocument();
  });

  it("opens Guest Link Modal when clicking Guest link", () => {
    render(<ShareOfVoiceView {...defaultProps} />);

    fireEvent.click(screen.getByTitle("Get access to guest links"));

    expect(screen.getByRole("dialog", { name: /Guest link/i })).toBeInTheDocument();
  });
});
