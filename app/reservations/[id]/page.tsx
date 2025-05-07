"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Package,
  Phone,
  User,
  Mail,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Reservation } from "@/app/types/types";
import ReservationWizard from "@/components/modals/reservation-wizard";
import InvoiceModal from "@/components/modals/invoice-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";

export default function ReservationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t, formatT } = useTranslation();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`/api/reservations/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setReservation(data);
        setSelectedReservation(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleOpenReservationModal = () => {
    setIsReservationModalOpen(true);
  };

  const handleCloseReservationModal = () => {
    setIsReservationModalOpen(false);
  };

  const handleOpenInvoiceModal = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
  };

  const handleSaveReservation = (data: Partial<Reservation>) => {
    // Update the reservation
    setReservation((prev) =>
      prev ? ({ ...prev, ...data } as Reservation) : null
    );
    toast({
      title: t("reservations.updated"),
      description: formatT("reservations.updateSuccess", { id: params.id }),
    });
    handleCloseReservationModal();
  };

  const handleSaveInvoice = () => {
    toast({
      title: t("invoices.created"),
      description: formatT("invoices.createSuccess", { id: params.id }),
    });
    handleCloseInvoiceModal();
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

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-10 text-red-500">
          {t("common.error")} – {t("common.tryAgain")}
        </div>
      </AppLayout>
    );
  }
  if (!reservation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">
            {formatT("common.notFound", { item: t("common.reservation") })}
          </h1>
          <Button onClick={() => router.push("/reservations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {formatT("common.backTo", { page: t("reservations.title") })}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/reservations")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <h1 className="text-2xl font-bold">
              {t("reservations.reservation")} #{reservation.id}
            </h1>
            <Badge
              className={
                reservation.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : reservation.status === "in-progress"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : reservation.status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }
            >
              {t(`reservations.status.${reservation.status}`)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenInvoiceModal}>
              <FileText className="mr-2 h-4 w-4" />
              {t("reservations.createInvoice")}
            </Button>
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("reservations.edit")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("reservations.clientInformation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{t("common.name")}:</span>
                    <span>
                      {reservation.client?.firstName}{" "}
                      {reservation.client?.lastName ||
                        t("reservations.unknownClient")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{t("common.phone")}:</span>
                    <span>
                      {reservation.client?.phone || t("common.notAvailable")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{t("common.email")}:</span>
                    <span>
                      {reservation.client?.email || t("common.notAvailable")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{t("common.address")}:</span>
                    <span>
                      {reservation.client
                        ? `${reservation.client.street} ${reservation.client.buildingNumber}, ${reservation.client.postalCode} ${reservation.client.city}`
                        : t("common.notAvailable")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("reservations.details")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("reservations.startDate")}:
                    </span>
                    <span>
                      {new Date(reservation.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("reservations.endDate")}:
                    </span>
                    <span>
                      {new Date(reservation.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("reservations.total")}:
                    </span>
                    <span className="text-lg font-bold">
                      ${reservation.totalPrice}
                    </span>
                  </div>
                  {reservation.notes && (
                    <div>
                      <span className="font-medium">
                        {t("reservations.notes")}:
                      </span>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        {reservation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="attractions" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="attractions">
                  {t("common.attractions")}
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  {t("common.invoices")}
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  {t("common.timeline")}
                </TabsTrigger>
                <TabsTrigger value="users">
                  {t("common.assignedUsers")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attractions">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("reservations.reservedAttractions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reservation.attractions.map((item) => (
                        <div
                          key={item.attractionId}
                          className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-md cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(`/attractions/${item.attractionId}`)
                          }
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.attraction.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.attraction.width}cm ×{" "}
                                {item.attraction.length}cm ×{" "}
                                {item.attraction.height}cm
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${item.attraction.price}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t("common.quantity")}: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("common.invoices")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      {t("reservations.noInvoices")}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reservations.timeline")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {t("reservations.created")}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(reservation.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {formatT("reservations.createdWithAttractions", {
                              count: String(reservation.attractions?.length),
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {t("reservations.updated")}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(reservation.updatedAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {t("reservations.detailsUpdated")}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatT("reservations.statusIs", {
                              status: t(
                                `reservations.status.${reservation.status}`
                              ),
                            })}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t(`reservations.status.${reservation.status}`)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {t("reservations.waitingForDate")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("reservations.assignedUsers")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reservation.assignedUsers &&
                    reservation.assignedUsers.length > 0 ? (
                      <div className="space-y-4">
                        {reservation.assignedUsers.map((userId) => {
                          // W rzeczywistej aplikacji, pobierz dane użytkownika z API
                          const user = {
                            id: userId,
                            name: `User ${userId}`,
                            email: "user@example.com",
                            role: "employee",
                          };
                          return (
                            <div
                              key={userId}
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                              <Badge>{user.role}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        {t("reservations.noAssignedUsers")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ReservationWizard
        isOpen={isReservationModalOpen}
        onClose={handleCloseReservationModal}
        reservation={reservation}
        onSave={handleSaveReservation}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
        reservationId={reservation.id}
        onSave={handleSaveInvoice}
      />

      {isEditModalOpen && selectedReservation && (
        <ReservationWizard
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          reservation={selectedReservation}
          onSave={handleSaveReservation}
        />
      )}
    </AppLayout>
  );
}
