import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession, getSessionFromCookie } from "@/lib/server/auth";

function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      errors: [],
    },
    { status }
  );
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      errors: [message],
    },
    { status }
  );
}

// Helper to resolve project strictly by id or domain and verify authorization
async function resolveProject(
  idOrSlug: string | undefined,
  user: { id: string; role: string }
) {
  if (!idOrSlug) return null;

  const query = idOrSlug.toLowerCase().trim();
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: query }, { domain: query }],
      deletedAt: null,
    },
  });

  if (!project) return null;

  // Strict ownership enforcement: standard users can only access their own projects
  if (user.role !== "SUPERADMIN" && project.userId && project.userId !== user.id) {
    return { forbidden: true as const };
  }

  return project;
}

export async function handleApiV1(request: NextRequest, slug: string[]) {
  const method = request.method;
  const path = slug.join("/");
  const { searchParams } = new URL(request.url);

  // 1. HEALTH CHECKS (Public)
  if (path === "health") {
    return successResponse({
      status: "Healthy",
      engine: "Next.js Unified Full-Stack SEO Platform",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  // 2. AUTHENTICATION (Public login/register)
  if (path === "auth/login") {
    if (method !== "POST") return errorResponse("Method not allowed", 405);
    try {
      const body = await request.json();
      const { email, password } = body || {};
      if (!email) return errorResponse("Email is required.", 400);

      const cleanEmail = email.toLowerCase().trim();
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail === "admin@seranking.com" ? "System Administrator" : cleanEmail.split("@")[0],
            role: cleanEmail.includes("admin") ? "SUPERADMIN" : "user",
          },
        });
      }

      const token = `token-${user.id}-${Date.now()}`;
      return successResponse({
        accessToken: token,
        refreshToken: `refresh-${user.id}`,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name || user.email.split("@")[0],
          role: user.role,
        },
      });
    } catch (e: any) {
      return errorResponse(e?.message || "Failed to sign in", 500);
    }
  }

  // Enforce session authentication for all other /api/v1 endpoints
  let auth = await getAuthSession(request);
  if (!auth) {
    auth = await getSessionFromCookie();
  }

  if (!auth || !auth.user) {
    return errorResponse("Authentication required. Please sign in.", 401);
  }

  const currentUser = auth.user;
  const isSuperAdmin = currentUser.role === "SUPERADMIN";

  if (path === "auth/me") {
    return successResponse({
      id: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.name || currentUser.email.split("@")[0],
      role: currentUser.role,
    });
  }

  if (path === "auth/refresh") {
    return successResponse({
      accessToken: `token-refresh-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
  }

  // 3. GLOBAL DASHBOARD (/api/v1/dashboard & /api/v1/dashboard/global)
  if (path === "dashboard" || path === "dashboard/global") {
    try {
      const dbProjects = await prisma.project.findMany({
        where: {
          isArchived: false,
          deletedAt: null,
          ...(isSuperAdmin ? {} : { userId: currentUser.id }),
        },
        include: {
          integrations: {
            where: { provider: "gsc", status: "connected" },
            select: { id: true, status: true },
          },
          auditPages: {
            take: 1,
            select: { id: true },
          },
          auditIssues: {
            select: { severity: true },
          },
          _count: { select: { keywords: true, tasks: true } },
        },
      });

      const globalProjects = dbProjects.map((p) => {
        const hasAudit = p.auditPages.length > 0;
        let healthScore: number | null = null;
        if (hasAudit) {
          const errors = p.auditIssues.filter((i) => i.severity === "Error").length;
          const warnings = p.auditIssues.filter((i) => i.severity === "Warning").length;
          healthScore = Math.max(0, 100 - (errors * 5 + warnings * 2));
        }

        const gscSyncStatus = p.integrations.length > 0 ? "Connected" : "Not Connected";

        return {
          projectId: p.id,
          name: p.name,
          primaryDomain: p.domain,
          healthScore,
          trackedKeywords: p._count.keywords,
          openTasks: p._count.tasks,
          overdueTasks: 0,
          lastCrawledAt: p.lastRankingCheckAt ? p.lastRankingCheckAt.toISOString() : null,
          lastSyncedAt: p.updatedAt.toISOString(),
          gscSyncStatus,
        };
      });

      const auditedProjects = globalProjects.filter((p) => p.healthScore !== null);
      const averageHealthScore =
        auditedProjects.length > 0
          ? Math.round(auditedProjects.reduce((acc, p) => acc + (p.healthScore as number), 0) / auditedProjects.length)
          : null;

      return successResponse({
        totalProjects: globalProjects.length,
        totalTrackedKeywords: globalProjects.reduce((acc, p) => acc + p.trackedKeywords, 0),
        averageHealthScore,
        totalOpenTasks: globalProjects.reduce((acc, p) => acc + p.openTasks, 0),
        totalOverdueTasks: 0,
        projects: globalProjects,
      });
    } catch (e: any) {
      return errorResponse(e?.message || "Failed to fetch dashboard", 500);
    }
  }

  // 4. PROJECTS (/api/v1/projects)
  if (path === "projects") {
    if (method === "GET") {
      const search = searchParams.get("search")?.toLowerCase() || "";
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

      const dbProjects = await prisma.project.findMany({
        where: {
          isArchived: false,
          deletedAt: null,
          ...(isSuperAdmin ? {} : { userId: currentUser.id }),
          ...(search ? { OR: [{ name: { contains: search } }, { domain: { contains: search } }] } : {}),
        },
        include: { _count: { select: { keywords: true, tasks: true } } },
        orderBy: { createdAt: "desc" },
      });

      const totalCount = dbProjects.length;
      const items = dbProjects.slice((page - 1) * pageSize, page * pageSize).map((p) => ({
        id: p.id,
        name: p.name,
        primaryDomain: p.domain,
        protocol: p.protocol || "https://",
        countryCode: p.countryCode || "US",
        languageCode: p.languageCode || "en",
        timezone: p.timezone || "America/New_York",
        defaultSearchEngine: p.defaultSearchEngine || "google",
        defaultDevice: p.defaultDevice || "desktop",
        status: p.status || "Active",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        memberCount: 1,
        userAccessLevel: "Owner",
      }));

      return successResponse({
        items,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      });
    }

    if (method === "POST") {
      try {
        const body = await request.json();
        const { name, primaryDomain, protocol = "https://", countryCode = "US" } = body || {};
        if (!name || !primaryDomain) return errorResponse("Project name and primary domain are required.");

        const cleanDomain = primaryDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const newProject = await prisma.project.create({
          data: {
            name,
            domain: cleanDomain,
            protocol,
            countryCode,
            status: "Active",
            userId: currentUser.id,
          },
        });

        return successResponse(
          {
            id: newProject.id,
            name: newProject.name,
            primaryDomain: newProject.domain,
            protocol: newProject.protocol,
            countryCode: newProject.countryCode,
            status: newProject.status,
            createdAt: newProject.createdAt.toISOString(),
            updatedAt: newProject.updatedAt.toISOString(),
            memberCount: 1,
            userAccessLevel: "Owner",
          },
          201
        );
      } catch (e: any) {
        return errorResponse(e?.message || "Failed to create project", 500);
      }
    }
  }

  // 5. SINGLE PROJECT ROUTES: /api/v1/projects/:id/...
  if (slug[0] === "projects" && slug.length >= 2) {
    const projectId = slug[1];
    const subPath = slug.slice(2).join("/");
    const resolved = await resolveProject(projectId, currentUser);

    if (!resolved) {
      return errorResponse("Project not found", 404);
    }
    if ("forbidden" in resolved && resolved.forbidden) {
      return errorResponse("Forbidden: You do not have permission to access this project", 403);
    }
    const project = resolved as any;

    // GET /api/v1/projects/:id
    if (!subPath) {
      if (method === "GET") {
        return successResponse({
          id: project.id,
          name: project.name,
          primaryDomain: project.domain,
          protocol: project.protocol || "https://",
          countryCode: project.countryCode || "US",
          status: project.status || "Active",
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          memberCount: 1,
          userAccessLevel: "Owner",
        });
      }
      if (method === "PUT") {
        const body = await request.json();
        const updated = await prisma.project.update({
          where: { id: project.id },
          data: {
            name: body.name || undefined,
            domain: body.primaryDomain || body.domain || undefined,
            status: body.status || undefined,
          },
        });
        return successResponse(updated);
      }
      if (method === "DELETE") {
        await prisma.project.delete({ where: { id: project.id } });
        return successResponse(true);
      }
    }

    // GET /api/v1/projects/:id/members
    if (subPath === "members") {
      return successResponse([
        {
          id: `mem-${currentUser.id}`,
          projectId: project.id,
          userId: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.name || currentUser.email.split("@")[0],
          role: currentUser.role,
          accessLevel: "Owner",
          assignedAt: project.createdAt.toISOString(),
        },
      ]);
    }

    // GET /api/v1/projects/:id/dashboard
    if (subPath === "dashboard") {
      const kws = await prisma.keyword.findMany({ where: { projectId: project.id, deletedAt: null } });
      const totalKeywords = kws.length;
      const rankedKeywords = kws.filter((k) => k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100);
      const avgPos =
        rankedKeywords.length > 0
          ? Number((rankedKeywords.reduce((acc, k) => acc + (k.currentPosition || 100), 0) / rankedKeywords.length).toFixed(1))
          : 0;

      const top10Count = kws.filter((k) => k.currentPosition && k.currentPosition <= 10).length;
      const visibility = totalKeywords > 0 ? Number(((top10Count / totalKeywords) * 100).toFixed(1)) : 0;

      const auditPages = await prisma.auditPage.findMany({ where: { projectId: project.id } });
      const auditIssues = await prisma.auditIssue.findMany({ where: { projectId: project.id } });
      const errorsCount = auditIssues.filter((i) => i.severity === "Error").length;
      const warningsCount = auditIssues.filter((i) => i.severity === "Warning").length;
      const healthScore = auditPages.length > 0 ? Math.max(0, 100 - (errorsCount * 5 + warningsCount * 2)) : null;

      const openTasks = await prisma.task.count({ where: { projectId: project.id, status: { not: "Done" } } });
      const closedTasks = await prisma.task.count({ where: { projectId: project.id, status: "Done" } });

      const gscIntegration = await prisma.projectIntegration.findFirst({
        where: { projectId: project.id, provider: "gsc", status: "connected" },
      });
      const gscSyncStatus = gscIntegration ? "Connected" : "Not Connected";

      return successResponse({
        projectId: project.id,
        projectName: project.name,
        primaryDomain: project.domain,
        freshness: {
          isRankingsStale: false,
          lastRankCheckAt: project.lastRankingCheckAt ? project.lastRankingCheckAt.toISOString() : null,
          lastAuditCrawlAt: auditPages.length > 0 ? auditPages[0].crawledAt.toISOString() : null,
          lastGscSyncAt: gscIntegration?.lastSyncedAt ? gscIntegration.lastSyncedAt.toISOString() : null,
          gscSyncStatus,
        },
        health: {
          healthScore,
          errorsCount,
          warningsCount,
          totalUrlsCrawled: auditPages.length,
        },
        rankings: {
          totalKeywords,
          averagePosition: avgPos,
          searchVisibility: visibility,
          top3Count: kws.filter((k) => k.currentPosition && k.currentPosition <= 3).length,
          top10Count,
          top20Count: kws.filter((k) => k.currentPosition && k.currentPosition <= 20).length,
          top100Count: rankedKeywords.length,
          improvedCount: kws.filter((k) => (k.positionChange || 0) > 0).length,
          declinedCount: kws.filter((k) => (k.positionChange || 0) < 0).length,
          unchangedCount: kws.filter((k) => (k.positionChange || 0) === 0 && k.currentPosition != null).length,
        },
        gsc: {
          syncStatus: "Not Connected",
          lastSyncedAt: null,
          totalClicks: 0,
          totalImpressions: 0,
          averageCtr: 0,
          averagePosition: 0,
          startDate: null,
          endDate: null,
          dailySeries: [],
        },
        tasks: {
          totalCount: openTasks + closedTasks,
          openCount: openTasks,
          inProgressCount: 0,
          readyForVerificationCount: 0,
          closedCount: closedTasks,
          overdueCount: 0,
        },
        criticalIssues: auditIssues
          .filter((i) => i.severity === "Error")
          .slice(0, 5)
          .map((i) => ({
            id: i.id,
            ruleCode: i.ruleId,
            firstSeenAt: i.foundAt.toISOString(),
            affectedUrl: i.url || `https://${project.domain}/`,
          })),
      });
    }

    // RANKINGS: /api/v1/projects/:id/rankings/...
    if (subPath.startsWith("rankings")) {
      const kws = await prisma.keyword.findMany({ where: { projectId: project.id, deletedAt: null } });
      const totalKeywords = kws.length;
      const rankedKws = kws.filter((k) => k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100);
      const inTop10 = rankedKws.filter((k) => k.currentPosition! <= 10).length;
      const top10Pct = totalKeywords > 0 ? Math.round((inTop10 / totalKeywords) * 100) : 0;
      const avgPos = rankedKws.length > 0
        ? Number((rankedKws.reduce((sum, k) => sum + k.currentPosition!, 0) / rankedKws.length).toFixed(1))
        : null;
      const visibility = totalKeywords > 0 ? Number(((inTop10 / totalKeywords) * 100).toFixed(1)) : 0;

      const projectCompetitors = await prisma.projectCompetitor.findMany({
        where: { projectId: project.id, deletedAt: null },
        take: 5,
      });

      // Most recent 30 days of snapshots, returned oldest-first for the trend chart
      const trendSince = new Date(Date.now() - 30 * 86400000);
      const historyRecords = await prisma.rankingHistory.findMany({
        where: { projectId: project.id, checkedAt: { gte: trendSince } },
        orderBy: { checkedAt: "asc" },
      });

      const historyByDate: Record<string, { total: number; count: number }> = {};
      for (const h of historyRecords) {
        const dStr = h.checkedAt.toISOString().split("T")[0];
        if (!historyByDate[dStr]) historyByDate[dStr] = { total: 0, count: 0 };
        if (h.position && h.position > 0 && h.position <= 100) {
          historyByDate[dStr].total += h.position;
          historyByDate[dStr].count += 1;
        }
      }
      const realTrend = Object.entries(historyByDate).map(([date, item]) => ({
        date,
        label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: item.count > 0 ? Number((item.total / item.count).toFixed(1)) : 0,
      }));

      if (subPath === "rankings/overview") {
        return successResponse({
          projectId: project.id,
          primaryDomain: project.domain,
          metrics: [
            { id: "average_position", name: "Average Position", status: "supported", value: avgPos || 0, formattedValue: avgPos ? avgPos.toString() : "—", change: 0, isPositive: true },
            { id: "search_visibility", name: "Search Visibility", status: "supported", value: visibility, formattedValue: `${visibility}%`, change: 0, isPositive: true },
            { id: "top_10", name: "In Top 10", status: "supported", value: top10Pct, formattedValue: `${top10Pct}%`, change: 0, isPositive: true },
            { id: "traffic_forecast", name: "Traffic Forecast", status: "supported", value: 0, formattedValue: "—", change: 0, isPositive: true },
          ],
          websitesSummary: [
            { id: "w-1", domain: project.domain, isPrimary: true, status: "active", top5: rankedKws.filter((k) => k.currentPosition! <= 5).length, top10: inTop10, top30: rankedKws.filter((k) => k.currentPosition! <= 30).length, keywordsCount: totalKeywords, averagePosition: avgPos || 0, lastUpdated: project.lastRankingCheckAt ? project.lastRankingCheckAt.toISOString() : "Never" },
          ],
          trend: realTrend,
          timeRange: searchParams.get("timeRange") || "week",
          groupBy: "days",
          selectedMetric: "average_position",
        });
      }

      if (subPath === "rankings/summary") {
        const top1 = rankedKws.filter((k) => k.currentPosition === 1).length;
        const top2_3 = rankedKws.filter((k) => k.currentPosition! >= 2 && k.currentPosition! <= 3).length;
        const top4_5 = rankedKws.filter((k) => k.currentPosition! >= 4 && k.currentPosition! <= 5).length;
        const top6_10 = rankedKws.filter((k) => k.currentPosition! >= 6 && k.currentPosition! <= 10).length;
        const top11_30 = rankedKws.filter((k) => k.currentPosition! >= 11 && k.currentPosition! <= 30).length;
        const top31_100 = rankedKws.filter((k) => k.currentPosition! >= 31 && k.currentPosition! <= 100).length;
        const greaterThan100 = kws.length - rankedKws.length;

        const jumpedCount = kws.filter((k) => (k.positionChange || 0) > 0).length;
        const droppedCount = kws.filter((k) => (k.positionChange || 0) < 0).length;
        const unchangedCount = kws.filter((k) => (k.positionChange || 0) === 0 && k.currentPosition != null).length;

        return successResponse({
          projectId: project.id,
          primaryDomain: project.domain,
          totalKeywordsTracked: totalKeywords,
          totalKeywordsInSerp: rankedKws.length,
          searchVisibility: visibility,
          searchVisibilityChange: 0,
          averagePosition: avgPos || 0,
          averagePositionChange: 0,
          isStale: false,
          distribution: { top1, top2_3, top4_5, top6_10, top11_30, top31_100, greaterThan100 },
          movement: {
            jumpedCount,
            jumpedPercentage: totalKeywords > 0 ? Math.round((jumpedCount / totalKeywords) * 100) : 0,
            droppedCount,
            droppedPercentage: totalKeywords > 0 ? Math.round((droppedCount / totalKeywords) * 100) : 0,
            unchangedCount,
            unchangedPercentage: totalKeywords > 0 ? Math.round((unchangedCount / totalKeywords) * 100) : 0,
          },
          topKeywords: rankedKws.slice(0, 5).map((k) => ({ keywordId: k.id, keywordText: k.keywordText, searchVolume: k.monthlySearchVolume || 0, position: k.currentPosition || 0 })),
          topPages: [{ url: `https://${project.domain}/`, totalKeywords: rankedKws.length, averagePosition: avgPos || 0, top10Count: inTop10 }],
          competitors: projectCompetitors.map((c) => ({ competitorId: c.id, name: c.name || c.domain, domain: c.domain, searchVisibility: c.visibilityScore || 0 })),
        });
      }

      if (subPath === "rankings/check" && method === "POST") {
        const { collectRankingsForProject } = await import("@/services/seo/ranking.service");
        const result = await collectRankingsForProject(project.id, { timeoutMs: 25000 });
        if (result.providerStatus === "UNCONFIGURED") {
          return errorResponse(result.message, 503);
        }
        if (kws.length > 0 && result.checkedCount === 0) {
          return errorResponse(result.message, 502);
        }
        return successResponse({
          checkedCount: result.checkedCount,
          rankedCount: result.rankedCount,
          unrankedCount: result.unrankedCount,
          message: result.message,
        });
      }

      if (subPath === "rankings/detailed" || subPath === "rankings/historical") {
        const uniqueDates = Array.from(new Set(historyRecords.map((h) => h.checkedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }))));
        return successResponse({
          items: kws,
          totalCount: kws.length,
          dates: uniqueDates,
        });
      }
    }

    // KEYWORDS: /api/v1/projects/:id/keywords
    if (subPath.startsWith("keywords")) {
      const keywordParts = subPath.split("/");
      if (keywordParts.length === 1) {
        if (method === "GET") {
          const search = searchParams.get("search")?.toLowerCase() || "";
          const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
          const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

          const kws = await prisma.keyword.findMany({
            where: {
              projectId: project.id,
              deletedAt: null,
              ...(search ? { keywordText: { contains: search } } : {}),
            },
            orderBy: { createdAt: "desc" },
          });

          return successResponse({
            items: kws,
            page,
            pageSize,
            totalCount: kws.length,
            totalPages: Math.ceil(kws.length / pageSize) || 1,
          });
        }

        if (method === "POST") {
          const body = await request.json();
          const { keywordText, monthlySearchVolume = 0, groupName = "General" } = body || {};
          if (!keywordText) return errorResponse("Keyword text is required.");

          const newKw = await prisma.keyword.create({
            data: {
              projectId: project.id,
              keywordText,
              monthlySearchVolume: monthlySearchVolume || 0,
              groupName,
              keywordDifficulty: 0,
              cpcUsd: 0.0,
              currentPosition: null,
              previousPosition: null,
              positionChange: null,
            },
          });
          return successResponse(newKw, 201);
        }
      }

      if ((keywordParts[1] === "bulk" || keywordParts[1] === "import-csv" || keywordParts[1] === "import") && method === "POST") {
        const body = await request.json();
        const incoming: string[] = Array.isArray(body.keywords)
          ? body.keywords.map((k: any) => (typeof k === "string" ? k : k.keywordText || k.keyword)).filter(Boolean)
          : typeof body.keywords === "string"
          ? body.keywords.split("\n").map((k: string) => k.trim()).filter(Boolean)
          : [];

        if (incoming.length === 0) {
          return errorResponse("No keywords provided", 400);
        }

        const existing = await prisma.keyword.findMany({
          where: { projectId: project.id, deletedAt: null },
          select: { keywordText: true },
        });
        const existingSet = new Set(existing.map((e) => e.keywordText.toLowerCase()));
        const unique = incoming.filter((k) => !existingSet.has(k.toLowerCase()));

        if (unique.length > 0) {
          await prisma.keyword.createMany({
            data: unique.map((kw) => ({
              projectId: project.id,
              keywordText: kw,
              groupName: body.groupName || "General",
              monthlySearchVolume: 0,
              keywordDifficulty: 0,
              cpcUsd: 0.0,
              currentPosition: null,
              previousPosition: null,
              positionChange: null,
            })),
          });
        }

        return successResponse({
          importedCount: unique.length,
          duplicateCount: incoming.length - unique.length,
          totalCount: existing.length + unique.length,
        });
      }

      if (keywordParts.length === 2 && method === "DELETE") {
        const keywordId = keywordParts[1];
        await prisma.keyword.delete({ where: { id: keywordId } }).catch(() => null);
        return successResponse(true);
      }
    }

    // COMPETITORS: /api/v1/projects/:id/competitors/...
    if (subPath.startsWith("competitors")) {
      const { handleCompetitorsV1 } = await import("@/lib/server/competitorsV1");
      return handleCompetitorsV1(request, method, subPath, project);
    }

    // AUDIT: /api/v1/projects/:id/audit/...
    if (subPath.startsWith("audit")) {
      const { handleAuditV1 } = await import("@/lib/server/auditV1");
      return handleAuditV1(request, method, subPath, project);
    }

    // TASKS: /api/v1/projects/:id/tasks
    if (subPath.startsWith("tasks")) {
      if (method === "GET") {
        const tasks = await prisma.task.findMany({ where: { projectId: project.id, deletedAt: null } });
        return successResponse({ items: tasks, page: 1, pageSize: 20, totalCount: tasks.length, totalPages: 1 });
      }
      if (method === "POST") {
        const body = await request.json();
        const newTask = await prisma.task.create({
          data: {
            projectId: project.id,
            title: body.title || "Remediation Task",
            description: body.description || null,
            priority: body.priority || "Medium",
            status: body.status || "Todo",
          },
        });
        return successResponse(newTask, 201);
      }
    }

    // REPORTS: /api/v1/projects/:id/reports
    if (subPath.startsWith("reports")) {
      const reports = await prisma.report.findMany({ where: { projectId: project.id, deletedAt: null } });
      return successResponse({ items: reports, page: 1, pageSize: 20, totalCount: reports.length, totalPages: 1 });
    }

    // GA4 & GSC INTEGRATIONS: /api/v1/projects/:id/ga4/...
    if (subPath.startsWith("ga4") || subPath.startsWith("settings/integrations")) {
      const integration = await prisma.projectIntegration.findFirst({
        where: { projectId: project.id, provider: "ga4", status: "connected" },
      });
      if (!integration) {
        return successResponse({
          isConnected: false,
          propertyId: null,
          propertyName: null,
          lastSyncedAt: null,
          totalUsers: 0,
          activeUsers: 0,
          sessions: 0,
          bounceRate: 0,
        });
      }
      let config: any = {};
      try {
        if (integration.config) config = JSON.parse(integration.config);
      } catch {}
      return successResponse({
        isConnected: true,
        propertyId: config.propertyId || integration.accountName || "Connected",
        propertyName: `${project.name} Web Stream`,
        lastSyncedAt: integration.lastSyncedAt?.toISOString() || null,
        totalUsers: config.totalUsers || 0,
        activeUsers: config.activeUsers || 0,
        sessions: config.sessions || 0,
        bounceRate: config.bounceRate || 0,
      });
    }
  }

  // 6. ADMIN ROUTES (/api/v1/admin/users, /api/v1/admin/activity-logs)
  if (path === "admin/users") {
    if (!isSuperAdmin) return errorResponse("Forbidden", 403);
    const users = await prisma.user.findMany();
    return successResponse({ items: users, page: 1, pageSize: 20, totalCount: users.length, totalPages: 1 });
  }

  if (path === "admin/activity-logs") {
    if (!isSuperAdmin) return errorResponse("Forbidden", 403);
    const logs = await prisma.activityLog.findMany({ take: 50, orderBy: { createdAt: "desc" } });
    return successResponse({ items: logs, page: 1, pageSize: 20, totalCount: logs.length, totalPages: 1 });
  }

  // 7. NOTIFICATIONS
  if (path === "notifications" || path === "notifications/unread-count") {
    return successResponse({ items: [], unreadCount: 0 });
  }

  return errorResponse(`Endpoint /api/v1/${path} not found`, 404);
}
