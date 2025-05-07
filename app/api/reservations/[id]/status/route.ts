import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status } = await req.json();

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
