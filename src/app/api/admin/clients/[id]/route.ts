import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { z } from "zod";

const UpdateClientSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "archived", "deactivated"]).optional(),
  projectIds: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              keywords: true,
              members: true,
              auditIssues: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      status: client.status,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      projects: client.projects.map((p) => ({
        id: p.id,
        name: p.name,
        domain: p.domain,
        status: p.status,
        keywordsCount: p._count.keywords,
        membersCount: p._count.members,
        issuesCount: p._count.auditIssues,
        createdAt: p.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const { projectIds, ...clientData } = parsed.data;

    const updated = await prisma.client.update({
      where: { id },
      data: clientData,
    });

    if (projectIds !== undefined) {
      // Disconnect projects no longer in projectIds
      await prisma.project.updateMany({
        where: {
          clientId: id,
          id: { notIn: projectIds },
        },
        data: { clientId: null },
      });

      // Connect projects in projectIds
      if (projectIds.length > 0) {
        await prisma.project.updateMany({
          where: { id: { in: projectIds } },
          data: { clientId: id },
        });
      }
    }

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "CLIENT_UPDATE",
      entity: "Client",
      entityId: id,
      beforeJson: { name: existing.name, status: existing.status },
      afterJson: parsed.data,
      req,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update client." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const isPermanent = searchParams.get("permanent") === "true";

  try {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    if (isPermanent) {
      // Unlink all projects before hard deletion
      await prisma.project.updateMany({
        where: { clientId: id },
        data: { clientId: null },
      });

      await prisma.client.delete({ where: { id } });

      await createAuditLog({
        actorId: adminCheck.auth.user.id,
        actorEmail: adminCheck.auth.user.email,
        action: "CLIENT_DELETE",
        entity: "Client",
        entityId: id,
        beforeJson: { name: existing.name, email: existing.email },
        req,
      });

      return NextResponse.json({
        success: true,
        message: `Client ${existing.name} permanently deleted.`,
      });
    }

    const client = await prisma.client.update({
      where: { id },
      data: { status: "archived" },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "CLIENT_ARCHIVE",
      entity: "Client",
      entityId: id,
      afterJson: { status: "archived" },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Client ${client.name} archived.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process client deletion." },
      { status: 500 }
    );
  }
}
