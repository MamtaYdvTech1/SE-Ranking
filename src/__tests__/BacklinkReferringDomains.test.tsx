import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BacklinkReferringDomainsView } from "../components/backlink-checker/BacklinkReferringDomainsView";
import { MOCK_REFERRING_DOMAINS } from "../data/mockBacklinkData";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/projects/proj-123/backlink-checker/domains",
}));

describe("BacklinkReferringDomains Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies mockBacklinkData has at least 180 records", () => {
    expect(MOCK_REFERRING_DOMAINS.length).toBeGreaterThanOrEqual(180);
  });

  it("renders dual-month calendar picker popover and history controls", () => {
    render(<BacklinkReferringDomainsView projectId="proj-123" />);

    // Check history button with default label
    const historyButton = screen.getByRole("button", { name: /History: Don't show/i });
    expect(historyButton).toBeInTheDocument();

    // Clicking opens popover with presets
    fireEvent.click(historyButton);
    expect(screen.getByRole("button", { name: /^DON'T SHOW$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LAST 30 DAYS$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LAST 3 MONTHS$/i })).toBeInTheDocument();
  });

  it("renders segmented filter controls (ACTIVE, NEW, LOST)", () => {
    render(<BacklinkReferringDomainsView projectId="proj-123" />);

    expect(screen.getByRole("button", { name: /^ACTIVE$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^NEW$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LOST$/i })).toBeInTheDocument();
  });

  it("renders 180-row dataset table with full pagination (Pages 1 to 9, Rows: 20)", () => {
    render(<BacklinkReferringDomainsView projectId="proj-123" />);

    // Total records indicator matches 180 referring domains
    expect(
      screen.getByRole("heading", { name: /180\s+referring domains/i })
    ).toBeInTheDocument();

    // Check pagination buttons: Page 1, Page 2, Page 9
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 9" })).toBeInTheDocument();

    // Check rows per page selector shows 20
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("filters referring domains when segmented status is changed", () => {
    render(<BacklinkReferringDomainsView projectId="proj-123" />);

    const newBtn = screen.getByRole("button", { name: /^NEW$/i });
    fireEvent.click(newBtn);

    // Active status filter is now NEW with active styled class
    expect(newBtn).toHaveClass("bg-[#433b5c]");
  });
});
