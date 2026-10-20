import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { z } from "zod";

const ClientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const status = searchParams.get("status")?.trim() || "";

  const whereClause: any = {};
  if (status) {
    whereClause.status = status;
  }
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.client.findMany({
    where: whereClause,
    include: {
      _count: {
        select: {
          projects: {
            where: { isArchived: false, deletedAt: null },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company || "—",
    email: c.email || "—",
    phone: c.phone || "—",
    status: c.status,
    notes: c.notes || "",
    projectsCount: c._count.projects,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    success: true,
    data: items,
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await req.json();
    const parsed = ClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, company, email, phone, notes } = parsed.data;

    const client = await prisma.client.create({
      data: {
        name,
        company: company || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        status: "active",
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "CLIENT_CREATE",
      entity: "Client",
      entityId: client.id,
      afterJson: { name, company, email },
      req,
    });

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create client." },
      { status: 500 }
    );
  }
}
