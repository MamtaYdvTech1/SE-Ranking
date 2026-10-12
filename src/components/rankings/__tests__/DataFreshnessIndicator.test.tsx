import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataFreshnessIndicator } from "../DataFreshnessIndicator";

describe("DataFreshnessIndicator Component", () => {
  it("renders timestamps and fresh status when not stale", () => {
    render(
      <DataFreshnessIndicator
        lastChecked="10 minutes ago"
        lastSynced="Today at 11:30 AM"
        isStale={false}
      />
    );

    expect(screen.getByText("10 minutes ago")).toBeInTheDocument();
    expect(screen.getByText("Today at 11:30 AM")).toBeInTheDocument();
    expect(screen.getByText("Live Real-Time SERP Data")).toBeInTheDocument();
    expect(screen.queryByText(/Stale Data Warning:/i)).not.toBeInTheDocument();
  });

  it("renders warning banner when isStale is true with default notice", () => {
    render(
      <DataFreshnessIndicator
        lastChecked="3 days ago"
        lastSynced="3 days ago"
        isStale={true}
      />
    );

    expect(screen.getByText(/Stale Data Warning:/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "SERP position snapshot from 72h ago. Latest automated rank run is pending."
      )
    ).toBeInTheDocument();
  });

  it("renders custom stale notice and custom data notice", () => {
    render(
      <DataFreshnessIndicator
        lastChecked="Yesterday"
        lastSynced="Yesterday"
        isStale={true}
        staleNotice="Data delayed due to provider maintenance."
        dataNotice="Live Google SERP"
      />
    );

    expect(
      screen.getByText("Data delayed due to provider maintenance.")
    ).toBeInTheDocument();
    expect(screen.getByText("Live Google SERP")).toBeInTheDocument();
  });
});
