import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(reservations);
}
