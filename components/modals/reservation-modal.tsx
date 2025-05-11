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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clients, attractions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type {
  Reservation,
  ReservationStatus,
  ReservationAttraction,
} from "@/app/types/types";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
  onSave: (reservation: Partial<Reservation>) => void;
}

const statusOptions: ReservationStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export default function ReservationModal({
  isOpen,
  onClose,
  reservation,
  onSave,
}: ReservationModalProps) {
  const [formData, setFormData] = useState<Partial<Reservation>>({
    clientId: "",
    attractions: [],
    status: "pending",
    startDate: new Date(),
    endDate: new Date(),
    totalPrice: 0,
    notes: "",
  });
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>("");
  const [selectedAttractionQuantity, setSelectedAttractionQuantity] =
    useState<number>(1);

  // Initialize form with reservation data if editing
  useEffect(() => {
    if (reservation) {
      setFormData({
        id: reservation.id,
        clientId: reservation.clientId,
        attractions: [...reservation.attractions],
        status: reservation.status,
        startDate: new Date(reservation.startDate),
        endDate: new Date(reservation.endDate),
        totalPrice: reservation.totalPrice,
        notes: reservation.notes || "",
      });
    } else {
      // Reset form for new reservation
      setFormData({
        clientId: "",
        attractions: [],
        status: "pending",
        startDate: new Date(),
        endDate: new Date(),
        totalPrice: 0,
        notes: "",
      });
    }
  }, [reservation, isOpen]);

  // Calculate total price based on selected attractions
  useEffect(() => {
    if (formData.attractions && formData.attractions.length > 0) {
      const total = formData.attractions.reduce(
        (sum, item) => sum + item.attraction.price * item.quantity,
        0
      );
      setFormData((prev) => ({ ...prev, totalPrice: total }));
    } else {
      setFormData((prev) => ({ ...prev, totalPrice: 0 }));
    }
  }, [formData.attractions]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
  };

  const handleAddAttraction = () => {
    if (!selectedAttractionId || selectedAttractionQuantity < 1) return;

    const attraction = attractions.find((a) => a.id === selectedAttractionId);
    if (!attraction) return;

    const existingIndex = formData.attractions?.findIndex(
      (a) => a.attractionId === selectedAttractionId
    );

    if (existingIndex !== undefined && existingIndex >= 0) {
      // Update quantity if attraction already exists
      const updatedAttractions = [...(formData.attractions || [])];
      updatedAttractions[existingIndex] = {
        ...updatedAttractions[existingIndex],
        quantity:
          updatedAttractions[existingIndex].quantity +
          selectedAttractionQuantity,
      };
      setFormData((prev) => ({ ...prev, attractions: updatedAttractions }));
    } else {
      // Add new attraction
      const newAttraction: ReservationAttraction = {
        attractionId: attraction.id,
        attraction,
        quantity: selectedAttractionQuantity,
      };
      setFormData((prev) => ({
        ...prev,
        attractions: [...(prev.attractions || []), newAttraction],
      }));
    }

    // Reset selection
    setSelectedAttractionId("");
    setSelectedAttractionQuantity(1);
  };

  const handleRemoveAttraction = (attractionId: string) => {
    setFormData((prev) => ({
      ...prev,
      attractions:
        prev.attractions?.filter((a) => a.attractionId !== attractionId) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? "Edit Reservation" : "New Reservation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Client Selection */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="clientId">Client</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => handleSelectChange("clientId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.firstName} {client.lastName} - {client.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={
                  formData.startDate
                    ? new Date(formData.startDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleDateChange("startDate", e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={
                  formData.endDate
                    ? new Date(formData.endDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleDateChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange("status", value as ReservationStatus)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attractions */}
          <div className="space-y-2">
            <Label>Attractions</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.attractions?.map((item) => (
                <Badge
                  key={item.attractionId}
                  variant="secondary"
                  className="flex items-center gap-1 py-1.5"
                >
                  {item.attraction.name} (x{item.quantity})
                  <button
                    type="button"
                    onClick={() => handleRemoveAttraction(item.attractionId)}
                    className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedAttractionId}
                onValueChange={setSelectedAttractionId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add attraction" />
                </SelectTrigger>
                <SelectContent>
                  {attractions.map((attraction) => (
                    <SelectItem key={attraction.id} value={attraction.id}>
                      {attraction.name} - ${attraction.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                className="w-20"
                value={selectedAttractionQuantity}
                onChange={(e) =>
                  setSelectedAttractionQuantity(
                    Number.parseInt(e.target.value) || 1
                  )
                }
              />
              <Button type="button" size="sm" onClick={handleAddAttraction}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="totalPrice">Total Price ($)</Label>
            <Input
              type="number"
              id="totalPrice"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleInputChange}
            />
          </div>

          {/* Notes */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Add any additional notes here..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
