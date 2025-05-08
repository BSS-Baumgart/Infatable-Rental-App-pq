"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Search, Trash, FileText } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/app/types/types";
import ReservationWizard from "@/components/modals/reservation-wizard";
import InvoiceModal from "@/components/modals/invoice-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";
import {
  createReservation,
  deleteReservation,
  getReservations,
  updateReservation,
} from "@/services/reservation-service";
import { getCurrentUser } from "@/lib/auth";
import type { SafeUser } from "@/app/types/types";

const statusColors: Record<ReservationStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function ReservationsPage() {
  const { t, formatT } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all"
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] =
    useState<Reservation | null>(null);
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    getReservations()
      .then((data) => setReservations(data))
      .catch(() => {
        toast({ title: t("common.error"), description: t("common.tryAgain") });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.client?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.client?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    const isAssignedOrAdmin =
      currentUser?.role === "admin" ||
      (reservation.assignedUsers &&
        currentUser &&
        reservation.assignedUsers.includes(currentUser.id));

    return matchesSearch && matchesStatus && isAssignedOrAdmin;
  });

  const handleOpenReservationModal = (reservation?: Reservation) => {
    setCurrentReservation(reservation || null);
    setIsReservationModalOpen(true);
  };

  const handleCloseReservationModal = async () => {
    setIsReservationModalOpen(false);
    setCurrentReservation(null);
    const fresh = await getReservations();
    setReservations(fresh);
  };

  const handleOpenInvoiceModal = (reservation: Reservation) => {
    setCurrentReservation(reservation);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
  };

  const handleViewReservation = (id: string) => {
    router.push(`/reservations/${id}`);
  };

  const handleSaveReservation = async (data: Partial<Reservation>) => {
    try {
      const saved = data.id
        ? await updateReservation(data.id, data)
        : await createReservation(data);

      const fresh = await getReservations();
      setReservations(fresh);

      toast({
        title: data.id ? t("reservations.updated") : t("reservations.created"),
        description: data.id
          ? t("reservations.updateSuccess")
          : t("reservations.createSuccess"),
      });
    } catch {
      toast({ title: t("common.error"), description: t("common.tryAgain") });
    } finally {
      handleCloseReservationModal();
    }
  };

  const handleSaveInvoice = (data: any) => {
    toast({
      title: t("invoices.created"),
      description: formatT("invoices.createSuccess", {
        id: currentReservation?.id,
      }),
    });
    handleCloseInvoiceModal();
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm(t("reservations.confirmDelete"))) return;

    try {
      await deleteReservation(id);
      const fresh = await getReservations();
      setReservations(fresh);

      toast({
        title: t("reservations.deleted"),
        description: formatT("reservations.deleteSuccess", { id }),
      });
    } catch {
      toast({ title: t("common.error"), description: t("common.tryAgain") });
    }
  };

  const handleReservationClick = (id: string) => {
    router.push(`/reservations/${id}`);
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
          <h1 className="text-2xl font-bold">{t("reservations.title")}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t("reservations.search")}
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenReservationModal()}>
              <Plus className="h-4 w-4 mr-2" />
              {t("reservations.new")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            {t("reservations.allStatuses")}
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            {t("reservations.status.pending")}
          </Button>
          <Button
            variant={statusFilter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in_progress")}
          >
            {t("reservations.status.in-progress")}
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            {t("reservations.status.completed")}
          </Button>
          <Button
            variant={statusFilter === "cancelled" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("cancelled")}
          >
            {t("reservations.status.cancelled")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("reservations.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left font-medium p-2">
                      {t("reservations.name")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("reservations.client")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("reservations.date")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("reservations.attraction")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("reservations.price")}
                    </th>
                    <th className="text-left font-medium p-2">
                      {t("reservations.status")}
                    </th>
                    <th className="text-right font-medium p-2">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleReservationClick(reservation.id)}
                    >
                      <td className="p-2">{reservation.id}</td>
                      <td className="p-2">
                        {reservation.client
                          ? `${reservation.client.firstName} ${reservation.client.lastName}`
                          : t("reservations.unknownClient")}
                      </td>
                      <td className="p-2">
                        {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                        {new Date(reservation.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">{reservation.attractions.length}</td>
                      <td className="p-2">${reservation.totalPrice}</td>
                      <td className="p-2">
                        <Badge className={statusColors[reservation.status]}>
                          {t(`reservations.status.${reservation.status}`)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewReservation(reservation.id)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReservationModal(reservation);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenInvoiceModal(reservation)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReservation(reservation.id);
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
            </div>
          </CardContent>
        </Card>
      </div>

      <ReservationWizard
        isOpen={isReservationModalOpen}
        onClose={handleCloseReservationModal}
        reservation={currentReservation}
        onSave={handleSaveReservation}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
        reservationId={currentReservation?.id}
        onSave={handleSaveInvoice}
      />
    </AppLayout>
  );
}
