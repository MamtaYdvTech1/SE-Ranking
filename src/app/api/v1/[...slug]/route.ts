import { NextRequest, NextResponse } from "next/server";
import { handleApiV1 } from "@/lib/server/apiV1Handler";

const API_SERVER_URL = process.env.API_SERVER_URL;

async function tryProxy(request: NextRequest, slug: string[]) {
  // Only attempt proxy if API_SERVER_URL is explicitly set and not localhost:5000 in unified dev
  if (!API_SERVER_URL || API_SERVER_URL.includes("localhost:5000")) {
    return null;
  }

  const path = slug.join("/");
  const url = `${API_SERVER_URL}/api/v1/${path}${request.nextUrl.search}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const body = ["POST", "PUT", "PATCH"].includes(request.method) ? await request.text() : undefined;
    const res = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
        "X-Correlation-ID": request.headers.get("X-Correlation-ID") || crypto.randomUUID(),
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    // If proxy failed, fall back to native Next.js Prisma API handler
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const proxyRes = await tryProxy(request, slug);
  if (proxyRes) return proxyRes;
  return handleApiV1(request, slug);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const proxyRes = await tryProxy(request, slug);
  if (proxyRes) return proxyRes;
  return handleApiV1(request, slug);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const proxyRes = await tryProxy(request, slug);
  if (proxyRes) return proxyRes;
  return handleApiV1(request, slug);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const proxyRes = await tryProxy(request, slug);
  if (proxyRes) return proxyRes;
  return handleApiV1(request, slug);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const proxyRes = await tryProxy(request, slug);
  if (proxyRes) return proxyRes;
  return handleApiV1(request, slug);
}
