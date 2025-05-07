import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware/withAuth";
import { logAudit } from "@/lib/log-audit";

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;

  return withAuth(async (req, _context, user) => {
    const data = await req.json();

    if (user.role !== "admin" && user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.client.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  })(req, context);
};

export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;

  return withAuth(async (_req, _context, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const client = await prisma.client.findUnique({ where: { id: params.id } });

    await prisma.client.delete({
      where: { id: params.id },
    });

    await logAudit({
      user,
      action: "DELETE_CLIENT",
      target: "client",
      details: `Usunięto klienta: ${client?.firstName} ${client?.lastName}`,
      ip: req.headers.get("x-forwarded-for") ?? null,
    });

    return NextResponse.json({ success: true });
  })(req, context);
};
