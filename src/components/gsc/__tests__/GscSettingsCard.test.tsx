import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GscSettingsCard } from "../GscSettingsCard";
import { api } from "@/lib/api";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "admin@example.com", role: "SuperAdmin" },
    isAuthenticated: true,
    isViewer: false,
    canManageProjects: true,
    logout: vi.fn(),
  }),
}));

describe("GscSettingsCard Component", () => {
  const projectId = "proj-gsc-test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders disconnected state when connection is null", async () => {
    vi.spyOn(api.gsc, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: null as any,
    });

    render(<GscSettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("No Google Account Connected")).toBeInTheDocument();
    });

    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Connect Google Account/i })).toBeInTheDocument();
  });

  it("renders connected and bound state", async () => {
    vi.spyOn(api.gsc, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "sc-domain:example.com",
        accountEmail: "seo@example.com",
        syncStatus: "Active",
        lastSyncedAt: "2026-03-30T10:00:00Z",
      },
    });

    vi.spyOn(api.gsc, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [
        { propertyIdentifier: "sc-domain:example.com", permissionLevel: "siteOwner" },
      ],
    });

    render(<GscSettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("Active & Bound")).toBeInTheDocument();
    });

    expect(screen.getByText("seo@example.com")).toBeInTheDocument();
    expect(screen.getByText("sc-domain:example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Disconnect GSC/i })).toBeInTheDocument();
  });

  it("handles connecting Google account and binding a property", async () => {
    vi.spyOn(api.gsc, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: null as any,
    });

    vi.spyOn(api.gsc, "completeCallback").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: null,
        accountEmail: "new-user@example.com",
        syncStatus: "Active",
        lastSyncedAt: null,
      },
    });

    vi.spyOn(api.gsc, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [
        { propertyIdentifier: "sc-domain:workcomposer.com", permissionLevel: "siteOwner" },
      ],
    });

    vi.spyOn(api.gsc, "bindProperty").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "sc-domain:workcomposer.com",
        accountEmail: "new-user@example.com",
        syncStatus: "Active",
        lastSyncedAt: new Date().toISOString(),
      },
    });

    render(<GscSettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Connect Google Account/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Connect Google Account/i }));

    await waitFor(() => {
      expect(api.gsc.completeCallback).toHaveBeenCalled();
    });

    // Form is now present for property binding
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Bind Property/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Bind Property/i }));

    await waitFor(() => {
      expect(api.gsc.bindProperty).toHaveBeenCalledWith(projectId, "sc-domain:workcomposer.com");
    });
  });

  it("handles disconnecting GSC through confirmation modal", async () => {
    vi.spyOn(api.gsc, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "sc-domain:example.com",
        accountEmail: "seo@example.com",
        syncStatus: "Active",
        lastSyncedAt: "2026-03-30T10:00:00Z",
      },
    });

    vi.spyOn(api.gsc, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [],
    });

    vi.spyOn(api.gsc, "disconnect").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { success: true },
    });

    render(<GscSettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Disconnect GSC/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Disconnect GSC/i }));

    // Modal opens
    expect(screen.getByText("Disconnect Google Search Console?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Confirm Disconnect/i }));

    await waitFor(() => {
      expect(api.gsc.disconnect).toHaveBeenCalledWith(projectId);
    });

    await waitFor(() => {
      expect(screen.getByText("No Google Account Connected")).toBeInTheDocument();
    });
  });
});
