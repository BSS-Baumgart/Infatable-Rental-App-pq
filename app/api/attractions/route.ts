import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware/withAuth";
import { logAudit } from "@/lib/log-audit";
import type { AuthPayload } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const attractions = await prisma.attraction.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(attractions);
  } catch (error) {
    await logAudit({
      action: "error",
      target: "attraction",
      details: `Failed to fetch attractions: ${String(error)}`,
      ip: req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export const POST = withAuth(
  async (req: NextRequest, _ctx, user: AuthPayload) => {
    if (user.role !== "admin" && user.role !== "manager") {
      await logAudit({
        user,
        action: "unauthorized",
        target: "attraction",
        details: "Unauthorized attempt to create attraction",
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const data = await req.json();
      const attraction = await prisma.attraction.create({ data });
      await logAudit({
        user,
        action: "create",
        target: "attraction",
        details: `Created attraction ${attraction.id} (${attraction.name})`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json(attraction);
    } catch (error) {
      await logAudit({
        user,
        action: "error",
        target: "attraction",
        details: `Failed to create attraction: ${String(error)}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
  }
);
