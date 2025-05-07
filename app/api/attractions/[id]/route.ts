// app/api/attractions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware/withAuth";
import { logAudit } from "@/lib/log-audit";

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;

  return withAuth(async (req, _ctx, user) => {
    if (user.role !== "admin" && user.role !== "manager") {
      await logAudit({
        user,
        action: "unauthorized_update",
        target: "attraction",
        details: `User tried to update attraction ${id}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const data = await req.json();

      const updated = await prisma.attraction.update({
        where: { id },
        data,
      });

      await logAudit({
        user,
        action: "update",
        target: "attraction",
        details: `Updated attraction ${updated.id} (${updated.name})`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json(updated);
    } catch (error) {
      await logAudit({
        user,
        action: "error",
        target: "attraction",
        details: `Failed to update attraction ${id}: ${String(error)}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  })(req, context);
};

export const DELETE = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  return withAuth(async (_req, context, user) => {
    const attractionId = context.params.id;

    if (user.role !== "admin") {
      await logAudit({
        user,
        action: "unauthorized_delete",
        target: "attraction",
        details: `User tried to delete attraction ${attractionId}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      await prisma.attraction.delete({ where: { id: attractionId } });

      await logAudit({
        user,
        action: "delete",
        target: "attraction",
        details: `Deleted attraction ${attractionId}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      await logAudit({
        user,
        action: "error",
        target: "attraction",
        details: `Failed to delete attraction ${attractionId}: ${String(
          error
        )}`,
        ip: req.headers.get("x-forwarded-for"),
      });

      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
  })(req, context);
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const attraction = await prisma.attraction.findUnique({
      where: { id },
    });

    if (!attraction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(attraction);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
