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
import { Textarea } from "@/components/ui/textarea";
import type { Attraction } from "@/app/types/types";
import { useTranslation } from "@/lib/i18n/translation-context";

interface AttractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  attraction?: Attraction | null;
  onSave: (data: Partial<Attraction>) => void;
}

export default function AttractionModal({
  isOpen,
  onClose,
  attraction,
  onSave,
}: AttractionModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Attraction>>({
    name: "",
    description: "",
    price: 0,
    width: 0,
    length: 0,
    height: 0,
    weight: 0,
    setupTime: 0,
    image: "",
  });

  useEffect(() => {
    if (attraction) {
      setFormData({
        name: attraction.name,
        description: attraction.description,
        price: attraction.price,
        width: attraction.width,
        length: attraction.length,
        height: attraction.height,
        weight: attraction.weight,
        setupTime: attraction.setupTime,
        image: attraction.image,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
        setupTime: 0,
        image: "",
      });
    }
  }, [attraction, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "width" ||
        name === "length" ||
        name === "height" ||
        name === "weight" ||
        name === "setupTime"
          ? Number.parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {attraction ? t("attractions.edit") : t("attractions.new")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">{t("attractions.name")}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">
                {t("attractions.description")}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="price">{t("attractions.price")} ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="setupTime">
                  {t("attractions.setupTime")} ({t("calendar.minutes")})
                </Label>
                <Input
                  id="setupTime"
                  name="setupTime"
                  type="number"
                  min="0"
                  value={formData.setupTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="width">{t("attractions.width")} (cm)</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  min="0"
                  value={formData.width}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="length">{t("attractions.length")} (cm)</Label>
                <Input
                  id="length"
                  name="length"
                  type="number"
                  min="0"
                  value={formData.length}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="height">{t("attractions.height")} (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="weight">{t("attractions.weight")} (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="image">{t("attractions.imageUrl")}</Label>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Podgląd"
                    className="mt-2 h-32 object-contain border rounded"
                  />
                )}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formDataUpload = new FormData();
                    formDataUpload.append("file", file);

                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formDataUpload,
                    });

                    const data = await res.json();
                    setFormData((prev) => ({ ...prev, image: data.url }));
                  }}
                />
              </div>
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
