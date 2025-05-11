/**
 * Serwis do generowania numerów faktur i paragonów
 */

import { prisma } from "@/lib/prisma";

/**
 * Generuje numer faktury w formacie FV/RRRR/MM/NNNN
 * gdzie RRRR to rok, MM to miesiąc, NNNN to kolejny numer faktury w danym miesiącu
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Miesiące są indeksowane od 0

  // Znajdź ostatnią fakturę z bieżącego miesiąca i roku
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `FV/${year}/${month.toString().padStart(2, "0")}/`,
      },
      isCompanyInvoice: true,
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let nextNumber = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    // Wyciągnij numer z ostatniej faktury
    const parts = lastInvoice.invoiceNumber.split("/");
    if (parts.length === 4) {
      nextNumber = Number.parseInt(parts[3], 10) + 1;
    }
  }

  // Format: FV/RRRR/MM/NNNN
  return `FV/${year}/${month.toString().padStart(2, "0")}/${nextNumber
    .toString()
    .padStart(4, "0")}`;
}

/**
 * Generuje numer paragonu w formacie PR/RRRR/MM/NNNN
 * gdzie RRRR to rok, MM to miesiąc, NNNN to kolejny numer paragonu w danym miesiącu
 */
export async function generateReceiptNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Miesiące są indeksowane od 0

  // Znajdź ostatni paragon z bieżącego miesiąca i roku
  const lastReceipt = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `PR/${year}/${month.toString().padStart(2, "0")}/`,
      },
      isCompanyInvoice: false,
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let nextNumber = 1;

  if (lastReceipt && lastReceipt.invoiceNumber) {
    // Wyciągnij numer z ostatniego paragonu
    const parts = lastReceipt.invoiceNumber.split("/");
    if (parts.length === 4) {
      nextNumber = Number.parseInt(parts[3], 10) + 1;
    }
  }

  // Format: PR/RRRR/MM/NNNN
  return `PR/${year}/${month.toString().padStart(2, "0")}/${nextNumber
    .toString()
    .padStart(4, "0")}`;
}
