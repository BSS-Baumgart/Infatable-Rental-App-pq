"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash,
  Send,
  Check,
  Building2,
  Receipt,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/app/types/types";
import InvoiceModal from "@/components/modals/invoice-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoice-service";
import { CustomPagination } from "@/components/ui/custom-pagination";

const statusColors: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unpaid:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function InvoicesPage() {
  const { t, formatT } = useTranslation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all"
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Paginacja
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(isMobile ? 5 : 10);
  const [hasMore, setHasMore] = useState(true);

  // Aktualizuj limit na podstawie rozmiaru ekranu
  useEffect(() => {
    setLimit(isMobile ? 5 : 10);
  }, [isMobile]);

  // Pobierz faktury
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();

      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error("Unexpected data format:", data);
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        title: t("common.error"),
        description: t("invoices.loadError"),
        variant: "destructive",
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.reservation?.client?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.reservation?.client?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.companyName &&
        invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.taxId &&
        invoice.taxId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginacja
  const totalPages = Math.ceil(filteredInvoices.length / limit);
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * limit,
    page * limit
  );

  // Załaduj więcej faktur (dla mobilnego widoku z nieskończonym scrollowaniem)
  const loadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    } else {
      setHasMore(false);
    }
  };

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

  const handleSaveInvoice = async (data: Partial<Invoice>) => {
    try {
      if (currentInvoice) {
        // Update existing invoice
        await updateInvoice(currentInvoice.id, data);
        toast({
          title: t("invoices.updated"),
          description: formatT("invoices.updateSuccess", {
            id: currentInvoice.id,
          }),
        });
      } else {
        // Create new invoice
        await createInvoice(data);
        toast({
          title: t("invoices.created"),
          description: t("invoices.createSuccess"),
        });
      }

      // Reload invoices
      await loadInvoices();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm(t("invoices.confirmDelete"))) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
        toast({
          title: t("invoices.deleted"),
          description: formatT("invoices.deleteSuccess", { id }),
        });
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast({
          title: t("common.error"),
          description: t("common.tryAgain"),
          variant: "destructive",
        });
      }
    }
  };

  const handleSendInvoice = (id: string) => {
    toast({
      title: t("invoices.sent"),
      description: t("invoices.sentSuccess"),
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateInvoice(id, { status: "paid", paidAt: new Date() });
      await loadInvoices();
      toast({
        title: t("invoices.updated"),
        description: t("invoices.paidSuccess"),
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const handleInvoiceClick = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {t("common.loading")}
        </div>
      </AppLayout>
    );
  }

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
            {isMobile ? (
              // Mobilny widok z kartami
              <div className="space-y-4">
                {paginatedInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-500">
                            {invoice.reservation?.client
                              ? `${invoice.reservation.client.firstName} ${invoice.reservation.client.lastName}`
                              : "-"}
                          </p>
                        </div>
                        <Badge className={statusColors[invoice.status]}>
                          {t(`invoices.status.${invoice.status}`)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">
                            {t("invoices.issueDate")}
                          </p>
                          <p>
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            {t("invoices.dueDate")}
                          </p>
                          <p>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            {t("invoices.amount")}
                          </p>
                          <p className="font-medium">${invoice.amount}</p>
                        </div>
                        <div>
                          {invoice.isCompanyInvoice ? (
                            <div className="flex items-center text-gray-500">
                              <Building2 className="h-3 w-3 mr-1" />
                              <span>{t("invoices.companyInvoice")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Receipt className="h-3 w-3 mr-1" />
                              <span>{t("invoices.receipt")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {invoice.isCompanyInvoice && (
                        <div className="text-sm mb-3 border-t pt-2 border-gray-100 dark:border-gray-800">
                          <p className="text-gray-500">
                            {t("invoices.companyName")}
                          </p>
                          <p>{invoice.companyName}</p>
                          <p className="text-gray-500 mt-1">
                            {t("invoices.taxId")}
                          </p>
                          <p>{invoice.taxId}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-1 border-t pt-2 border-gray-100 dark:border-gray-800">
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
                    </CardContent>
                  </Card>
                ))}

                {paginatedInvoices.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    {t("invoices.noInvoices")}
                  </div>
                )}

                {hasMore && page < totalPages && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={loadMore}>
                      {t("common.loadMore")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Desktopowy widok z tabelą
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
                        {t("invoices.type")}
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
                    {paginatedInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => handleInvoiceClick(invoice.id)}
                      >
                        <td className="p-2">{invoice.id}</td>
                        <td className="p-2">
                          <div>
                            {invoice.reservation?.client
                              ? `${invoice.reservation.client.firstName} ${invoice.reservation.client.lastName}`
                              : "-"}
                          </div>
                          {invoice.isCompanyInvoice && invoice.companyName && (
                            <div className="text-xs text-gray-500">
                              {invoice.companyName}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          {invoice.isCompanyInvoice ? (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              <span>{t("invoices.companyInvoice")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Receipt className="h-4 w-4 mr-1" />
                              <span>{t("invoices.receipt")}</span>
                            </div>
                          )}
                        </td>
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
                {paginatedInvoices.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    {t("invoices.noInvoices")}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <CustomPagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            )}
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
