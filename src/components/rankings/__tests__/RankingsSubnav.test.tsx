import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankingsSubnav } from "../RankingsSubnav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/proj-100/rankings/detailed",
}));

describe("RankingsSubnav Component", () => {
  it("renders all rankings sub-navigation links with icons", () => {
    render(<RankingsSubnav projectId="proj-100" />);

    expect(screen.getByRole("link", { name: /Summary/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Detailed/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Historical Data/i })).toBeInTheDocument();
  });

  it("marks Detailed link as active when pathname is /rankings/detailed", () => {
    render(<RankingsSubnav projectId="proj-100" />);

    const detailedLink = screen.getByRole("link", { name: /Detailed/i });
    expect(detailedLink.className).toContain("text-blue-600");
  });
});
