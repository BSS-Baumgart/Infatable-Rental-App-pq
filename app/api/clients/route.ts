import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients error", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "street",
      "buildingNumber",
      "postalCode",
      "city",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        street: data.street,
        buildingNumber: data.buildingNumber,
        postalCode: data.postalCode,
        city: data.city,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("POST /api/clients error", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
