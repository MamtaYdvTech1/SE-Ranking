import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectSettingsWizard } from "../ProjectSettingsWizard";
import { ProjectSettingsWorkspace } from "../ProjectSettingsWorkspace";
import { api } from "@/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/proj-123/settings",
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "admin@workcomposer.com", role: "SuperAdmin" },
    isAuthenticated: true,
    isViewer: false,
    canManageProjects: true,
    logout: vi.fn(),
  }),
}));

// Mock api methods
vi.mock("@/lib/api", () => ({
  api: {
    projects: {
      get: vi.fn(),
      update: vi.fn(),
      getMembers: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
    },
    audit: {
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
    },
    competitors: {
      list: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
    },
    keywords: {
      list: vi.fn(),
      create: vi.fn(),
      bulk: vi.fn(),
      delete: vi.fn(),
    },
    gsc: {
      getStatus: vi.fn().mockResolvedValue({ data: null }),
      getProperties: vi.fn().mockResolvedValue({ data: [] }),
    },
    ga4: {
      getStatus: vi.fn().mockResolvedValue({ data: null }),
      getProperties: vi.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

describe("ProjectSettingsWizard & Workspace Components", () => {
  const projectId = "proj-123";

  beforeEach(() => {
    vi.clearAllMocks();

    (api.projects.get as any).mockResolvedValue({
      data: {
        id: projectId,
        name: "Acme Corp",
        primaryDomain: "acme.com",
        protocol: "https://",
        status: "Active",
        defaultDevice: "desktop",
        defaultSearchEngine: "Google",
        countryCode: "US",
        primaryLocation: "United States",
      },
    });

    (api.audit.getSettings as any).mockResolvedValue({
      data: {
        crawlMaxPages: 1000,
        crawlMaxDepth: 5,
        crawlConcurrency: 3,
        crawlRateLimitMs: 150,
        crawlRespectRobotsTxt: true,
        crawlUserAgent: "TestBot/1.0",
      },
    });

    (api.projects.getMembers as any).mockResolvedValue({
      data: [
        {
          id: "mem-1",
          projectId,
          userId: "user-1",
          email: "admin@workcomposer.com",
          fullName: "Admin User",
          role: "SuperAdmin",
          accessLevel: "Owner",
          assignedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });

    (api.competitors.list as any).mockResolvedValue({
      data: [
        {
          id: "comp-1",
          domain: "competitor.com",
          name: "Competitor Inc",
        },
      ],
    });

    (api.keywords.list as any).mockResolvedValue({
      data: {
        items: [
          {
            id: "kw-1",
            projectId,
            keywordText: "seo rank tracker",
            groupName: "General",
            createdAt: "2026-02-01T00:00:00Z",
          },
        ],
        totalCount: 1,
      },
    });
  });

  it("renders ProjectSettingsWizard with navigation tabs and general information", async () => {
    render(<ProjectSettingsWizard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("Project Settings")).toBeInTheDocument();
      expect(screen.getAllByText("acme.com").length).toBeGreaterThan(0);
    });

    // Check presence of navigation items
    expect(screen.getByText("General information")).toBeInTheDocument();
    expect(screen.getByText("Search engines")).toBeInTheDocument();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
    expect(screen.getByText("Prompts")).toBeInTheDocument();
    expect(screen.getByText("Competitors")).toBeInTheDocument();
    expect(screen.getByText("Statistics and Analytics services")).toBeInTheDocument();
  });

  it("allows switching between wizard tabs", async () => {
    render(<ProjectSettingsWizard projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText("Project Settings")).toBeInTheDocument();
    });

    // Click on Search engines tab
    fireEvent.click(screen.getByText("Search engines"));
    await waitFor(() => {
      expect(screen.getByText("Add search engine")).toBeInTheDocument();
    });

    // Click on Competitors tab
    fireEvent.click(screen.getByText("Competitors"));
    await waitFor(() => {
      expect(screen.getByText("Competitor suggestions")).toBeInTheDocument();
    });

    // Click on Statistics and Analytics services tab
    fireEvent.click(screen.getByText("Statistics and Analytics services"));
    await waitFor(() => {
      expect(screen.getByText("Google Analytics")).toBeInTheDocument();
      expect(screen.getByText("Google Search Console")).toBeInTheDocument();
      expect(screen.getByText("Matomo Analytics")).toBeInTheDocument();
    });
  });

  it("renders ProjectSettingsWorkspace wrapper properly", async () => {
    render(<ProjectSettingsWorkspace projectId={projectId} initialTab="keywords" />);

    await waitFor(() => {
      expect(screen.getByText("Project Settings")).toBeInTheDocument();
      expect(screen.getByText(/Keyword limits/i)).toBeInTheDocument();
    });
  });
});
