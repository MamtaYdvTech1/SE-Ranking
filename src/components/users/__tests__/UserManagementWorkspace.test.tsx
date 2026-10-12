import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { UserManagementWorkspace } from "../UserManagementWorkspace";
import { api } from "../../../lib/api";
import { AdminUserDto, ApiResponse, PaginatedList } from "../../../lib/types";

vi.mock("../../../lib/api", () => ({
  api: {
    admin: {
      users: {
        list: vi.fn(),
        create: vi.fn(),
        updateRole: vi.fn(),
        updateStatus: vi.fn(),
        get: vi.fn(),
        assignProject: vi.fn(),
        unassignProject: vi.fn(),
      },
    },
    projects: {
      list: vi.fn(),
    },
  },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "usr-1",
      email: "admin@internal-seo.local",
      fullName: "System Administrator",
      role: "SuperAdmin",
    },
    setUser: vi.fn(),
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

function createPaginatedUsers(items: AdminUserDto[]): ApiResponse<PaginatedList<AdminUserDto>> {
  return {
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    data: {
      items,
      pageNumber: 1,
      pageSize: 15,
      totalCount: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

const mockUsers: AdminUserDto[] = [
  {
    id: "usr-1",
    email: "admin@internal-seo.local",
    fullName: "System Administrator",
    role: "SuperAdmin",
    isActive: true,
    projectCount: 4,
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "usr-2",
    email: "sarah.seo@internal-seo.local",
    fullName: "Sarah Jenkins",
    role: "SEOExecutive",
    isActive: true,
    projectCount: 2,
    createdAt: "2025-02-01T11:30:00Z",
  },
  {
    id: "usr-3",
    email: "alex.viewer@internal-seo.local",
    fullName: "Alex Vance",
    role: "Viewer",
    isActive: false,
    projectCount: 0,
    createdAt: "2025-03-10T14:15:00Z",
  },
];

describe("UserManagementWorkspace Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no users exist", async () => {
    vi.mocked(api.admin.users.list).mockResolvedValue(createPaginatedUsers([]));

    render(<UserManagementWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("No users found matching your criteria.")).toBeInTheDocument();
    });
  });

  it("renders populated users table with self badge", async () => {
    vi.mocked(api.admin.users.list).mockResolvedValue(createPaginatedUsers(mockUsers));

    render(<UserManagementWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("System Administrator")).toBeInTheDocument();
      expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
      expect(screen.getByText("Alex Vance")).toBeInTheDocument();
      expect(screen.getByText("You")).toBeInTheDocument();
    });
  });

  it("handles role change dispatch", async () => {
    vi.mocked(api.admin.users.list).mockResolvedValue(createPaginatedUsers(mockUsers));
    vi.mocked(api.admin.users.updateRole).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { success: true },
    });

    render(<UserManagementWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    // Change Sarah's role (the second user role dropdown)
    fireEvent.change(selects[3], { target: { value: "Viewer" } });

    await waitFor(() => {
      expect(api.admin.users.updateRole).toHaveBeenCalledWith("usr-2", "Viewer");
    });
  });

  it("handles status toggle dispatch", async () => {
    vi.mocked(api.admin.users.list).mockResolvedValue(createPaginatedUsers(mockUsers));
    vi.mocked(api.admin.users.updateStatus).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { success: true },
    });

    render(<UserManagementWorkspace />);

    await waitFor(() => {
      expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByRole("button", { name: /deactivate/i });
    // Click the second user's (Sarah's) Deactivate button (first is disabled because isSelf)
    fireEvent.click(deactivateButtons[1]);

    await waitFor(() => {
      expect(api.admin.users.updateStatus).toHaveBeenCalledWith("usr-2", false);
    });
  });

  it("opens create user modal when clicking Add New User", async () => {
    vi.mocked(api.admin.users.list).mockResolvedValue(createPaginatedUsers(mockUsers));

    render(<UserManagementWorkspace />);

    const addBtn = screen.getByRole("button", { name: /add new user/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Create New User")).toBeInTheDocument();
  });
});
