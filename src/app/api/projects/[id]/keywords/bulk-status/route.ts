import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyProjectAccess } from "@/lib/server/projectAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await verifyProjectAccess(req, id);
    if (!access.success) return access.error;
    const projectId = access.data.project.id;

    const body = await req.json();
    const { keywordIds, isActive } = body;

    if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "keywordIds must be a non-empty array." },
        { status: 400 }
      );
    }

    const result = await prisma.keyword.updateMany({
      where: { id: { in: keywordIds.map(String) }, projectId, deletedAt: null },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        updatedCount: result.count,
        isActive: Boolean(isActive),
        projectId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update keyword status.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
