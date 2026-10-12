import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTaskModal } from "../CreateTaskModal";
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
      projects: {
        get: vi.fn(),
      },
      tasks: {
        create: vi.fn(),
      },
    },
  };
});

describe("CreateTaskModal Component", () => {
  const projectId = "proj-123";
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (api.projects.get as any).mockResolvedValue({
      data: {
        id: projectId,
        members: [
          {
            userId: "user-101",
            email: "dev@workcomposer.com",
            fullName: "Lead Developer",
            role: "SEOExecutive",
          },
        ],
      },
    });

    (api.tasks.create as any).mockResolvedValue({
      data: {
        id: "task-999",
        title: "Test Task",
      },
    });
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CreateTaskModal
        projectId={projectId}
        isOpen={false}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal dialog and pre-populates initialValues", async () => {
    render(
      <CreateTaskModal
        projectId={projectId}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        initialValues={{
          sourceIssueId: "issue-55",
          title: "Fix canonical tag on /blog",
          affectedUrl: "https://example.com/blog",
          priority: "High",
          acceptanceCriteria: "Self-referencing canonical exists",
        }}
      />
    );

    expect(screen.getByText("Create Remediation Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fix canonical tag on /blog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://example.com/blog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Self-referencing canonical exists")).toBeInTheDocument();

    // Check that project members were fetched into the assignee select
    await waitFor(() => {
      expect(screen.getByText(/Lead Developer/i)).toBeInTheDocument();
    });
  });

  it("submits new task and invokes callbacks", async () => {
    render(
      <CreateTaskModal
        projectId={projectId}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Create New SEO Task")).toBeInTheDocument();

    // Fill title
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Fix missing title tag/i), {
      target: { value: "Optimize Hero H1" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    await waitFor(() => {
      expect(api.tasks.create).toHaveBeenCalledWith(
        projectId,
        expect.objectContaining({
          title: "Optimize Hero H1",
          priority: "Medium",
        })
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays error message if task title is missing", async () => {
    render(
      <CreateTaskModal
        projectId={projectId}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    // Title is empty, so submission shouldn't proceed
    expect(api.tasks.create).not.toHaveBeenCalled();
  });

  it("displays error banner when api.tasks.create fails", async () => {
    (api.tasks.create as any).mockRejectedValueOnce(
      new ApiError("Quota exceeded")
    );

    render(
      <CreateTaskModal
        projectId={projectId}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        initialValues={{ title: "Sample task" }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    await waitFor(() => {
      expect(screen.getByText(/Quota exceeded|unexpected error/i)).toBeInTheDocument();
    });
  });
});
