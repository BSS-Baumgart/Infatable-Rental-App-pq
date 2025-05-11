import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware/withAuth";
import {
  generateInvoiceNumber,
  generateReceiptNumber,
} from "@/services/invoice-number-service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || undefined;

    const skip = (page - 1) * limit;

    // Budowanie warunków wyszukiwania
    const where: any = {};

    // Filtrowanie po statusie
    if (status && (status === "paid" || status === "unpaid")) {
      where.status = status;
    }

    // Wyszukiwanie
    if (search) {
      where.OR = [
        { id: { contains: search } },
        {
          reservation: {
            client: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { taxId: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    // Pobieranie faktur z paginacją
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issueDate: "desc" },
        include: {
          reservation: {
            include: {
              client: true,
            },
          },
          client: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/invoices error", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  return withAuth(async (req, _context, user) => {
    try {
      const data = await req.json();

      // Walidacja wymaganych pól
      const requiredFields = [
        "reservationId",
        "issueDate",
        "dueDate",
        "amount",
        "status",
      ];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json(
            { error: `Missing field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Sprawdź czy rezerwacja istnieje
      const reservation = await prisma.reservation.findUnique({
        where: { id: data.reservationId },
        include: { client: true },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      // Wygeneruj numer faktury lub paragonu
      const invoiceNumber = data.isCompanyInvoice
        ? await generateInvoiceNumber()
        : await generateReceiptNumber();

      // Przygotuj dane do zapisania
      const invoiceData: any = {
        reservationId: data.reservationId,
        clientId: data.clientId || reservation.clientId,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        amount: data.amount,
        status: data.status,
        pdfUrl: data.pdfUrl,
        invoiceNumber: invoiceNumber, // Dodaj numer faktury/paragonu
        isCompanyInvoice: !!data.isCompanyInvoice,
        companyName: data.companyName || null,
        taxId: data.taxId || null,
      };

      // Utwórz fakturę
      const invoice = await prisma.invoice.create({
        data: invoiceData,
        include: {
          reservation: {
            include: {
              client: true,
            },
          },
          client: true,
        },
      });

      return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
      console.error("POST /api/invoices error", error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  })(req, context);
}
