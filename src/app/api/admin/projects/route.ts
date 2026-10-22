import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

import { normalizeDomain } from "@/lib/projectUtils";
export { normalizeDomain };

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const clientId = searchParams.get("clientId") || "";
    const userId = searchParams.get("userId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));
    const skip = (page - 1) * pageSize;

    const fakeProjectFilter = [
      { domain: { in: ["alpha-marketing.com", "beta-tech.com", "fresh-domain.com", "project-alpha-assigned.org", "project-beta-unassigned.org"] } },
      { name: { in: ["Alpha Project", "Beta Project", "Fresh New Project"] } },
      { domain: { contains: "example.com" } },
      { domain: { contains: "example.org" } },
      { user: { email: { contains: "user.alpha" } } },
      { user: { email: { contains: "user.beta" } } },
      { user: { email: { contains: "sec-user" } } },
      { user: { email: { contains: "sec.test" } } },
    ];

    const where: any = {
      deletedAt: null,
      NOT: fakeProjectFilter,
    };

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { domain: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (userId) {
      where.OR = [
        { userId },
        { members: { some: { userId } } },
      ];
    }

    const [totalCount, items] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
          client: {
            select: { id: true, name: true, company: true },
          },
          group: {
            select: { id: true, name: true, color: true },
          },
          domains: true,
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
            },
          },
          _count: {
            select: {
              keywords: { where: { deletedAt: null } },
              projectCompetitors: { where: { deletedAt: null } },
              auditPages: true,
              auditIssues: { where: { deletedAt: null } },
              backlinks: { where: { deletedAt: null } },
              reports: { where: { deletedAt: null } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json(
        { success: false, message: adminCheck.error || "Unauthorized" },
        { status: adminCheck.status }
      );
    }

    const body = await req.json();
    const {
      name,
      domain,
      clientId,
      country = "United States",
      countryCode = "us",
      languageCode = "en",
      defaultSearchEngine = "google",
      defaultDevice = "desktop",
      userId,
      competitors = [],
      rankingFrequency = "Daily",
    } = body;

    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return NextResponse.json({ success: false, message: "Domain is required." }, { status: 400 });
    }

    const cleanDomain = normalizeDomain(domain);
    if (!cleanDomain) {
      return NextResponse.json({ success: false, message: "Invalid domain specified." }, { status: 400 });
    }

    // Duplicate domain check: Block if another active project already tracks this exact domain
    const existingProjectWithDomain = await prisma.project.findFirst({
      where: {
        domain: cleanDomain,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });

    if (existingProjectWithDomain) {
      return NextResponse.json(
        {
          success: false,
          message: `The domain "${cleanDomain}" is already being tracked in project "${existingProjectWithDomain.name}". Duplicate domains are prohibited.`,
        },
        { status: 409 }
      );
    }

    const projectName = name?.trim() || cleanDomain;
    const assignedOwnerId = userId || adminCheck.auth.user.id;

    // Create Project in DB
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        domain: cleanDomain,
        websiteUrl: `https://${cleanDomain}`,
        country,
        countryCode: countryCode.toLowerCase().slice(0, 2),
        languageCode,
        defaultSearchEngine,
        defaultDevice,
        rankingFrequency,
        status: "Active",
        clientId: clientId || null,
        userId: assignedOwnerId,
      },
    });

    // 1. Create primary domain entry
    await prisma.projectDomain.create({
      data: {
        projectId: newProject.id,
        domain: cleanDomain,
        isPrimary: true,
      },
    });

    // 2. Create SearchEngineConfig entry
    await prisma.searchEngineConfig.create({
      data: {
        projectId: newProject.id,
        engine: defaultSearchEngine,
        country,
        countryCode: countryCode.toLowerCase().slice(0, 2),
        device: defaultDevice,
        languageCode,
      },
    });

    // 3. Add ProjectMember (Unique constraint handles duplicate safety)
    await prisma.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: assignedOwnerId,
        role: "OWNER",
        canEdit: true,
      },
    });

    // 4. Seed competitors if provided
    if (Array.isArray(competitors) && competitors.length > 0) {
      for (const comp of competitors) {
        if (typeof comp === "string" && comp.trim()) {
          const compDomain = normalizeDomain(comp);
          if (compDomain && compDomain !== cleanDomain) {
            await prisma.projectCompetitor.create({
              data: {
                projectId: newProject.id,
                domain: compDomain,
                name: compDomain,
              },
            });
          }
        }
      }
    }

    // Audit log
    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "PROJECT_CREATE",
      entity: "Project",
      entityId: newProject.id,
      afterJson: {
        name: newProject.name,
        domain: newProject.domain,
        clientId,
        assignedOwnerId,
        competitorsCount: competitors.length,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      data: newProject,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
