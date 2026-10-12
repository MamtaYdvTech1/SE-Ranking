import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CompetitorWorkspace } from "../CompetitorWorkspace";
import { api } from "@/lib/api";

const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u-1", email: "admin@example.com", role: "SuperAdmin" },
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    projects: {
      get: vi.fn(),
    },
    competitors: {
      list: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getVisibility: vi.fn(),
      getOverview: vi.fn(),
      getKeywords: vi.fn(),
      getGap: vi.fn(),
    },
  },
}));

describe("CompetitorWorkspace Component", () => {
  const mockCompetitors = [
    {
      id: "comp-1",
      name: "Hubstaff",
      domain: "hubstaff.com",
      notes: "Main tracking competitor",
      lastCheckedAt: "2026-09-20T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/projects/proj-123/competitors/added");
    (api.projects.get as any).mockResolvedValue({
      success: true,
      data: { id: "proj-123", name: "WorkComposer", primaryDomain: "workcomposer.com" },
    });
    (api.competitors.list as any).mockResolvedValue({
      success: true,
      data: mockCompetitors,
    });
  });

  it("renders workspace tabs and loaded competitors", async () => {
    render(<CompetitorWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("Added Competitors (1/5)")).toBeInTheDocument();
      expect(screen.getAllByText("SERP Competitors").length).toBeGreaterThan(0);
      expect(screen.getByText("Share of Voice")).toBeInTheDocument();
      expect(screen.getAllByText("Visibility Rating").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("Hubstaff").length).toBeGreaterThan(0);
  });

  it("renders empty state when no competitors exist", async () => {
    (api.competitors.list as any).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<CompetitorWorkspace projectId="proj-123" />);

    await waitFor(() => {
      expect(screen.getByText("No competitors added")).toBeInTheDocument();
      expect(screen.getByText("Add Your First Competitor")).toBeInTheDocument();
    });
  });

  it("renders SERP competitors view when initialTab is serp", async () => {
    mockPathname.mockReturnValue("/projects/proj-123/competitors/serp");

    render(<CompetitorWorkspace projectId="proj-123" initialTab="serp" />);

    await waitFor(() => {
      expect(screen.getByTestId("serp-competitors-view")).toBeInTheDocument();
      expect(screen.getByText("ADVANCED SERP ANALYSIS")).toBeInTheDocument();
    });
  });

  it("renders Share of Voice view when initialTab is share-of-voice", async () => {
    mockPathname.mockReturnValue("/projects/proj-123/competitors/share-of-voice");

    render(<CompetitorWorkspace projectId="proj-123" initialTab="share-of-voice" />);

    await waitFor(() => {
      expect(screen.getByTestId("share-of-voice-view")).toBeInTheDocument();
      expect(screen.getByText("TOTAL TRAFFIC FORECAST")).toBeInTheDocument();
    });
  });

  it("renders Visibility Rating view when initialTab is visibility-rating", async () => {
    mockPathname.mockReturnValue("/projects/proj-123/competitors/visibility-rating");

    render(<CompetitorWorkspace projectId="proj-123" initialTab="visibility-rating" />);

    await waitFor(() => {
      expect(screen.getByTestId("visibility-rating-view")).toBeInTheDocument();
      expect(screen.getByText("COMPETITOR DISTRIBUTION")).toBeInTheDocument();
    });
  });
});
