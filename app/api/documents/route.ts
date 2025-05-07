import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentRelationType } from "@/lib/generated/prisma";
export async function GET(req: NextRequest) {
  const relatedId = req.nextUrl.searchParams.get("relatedId");
  const relatedType = req.nextUrl.searchParams.get("relatedType");

  if (!relatedId || !relatedType) {
    return NextResponse.json(
      { error: "Missing query parameters" },
      { status: 400 }
    );
  }

  if (!["attraction", "reservation"].includes(relatedType)) {
    return NextResponse.json({ error: "Invalid relatedType" }, { status: 400 });
  }

  const documents = await prisma.document.findMany({
    where: {
      relatedId,
      relatedType: relatedType as DocumentRelationType,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(documents);
}
