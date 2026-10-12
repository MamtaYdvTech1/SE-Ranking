import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectSidebar } from "../ProjectSidebar";
import LayoutProjectSidebar from "@/components/layout/ProjectSidebar";
import { ProjectDetailDto } from "@/lib/types";

let mockPathname = "/projects/proj-123";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("ProjectSidebar Component", () => {
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

  it("renders project primary domain and key navigation links", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    expect(screen.getByText("workcomposer.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^All Projects$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Project Overview$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Rankings$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Keywords$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Search Console$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Analytics & Traffic$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^My Competitors$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^AI Results Tracker$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Insights$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Marketing Plan$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Website Audit$/i })).toBeInTheDocument();
  });

  it("triggers onToggleCollapse when collapse button is clicked", () => {
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

  it("renders collapsed mode and allows expanding via expand button", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={true}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    const expandBtn = screen.getByTitle(/Expand Project Sidebar/i);
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);
    expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it("opens project dropdown menu when project selector is clicked", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    const projectSelectorBtn = screen.getByRole("button", { name: /workcomposer\.com/i });
    fireEvent.click(projectSelectorBtn);

    expect(screen.getByText(/Current Project/i)).toBeInTheDocument();
    expect(screen.getByText(/WorkComposer Main \(workcomposer\.com\)/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Switch \/ All Projects/i })).toBeInTheDocument();
  });

  it("allows expanding and collapsing nested sections like My Competitors and Analytics", () => {
    render(
      <ProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    const competitorsToggle = screen.getByRole("button", { name: /Toggle My Competitors menu/i });
    fireEvent.click(competitorsToggle);

    expect(screen.getByRole("link", { name: /•Added Competitors/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /•SERP Competitors/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /•Share of Voice/i })).toBeInTheDocument();

    const analyticsToggle = screen.getByRole("button", { name: /Toggle Analytics & Traffic menu/i });
    fireEvent.click(analyticsToggle);
    expect(screen.queryByRole("link", { name: /Google Search Console Data/i })).not.toBeInTheDocument();
  });

  it("works seamlessly through layout/ProjectSidebar proxy re-export", () => {
    render(
      <LayoutProjectSidebar
        project={mockProject}
        isCollapsed={false}
        onToggleCollapse={mockToggleCollapse}
      />
    );

    expect(screen.getByText("workcomposer.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Insights$/i })).toBeInTheDocument();
  });
});
