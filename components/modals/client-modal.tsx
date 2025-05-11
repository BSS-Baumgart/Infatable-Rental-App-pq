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
import type { Client } from "@/app/types/types";
import { useTranslation } from "@/lib/i18n/translation-context";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (client: Partial<Client>) => void;
}

export default function ClientModal({
  isOpen,
  onClose,
  client,
  onSave,
}: ClientModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    street: "",
    buildingNumber: "",
    postalCode: "",
    city: "",
    companyName: "",
    taxId: "",
  });

  // Initialize form with client data if editing
  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email || "",
        street: client.street,
        buildingNumber: client.buildingNumber,
        postalCode: client.postalCode,
        city: client.city,
        companyName: client.companyName || "",
        taxId: client.taxId || "",
      });
    } else {
      // Reset form for new client
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        street: "",
        buildingNumber: "",
        postalCode: "",
        city: "",
        companyName: "",
        taxId: "",
      });
    }
  }, [client, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? t("clients.edit") : t("clients.new")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Company Information (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="companyName">
                {t("clients.companyName") || "Firma"}
                <span className="text-xs text-gray-500 ml-1">
                  ({t("common.optional") || "opcjonalnie"})
                </span>
              </Label>
              <Input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleInputChange}
                placeholder={t("common.optional") || "Opcjonalnie"}
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="taxId">
                {t("clients.taxId") || "NIP"}
                <span className="text-xs text-gray-500 ml-1">
                  ({t("common.optional") || "opcjonalnie"})
                </span>
              </Label>
              <Input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId || ""}
                onChange={handleInputChange}
                placeholder={t("common.optional") || "Opcjonalnie"}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="firstName">{t("clients.firstName")}</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="lastName">{t("clients.lastName")}</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="phone">{t("clients.phone")}</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="email">{t("clients.email")}</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("common.optional")}
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="street">{t("clients.street")}</Label>
              <Input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="buildingNumber">
                {t("clients.buildingNumber")}
              </Label>
              <Input
                type="text"
                id="buildingNumber"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="postalCode">{t("clients.postalCode")}</Label>
              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="city">{t("clients.city")}</Label>
              <Input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
