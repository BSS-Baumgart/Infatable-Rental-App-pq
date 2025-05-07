import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      attractions: {
        include: {
          attraction: true,
        },
      },
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
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  // Usuwamy stare atrakcje
  await prisma.reservationAttraction.deleteMany({
    where: { reservationId: params.id },
  });

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: {
      clientId: data.clientId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalPrice: data.totalPrice,
      notes: data.notes,
      status: data.status,
      assignedUsers: {
        set: data.assignedUsers?.map((id: string) => ({ id })) || [],
      },
      attractions: {
        create: data.attractions.map((item: any) => ({
          attractionId: item.attractionId,
          quantity: item.quantity,
        })),
      },
    },
  });

  return NextResponse.json(updated);
}
