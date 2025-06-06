import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    include: {
      client: true,
      attractions: { include: { attraction: true } },
      assignedUsers: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const data = await req.json();

  const last = await prisma.reservation.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const nextNumber = `REZ-${new Date().getFullYear()}-${String(
    last ? parseInt(last.name.split("-")[2]) + 1 : 1
  ).padStart(4, "0")}`;

  const created = await prisma.reservation.create({
    data: {
      name: nextNumber,
      clientId: data.clientId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalPrice: data.totalPrice,
      notes: data.notes ?? "",
      status: data.status ?? "pending",
      assignedUsers: {
        connect: Array.isArray(data.assignedUsers)
          ? data.assignedUsers.map((id: string) => ({ id }))
          : [],
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

  return NextResponse.json(created);
}
