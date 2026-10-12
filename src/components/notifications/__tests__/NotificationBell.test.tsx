import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationBell } from "../NotificationBell";
import { NotificationsDrawer } from "../NotificationsDrawer";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    notifications: {
      getUnreadCount: vi.fn(),
      list: vi.fn(),
      markRead: vi.fn(),
      markAllRead: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    },
  },
}));

describe("NotificationBell Component", () => {
  const mockNotifications = [
    {
      id: 1,
      title: "Rank change alert",
      message: "Keyword 'seo audit' moved up to position 3",
      severity: "warning",
      projectName: "Project A",
      isRead: false,
      createdAt: new Date().toISOString(),
      targetUrl: "/projects/p1/rankings",
    },
    {
      id: 2,
      title: "Audit complete",
      message: "Crawl completed with 0 errors",
      severity: "info",
      projectName: "Project A",
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.notifications.getUnreadCount).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { count: 3 },
    });
    vi.mocked(api.notifications.list).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        items: mockNotifications,
        pageNumber: 1,
        pageSize: 50,
        totalCount: 2,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
    vi.mocked(api.notifications.markRead).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: true,
    });
    vi.mocked(api.notifications.markAllRead).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: true,
    });
  });

  it("fetches unread count and renders unread badge", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
    });
  });

  it("shows error dot when fetch fails and unreadCount is 0", async () => {
    vi.mocked(api.notifications.getUnreadCount).mockRejectedValueOnce(
      new Error("Network Error")
    );

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId("bell-error-dot")).toBeInTheDocument();
    });
  });

  it("opens the drawer when bell button is clicked", async () => {
    render(<NotificationBell />);

    const button = screen.getByTestId("notification-bell-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("notifications-drawer")).toBeInTheDocument();
      expect(screen.getByText("Rank change alert")).toBeInTheDocument();
    });
  });

  it("closes the drawer when backdrop or close button is clicked", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));

    await waitFor(() => {
      expect(screen.getByTestId("notifications-drawer")).toBeInTheDocument();
    });

    const closeBtn = screen.getByTestId("close-drawer-button");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("notifications-drawer")).not.toBeInTheDocument();
    });
  });

  it("marks single notification as read in NotificationsDrawer", async () => {
    const handleCountChange = vi.fn();
    render(
      <NotificationsDrawer
        isOpen={true}
        onClose={vi.fn()}
        onCountChange={handleCountChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-item-1")).toBeInTheDocument();
    });

    const markReadBtn = screen.getByTestId("mark-read-button-1");
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(api.notifications.markRead).toHaveBeenCalledWith(1);
    });
  });

  it("marks all notifications as read in NotificationsDrawer", async () => {
    const handleCountChange = vi.fn();
    render(
      <NotificationsDrawer
        isOpen={true}
        onClose={vi.fn()}
        onCountChange={handleCountChange}
        projectId="proj-123"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("mark-all-read-button")).toBeEnabled();
    });

    const markAllBtn = screen.getByTestId("mark-all-read-button");
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(api.notifications.markAllRead).toHaveBeenCalledWith("proj-123");
      expect(handleCountChange).toHaveBeenCalledWith(0);
    });
  });
});
