import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const attractionId = req.nextUrl.searchParams.get("attractionId");

  if (!attractionId) {
    return NextResponse.json(
      { error: "Missing attractionId" },
      { status: 400 }
    );
  }

  const records = await prisma.maintenanceRecord.findMany({
    where: { attractionId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const created = await prisma.maintenanceRecord.create({
    data: {
      ...data,
      imagesJson: data.images ? JSON.stringify(data.images) : undefined,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
