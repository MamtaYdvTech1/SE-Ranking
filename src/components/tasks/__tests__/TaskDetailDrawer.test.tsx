import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDetailDrawer } from "../TaskDetailDrawer";
import { api, ApiError } from "@/lib/api";

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
      tasks: {
        get: vi.fn(),
        patchStatus: vi.fn(),
        verify: vi.fn(),
        addComment: vi.fn(),
      },
    },
  };
});

describe("TaskDetailDrawer Component", () => {
  const projectId = "proj-100";
  const taskId = "task-500";
  const onClose = vi.fn();
  const onTaskUpdated = vi.fn();

  const mockTaskData = {
    id: taskId,
    projectId,
    title: "Fix Missing H1 on Landing Page",
    description: "Ensure exactly one H1 element exists with target keyword.",
    affectedUrl: "https://example.com/landing",
    priority: "High",
    status: "InProgress",
    dueDate: "2026-11-01",
    acceptanceCriteria: "Single H1 tag present in HTML document.",
    assigneeName: "Jane Doe",
    assigneeEmail: "jane@example.com",
    sourceIssueRuleCode: "H1_MISSING",
    sourceIssueRuleTitle: "Missing H1 Tag",
    sourceIssueRecommendation: "Add a main descriptive H1 heading to page.",
    evidence: [
      { id: "ev-1", evidencePayload: "<h1> element not found in DOM." },
    ],
    verifications: [
      {
        id: 1,
        status: "Failed",
        attemptedAt: "2026-09-29T10:00:00Z",
        details: "H1 still not detected.",
        verifiedByUserName: "CrawlerBot",
      },
    ],
    comments: [
      {
        id: "c-1",
        authorName: "Jane Doe",
        authorEmail: "jane@example.com",
        commentText: "Investigating the template layout.",
        createdAt: "2026-09-29T12:00:00Z",
      },
    ],
    createdAt: "2026-09-28T09:00:00Z",
    updatedAt: "2026-09-29T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.tasks.get as any).mockResolvedValue({
      data: mockTaskData,
    });
    (api.tasks.patchStatus as any).mockResolvedValue({
      data: { ...mockTaskData, status: "ReadyForVerification" },
    });
    (api.tasks.verify as any).mockResolvedValue({
      data: { enqueued: true },
    });
    (api.tasks.addComment as any).mockResolvedValue({
      data: {
        id: "c-2",
        authorName: "Jane Doe",
        commentText: "Updated template with H1 tag.",
        createdAt: new Date().toISOString(),
      },
    });
  });

  it("does not render anything when taskId is null", () => {
    const { container } = render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={null}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders task details after loading", async () => {
    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );

    // Initial load calls api.tasks.get
    expect(api.tasks.get).toHaveBeenCalledWith(projectId, taskId);

    // After loading, task details are rendered
    await waitFor(() => {
      expect(screen.getByText("Fix Missing H1 on Landing Page")).toBeInTheDocument();
    });

    expect(screen.getByText("H1_MISSING")).toBeInTheDocument();
    expect(screen.getAllByText("Jane Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("https://example.com/landing")).toBeInTheDocument();
    expect(screen.getByText("Ensure exactly one H1 element exists with target keyword.")).toBeInTheDocument();
    expect(screen.getByText("Single H1 tag present in HTML document.")).toBeInTheDocument();
    expect(screen.getByText(/Source Audit Issue: Missing H1 Tag/i)).toBeInTheDocument();
    expect(screen.getByText("<h1> element not found in DOM.")).toBeInTheDocument();
    expect(screen.getByText("Attempt #1")).toBeInTheDocument();
    expect(screen.getByText("Investigating the template layout.")).toBeInTheDocument();
  });

  it("allows writer to update task status", async () => {
    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Mark Ready for Verification")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Mark Ready for Verification"));

    await waitFor(() => {
      expect(api.tasks.patchStatus).toHaveBeenCalledWith(
        projectId,
        taskId,
        "ReadyForVerification"
      );
      expect(screen.getByText(/Status updated to ReadyForVerification/i)).toBeInTheDocument();
      expect(onTaskUpdated).toHaveBeenCalled();
    });
  });

  it("allows writer to trigger verification", async () => {
    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Verify Remediation")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Verify Remediation"));

    await waitFor(() => {
      expect(api.tasks.verify).toHaveBeenCalledWith(projectId, taskId);
      expect(
        screen.getByText(/Verification enqueued! Background crawler is testing the remediation.../i)
      ).toBeInTheDocument();
      expect(onTaskUpdated).toHaveBeenCalled();
    });
  });

  it("allows adding comments", async () => {
    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Add a comment or evidence note/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Add a comment or evidence note/i);
    fireEvent.change(textarea, { target: { value: "Updated template with H1 tag." } });

    const postBtn = screen.getByText("Post Comment");
    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(api.tasks.addComment).toHaveBeenCalledWith(
        projectId,
        taskId,
        "Updated template with H1 tag."
      );
      expect(onTaskUpdated).toHaveBeenCalled();
    });
  });

  it("handles comment API error gracefully", async () => {
    (api.tasks.addComment as any).mockRejectedValueOnce(
      new ApiError("Comment submission forbidden", 403)
    );

    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Add a comment or evidence note/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Add a comment or evidence note/i);
    fireEvent.change(textarea, { target: { value: "Should fail" } });

    fireEvent.click(screen.getByText("Post Comment"));

    await waitFor(() => {
      expect(screen.getByText("Comment submission forbidden")).toBeInTheDocument();
    });
  });

  it("renders read-only view when isWriter is false", async () => {
    render(
      <TaskDetailDrawer
        projectId={projectId}
        taskId={taskId}
        onClose={onClose}
        onTaskUpdated={onTaskUpdated}
        isWriter={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Fix Missing H1 on Landing Page")).toBeInTheDocument();
    });

    // Workflow actions should not be visible
    expect(screen.queryByText("Workflow & Verification Actions")).toBeNull();
    expect(screen.queryByText("Verify Remediation")).toBeNull();

    // Comment form should not be visible
    expect(
      screen.getByText(/Read-only access: Commenting requires Project Writer or Admin role/i)
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Add a comment or evidence note/i)).toBeNull();
  });
});
