import { vi } from "vitest";

/**
 * Shared fixtures for competitor view tests: stubbed API responses for the
 * SERP landscape, competitor overview and keyword matrix endpoints.
 * Tests pin the clock to FIXED_NOW so date labels are deterministic.
 */

export const FIXED_NOW = new Date(2026, 8, 19, 12, 0, 0); // 19 Sep 2026

const TARGET = "workcomposer.com";

export const FIXTURE_KEYWORDS: Array<{ id: string; keyword: string; volume: number; group: string; tags: string[] }> = [
  { id: "kw-1", keyword: "work composer download", volume: 210, group: "Brand", tags: ["core", "branded", "download"] },
  { id: "kw-2", keyword: "work composer", volume: 590, group: "General", tags: ["core", "branded"] },
  { id: "kw-3", keyword: "work composer hack", volume: 10, group: "Brand", tags: ["high-intent"] },
  { id: "kw-4", keyword: "workpuls idle time", volume: 10, group: "Competitor", tags: ["idle-time"] },
  { id: "kw-5", keyword: "idle time tracker", volume: 10, group: "Features", tags: ["idle-time", "tracking"] },
  { id: "kw-6", keyword: "idle time tracking", volume: 10, group: "Features", tags: ["idle-time", "tracking"] },
  { id: "kw-7", keyword: "idle time tracking software", volume: 10, group: "Features", tags: ["software"] },
  { id: "kw-8", keyword: "composer download", volume: 1900, group: "Brand", tags: ["download"] },
  { id: "kw-9", keyword: "working track", volume: 480, group: "General", tags: ["tracking"] },
  { id: "kw-10", keyword: "screenshot time tracking", volume: 110, group: "Features", tags: ["tracking", "screenshot"] },
];

const OTHER_DOMAINS = [
  "github.com",
  "sourceforge.net",
  "capterra.com",
  "g2.com",
  "reddit.com",
  "quora.com",
  "wikipedia.org",
  "alternativeto.net",
  "softwareadvice.com",
  "trustradius.com",
  "pcmag.com",
  "techradar.com",
  "zdnet.com",
  "producthunt.com",
  "medium.com",
  "forbes.com",
];

/** 20 organic results per keyword; getcomposer.org leads, the target is #2. */
function serpFor(keywordIdx: number) {
  const order = [
    { domain: "getcomposer.org", url: "https://getcomposer.org/download/" },
    { domain: TARGET, url: `https://${TARGET}/` },
    { domain: "timedoctor.com", url: "https://timedoctor.com/" },
    { domain: "hubstaff.com", url: "https://hubstaff.com/" },
    ...OTHER_DOMAINS.map((d, i) => ({ domain: d, url: `https://${d}/page-${(i + keywordIdx) % 5}` })),
  ];
  return order.slice(0, 20).map((r, i) => ({ position: i + 1, url: r.url, domain: r.domain }));
}

export function serpLandscapeFixture() {
  const keywords = FIXTURE_KEYWORDS.map((k, idx) => ({
    keywordId: k.id,
    keyword: k.keyword,
    searchVolume: k.volume,
    group: k.group,
    tags: k.tags,
    checkedAt: "2026-09-19T08:00:00.000Z",
    results: serpFor(idx),
  }));
  const byText = (offset: number) =>
    Object.fromEntries(FIXTURE_KEYWORDS.map((k, idx) => [k.keyword, serpFor(idx + offset)]));
  return {
    success: true,
    targetDomain: TARGET,
    queriesAnalyzed: keywords.length,
    lastCheckedAt: "2026-09-19T08:00:00.000Z",
    domains: [],
    keywords,
    snapshots: [
      { date: "2026-09-18", checkedAt: "2026-09-18T08:00:00.000Z", keywords: byText(1) },
      { date: "2026-09-19", checkedAt: "2026-09-19T08:00:00.000Z", keywords: byText(0) },
    ],
  };
}

const HISTORY_DAYS = Array.from({ length: 14 }, (_, i) => `2026-09-${String(6 + i).padStart(2, "0")}`);

function history(base: number) {
  return HISTORY_DAYS.map((date, i) => ({
    date,
    visibility: Number((base + i * 0.5).toFixed(2)),
    averagePosition: 5,
    rankedKeywordsCount: 8,
    top10Count: 6,
    estimatedTraffic: 100 + i * 10,
  }));
}

export function overviewFixture() {
  const summary = (competitorId: string | null, domain: string, isTarget: boolean, vis: number, traffic: number) => ({
    competitorId,
    domain,
    name: domain,
    isTargetDomain: isTarget,
    currentVisibility: vis,
    currentAveragePosition: 4.2,
    currentRankedCount: 8,
    top3Count: 3,
    top10Count: 6,
    top20Count: 8,
    top30Count: 8,
    top100Count: 8,
    unrankedCount: 2,
    top20OverlapCount: 5,
    top20OverlapPercentage: 50,
    estimatedTraffic: traffic,
    history: history(vis - 6),
  });
  return {
    success: true,
    data: {
      projectId: "proj-123",
      targetDomain: TARGET,
      totalKeywordsCount: 10,
      lastCheckedAt: "2026-09-19T08:00:00.000Z",
      latestCheckDate: "2026-09-19T08:00:00.000Z",
      isStale: false,
      summaries: [
        summary(null, TARGET, true, 30.5, 1200),
        summary("comp-1", "getcomposer.org", false, 41.52, 4850),
        summary("comp-2", "sourceforge.net", false, 12.3, 640),
        summary("comp-3", "github.com", false, 9.8, 410),
      ],
    },
  };
}

/** Keyword x competitor positions; hubstaff ranks top 10 for the first three keywords only. */
export function keywordMatrixFixture() {
  return {
    success: true,
    data: {
      items: FIXTURE_KEYWORDS.map((k, idx) => ({
        keywordId: k.id,
        keywordText: k.keyword,
        searchVolume: k.volume,
        targetPosition: 2,
        targetPreviousPosition: 3,
        targetPositionChange: 1,
        targetRankedUrl: `https://${TARGET}/`,
        competitorRanks: {
          "comp-1": { competitorId: "comp-1", position: idx < 3 ? idx + 2 : 45, previousPosition: null, positionChange: 0, rankedUrl: null },
          "comp-2": { competitorId: "comp-2", position: null, previousPosition: null, positionChange: null, rankedUrl: null },
        },
      })),
      totalCount: FIXTURE_KEYWORDS.length,
      pageNumber: 1,
      pageSize: 200,
      competitors: [],
      lastCheckedAt: "2026-09-19T08:00:00.000Z",
      isStale: false,
    },
  };
}

/** Routes fetch() calls made by the competitor views to the fixtures above. */
export function installCompetitorFetchStub() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes("/competitors/serp")
      ? serpLandscapeFixture()
      : url.includes("/competitors/overview")
      ? overviewFixture()
      : url.includes("/competitors/keywords")
      ? keywordMatrixFixture()
      : { success: false, error: "not stubbed" };
    return { ok: body.success !== false, status: 200, json: async () => body } as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Pins Date to FIXED_NOW (timers stay real so React effects and promises run normally). */
export function pinClock() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FIXED_NOW);
}
