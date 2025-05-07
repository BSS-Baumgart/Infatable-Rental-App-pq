import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { startDate, endDate, attractionId } = await req.json();

  const overlapping = await prisma.reservation.findMany({
    where: {
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
      attractions: {
        some: { attractionId },
      },
    },
    select: { id: true },
  });

  const available = overlapping.length === 0;
  return NextResponse.json({ available });
}
