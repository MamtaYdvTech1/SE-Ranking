import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectSidebar } from "../components/navigation/ProjectSidebar";
import { ProjectDetailDto } from "../lib/types";

let mockPathname = "/projects/proj-123";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("ProjectSidebar Component Integration", () => {
  const mockProject: ProjectDetailDto = {
    id: "proj-123",
    name: "WorkComposer Main",
    primaryDomain: "workcomposer.com",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
  };

  const mockToggleCollapse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/projects/proj-123";
  });

  it("renders key sidebar hierarchy: AI Results Tracker, Insights, Backlink Checker, Marketing Plan, Website Audit", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    expect(screen.getByText("workcomposer.com")).toBeInTheDocument();

    // Verify key hierarchy items
    const aiTrackerLink = screen.getByRole("link", { name: /AI Results Tracker/i });
    expect(aiTrackerLink).toBeInTheDocument();
    expect(aiTrackerLink).toHaveAttribute("href", "/projects/proj-123/ai-results-tracker/rankings");

    const insightsLink = screen.getByRole("link", { name: /^Insights$/i });
    expect(insightsLink).toBeInTheDocument();
    expect(insightsLink).toHaveAttribute("href", "/projects/proj-123/insights");

    const backlinkCheckerLink = screen.getByRole("link", { name: /^Backlink Checker$/i });
    expect(backlinkCheckerLink).toBeInTheDocument();
    expect(backlinkCheckerLink).toHaveAttribute("href", "/projects/proj-123/backlink-checker/overview");

    const marketingPlanLink = screen.getByRole("link", { name: /^Marketing Plan$/i });
    expect(marketingPlanLink).toBeInTheDocument();
    expect(marketingPlanLink).toHaveAttribute("href", "/projects/proj-123/marketing-plan");

    const websiteAuditLink = screen.getByRole("link", { name: /^Website Audit$/i });
    expect(websiteAuditLink).toBeInTheDocument();
    expect(websiteAuditLink).toHaveAttribute("href", "/projects/proj-123/audit/overview");
  });

  it("expands AI Results Tracker accordion showing Rankings, Competitors, and Sources", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    // AI Results Tracker sub-links toggle
    const aiToggleBtn = screen.getByRole("button", { name: /Toggle AI Results Tracker menu/i });
    expect(aiToggleBtn).toBeInTheDocument();
    fireEvent.click(aiToggleBtn);

    // The sub items should be in the document
    expect(screen.getByRole("link", { name: /•Rankings/i })).toHaveAttribute(
      "href",
      "/projects/proj-123/ai-results-tracker/rankings"
    );
    expect(screen.getByRole("link", { name: /•Competitors/i })).toHaveAttribute(
      "href",
      "/projects/proj-123/ai-results-tracker/competitors"
    );
    expect(screen.getByRole("link", { name: /•Sources/i })).toHaveAttribute(
      "href",
      "/projects/proj-123/ai-results-tracker/sources"
    );
  });

  it("allows toggling sidebar collapse state", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    const collapseBtn = screen.getByTitle(/Collapse Project Sidebar/i);
    fireEvent.click(collapseBtn);
    expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
  });
});
