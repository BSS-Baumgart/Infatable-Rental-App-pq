import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const reservation = await prisma.reservation.findUnique({
    where: { id: id },
    include: {
      client: true,
      attractions: { include: { attraction: true } },
      assignedUsers: true,
      invoices: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(reservation);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();

  await prisma.reservationAttraction.deleteMany({
    where: { reservationId: id },
  });

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      clientId: data.clientId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalPrice: data.totalPrice,
      notes: data.notes ?? "",
      status: data.status,
      assignedUsers: {
        set: data.assignedUsers.map((u: string | { id: string }) =>
          typeof u === "string" ? { id: u } : { id: u.id }
        ),
      },
      attractions: {
        create: Array.isArray(data.attractions)
          ? data.attractions.map((a: any) => ({
              attractionId: a.attractionId,
              quantity: a.quantity,
            }))
          : [],
      },
    },
    include: {
      client: true,
      attractions: { include: { attraction: true } },
      assignedUsers: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: { connect: { id: payload.id } },
      },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
