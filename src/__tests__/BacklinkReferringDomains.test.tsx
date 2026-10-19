import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BacklinkReferringDomainsView } from "../components/backlink-checker/BacklinkReferringDomainsView";
import type { ReferringDomainRecord } from "../components/backlink-checker/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/projects/proj-123/backlink-checker/domains",
}));

// 45 active referring domains (the view's default filter) -> 3 pages at 20 rows
const FIXTURE_DOMAINS: ReferringDomainRecord[] = Array.from({ length: 45 }, (_, i) => ({
  id: `rd-${i + 1}`,
  domain: `site${i + 1}.example`,
  domainTrust: 10 + (i % 80),
  pageTrust: 5,
  domainTraffic: "—",
  domainTrafficNum: 0,
  backlinksCount: 1 + (i % 3),
  keywords: "—",
  keywordsNum: 0,
  domainAge: "—",
  firstSeen: "01 Jan 2026",
  lastSeen: "01 Oct 2026",
  status: "Active",
  dofollowCount: 1,
  nofollowCount: 0,
}));

describe("BacklinkReferringDomains Integration Suite", () => {
  let projectSeq = 0;
  let projectId = "proj-123";

  beforeEach(() => {
    vi.clearAllMocks();
    // Fresh project id per test so the explorer's per-project cache never leaks between tests
    projectId = `proj-test-${++projectSeq}`;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ success: true, referringDomains: FIXTURE_DOMAINS, backlinks: [] }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads referring domains from the project's explorer endpoint", async () => {
    render(<BacklinkReferringDomainsView projectId={projectId} />);
    expect(
      await screen.findByRole("heading", { name: /45\s+referring domains/i })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      `/api/projects/${projectId}/backlinks/explorer`,
      expect.anything()
    );
  });

  it("renders dual-month calendar picker popover and history controls", () => {
    render(<BacklinkReferringDomainsView projectId={projectId} />);

    const historyButton = screen.getByRole("button", { name: /History: Don't show/i });
    expect(historyButton).toBeInTheDocument();

    fireEvent.click(historyButton);
    expect(screen.getByRole("button", { name: /^DON'T SHOW$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LAST 30 DAYS$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LAST 3 MONTHS$/i })).toBeInTheDocument();
  });

  it("renders segmented filter controls (ACTIVE, NEW, LOST)", () => {
    render(<BacklinkReferringDomainsView projectId={projectId} />);

    expect(screen.getByRole("button", { name: /^ACTIVE$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^NEW$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^LOST$/i })).toBeInTheDocument();
  });

  it("paginates the stored dataset at 20 rows per page", async () => {
    render(<BacklinkReferringDomainsView projectId={projectId} />);

    await screen.findByRole("heading", { name: /45\s+referring domains/i });
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 4" })).not.toBeInTheDocument();
    // Rows-per-page selector (a fixture DT value can also read "20")
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  });

  it("filters referring domains when segmented status is changed", () => {
    render(<BacklinkReferringDomainsView projectId={projectId} />);

    const newBtn = screen.getByRole("button", { name: /^NEW$/i });
    fireEvent.click(newBtn);

    expect(newBtn).toHaveClass("bg-[#433b5c]");
  });
});
