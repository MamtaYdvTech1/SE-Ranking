import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MarketingPlanView } from "../components/marketing-plan/MarketingPlanView";

describe("MarketingPlanWorkspace Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders top progress card with 0% gauge, status counts (Total: 74, Done: 0, In progress: 0, Left: 74) and priority breakdown (High: 3, Medium: 69, Low: 2)", () => {
    render(<MarketingPlanView projectId="proj-123" projectDomain="workcomposer.com" />);

    // Gauge Percentage
    expect(screen.getByText("0%")).toBeInTheDocument();

    // Status counts: Total: 74, Left: 74
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getAllByText("74").length).toBe(2);
    expect(screen.getAllByText("Done").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In progress").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Left").length).toBeGreaterThan(0);

    // Priority breakdown
    expect(screen.getByText("High: 3")).toBeInTheDocument();
    expect(screen.getByText("Medium: 69")).toBeInTheDocument();
    expect(screen.getByText("Low: 2")).toBeInTheDocument();
  });

  it("renders sticky left sidebar with all 7 SEO implementation steps", () => {
    render(<MarketingPlanView projectId="proj-123" />);

    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByText("1. Strategy & Pre-Launch")).toBeInTheDocument();
    expect(within(sidebar).getByText("2. Keyword Research & Mapping")).toBeInTheDocument();
    expect(within(sidebar).getByText("3. On-Page Optimization")).toBeInTheDocument();
    expect(within(sidebar).getByText("4. Technical SEO Audit")).toBeInTheDocument();
    expect(within(sidebar).getByText("5. Content Creation & Strategy")).toBeInTheDocument();
    expect(within(sidebar).getByText("6. Off-Page SEO & Link Building")).toBeInTheDocument();
    expect(within(sidebar).getByText("7. Analytics & Performance Tracking")).toBeInTheDocument();
  });

  it("allows checking a task checkbox to mark it done, updating status counts and gauge percentage", () => {
    render(<MarketingPlanView projectId="proj-123" />);

    const firstTaskCheckbox = screen.getAllByRole("checkbox")[0];
    expect(firstTaskCheckbox).toHaveAttribute("aria-checked", "false");

    // Click to complete task
    fireEvent.click(firstTaskCheckbox);
    expect(firstTaskCheckbox).toHaveAttribute("aria-checked", "true");

    // Gauge updates from 0% to 1% (1/74)
    expect(screen.getByText("1%")).toBeInTheDocument();
  });

  it("allows changing priority pill on task card", () => {
    render(<MarketingPlanView projectId="proj-123" />);

    const prioritySelects = screen.getAllByRole("combobox", { name: /Change priority for/i });
    expect(prioritySelects.length).toBeGreaterThan(0);

    // Change first task priority from High to Low
    fireEvent.change(prioritySelects[0], { target: { value: "Low" } });

    // High should decrement to 2, Low should increment to 3
    expect(screen.getByText("High: 2")).toBeInTheDocument();
    expect(screen.getByText("Low: 3")).toBeInTheDocument();
  });

  it("opens subtasks drawer and allows adding notes to task", () => {
    render(<MarketingPlanView projectId="proj-123" />);

    // Open subtasks drawer
    const subtaskBtn = screen.getAllByRole("button", { name: /Subtasks/i })[0];
    fireEvent.click(subtaskBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Task Subtasks")).toBeInTheDocument();

    // Close drawer using within dialog
    const closeBtn = within(dialog).getByRole("button", { name: /Done/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Task Subtasks")).not.toBeInTheDocument();

    // Open note input
    const noteBtn = screen.getAllByRole("button", { name: /Add Note/i })[0];
    fireEvent.click(noteBtn);
    expect(screen.getByPlaceholderText(/Write internal notes/i)).toBeInTheDocument();
  });

  it("renders 'Daily Task suggestions' teaser card with Unlock link at the bottom of each step", () => {
    render(<MarketingPlanView projectId="proj-123" />);

    expect(screen.getByText("Daily Task suggestions")).toBeInTheDocument();
    const unlockBtn = screen.getByRole("button", { name: /Unlock Daily Suggestions/i });
    expect(unlockBtn).toBeInTheDocument();

    // Clicking opens unlock dialog
    fireEvent.click(unlockBtn);
    expect(screen.getByText("Included in Enterprise Plan:")).toBeInTheDocument();
  });
});
