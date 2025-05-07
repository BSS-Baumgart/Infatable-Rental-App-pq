"use client";

import type React from "react";
import { SafeUser } from "@/app/types/types";
import { DateRange } from "react-date-range";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  User as UserIcon,
  Package,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import type {
  ReservationStatus,
  Client,
  Reservation as ReservationType,
  Attraction,
} from "@/app/types/types";
import ClientModal from "./client-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

interface ReservationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: ReservationType | null;
  onSave: (reservation: Partial<ReservationType>) => void;
  initialDate?: Date | null;
}

const statusOptions: ReservationStatus[] = [
  "pending",
  "in-progress",
  "completed",
  "cancelled",
];

export default function ReservationWizard({
  isOpen,
  onClose,
  reservation,
  onSave,
  initialDate,
}: ReservationWizardProps) {
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [allAttractions, setAllAttractions] = useState<Attraction[]>([]);
  const [allReservations, setAllReservations] = useState<ReservationType[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [formData, setFormData] = useState<Partial<ReservationType>>({});
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);

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
          assignedUsers: reservation.assignedUsers || [],
        });
      } else {
        setFormData({
          clientId: "",
          attractions: [],
          status: "pending",
          startDate: initialDate || new Date(),
          endDate: initialDate || new Date(),
          totalPrice: 0,
          notes: "",
          assignedUsers: user?.id ? [user.id] : [],
        });
      }

      setStep(1);
    });
  }, [reservation, isOpen, initialDate]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [clientsRes, attractionsRes, reservationsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/attractions"),
        fetch("/api/reservations"),
      ]);

      const [clientsData, attractionsData, reservationsData] =
        await Promise.all([
          clientsRes.json(),
          attractionsRes.json(),
          reservationsRes.json(),
        ]);

      setClients(clientsData);
      setAllAttractions(attractionsData);
      setAllReservations(reservationsData);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.attractions && formData.attractions.length > 0) {
      const total = formData.attractions.reduce(
        (sum, item) => sum + item.attraction.price,
        0
      );
      setFormData((prev) => ({ ...prev, totalPrice: total }));
    } else {
      setFormData((prev) => ({ ...prev, totalPrice: 0 }));
    }
  }, [formData.attractions]);

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm)
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveAttraction = (attractionId: string) => {
    setFormData((prev) => ({
      ...prev,
      attractions:
        prev.attractions?.filter((a) => a.attractionId !== attractionId) || [],
    }));
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (
      !selectedClient ||
      !formData.attractions ||
      formData.attractions.length === 0
    ) {
      alert("Uzupełnij dane klienta i wybierz atrakcje.");
      return;
    }

    const toISO = (d?: Date) => (d ? new Date(d).toISOString() : undefined);

    const dataToSave = {
      ...formData,
      clientId: selectedClient.id,
      startDate: toISO(formData.startDate),
      endDate: toISO(formData.endDate),
      attractions: formData.attractions ?? [],
      assignedUsers: (formData.assignedUsers || []).map((u: any) =>
        typeof u === "string" ? u : u.id
      ),
      ...(reservation ? { id: reservation.id } : {}),
    };

    try {
      const response = await fetch("/api/reservations", {
        method: reservation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) throw new Error("Failed to save");

      const saved = await response.json();
      onSave(saved);
    } catch (error) {
      alert("Nie udało się zapisać rezerwacji.");
    }
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    const newClient = {
      ...clientData,
      id: clientData.id || `CL-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
    } as Client;

    if (clientData.id) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientData.id ? newClient : c))
      );
    } else {
      setClients((prev) => [...prev, newClient]);
    }

    setFormData((prev) => ({ ...prev, clientId: newClient.id }));
    setIsClientModalOpen(false);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  const currentReservation = reservation;

  const isAttractionAvailable = (
    attractionId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!startDate || !endDate) return true;

    const attractionReservations = allReservations.filter((res) =>
      res.attractions.some((att) => att.attractionId === attractionId)
    );

    for (const res of attractionReservations) {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      if (currentReservation && res.id === currentReservation.id) continue;

      if (startDate <= resEnd && endDate >= resStart) {
        return false;
      }
    }

    return true;
  };

  const handleAddAttraction = (attractionId: string) => {
    if (!attractionId) return;

    const attraction = allAttractions.find((a) => a.id === attractionId);
    if (!attraction) return;

    const newAttraction = {
      attractionId: attraction.id,
      attraction,
      quantity: 1,
    };

    setFormData((prev) => ({
      ...prev,
      attractions: [...(prev.attractions || []), newAttraction],
    }));

    setSelectedAttractionId("");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reservation ? "Edit Reservation" : "New Reservation"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Stepper - Updated with rounded design */}
            <div className="mb-8">
              <div className="flex justify-between">
                <div
                  className={`flex flex-col items-center ${
                    step >= 1
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= 1
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Client</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className={`h-1 w-full ${
                      step > 1 ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                    } transition-colors duration-300 rounded-full`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col items-center ${
                    step >= 2
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= 2
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Attractions</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className={`h-1 w-full ${
                      step > 2 ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                    } transition-colors duration-300 rounded-full`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col items-center ${
                    step >= 3
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= 3
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Summary</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveReservation}>
              {/* Step 1: Client Selection */}
              {step === 1 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Select Client</h3>
                    <Button
                      type="button"
                      size="sm"
                      className="py-2"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Client
                    </Button>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search clients..."
                      className="pl-8 h-10"
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          formData.clientId === client.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            clientId: client.id,
                          }))
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.phone}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.city}, {client.postalCode}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredClients.length === 0 && (
                      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                        No clients found. Please create a new client.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      className="py-2"
                      onClick={nextStep}
                      disabled={!formData.clientId}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Attractions and Dates */}
              {step === 2 && (
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg font-medium mb-4">
                    Select Attractions & Dates
                  </h3>

                  {/* Date range picker */}
                  <div className="grid w-full items-center gap-2">
                    <Label>Reservation Dates</Label>
                    <DateRange
                      ranges={[
                        {
                          startDate: formData.startDate || new Date(),
                          endDate: formData.endDate || new Date(),
                          key: "selection",
                        },
                      ]}
                      onChange={(ranges: any) => {
                        const selection = ranges.selection;
                        setFormData((prev) => ({
                          ...prev,
                          startDate: selection.startDate,
                          endDate: selection.endDate,
                        }));
                      }}
                      moveRangeOnFirstSelection={false}
                      months={1}
                      direction="horizontal"
                      showDateDisplay={true}
                      editableDateInputs={true}
                    />
                  </div>

                  {/* Status select */}
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value as ReservationStatus)
                      }
                    >
                      <SelectTrigger className="h-10">
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
                    <Label>Selected Attractions</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.attractions?.map((item) => (
                        <Badge
                          key={item.attractionId}
                          variant="secondary"
                          className="flex items-center gap-1 py-1.5"
                        >
                          {item.attraction.name}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAttraction(item.attractionId)
                            }
                            className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                      {formData.attractions?.length === 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No attractions selected
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAttractionId}
                        onValueChange={(value) => {
                          setSelectedAttractionId(value);
                          if (value) handleAddAttraction(value);
                        }}
                      >
                        <SelectTrigger className="flex-1 h-10">
                          <SelectValue placeholder="Add attraction" />
                        </SelectTrigger>
                        <SelectContent>
                          {allAttractions
                            .filter(
                              (attraction) =>
                                !formData.attractions?.some(
                                  (item) => item.attractionId === attraction.id
                                )
                            )
                            .filter((attraction) =>
                              isAttractionAvailable(
                                attraction.id,
                                formData.startDate,
                                formData.endDate
                              )
                            )
                            .map((attraction) => (
                              <SelectItem
                                key={attraction.id}
                                value={attraction.id}
                              >
                                {attraction.name} - ${attraction.price}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      className="min-h-[100px] h-10"
                    />
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="py-2"
                      onClick={prevStep}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="py-2"
                      onClick={nextStep}
                      disabled={
                        !formData.startDate ||
                        !formData.endDate ||
                        formData.attractions?.length === 0
                      }
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg font-medium mb-4">
                    Reservation Summary
                  </h3>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedClient && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Name:</span>
                              <span>
                                {selectedClient.firstName}{" "}
                                {selectedClient.lastName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Phone:</span>
                              <span>{selectedClient.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Email:</span>
                              <span>{selectedClient.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Address:</span>
                              <span>
                                {selectedClient.street}{" "}
                                {selectedClient.buildingNumber},{" "}
                                {selectedClient.postalCode}{" "}
                                {selectedClient.city}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Reservation Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Start Date:</span>
                            <span>
                              {formData.startDate
                                ? new Date(
                                    formData.startDate
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">End Date:</span>
                            <span>
                              {formData.endDate
                                ? new Date(
                                    formData.endDate
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <span className="capitalize">
                              {formData.status?.replace("-", " ") ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Notes:</span>
                            <span>{formData.notes || "None"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Attractions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {formData.attractions?.map((item) => (
                            <div
                              key={item.attractionId}
                              className="flex justify-between"
                            >
                              <span>{item.attraction.name}</span>
                              <span>${item.attraction.price}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                            <span>Total:</span>
                            <span>${formData.totalPrice}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="py-2"
                      onClick={prevStep}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" className="py-2">
                      Save Reservation
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
      />
    </>
  );
}
