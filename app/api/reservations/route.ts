import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    include: {
      client: true,
      attractions: {
        include: {
          attraction: true,
        },
      },
      assignedUsers: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (
    !data.clientId ||
    !data.startDate ||
    !data.endDate ||
    !Array.isArray(data.attractions)
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      clientId: data.clientId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalPrice: data.totalPrice ?? 0,
      notes: data.notes ?? "",
      status: data.status || "pending",
      assignedUsers:
        Array.isArray(data.assignedUsers) && data.assignedUsers.length
          ? {
              connect: data.assignedUsers.map((id: string) => ({ id })),
            }
          : undefined,
      attractions: {
        create: data.attractions.map((item: any) => ({
          attractionId: item.attractionId,
          quantity: item.quantity ?? 1,
        })),
      },
    },
    include: {
      client: true,
      attractions: {
        include: {
          attraction: true,
        },
      },
      assignedUsers: true,
    },
  });

  return NextResponse.json(reservation);
}
