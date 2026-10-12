import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskListTable } from "../TaskListTable";
import { TaskDto } from "@/lib/types";

describe("TaskListTable Component", () => {
  const mockTasks: TaskDto[] = [
    {
      id: "task-1",
      projectId: "proj-1",
      title: "Fix Missing H1 Header",
      priority: "High",
      status: "ReadyForVerification",
      affectedUrl: "https://example.com/page-1",
      assigneeName: "Jane Smith",
      assigneeEmail: "jane@example.com",
      dueDate: "2026-10-30",
      sourceIssueRuleCode: "H1_MISSING",
      sourceIssueSeverity: "Critical",
      latestVerification: {
        id: 101,
        status: "Passed",
        completedAt: "2026-09-29T10:00:00Z",
      },
      createdAt: "2026-09-25T08:00:00Z",
    },
    {
      id: "task-2",
      projectId: "proj-1",
      title: "Add Alt Text to Images",
      priority: "Medium",
      status: "InProgress",
      affectedUrl: "https://example.com/gallery",
      assigneeName: "",
      assigneeEmail: "",
      dueDate: "",
      sourceIssueRuleCode: "IMG_ALT_MISSING",
      sourceIssueSeverity: "Warning",
      latestVerification: {
        id: 102,
        status: "Failed",
        completedAt: "2026-09-28T10:00:00Z",
      },
      createdAt: "2026-09-26T08:00:00Z",
    },
    {
      id: "task-3",
      projectId: "proj-1",
      title: "Fix Slow LCP on Mobile",
      priority: "Critical",
      status: "Verified",
      affectedUrl: "https://example.com/speed",
      assigneeName: "Alex Mercer",
      createdAt: "2026-09-27T08:00:00Z",
    },
  ];

  it("renders loading spinner when isLoading is true", () => {
    render(
      <TaskListTable
        tasks={[]}
        isLoading={true}
        onSelectTask={vi.fn()}
      />
    );

    expect(screen.getByText("Loading SEO tasks...")).toBeInTheDocument();
  });

  it("renders empty state message when tasks is empty", () => {
    render(
      <TaskListTable
        tasks={[]}
        isLoading={false}
        onSelectTask={vi.fn()}
      />
    );

    expect(screen.getByText("No tasks found")).toBeInTheDocument();
    expect(
      screen.getByText(/No SEO tasks match your current filter criteria/i)
    ).toBeInTheDocument();
  });

  it("renders table with all task columns and badges", () => {
    render(
      <TaskListTable
        tasks={mockTasks}
        isLoading={false}
        onSelectTask={vi.fn()}
      />
    );

    // Headers
    expect(screen.getByText("Task & Source Rule")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Affected URL")).toBeInTheDocument();
    expect(screen.getByText("Assignee")).toBeInTheDocument();
    expect(screen.getByText("Latest Verification")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();

    // Rows
    expect(screen.getByText("Fix Missing H1 Header")).toBeInTheDocument();
    expect(screen.getByText("H1_MISSING")).toBeInTheDocument();
    expect(screen.getByText("• Critical")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/page-1")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("2026-10-30")).toBeInTheDocument();

    // Unassigned display
    expect(screen.getByText("Unassigned")).toBeInTheDocument();

    // Badges
    expect(screen.getByText("Ready to Verify")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("calls onSelectTask when a table row is clicked", () => {
    const onSelectTask = vi.fn();
    render(
      <TaskListTable
        tasks={mockTasks}
        isLoading={false}
        onSelectTask={onSelectTask}
      />
    );

    fireEvent.click(screen.getByText("Fix Missing H1 Header"));
    expect(onSelectTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("calls onSelectTask when the View button is clicked", () => {
    const onSelectTask = vi.fn();
    render(
      <TaskListTable
        tasks={mockTasks}
        isLoading={false}
        onSelectTask={onSelectTask}
      />
    );

    const viewButtons = screen.getAllByRole("button", { name: /View/i });
    fireEvent.click(viewButtons[1]);
    expect(onSelectTask).toHaveBeenCalledWith(mockTasks[1]);
  });

  it("calls onQuickVerify and does not trigger onSelectTask when Verify button is clicked", () => {
    const onSelectTask = vi.fn();
    const onQuickVerify = vi.fn();

    render(
      <TaskListTable
        tasks={mockTasks}
        isLoading={false}
        onSelectTask={onSelectTask}
        onQuickVerify={onQuickVerify}
        isWriter={true}
      />
    );

    const verifyButtons = screen.getAllByRole("button", { name: /^Verify$/i });
    expect(verifyButtons.length).toBeGreaterThan(0);

    fireEvent.click(verifyButtons[0]);
    expect(onQuickVerify).toHaveBeenCalledWith(mockTasks[0]);
    expect(onSelectTask).not.toHaveBeenCalled();
  });

  it("hides quick verify button when isWriter is false", () => {
    render(
      <TaskListTable
        tasks={mockTasks}
        isLoading={false}
        onSelectTask={vi.fn()}
        onQuickVerify={vi.fn()}
        isWriter={false}
      />
    );

    expect(screen.queryByRole("button", { name: /^Verify$/i })).toBeNull();
  });
});
