import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { AnalyticsWorkspace } from "../AnalyticsWorkspace";
import { api } from "../../../lib/api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "usr-1",
      email: "tester@seranking.com",
      fullName: "Test User",
      role: "SuperAdmin",
    },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock("../../../lib/api", () => ({
  api: {
    projects: {
      get: vi.fn(),
    },
  },
}));

describe("AnalyticsWorkspace Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.projects.get).mockResolvedValue({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        id: "proj-1",
        name: "WorkComposer",
        primaryDomain: "workcomposer.com",
        status: "active",
        createdAt: "2025-01-01T00:00:00Z",
        role: "Owner",
      },
    });
  });

  it("renders overview subtab with connection buttons and domain breadcrumb", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="overview" />);

    await waitFor(() => {
      expect(screen.getByText("Analytics and statistics services")).toBeDefined();
    });

    expect(screen.getByText("workcomposer.com")).toBeDefined();
    expect(screen.getByText("Connect Google Analytics")).toBeDefined();
    expect(screen.getByText("Connect Google Search Console")).toBeDefined();
    expect(screen.getByText("Connect Matomo Analytics")).toBeDefined();
  });

  it("opens Google OAuth modal and connects Google Analytics", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="overview" />);

    await waitFor(() => {
      expect(screen.getByText("Connect Google Analytics")).toBeDefined();
    });

    // Open Google OAuth modal
    fireEvent.click(screen.getByText("Connect Google Analytics"));
    expect(screen.getByText("Choose an account")).toBeDefined();

    // Select account
    fireEvent.click(screen.getByText("SE Ranking Marketing"));

    // Verify modal closes and connected badge is shown
    await waitFor(() => {
      expect(screen.queryByText("Choose an account")).toBeNull();
      expect(screen.getByText("marketing@seranking.com")).toBeDefined();
    });

    // CONTINUE > button should be active and clickable
    const continueBtn = screen.getByRole("button", { name: /continue >/i });
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);
    expect(pushMock).toHaveBeenCalledWith("/projects/proj-1/analytics/traffic");
  });

  it("opens Matomo modal and connects Matomo Analytics", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="overview" />);

    await waitFor(() => {
      expect(screen.getByText("Connect Matomo Analytics")).toBeDefined();
    });

    // Open Matomo modal
    fireEvent.click(screen.getByText("Connect Matomo Analytics"));
    expect(screen.getByText("Matomo server URL address")).toBeDefined();

    // Fill and click connect
    const serverInput = screen.getByPlaceholderText("https://yourdomain.com/your-new-page-url");
    fireEvent.change(serverInput, { target: { value: "https://matomo.mybrand.com" } });

    const dialog = screen.getByRole("dialog");
    const connectBtn = within(dialog).getByRole("button", { name: /connect/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(screen.queryByText("Matomo server URL address")).toBeNull();
      expect(screen.getByText("Site ID #1")).toBeDefined();
    });
  });

  it("navigates across sub-tabs", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="traffic" />);

    await waitFor(() => {
      expect(screen.getByText("Website Traffic Telemetry")).toBeDefined();
    });

    // Click Snippets subtab
    const snippetsTab = screen.getByRole("button", { name: "Snippets" });
    fireEvent.click(snippetsTab);
    expect(pushMock).toHaveBeenCalledWith("/projects/proj-1/analytics/snippets");

    // Click Google Search Console Data subtab
    const gscTab = screen.getByRole("button", { name: "Google Search Console Data" });
    fireEvent.click(gscTab);
    expect(pushMock).toHaveBeenCalledWith("/projects/proj-1/analytics/gsc");

    // Click SEO potential subtab
    const potentialTab = screen.getByRole("button", { name: "SEO potential" });
    fireEvent.click(potentialTab);
    expect(pushMock).toHaveBeenCalledWith("/projects/proj-1/analytics/potential");
  });

  it("handles Snippets tab interactions: device toggle, metric switch, and banner dismissal", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="snippets" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Snippets" })).toBeDefined();
    });

    // Dismiss info banner
    const dismissBtn = screen.getByLabelText("Dismiss banner");
    fireEvent.click(dismissBtn);
    expect(screen.queryByText(/Find out how effective your snippets are/i)).toBeNull();

    // Switch device to mobile and desktop
    const mobileBtn = screen.getByRole("button", { name: /mobile/i });
    fireEvent.click(mobileBtn);
    expect(screen.getByText("Mobile SERP Layout")).toBeDefined();

    const desktopBtn = screen.getByRole("button", { name: /desktop/i });
    fireEvent.click(desktopBtn);
    expect(screen.getByText("Desktop SERP Layout")).toBeDefined();

    // Switch metric to TRAFFIC FORECAST
    const trafficMetricBtn = screen.getByRole("button", { name: "TRAFFIC FORECAST" });
    fireEvent.click(trafficMetricBtn);
    expect(trafficMetricBtn.className).toContain("text-blue-600");
  });

  it("handles SEO potential tab: editing assumptions and opening guide", async () => {
    render(<AnalyticsWorkspace projectId="proj-1" initialTab="potential" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "SEO potential" })).toBeDefined();
    });

    // Check default conversion and revenue values
    expect(screen.getByText("1:100")).toBeDefined();
    expect(screen.getByText("$50")).toBeDefined();

    // Edit conversion ratio
    fireEvent.click(screen.getByText("1:100"));
    const convInput = screen.getByLabelText("Conversion into sales denominator");
    fireEvent.change(convInput, { target: { value: "80" } });
    fireEvent.blur(convInput);

    await waitFor(() => {
      expect(screen.getByText("1:80")).toBeDefined();
    });

    // Open guide modal
    fireEvent.click(screen.getByText("Read more"));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getAllByText("How does SEO potential work?").length).toBeGreaterThanOrEqual(1);

    // Click "Apply to Workspace" from guide modal
    const applyToWsBtn = screen.getByRole("button", { name: /apply to workspace/i });
    fireEvent.click(applyToWsBtn);

    // Guide modal should close and workspace reflect applied example values
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByText("1:50")).toBeDefined();
      expect(screen.getByText("$5")).toBeDefined();
    });
  });
});
