import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconNavRail } from "../IconNavRail";
import { AuthProvider } from "@/context/AuthContext";

let mockPathname = "/projects";
let mockUser: any = {
  id: "usr_1",
  email: "test@example.com",
  fullName: "Alice Wonderland",
  role: "SuperAdmin",
  firstName: "Alice",
  lastName: "Wonderland",
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/context/AuthContext", async () => {
  const actual = await vi.importActual<any>("@/context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      logout: vi.fn(),
      setUser: vi.fn(),
    }),
  };
});

describe("IconNavRail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/projects";
    mockUser = {
      id: "usr_1",
      email: "test@example.com",
      fullName: "Alice Wonderland",
      role: "SuperAdmin",
      firstName: "Alice",
      lastName: "Wonderland",
    };
  });

  it("renders platform logo and navigation rail", () => {
    render(<IconNavRail />);

    expect(screen.getByRole("complementary", { name: /Application Rail/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "SEO" })).toHaveAttribute("href", "/projects");
  });

  it("renders active state on Projects when pathname is /projects", () => {
    render(<IconNavRail />);

    const projectsLink = screen.getByRole("link", { name: /Projects/i });
    expect(projectsLink).toHaveAttribute("href", "/projects");
    expect(projectsLink.className).toContain("text-blue-400");
  });

  it("renders disabled items with phase indicators", () => {
    render(<IconNavRail />);

    expect(screen.getByTitle("Research (Phase 4)")).toBeInTheDocument();
    expect(screen.getByTitle("Backlinks (Phase 5)")).toBeInTheDocument();
    expect(screen.getByTitle("Audit (Phase 3)")).toBeInTheDocument();
    expect(screen.getByTitle("AI Search (Phase 5)")).toBeInTheDocument();
    expect(screen.getByTitle("Content (Phase 4)")).toBeInTheDocument();
    expect(screen.getByTitle("Reports (Phase 4)")).toBeInTheDocument();
  });

  it("renders Admin item when user is SuperAdmin", () => {
    render(<IconNavRail />);

    const adminLink = screen.getByRole("link", { name: /Admin/i });
    expect(adminLink).toHaveAttribute("href", "/admin/users");
  });

  it("does not render Admin item when user is not SuperAdmin", () => {
    mockUser = {
      id: "usr_2",
      email: "viewer@example.com",
      fullName: "Bob Builder",
      role: "SEOExecutive",
    };

    render(<IconNavRail />);

    expect(screen.queryByRole("link", { name: /Admin/i })).not.toBeInTheDocument();
  });

  it("displays user initials in profile avatar footer", () => {
    render(<IconNavRail />);

    const profileLink = screen.getByRole("link", { name: /AW/i });
    expect(profileLink).toHaveAttribute("href", "/profile");
    expect(profileLink).toHaveTextContent("AW");
  });

  it("falls back to fullName initials if firstName/lastName not set", () => {
    mockUser = {
      id: "usr_3",
      email: "charlie@example.com",
      fullName: "Charlie Delta",
      role: "SEOExecutive",
    };

    render(<IconNavRail />);

    const profileLink = screen.getByRole("link", { name: /CD/i });
    expect(profileLink).toHaveTextContent("CD");
  });
});
