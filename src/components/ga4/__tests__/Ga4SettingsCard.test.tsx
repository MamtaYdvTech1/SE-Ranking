import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Ga4SettingsCard } from "../Ga4SettingsCard";
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

describe("Ga4SettingsCard Component", () => {
  const projectId = "proj-ga4-test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders disconnected state when connection is null", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: null as any,
    });

    render(<Ga4SettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("No GA4 Property Connected")).toBeInTheDocument();
    });

    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Connect Google Account/i })).toBeInTheDocument();
  });

  it("renders connected and bound state", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "properties/123456789",
        accountEmail: "seo@example.com",
        syncStatus: "Active",
        lastSyncedAt: "2026-03-30T10:00:00Z",
      },
    });

    vi.spyOn(api.ga4, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [
        { propertyIdentifier: "properties/123456789", displayName: "Main Website", accountName: "Acme" },
      ],
    });

    render(<Ga4SettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("Active & Bound")).toBeInTheDocument();
    });

    expect(screen.getByText("seo@example.com")).toBeInTheDocument();
    expect(screen.getByText("properties/123456789")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Disconnect GA4/i })).toBeInTheDocument();
  });

  it("handles connecting Google account and binding a property", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: null as any,
    });

    vi.spyOn(api.ga4, "getAuthUrl").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { url: "https://auth.google.com", state: "state_123" },
    });

    vi.spyOn(api.ga4, "completeCallback").mockResolvedValue({
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

    vi.spyOn(api.ga4, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [
        { propertyIdentifier: "properties/999888777", displayName: "Demo Site", accountName: "Acme" },
      ],
    });

    vi.spyOn(api.ga4, "bindProperty").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "properties/999888777",
        accountEmail: "new-user@example.com",
        syncStatus: "Active",
        lastSyncedAt: new Date().toISOString(),
      },
    });

    render(<Ga4SettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Connect Google Account/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Connect Google Account/i }));

    await waitFor(() => {
      expect(api.ga4.completeCallback).toHaveBeenCalled();
    });

    // Form is now present for property binding
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Bind Property/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Bind Property/i }));

    await waitFor(() => {
      expect(api.ga4.bindProperty).toHaveBeenCalledWith(projectId, "properties/999888777");
    });
  });

  it("handles disconnecting GA4 through confirmation modal", async () => {
    vi.spyOn(api.ga4, "getStatus").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        propertyIdentifier: "properties/123456789",
        accountEmail: "seo@example.com",
        syncStatus: "Active",
        lastSyncedAt: "2026-03-30T10:00:00Z",
      },
    });

    vi.spyOn(api.ga4, "getProperties").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [],
    });

    vi.spyOn(api.ga4, "disconnect").mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { success: true },
    });

    render(<Ga4SettingsCard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Disconnect GA4/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Disconnect GA4/i }));

    // Modal opens
    expect(screen.getByText("Disconnect Google Analytics 4?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Confirm Disconnect/i }));

    await waitFor(() => {
      expect(api.ga4.disconnect).toHaveBeenCalledWith(projectId);
    });

    await waitFor(() => {
      expect(screen.getByText("No GA4 Property Connected")).toBeInTheDocument();
    });
  });
});
