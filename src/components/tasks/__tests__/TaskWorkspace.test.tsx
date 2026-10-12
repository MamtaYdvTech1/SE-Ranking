import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskWorkspace } from "../TaskWorkspace";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PaginatedList, TaskDto } from "@/lib/types";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock api methods
vi.mock("@/lib/api", () => {
  class MockApiError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  return {
    ApiError: MockApiError,
    api: {
      projects: {
        get: vi.fn().mockResolvedValue({
          data: { id: "proj-1", members: [] },
        }),
      },
      tasks: {
        list: vi.fn(),
        get: vi.fn(),
        verify: vi.fn(),
        create: vi.fn(),
        patchStatus: vi.fn(),
        addComment: vi.fn(),
      },
    },
  };
});

describe("TaskWorkspace Component", () => {
  const projectId = "proj-1";

  const mockTasks: TaskDto[] = [
    {
      id: "task-1",
      projectId,
      title: "Optimize Meta Description on /pricing",
      priority: "High",
      status: "InProgress",
      affectedUrl: "https://example.com/pricing",
      assigneeName: "Alex Mercer",
      sourceIssueRuleCode: "META_DESC_SHORT",
      createdAt: "2026-09-28T09:00:00Z",
    },
    {
      id: "task-2",
      projectId,
      title: "Add Canonical Tag to /features",
      priority: "Critical",
      status: "ReadyForVerification",
      affectedUrl: "https://example.com/features",
      assigneeName: "Jane Smith",
      sourceIssueRuleCode: "CANONICAL_MISSING",
      createdAt: "2026-09-27T09:00:00Z",
    },
    {
      id: "task-3",
      projectId,
      title: "Fix Broken Redirect Chain",
      priority: "Medium",
      status: "Verified",
      affectedUrl: "https://example.com/old-url",
      assigneeName: "David Kim",
      createdAt: "2026-09-26T09:00:00Z",
    },
  ];

  const mockPaginatedData: PaginatedList<TaskDto> = {
    items: mockTasks,
    pageNumber: 1,
    page: 1,
    pageSize: 50,
    totalCount: 3,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: {
        id: "user-1",
        email: "admin@workcomposer.com",
        role: "SuperAdmin",
      },
    });

    (api.tasks.list as any).mockResolvedValue({
      data: mockPaginatedData,
    });

    (api.tasks.get as any).mockResolvedValue({
      data: {
        ...mockTasks[0],
        description: "Task description",
        verifications: [],
        comments: [],
      },
    });

    (api.tasks.verify as any).mockResolvedValue({
      data: { enqueued: true },
    });
  });

  it("renders page header and KPI ribbon with task status counts", async () => {
    render(<TaskWorkspace projectId={projectId} />);

    expect(screen.getByText("SEO Tasks & Verification")).toBeInTheDocument();
    expect(
      screen.getByText(/Assign SEO remediation items, track team progress/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      // Total Tasks = 3
      expect(screen.getByText("Total Tasks")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      // Open / In Progress = 1
      expect(screen.getByText("Open / In Progress")).toBeInTheDocument();
      // Ready to Verify = 1
      expect(screen.getAllByText("Ready to Verify")[0]).toBeInTheDocument();
      // Verified = 1
      expect(screen.getAllByText("Verified")[0]).toBeInTheDocument();
    });
  });

  it("filters tasks by status and priority", async () => {
    render(<TaskWorkspace projectId={projectId} />);

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledWith(projectId, expect.objectContaining({ page: 1 }));
    });

    // Select status filter
    const statusSelect = screen.getByDisplayValue("All Statuses");
    fireEvent.change(statusSelect, { target: { value: "ReadyForVerification" } });

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledWith(
        projectId,
        expect.objectContaining({ status: "ReadyForVerification" })
      );
    });

    // Select priority filter
    const prioritySelect = screen.getByDisplayValue("All Priorities");
    fireEvent.change(prioritySelect, { target: { value: "Critical" } });

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledWith(
        projectId,
        expect.objectContaining({
          status: "ReadyForVerification",
          priority: "Critical",
        })
      );
    });
  });

  it("filters tasks by search input query", async () => {
    render(<TaskWorkspace projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "Canonical" } });

    await waitFor(() => {
      expect(api.tasks.list).toHaveBeenCalledWith(
        projectId,
        expect.objectContaining({ search: "Canonical" })
      );
    });
  });

  it("opens create task modal when clicking Create Task button", async () => {
    render(<TaskWorkspace projectId={projectId} />);

    const createBtn = screen.getByRole("button", { name: /Create Task/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("Create Remediation Task")).toBeInTheDocument();
    });

    // Close modal
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText("Create Remediation Task")).toBeNull();
    });
  });

  it("handles quick verify action on a task", async () => {
    render(<TaskWorkspace projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("Optimize Meta Description on /pricing")).toBeInTheDocument();
    });

    const verifyButtons = screen.getAllByRole("button", { name: /^Verify$/i });
    fireEvent.click(verifyButtons[0]);

    await waitFor(() => {
      expect(api.tasks.verify).toHaveBeenCalledWith(projectId, "task-1");
    });
  });

  it("hides create task button for viewers", () => {
    (useAuth as any).mockReturnValue({
      user: {
        id: "user-viewer",
        email: "viewer@example.com",
        role: "ProjectViewer",
      },
    });

    render(<TaskWorkspace projectId={projectId} />);

    expect(screen.queryByRole("button", { name: /Create Task/i })).toBeNull();
  });
});
