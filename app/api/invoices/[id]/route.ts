import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware/withAuth";
import { logAudit } from "@/lib/log-audit";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            client: true,
          },
        },
        client: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(`GET /api/invoices/${context.params.id} error`, error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return withAuth(async (req, _context, user) => {
    try {
      const { id } = context.params;
      const data = await req.json();

      // Sprawdź czy faktura istnieje
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: { reservation: true },
      });

      if (!existingInvoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      // Sprawdź uprawnienia - tylko admin i manager mogą aktualizować faktury
      if (user.role !== "admin" && user.role !== "manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Przygotuj dane do aktualizacji
      const updateData: any = {};

      // Aktualizuj tylko dostarczone pola
      if (data.reservationId !== undefined)
        updateData.reservationId = data.reservationId;
      if (data.clientId !== undefined) updateData.clientId = data.clientId;
      if (data.issueDate !== undefined)
        updateData.issueDate = new Date(data.issueDate);
      if (data.dueDate !== undefined)
        updateData.dueDate = new Date(data.dueDate);
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
      if (data.isCompanyInvoice !== undefined)
        updateData.isCompanyInvoice = data.isCompanyInvoice;
      if (data.companyName !== undefined)
        updateData.companyName = data.companyName;
      if (data.taxId !== undefined) updateData.taxId = data.taxId;

      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          reservation: {
            include: {
              client: true,
            },
          },
          client: true,
        },
      });

      // Zapisz log audytu
      await logAudit({
        user,
        action: "UPDATE_INVOICE",
        target: "invoice",
        details: `Zaktualizowano fakturę: ${id}`,
        ip: req.headers.get("x-forwarded-for") ?? null,
      });

      return NextResponse.json(updatedInvoice);
    } catch (error) {
      console.error(`PUT /api/invoices/${context.params.id} error`, error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  })(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return withAuth(async (req, _context, user) => {
    try {
      const { id } = context.params;

      // Sprawdź czy faktura istnieje
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: { reservation: true },
      });

      if (!existingInvoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      // Sprawdź uprawnienia - tylko admin może usuwać faktury
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Usuń fakturę
      await prisma.invoice.delete({
        where: { id },
      });

      // Zapisz log audytu
      await logAudit({
        user,
        action: "DELETE_INVOICE",
        target: "invoice",
        details: `Usunięto fakturę: ${id}`,
        ip: req.headers.get("x-forwarded-for") ?? null,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`DELETE /api/invoices/${context.params.id} error`, error);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  })(req, context);
}
