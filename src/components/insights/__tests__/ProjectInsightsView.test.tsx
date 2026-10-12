import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProjectInsightsView } from "../ProjectInsightsView";

describe("ProjectInsightsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders main header, domain, breadcrumbs, and default detection period", () => {
    render(<ProjectInsightsView projectId="proj-123" projectDomain="workcomposer.com" />);

    expect(screen.getByRole("heading", { level: 1, name: /Insights \/ workcomposer\.com/i })).toBeInTheDocument();
    expect(screen.getByText("workcomposer.com")).toBeInTheDocument();
    expect(screen.getByText("Last day")).toBeInTheDocument();
  });

  it("renders all 10 insight intelligence sections", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    expect(screen.getByRole("heading", { name: /Keywords and pages with easy-to-improve positions/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Keyword cannibalization/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Pages with poor-quality content/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Keywords for which impressions or clicks have significantly increased/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Keywords for which impressions or clicks have significantly decreased/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Low CTR top results/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Pages for which impressions or clicks have significantly increased/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Pages for which impressions or clicks have significantly decreased/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Keywords and pages with changes in snippets/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Competitors who jumped to the Top 10/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Competitors’ new keywords/i })).toBeInTheDocument();
  });

  it("allows dismissing the top information notice banner and the bottom idea banner", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const topBannerClose = screen.getByRole("button", { name: /Dismiss notice/i });
    expect(topBannerClose).toBeInTheDocument();
    fireEvent.click(topBannerClose);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const bottomBannerClose = screen.getByRole("button", { name: /Dismiss banner/i });
    expect(bottomBannerClose).toBeInTheDocument();
    fireEvent.click(bottomBannerClose);
    expect(screen.queryByText(/Do you have an idea for an insight\?/i)).not.toBeInTheDocument();
  });

  it("allows selecting a different detection period from dropdown", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const periodBtn = screen.getByLabelText(/Detection period: Last day/i);
    fireEvent.click(periodBtn);

    const option7Days = screen.getByRole("option", { name: /Last 7 days/i });
    fireEvent.click(option7Days);

    expect(screen.getByLabelText(/Detection period: Last 7 days/i)).toBeInTheDocument();
  });

  it("opens and closes the Easy-to-Improve Positions recommendation modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Keywords and pages with easy-to-improve positions/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Check SERP competitors for your desired keyword\(s\)/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes the Keyword Cannibalization recommendations modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Keyword cannibalization/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Remove, merge, and redirect non-primary pages/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes the Poor-Quality Content recommendations modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Pages with poor-quality content/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Content Score measures content quality and relevancy/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes Keywords and Pages with Changes in Snippets recommendations modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Keywords and pages with changes in snippets/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Compare snippet versions/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes Competitors who jumped to the Top 10 recommendations modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Competitors who jumped to the Top 10/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Add all competitors who have jumped to the Top 10/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes Competitors’ new keywords recommendations modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Competitors’ new keywords/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Add the query to the Keyword Manager/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /^CLOSE$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes GSC recommendations modal and supports Escape key", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Keywords for which impressions or clicks have significantly increased/i });
    const recBtn = within(section).getByRole("button", { name: /RECOMMENDATIONS/i });
    fireEvent.click(recBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Add the query to the Keyword Manager\./i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes View All modal from a section", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const section = screen.getByRole("region", { name: /Keywords and pages with easy-to-improve positions/i });
    const viewAllBtn = within(section).getByRole("button", { name: /VIEW ALL/i });
    fireEvent.click(viewAllBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/All 11 detected opportunities/i)).toBeInTheDocument();
    expect(within(dialog).getByText("11")).toBeInTheDocument();

    const dismissBtn = within(dialog).getByRole("button", { name: /Dismiss/i });
    fireEvent.click(dismissBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows connecting and disconnecting Google Search Console via modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const connectBtn = screen.getAllByRole("button", { name: /Connect Google Search Console/i })[0];
    fireEvent.click(connectBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Google Search Console Integration/i)).toBeInTheDocument();

    const authBtn = within(dialog).getByRole("button", { name: /Authorize Google Account/i });
    fireEvent.click(authBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google Search Console Connected ✓/i })).toBeInTheDocument();
  });

  it("opens and manages Project Notes drawer/modal", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const notesBtn = screen.getByRole("button", { name: /Notes \(46\)/i });
    fireEvent.click(notesBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Project Notes \(46\)/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Content refresh on time tracking hub/i)).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole("button", { name: /Close Notes/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens Feedback modal and handles feedback submission", () => {
    render(<ProjectInsightsView projectId="proj-123" />);

    const feedbackBtn = screen.getByRole("button", { name: /Feedback/i });
    fireEvent.click(feedbackBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const textarea = within(dialog).getByPlaceholderText(/Tell us what you think\.\.\./i);
    fireEvent.change(textarea, { target: { value: "Please add AI summary card" } });

    const submitBtn = within(dialog).getByRole("button", { name: /Submit/i });
    fireEvent.click(submitBtn);

    expect(within(dialog).getByText(/Thank you for your feedback!/i)).toBeInTheDocument();

    const closeFeedbackBtn = within(dialog).getByRole("button", { name: /Close/i });
    fireEvent.click(closeFeedbackBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
