import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceActionBar } from "../WorkspaceActionBar";

describe("WorkspaceActionBar Component", () => {
  it("renders active websites title and total count badge", () => {
    const onRecheck = vi.fn();
    const onFixtureChange = vi.fn();

    render(
      <WorkspaceActionBar
        totalWebsites={5}
        canManage={true}
        isViewer={false}
        isRechecking={false}
        onRecheck={onRecheck}
        fixtureMode="populated"
        onFixtureChange={onFixtureChange}
      />
    );

    expect(screen.getByText("Active websites")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("CREATE PROJECT")).toBeInTheDocument();
    expect(screen.getByText("EXPORT")).toBeInTheDocument();
    expect(screen.getByText("RECHECK DATA")).toBeInTheDocument();
  });

  it("renders read-only mode badge when canManage is false", () => {
    const onRecheck = vi.fn();
    const onFixtureChange = vi.fn();

    render(
      <WorkspaceActionBar
        totalWebsites={2}
        canManage={false}
        isViewer={true}
        isRechecking={false}
        onRecheck={onRecheck}
        fixtureMode="populated"
        onFixtureChange={onFixtureChange}
      />
    );

    expect(screen.getByText("Read-only mode (Viewer)")).toBeInTheDocument();
    expect(screen.queryByText("CREATE PROJECT")).not.toBeInTheDocument();
  });

  it("handles recheck click and dropdown menu interactions", () => {
    const onRecheck = vi.fn();
    const onFixtureChange = vi.fn();

    render(
      <WorkspaceActionBar
        totalWebsites={2}
        canManage={true}
        isViewer={false}
        isRechecking={false}
        onRecheck={onRecheck}
        fixtureMode="populated"
        onFixtureChange={onFixtureChange}
      />
    );

    // Primary recheck button
    fireEvent.click(screen.getByText("RECHECK DATA"));
    expect(onRecheck).toHaveBeenCalledTimes(1);

    // Toggle dropdown
    const dropdownToggle = screen.getByLabelText("Recheck Options");
    fireEvent.click(dropdownToggle);

    const recheckAllBtn = screen.getByText("Recheck All Keywords");
    expect(recheckAllBtn).toBeInTheDocument();
    fireEvent.click(recheckAllBtn);
    expect(onRecheck).toHaveBeenCalledTimes(2);
  });

  it("switches fixture mode when fixture select is changed", () => {
    const onRecheck = vi.fn();
    const onFixtureChange = vi.fn();

    render(
      <WorkspaceActionBar
        totalWebsites={2}
        canManage={true}
        isViewer={false}
        isRechecking={false}
        onRecheck={onRecheck}
        fixtureMode="populated"
        onFixtureChange={onFixtureChange}
      />
    );

    const fixtureSelect = screen.getByLabelText("Development State Fixture");
    fireEvent.change(fixtureSelect, { target: { value: "loading" } });
    expect(onFixtureChange).toHaveBeenCalledWith("loading");
  });
});
