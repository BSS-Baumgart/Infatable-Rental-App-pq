"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Trash,
  Send,
  Check,
  Printer,
  Download,
  Building2,
  Receipt,
  Calendar,
  Clock,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { Invoice } from "@/app/types/types";
import InvoiceModal from "@/components/modals/invoice-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";
import {
  getInvoice,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoice-service";

export default function InvoiceDetailsPage() {
  const { t, formatT } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invoiceId = params?.id as string;

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoice(invoiceId);
      setInvoice(data);
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast({
        title: t("common.error"),
        description: t("invoices.loadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveInvoice = async (data: Partial<Invoice>) => {
    try {
      await updateInvoice(invoiceId, data);
      toast({
        title: t("invoices.updated"),
        description: formatT("invoices.updateSuccess", { id: invoiceId }),
      });
      await loadInvoice();
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

  const handleDeleteInvoice = async () => {
    if (confirm(t("invoices.confirmDelete"))) {
      try {
        await deleteInvoice(invoiceId);
        toast({
          title: t("invoices.deleted"),
          description: formatT("invoices.deleteSuccess", { id: invoiceId }),
        });
        router.push("/invoices");
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

  const handleSendInvoice = () => {
    toast({
      title: t("invoices.sent"),
      description: t("invoices.sentSuccess"),
    });
  };

  const handleMarkAsPaid = async () => {
    try {
      await updateInvoice(invoiceId, { status: "paid", paidAt: new Date() });
      toast({
        title: t("invoices.updated"),
        description: t("invoices.paidSuccess"),
      });
      await loadInvoice();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Tutaj będzie logika pobierania PDF, gdy zostanie zaimplementowana
    toast({
      title: t("invoices.download"),
      description: t("invoices.downloadStarted"),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">{t("invoices.notFound")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t("invoices.notFoundDesc")}
          </p>
          <Button onClick={() => router.push("/invoices")}>
            {t("invoices.backToList")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 print:m-0 print:p-0 print:shadow-none print:bg-white">
        {/* Nagłówek strony z przyciskami akcji */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <h1 className="text-2xl font-bold">{t("invoices.details")}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t("invoices.print")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              {t("invoices.downloadPdf")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenModal}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
            {invoice.status === "unpaid" && (
              <Button variant="outline" size="sm" onClick={handleMarkAsPaid}>
                <Check className="h-4 w-4 mr-2" />
                {t("invoices.markAsPaid")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSendInvoice}>
              <Send className="h-4 w-4 mr-2" />
              {t("invoices.send")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteInvoice}>
              <Trash className="h-4 w-4 mr-2" />
              {t("common.delete")}
            </Button>
          </div>
        </div>

        {/* Główna karta faktury */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:pb-0">
            <div>
              <CardTitle className="text-2xl print:text-3xl">
                {invoice.isCompanyInvoice
                  ? t("invoices.invoice")
                  : t("invoices.receipt")}{" "}
                #{invoice.id}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {invoice.isCompanyInvoice ? (
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {t("invoices.companyInvoice")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Receipt className="h-4 w-4 mr-1" />
                    {t("invoices.receipt")}
                  </span>
                )}
              </p>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {t(`invoices.status.${invoice.status}`)}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-8 print:pt-4">
            {/* Informacje o fakturze i kliencie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informacje o fakturze */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {t("invoices.invoiceInfo")}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("invoices.issueDate")}
                      </p>
                      <p>{formatDate(invoice.issueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("invoices.dueDate")}
                      </p>
                      <p>{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>

                  {invoice.paidAt && (
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("invoices.paidAt")}
                        </p>
                        <p>{formatDate(invoice.paidAt)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <DollarSign className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("invoices.amount")}
                      </p>
                      <p className="font-semibold">${invoice.amount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informacje o kliencie */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {t("invoices.clientInfo")}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("clients.name")}
                      </p>
                      <p>
                        {invoice.reservation?.client
                          ? `${invoice.reservation.client.firstName} ${invoice.reservation.client.lastName}`
                          : invoice.client
                          ? `${invoice.client.firstName} ${invoice.client.lastName}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {invoice.isCompanyInvoice && invoice.companyName && (
                    <div className="flex items-start">
                      <Building2 className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("invoices.companyName")}
                        </p>
                        <p>{invoice.companyName}</p>
                      </div>
                    </div>
                  )}

                  {invoice.isCompanyInvoice && invoice.taxId && (
                    <div className="flex items-start">
                      <Receipt className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("invoices.taxId")}
                        </p>
                        <p>{invoice.taxId}</p>
                      </div>
                    </div>
                  )}

                  {(invoice.reservation?.client?.phone ||
                    invoice.client?.phone) && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("clients.phone")}
                        </p>
                        <p>
                          {invoice.reservation?.client?.phone ||
                            invoice.client?.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {(invoice.reservation?.client?.email ||
                    invoice.client?.email) && (
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("clients.email")}
                        </p>
                        <p>
                          {invoice.reservation?.client?.email ||
                            invoice.client?.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {((invoice.reservation?.client?.street &&
                    invoice.reservation?.client?.city) ||
                    (invoice.client?.street && invoice.client?.city)) && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("clients.address")}
                        </p>
                        <p>
                          {invoice.reservation?.client
                            ? `${invoice.reservation.client.street} ${invoice.reservation.client.buildingNumber}, ${invoice.reservation.client.postalCode} ${invoice.reservation.client.city}`
                            : invoice.client
                            ? `${invoice.client.street} ${invoice.client.buildingNumber}, ${invoice.client.postalCode} ${invoice.client.city}`
                            : "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Informacje o rezerwacji */}
            {invoice.reservation && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {t("invoices.reservationDetails")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        {t("reservations.id")}
                      </h4>
                      <p>{invoice.reservation.id}</p>
                    </CardContent>
                  </Card>

                  {invoice.reservation.startDate &&
                    invoice.reservation.endDate && (
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">
                            {t("reservations.dates")}
                          </h4>
                          <p>
                            {formatDate(invoice.reservation.startDate)} -{" "}
                            {formatDate(invoice.reservation.endDate)}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                  {invoice.reservation.status && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">
                          {t("reservations.status")}
                        </h4>
                        <Badge>
                          {t(
                            `reservations.status.${invoice.reservation.status}`
                          )}
                        </Badge>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Uwagi */}
            {invoice.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {t("invoices.notes")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {invoice.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:pt-8">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("invoices.createdAt")}:{" "}
              {formatDate(invoice.createdAt || new Date())}
              {invoice.updatedAt && invoice.updatedAt !== invoice.createdAt && (
                <span>
                  {" "}
                  • {t("invoices.updatedAt")}: {formatDate(invoice.updatedAt)}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("invoices.totalAmount")}
              </p>
              <p className="text-2xl font-bold">${invoice.amount}</p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Modal edycji faktury */}
      {invoice && (
        <InvoiceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          invoice={invoice}
          onSave={handleSaveInvoice}
        />
      )}
    </AppLayout>
  );
}
