import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ActivityLogWorkspace } from "../ActivityLogWorkspace";
import { ActivityLogDetailModal } from "../ActivityLogDetailModal";
import { api } from "../../../lib/api";
import { ActivityLogDto, ApiResponse, PaginatedList, ProjectDto } from "../../../lib/types";

vi.mock("../../../lib/api", () => ({
  api: {
    projects: {
      list: vi.fn(),
    },
    admin: {
      activityLogs: {
        list: vi.fn(),
      },
    },
  },
}));

function createPaginatedResponse<T>(items: T[]): ApiResponse<PaginatedList<T>> {
  return {
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    data: {
      items,
      pageNumber: 1,
      pageSize: 20,
      totalCount: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

describe("ActivityLogWorkspace Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially", () => {
    vi.mocked(api.projects.list).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.admin.activityLogs.list).mockReturnValue(new Promise(() => {}));

    render(<ActivityLogWorkspace />);
    expect(screen.getByText("Activity Audit Trail")).toBeDefined();
  });

  it("renders empty state when no activity logs exist", async () => {
    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([]));
    vi.mocked(api.admin.activityLogs.list).mockResolvedValue(createPaginatedResponse<ActivityLogDto>([]));

    render(<ActivityLogWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("No activity logs found")).toBeDefined();
    });
  });

  it("renders populated activity logs table", async () => {
    const mockProject: ProjectDto = {
      id: "proj-1",
      name: "Test Project",
      primaryDomain: "example.com",
      status: "Active",
      createdAt: "2026-09-01T00:00:00Z",
      role: "Owner",
    };

    const mockLog: ActivityLogDto = {
      id: 101,
      actorId: "user-1",
      actorEmail: "admin@internal.local",
      actorRole: "SuperAdmin",
      actionType: "Project.Created",
      entityType: "Project",
      entityId: "proj-1",
      projectId: "proj-1",
      projectName: "Test Project",
      payloadJson: JSON.stringify({ name: "Test Project" }),
      ipAddress: "127.0.0.1",
      createdAt: "2026-09-08T10:00:00.000Z",
    };

    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([mockProject]));
    vi.mocked(api.admin.activityLogs.list).mockResolvedValue(createPaginatedResponse<ActivityLogDto>([mockLog]));

    render(<ActivityLogWorkspace />);

    expect(await screen.findByText("admin@internal.local")).toBeInTheDocument();
    expect(await screen.findByText("Project.Created")).toBeInTheDocument();
    expect((await screen.findAllByText("Test Project")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("127.0.0.1")).toBeInTheDocument();
    expect(await screen.findByText("View Details")).toBeInTheDocument();
  });

  it("dispatches filter changes to api client", async () => {
    const mockProject: ProjectDto = {
      id: "proj-1",
      name: "Test Project",
      primaryDomain: "example.com",
      status: "Active",
      createdAt: "2026-09-01T00:00:00Z",
      role: "Owner",
    };

    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([mockProject]));
    vi.mocked(api.admin.activityLogs.list).mockResolvedValue(createPaginatedResponse<ActivityLogDto>([]));

    render(<ActivityLogWorkspace />);

    await waitFor(() => {
      expect(api.admin.activityLogs.list).toHaveBeenCalled();
    });

    const entitySelect = screen.getByLabelText("Entity Type");
    fireEvent.change(entitySelect, { target: { value: "Task" } });

    await waitFor(() => {
      expect(api.admin.activityLogs.list).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: "Task" })
      );
    });
  });

  it("handles pagination navigation", async () => {
    const mockLogs: ActivityLogDto[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      actorEmail: "admin@internal.local",
      actorRole: "SuperAdmin",
      actionType: "Task.Created",
      entityType: "Task",
      entityId: `task-${i + 1}`,
      createdAt: "2026-09-08T10:00:00.000Z",
    }));

    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([]));
    vi.mocked(api.admin.activityLogs.list).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        items: mockLogs.slice(0, 20),
        pageNumber: 1,
        pageSize: 20,
        totalCount: 25,
        totalPages: 2,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });

    render(<ActivityLogWorkspace />);

    expect(await screen.findByText("1 / 2")).toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: "Next" });
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(api.admin.activityLogs.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("renders error state when api fails", async () => {
    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([]));
    vi.mocked(api.admin.activityLogs.list).mockRejectedValue(new Error("Database connection failure"));

    render(<ActivityLogWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("Database connection failure")).toBeInTheDocument();
    });
  });

  it("opens ActivityLogDetailModal when clicking View Details", async () => {
    const mockLog: ActivityLogDto = {
      id: 999,
      actorEmail: "admin@internal.local",
      actorRole: "SuperAdmin",
      actionType: "User.Created",
      entityType: "User",
      entityId: "user-999",
      payloadJson: JSON.stringify({ role: "SEOExecutive" }),
      createdAt: "2026-09-08T10:00:00.000Z",
    };

    vi.mocked(api.projects.list).mockResolvedValue(createPaginatedResponse<ProjectDto>([]));
    vi.mocked(api.admin.activityLogs.list).mockResolvedValue(createPaginatedResponse<ActivityLogDto>([mockLog]));

    render(<ActivityLogWorkspace />);

    const viewDetailsBtn = await screen.findByText("View Details");
    fireEvent.click(viewDetailsBtn);

    expect(await screen.findByText("Activity Audit Detail")).toBeInTheDocument();
    expect(screen.getByText(/Log ID: #999/)).toBeInTheDocument();
  });
});

describe("ActivityLogDetailModal Component", () => {
  it("safely renders pretty-printed JSON payload without executing HTML", () => {
    const log: ActivityLogDto = {
      id: 1,
      actorId: "user-1",
      actorEmail: "test@admin.local",
      actorRole: "SuperAdmin",
      actionType: "Task.Created",
      entityType: "Task",
      entityId: "task-123",
      projectId: null,
      projectName: null,
      createdAt: "2026-09-08T12:00:00.000Z",
      ipAddress: "127.0.0.1",
      payloadJson: JSON.stringify({ note: "<script>alert('xss')</script>" }),
    };

    render(<ActivityLogDetailModal log={log} onClose={() => {}} />);

    expect(screen.getByText(/Activity Audit Detail/)).toBeDefined();
    // Raw script text should be safely rendered inside pre, not executed
    expect(screen.getByText(/alert\('xss'\)/)).toBeDefined();
  });

  it("safely renders malformed non-JSON payload as raw text", () => {
    const log: ActivityLogDto = {
      id: 2,
      actorId: "user-1",
      actorEmail: "test@admin.local",
      actorRole: "SuperAdmin",
      actionType: "Task.Created",
      entityType: "Task",
      entityId: "task-123",
      projectId: null,
      projectName: null,
      createdAt: "2026-09-08T12:00:00.000Z",
      ipAddress: "127.0.0.1",
      payloadJson: "malformed raw payload not json {",
    };

    render(<ActivityLogDetailModal log={log} onClose={() => {}} />);

    expect(screen.getByText(/malformed raw payload not json \{/)).toBeDefined();
  });
});
