"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoices as initialInvoices } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Search, Trash, Send, Check } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/app/types/types";
import InvoiceModal from "@/components/modals/invoice-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";

const statusColors: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unpaid:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all"
  );
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.reservation?.client?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.reservation?.client?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (invoice?: Invoice) => {
    setCurrentInvoice(invoice || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentInvoice(null);
  };

  const handleViewInvoice = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  const handleSaveInvoice = (data: Partial<Invoice>) => {
    if (currentInvoice) {
      // Update existing invoice
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === currentInvoice.id ? ({ ...inv, ...data } as Invoice) : inv
        )
      );
      toast({
        title: t("invoices.updated"),
        description: t("invoices.updateSuccess", { id: currentInvoice.id }),
      });
    } else {
      // Create new invoice
      const newInvoice = {
        ...data,
        id: `INV-${Math.floor(Math.random() * 10000)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Invoice;

      setInvoices((prev) => [...prev, newInvoice]);
      toast({
        title: t("invoices.created"),
        description: t("invoices.createSuccess"),
      });
    }
    handleCloseModal();
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm(t("invoices.confirmDelete"))) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast({
        title: t("invoices.deleted"),
        description: t("invoices.deleteSuccess", { id }),
      });
    }
  };

  const handleSendInvoice = (id: string) => {
    toast({
      title: t("invoices.sent"),
      description: t("invoices.sentSuccess"),
    });
  };

  const handleMarkAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? ({ ...inv, status: "paid", paidAt: new Date() } as Invoice)
          : inv
      )
    );
    toast({
      title: t("invoices.updated"),
      description: t("invoices.paidSuccess"),
    });
  };

  const handleInvoiceClick = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">{t("invoices.title")}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t("invoices.search")}
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              {t("invoices.new")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            {t("invoices.allStatuses")}
          </Button>
          <Button
            variant={statusFilter === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("paid")}
          >
            {t("invoices.status.paid")}
          </Button>
          <Button
            variant={statusFilter === "unpaid" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("unpaid")}
          >
            {t("invoices.status.unpaid")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("invoices.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left font-medium p-2">
                      {t("common.id")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.client")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.reservation")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.issueDate")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.dueDate")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.amount")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("invoices.status")}
                    </th>
                    <th className="text-right font-medium p-2">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleInvoiceClick(invoice.id)}
                    >
                      <td className="p-2">{invoice.id}</td>
                      <td className="p-2">
                        {invoice.reservation?.client
                          ? `${invoice.reservation.client.firstName} ${invoice.reservation.client.lastName}`
                          : "-"}
                      </td>
                      <td className="p-2">{invoice.reservationId}</td>
                      <td className="p-2">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">${invoice.amount}</td>
                      <td className="p-2">
                        <Badge className={statusColors[invoice.status]}>
                          {t(`invoices.status.${invoice.status}`)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoice(invoice.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(invoice);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === "unpaid" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsPaid(invoice.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendInvoice(invoice.id);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInvoice(invoice.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {t("invoices.noInvoices")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        invoice={currentInvoice}
        onSave={handleSaveInvoice}
      />
    </AppLayout>
  );
}
