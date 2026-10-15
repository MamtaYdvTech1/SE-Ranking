import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "../lib/safeRedirect";

describe("safeRedirectPath", () => {
  it("keeps same-site paths", () => {
    expect(safeRedirectPath("/rankings")).toBe("/rankings");
    expect(safeRedirectPath("/projects?tab=1#top")).toBe("/projects?tab=1#top");
  });

  it("falls back for missing values", () => {
    expect(safeRedirectPath(null)).toBe("/projects");
    expect(safeRedirectPath("")).toBe("/projects");
    expect(safeRedirectPath(undefined, "/login")).toBe("/login");
  });

  it("rejects off-site and script targets", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/projects");
    expect(safeRedirectPath("/\\evil.com")).toBe("/projects");
    expect(safeRedirectPath("https://evil.com")).toBe("/projects");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/projects");
    expect(safeRedirectPath("projects")).toBe("/projects");
    expect(safeRedirectPath("/ok\n//evil.com")).toBe("/projects");
  });
});
