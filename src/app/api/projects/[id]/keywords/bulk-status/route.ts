import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { keywordIds, isActive } = body;

    if (!Array.isArray(keywordIds) || keywordIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "keywordIds must be a non-empty array." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        updatedCount: keywordIds.length,
        isActive: Boolean(isActive),
        projectId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update keyword status.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
