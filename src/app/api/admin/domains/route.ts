import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { normalizeDomain } from "@/lib/projectUtils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateDomainSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  domain: z.string().min(3, "Domain is required"),
  isPrimary: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";

  // Query primary project domains + secondary project_domains from PostgreSQL
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { domain: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
      user: { select: { id: true, name: true, email: true } },
      domains: true,
      _count: {
        select: {
          keywords: true,
          auditPages: true,
          backlinks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const domainList: any[] = [];

  for (const p of projects) {
    // 1. Primary domain
    domainList.push({
      id: `primary-${p.id}`,
      projectId: p.id,
      projectName: p.name,
      domain: p.domain,
      protocol: p.protocol || "https://",
      isPrimary: true,
      status: p.status,
      country: p.country,
      countryCode: p.countryCode,
      ownerEmail: p.user?.email || "—",
      clientName: p.client?.name || p.client?.company || "Internal",
      keywordsCount: p._count.keywords,
      auditPagesCount: p._count.auditPages,
      backlinksCount: p._count.backlinks,
      createdAt: p.createdAt.toISOString(),
    });

    // 2. Secondary project domains
    for (const d of p.domains) {
      domainList.push({
        id: d.id,
        projectId: p.id,
        projectName: p.name,
        domain: d.domain,
        protocol: p.protocol || "https://",
        isPrimary: d.isPrimary,
        status: d.verified ? "Active" : "Pending Verification",
        country: p.country,
        countryCode: p.countryCode,
        ownerEmail: p.user?.email || "—",
        clientName: p.client?.name || p.client?.company || "Internal",
        keywordsCount: 0,
        auditPagesCount: 0,
        backlinksCount: 0,
        createdAt: d.createdAt.toISOString(),
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: domainList,
    totalCount: domainList.length,
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await req.json();
    const parsed = CreateDomainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { projectId, domain, isPrimary } = parsed.data;
    const cleanDomain = normalizeDomain(domain);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const newDomain = await prisma.projectDomain.create({
      data: {
        projectId,
        domain: cleanDomain,
        isPrimary,
        verified: true,
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "DOMAIN_ADD",
      entity: "ProjectDomain",
      entityId: newDomain.id,
      afterJson: { projectId, domain: cleanDomain, isPrimary },
      req,
    });

    return NextResponse.json({
      success: true,
      data: newDomain,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to add domain" },
      { status: 500 }
    );
  }
}
