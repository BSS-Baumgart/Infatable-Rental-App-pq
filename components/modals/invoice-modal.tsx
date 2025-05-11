"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateClient, getClient } from "@/services/clients-service";
import { getReservation } from "@/services/reservation-service";
import type {
  Invoice,
  InvoiceStatus,
  Client,
  Reservation,
} from "@/app/types/types";
import { useTranslation } from "@/lib/i18n/translation-context";
import { useToast } from "@/components/ui/use-toast";
import { getReservations } from "@/services/reservation-service";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  reservationId?: string;
  onSave: (invoice: Partial<Invoice>) => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  invoice,
  reservationId,
  onSave,
}: InvoiceModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Invoice>>({
    reservationId: "",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default due date is 14 days from now
    amount: 0,
    status: "unpaid",
    isCompanyInvoice: false,
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Pobierz listę rezerwacji
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getReservations()
        .then(setReservations)
        .catch((error) => {
          console.error("Error loading reservations:", error);
          toast({
            title: t("common.error"),
            description: t("reservations.loadError"),
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, t, toast]);

  // Initialize form with invoice data if editing
  useEffect(() => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        reservationId: invoice.reservationId,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        amount: invoice.amount,
        status: invoice.status,
        pdfUrl: invoice.pdfUrl || "",
        isCompanyInvoice: invoice.isCompanyInvoice || false,
        companyName: invoice.companyName || "",
        taxId: invoice.taxId || "",
      });

      // Pobierz rezerwację dla tej faktury
      if (invoice.reservationId) {
        loadReservation(invoice.reservationId);
      }
    } else if (reservationId) {
      // If creating a new invoice for a specific reservation
      loadReservation(reservationId);
    } else {
      // Reset form for new invoice
      setFormData({
        reservationId: "",
        issueDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        amount: 0,
        status: "unpaid",
        isCompanyInvoice: false,
        companyName: "",
        taxId: "",
      });
      setSelectedReservation(null);
      setClient(null);
    }
  }, [invoice, reservationId, isOpen]);

  // Załaduj dane klienta po wybraniu rezerwacji
  useEffect(() => {
    if (selectedReservation && selectedReservation.clientId) {
      loadClientData(selectedReservation.clientId);
    }
  }, [selectedReservation]);

  // Aktualizuj pola firmy na podstawie danych klienta
  useEffect(() => {
    if (client && formData.isCompanyInvoice) {
      setFormData((prev) => ({
        ...prev,
        companyName: client.companyName || prev.companyName || "",
        taxId: client.taxId || prev.taxId || "",
      }));
    }
  }, [client, formData.isCompanyInvoice]);

  const loadReservation = async (id: string) => {
    try {
      setLoading(true);
      const reservation = await getReservation(id);
      setSelectedReservation(reservation);

      setFormData((prev) => ({
        ...prev,
        reservationId: reservation.id,
        clientId: reservation.clientId,
        amount: reservation.totalPrice,
      }));

      if (reservation.clientId) {
        await loadClientData(reservation.clientId);
      }
    } catch (error) {
      console.error("Error loading reservation:", error);
      toast({
        title: t("common.error"),
        description: t("reservations.loadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientData = async (clientId: string) => {
    try {
      setLoading(true);
      const clientData = await getClient(clientId);
      setClient(clientData);
    } catch (error) {
      console.error("Error loading client data:", error);
      toast({
        title: t("common.error"),
        description: t("invoices.clientLoadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Jeśli zmieniono rezerwację, zaktualizuj wybraną rezerwację
    if (name === "reservationId") {
      loadReservation(value);
    }
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isCompanyInvoice: checked,
      // Jeśli przełączono na fakturę firmową, użyj danych klienta jeśli są dostępne
      companyName:
        checked && client?.companyName ? client.companyName : prev.companyName,
      taxId: checked && client?.taxId ? client.taxId : prev.taxId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja dla faktury firmowej
    if (formData.isCompanyInvoice) {
      if (!formData.companyName || !formData.taxId) {
        toast({
          title: t("common.error"),
          description: t("invoices.companyDataRequired"),
          variant: "destructive",
        });
        return;
      }
    }

    // Jeśli wprowadzono dane firmy i klient nie ma tych danych, zaktualizuj klienta
    if (formData.isCompanyInvoice && client && formData.clientId) {
      const shouldUpdateClient =
        (formData.companyName && formData.companyName !== client.companyName) ||
        (formData.taxId && formData.taxId !== client.taxId);

      if (shouldUpdateClient) {
        try {
          await updateClient(formData.clientId, {
            companyName: formData.companyName,
            taxId: formData.taxId,
          });

          toast({
            title: t("clients.updated"),
            description: t("invoices.clientDataUpdated"),
          });
        } catch (error) {
          console.error("Error updating client:", error);
          toast({
            title: t("common.error"),
            description: t("invoices.clientUpdateError"),
            variant: "destructive",
          });
        }
      }
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {invoice ? t("invoices.edit") : t("invoices.new")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Reservation Selection */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="reservationId">{t("invoices.reservation")}</Label>
            <Select
              value={formData.reservationId}
              onValueChange={(value) =>
                handleSelectChange("reservationId", value)
              }
              disabled={!!reservationId || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("invoices.selectReservation")} />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.id} - {res.client?.firstName} {res.client?.lastName} ($
                    {res.totalPrice})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="issueDate">{t("invoices.issueDate")}</Label>
              <Input
                type="date"
                id="issueDate"
                name="issueDate"
                value={
                  formData.issueDate
                    ? new Date(formData.issueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleDateChange("issueDate", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="dueDate">{t("invoices.dueDate")}</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleDateChange("dueDate", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="amount">{t("invoices.amount")} ($)</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          {/* Invoice Type Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isCompanyInvoice">
              {t("invoices.isCompanyInvoice")}
            </Label>
            <Switch
              id="isCompanyInvoice"
              checked={formData.isCompanyInvoice}
              onCheckedChange={handleToggleChange}
              disabled={loading}
            />
          </div>

          {/* Company Data - pokazywane tylko gdy isCompanyInvoice=true */}
          {formData.isCompanyInvoice && (
            <>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="companyName" className="flex items-center">
                  {t("invoices.companyName")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  required={formData.isCompanyInvoice}
                  placeholder={t("invoices.enterCompanyName")}
                  disabled={loading}
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="taxId" className="flex items-center">
                  {t("invoices.taxId")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId || ""}
                  onChange={handleInputChange}
                  required={formData.isCompanyInvoice}
                  placeholder={t("invoices.enterTaxId")}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Status */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">{t("invoices.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange("status", value as InvoiceStatus)
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("invoices.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">
                  {t("invoices.status.paid")}
                </SelectItem>
                <SelectItem value="unpaid">
                  {t("invoices.status.unpaid")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PDF URL */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="pdfUrl">
              {t("invoices.pdfUrl")} ({t("invoices.optional")})
            </Label>
            <Input
              type="text"
              id="pdfUrl"
              name="pdfUrl"
              value={formData.pdfUrl || ""}
              onChange={handleInputChange}
              placeholder="/documents/invoice.pdf"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
