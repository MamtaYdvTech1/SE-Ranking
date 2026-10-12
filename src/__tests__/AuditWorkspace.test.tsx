import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditOverviewView } from "../components/audit/AuditOverviewView";

describe("AuditWorkspace Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders top gauge widget with Health Score 83 (Strong) vs Top competitors (94.6)", () => {
    render(<AuditOverviewView projectId="proj-123" />);

    // Health Score 83
    expect(screen.getAllByText("83").length).toBeGreaterThan(0);
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();

    // Top competitors 94.6
    expect(screen.getByText("94.6")).toBeInTheDocument();
    expect(screen.getByText(/Top competitors/i)).toBeInTheDocument();
  });

  it("renders Found Issues card (Total 312: 3 Errors, 121 Warnings, 188 Notices)", () => {
    render(<AuditOverviewView projectId="proj-123" />);

    // Total 312
    expect(screen.getAllByText("312").length).toBeGreaterThan(0);

    // 3 Errors, 121 Warnings, 188 Notices
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getByText("121")).toBeInTheDocument();
    expect(screen.getByText("188")).toBeInTheDocument();

    expect(screen.getAllByText(/Errors/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Warnings/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notices/i).length).toBeGreaterThan(0);
  });

  it("renders Top Issues list with severity pills and Most Popular Use Cases with export buttons", () => {
    render(<AuditOverviewView projectId="proj-123" />);

    expect(screen.getByText(/TOP ISSUES/i)).toBeInTheDocument();
    expect(screen.getByText(/MOST POPULAR USE CASES/i)).toBeInTheDocument();

    // Check export buttons in Most Popular Use Cases
    const exportButtons = screen.getAllByRole("button", { name: /Export/i });
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it("renders Core Web Vitals progress bars with Desktop / Mobile toggle", () => {
    render(<AuditOverviewView projectId="proj-123" />);

    expect(screen.getByText("Core Web Vitals")).toBeInTheDocument();

    // Toggle buttons
    const desktopBtn = screen.getByRole("button", { name: /Desktop/i });
    const mobileBtn = screen.getByRole("button", { name: /Mobile/i });
    expect(desktopBtn).toBeInTheDocument();
    expect(mobileBtn).toBeInTheDocument();

    // Switch to Mobile
    fireEvent.click(mobileBtn);
    expect(mobileBtn).toHaveClass("bg-white", "dark:bg-slate-700");
  });

  it("renders Distribution of issues by category and HTTP status codes", () => {
    render(<AuditOverviewView projectId="proj-123" />);

    // Categories
    expect(screen.getByText(/Distribution of issues by category/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTP status codes/i)).toBeInTheDocument();

    // 200 OK status in HTTP status distribution
    expect(screen.getByText(/2xx Success/i)).toBeInTheDocument();
  });
});
