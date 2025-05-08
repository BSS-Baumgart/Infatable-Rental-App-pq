"use client";

import type React from "react";
import type { SafeUser } from "@/app/types/types";
import { useState, useEffect, useRef } from "react";
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
  UserIcon,
  Package,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  Calendar,
  Info,
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "@/lib/i18n/translation-context";
import { RESERVATION_STATUSES } from "@/app/constants/arrays";
import { createClient } from "@/services/clients-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReservationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: ReservationType | null;
  onSave: (reservation: Partial<ReservationType>) => void;
  initialDate?: Date | null;
}

type DayOption = "full-day" | "morning" | "afternoon";

// Stała reprezentująca siedzibę firmy (można przenieść do konfiguracji)
const COMPANY_LOCATION = {
  city: "Warszawa",
  postalCode: "00-001",
  street: "Marszałkowska",
  buildingNumber: "1",
};

// Stałe do obliczania kosztów transportu
const TRANSPORT_COST_PER_KM = 2;
const FREE_KM_ONE_WAY = 20;
const TOTAL_TRIPS = 4;

export default function ReservationWizard({
  isOpen,
  onClose,
  reservation,
  onSave,
  initialDate,
}: ReservationWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [allAttractions, setAllAttractions] = useState<Attraction[]>([]);
  const [allReservations, setAllReservations] = useState<ReservationType[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);
  const [formData, setFormData] = useState<Partial<ReservationType>>({});
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dayOption, setDayOption] = useState<DayOption>("full-day");
  const [transportDistance, setTransportDistance] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Obsługa kliknięcia poza datepickerem
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ustawienie godzin na podstawie wybranej opcji dnia
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      // Ustawienie godzin na podstawie opcji dnia
      if (dayOption === "full-day") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (dayOption === "morning") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(12, 0, 0, 0);
      } else if (dayOption === "afternoon") {
        startDate.setHours(12, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      if (endDate < startDate) {
        setDateError("End date cannot be before start date.");
      } else {
        setDateError(null);

        // Używamy funkcyjnej formy setState i sprawdzamy, czy daty się zmieniły
        setFormData((prev) => {
          // Sprawdzamy, czy daty są takie same jak poprzednio
          if (
            prev.startDate?.getTime() === startDate.getTime() &&
            prev.endDate?.getTime() === endDate.getTime()
          ) {
            return prev;
          }
          return {
            ...prev,
            startDate: startDate,
            endDate: endDate,
          };
        });

        // Aktualizujemy dateRange tylko jeśli daty się zmieniły
        if (
          dateRange[0]?.getTime() !== startDate.getTime() ||
          dateRange[1]?.getTime() !== endDate.getTime()
        ) {
          setDateRange([startDate, endDate]);
        }
      }
    }
  }, [dayOption, dateRange[0], dateRange[1]]);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);

      if (reservation) {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);

        // Określenie opcji dnia na podstawie godzin
        let option: DayOption = "full-day";
        if (startDate.getHours() === 0 && endDate.getHours() === 12) {
          option = "morning";
        } else if (startDate.getHours() === 12 && endDate.getHours() === 23) {
          option = "afternoon";
        }

        setDayOption(option);
        setDateRange([startDate, endDate]);

        setFormData({
          id: reservation.id,
          clientId: reservation.clientId,
          attractions: [...reservation.attractions],
          status: reservation.status,
          startDate,
          endDate,
          totalPrice: reservation.totalPrice,
          notes: reservation.notes || "",
          assignedUsers: reservation.assignedUsers || [],
        });
      } else {
        const date = initialDate || new Date();
        date.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        setDateRange([date, endDate]);
        setDayOption("full-day");

        setFormData({
          clientId: "",
          attractions: [],
          status: "pending",
          startDate: date,
          endDate: endDate,
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

      setClients(clientsData.data || clientsData);
      setAllAttractions(attractionsData.data || attractionsData);
      setAllReservations(reservationsData.data || reservationsData);
    };

    fetchInitialData();
  }, []);

  // Obliczanie kosztów transportu gdy zmienia się klient
  useEffect(() => {
    if (formData.clientId) {
      const selectedClient = clients.find((c) => c.id === formData.clientId);
      if (selectedClient) {
        // Tutaj w przyszłości będzie integracja z Google Maps API
        // Na razie symulujemy obliczanie odległości
        const distance = calculateDistance(COMPANY_LOCATION, selectedClient);

        // Aktualizujemy tylko jeśli odległość się zmieniła
        if (transportDistance !== distance) {
          setTransportDistance(distance);
        }

        // Obliczanie kosztu transportu
        // 4 przejazdy (zawieźć, wrócić, jechać zwinąć, wrócić)
        // 20 km gratis w każdą stronę
        const totalDistance = distance * TOTAL_TRIPS;
        const freeDistance = (FREE_KM_ONE_WAY * TOTAL_TRIPS) / 2; // Darmowe kilometry (w obie strony)
        const paidDistance = Math.max(0, totalDistance - freeDistance);
        const cost = paidDistance * TRANSPORT_COST_PER_KM;

        // Aktualizujemy tylko jeśli koszt się zmienił
        if (transportCost !== cost) {
          setTransportCost(cost);
        }
      }
    }
  }, [formData.clientId, clients]);

  // Aktualizacja całkowitej ceny z uwzględnieniem transportu
  useEffect(() => {
    if (formData.attractions && formData.attractions.length > 0) {
      const attractionsTotal = formData.attractions.reduce(
        (sum, item) => sum + Number(item.attraction.price),
        0
      );
      // Używamy funkcyjnej formy setState, aby uniknąć zależności od poprzedniego stanu
      setFormData((prev) => {
        // Sprawdzamy, czy cena się zmieniła, aby uniknąć niepotrzebnych aktualizacji
        const newTotal = attractionsTotal + transportCost;
        if (prev.totalPrice === newTotal) return prev;
        return {
          ...prev,
          totalPrice: newTotal,
        };
      });
    } else {
      setFormData((prev) => {
        // Sprawdzamy, czy cena się zmieniła, aby uniknąć niepotrzebnych aktualizacji
        if (prev.totalPrice === transportCost) return prev;
        return {
          ...prev,
          totalPrice: transportCost,
        };
      });
    }
  }, [formData.attractions, transportCost]);

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

    const apiPayload = {
      ...formData,
      clientId: selectedClient.id,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
      attractions: formData.attractions ?? [],
      assignedUsers: (formData.assignedUsers || []).map((u: any) =>
        typeof u === "string" ? u : u.id
      ),
      transportCost: transportCost,
      transportDistance: transportDistance,
    };

    try {
      const response = await fetch(
        reservation
          ? `/api/reservations/${reservation.id}`
          : "/api/reservations",
        {
          method: reservation ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) throw new Error("Failed to save");

      const saved = await response.json();
      onSave(saved);
    } catch (error) {
      alert("Nie udało się zapisać rezerwacji.");
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      const newClient = await createClient(
        clientData as Omit<Client, "id" | "createdAt">
      );

      setClients((prev) => [...prev, newClient]);

      setFormData((prev) => ({ ...prev, clientId: newClient.id }));

      setIsClientModalOpen(false);
      setClientSearchTerm("");
    } catch (error) {
      alert("Nie udało się zapisać klienta.");
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  const currentReservation = reservation;

  // Funkcja sprawdzająca dostępność atrakcji z uwzględnieniem opcji pół dnia
  const isAttractionAvailable = (
    attractionId: string,
    startDate?: Date,
    endDate?: Date,
    option?: DayOption
  ) => {
    if (!startDate || !endDate) return true;

    const checkOption = option || dayOption;

    const attractionReservations = allReservations.filter((res) =>
      res.attractions.some((att) => att.attractionId === attractionId)
    );

    for (const res of attractionReservations) {
      // Pomijamy bieżącą rezerwację przy edycji
      if (currentReservation && res.id === currentReservation.id) continue;

      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      // Sprawdzamy czy daty się pokrywają
      if (startDate.toDateString() === resStart.toDateString()) {
        // Sprawdzamy opcje dnia
        const resOption = getReservationDayOption(resStart, resEnd);

        // Jeśli obie rezerwacje są na cały dzień lub na tę samą porę dnia, to atrakcja jest niedostępna
        if (
          checkOption === "full-day" ||
          resOption === "full-day" ||
          checkOption === resOption
        ) {
          return false;
        }
      }
      // Dla różnych dat sprawdzamy standardowo czy zakresy się nakładają
      else if (startDate <= resEnd && endDate >= resStart) {
        return false;
      }
    }

    return true;
  };

  // Funkcja określająca opcję dnia na podstawie godzin rezerwacji
  const getReservationDayOption = (
    startDate: Date,
    endDate: Date
  ): DayOption => {
    if (startDate.getHours() === 0 && endDate.getHours() === 12) {
      return "morning";
    } else if (startDate.getHours() === 12 && endDate.getHours() === 23) {
      return "afternoon";
    }
    return "full-day";
  };

  // Symulacja obliczania odległości między lokalizacjami
  // W przyszłości zastąpić integracją z Google Maps API
  const calculateDistance = (location1: any, location2: any): number => {
    // Prosta symulacja - w rzeczywistości użylibyśmy Google Maps API
    // Zwracamy losową wartość między 10 a 100 km
    return Math.floor(Math.random() * 90) + 10;
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

  // Obsługa wyboru daty
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    if (start && end) {
      // Zachowaj opcję dnia (cały dzień, rano, popołudnie)
      const newStart = new Date(start);
      const newEnd = new Date(end || start);

      // Ustaw godziny zgodnie z wybraną opcją
      if (dayOption === "full-day") {
        newStart.setHours(0, 0, 0, 0);
        newEnd.setHours(23, 59, 59, 999);
      } else if (dayOption === "morning") {
        newStart.setHours(0, 0, 0, 0);
        newEnd.setHours(12, 0, 0, 0);
      } else if (dayOption === "afternoon") {
        newStart.setHours(12, 0, 0, 0);
        newEnd.setHours(23, 59, 59, 999);
      }

      setDateRange([newStart, newEnd]);
    } else {
      setDateRange([start, end]);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange[0]) return "Select date range";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const startDate = formatDate(dateRange[0]);
    const endDate = dateRange[1] ? formatDate(dateRange[1]) : startDate;

    let timeInfo = "";
    if (dayOption === "full-day") {
      timeInfo = "Cały dzień";
    } else if (dayOption === "morning") {
      timeInfo = "Rano (do 12:00)";
    } else if (dayOption === "afternoon") {
      timeInfo = "Popołudnie (od 12:00)";
    }

    if (startDate === endDate) {
      return `${startDate} - ${timeInfo}`;
    }

    return `${startDate} - ${endDate} - ${timeInfo}`;
  };

  // Obsługa zmiany opcji dnia
  const handleDayOptionChange = (value: DayOption) => {
    setDayOption(value);
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
            {/* Stepper - Improved with rounded design */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      step >= 1
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium mt-1">Client</span>
                </div>

                <div className="flex-1 relative mx-2">
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 absolute top-[22px]"></div>
                  <div
                    className={`h-1 bg-orange-500 absolute top-[22px] transition-all duration-300 ${
                      step >= 2 ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      step >= 2
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium mt-1">Attractions</span>
                </div>

                <div className="flex-1 relative mx-2">
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 absolute top-[22px]"></div>
                  <div
                    className={`h-1 bg-orange-500 absolute top-[22px] transition-all duration-300 ${
                      step >= 3 ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      step >= 3
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium mt-1">Summary</span>
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
                      className="py-2 bg-orange-500 hover:bg-orange-600 text-white"
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
                            ? "border-orange-500 bg-orange-500/10"
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

                        {/* Informacja o kosztach transportu - widoczna tylko gdy klient jest wybrany */}
                        {formData.clientId === client.id &&
                          transportDistance > 0 && (
                            <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex items-start">
                              <Info className="h-4 w-4 mr-1 text-orange-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p>
                                  Transport: {transportDistance} km (
                                  {TOTAL_TRIPS} przejazdy)
                                </p>
                                <p>
                                  Koszt transportu: {transportCost} zł (
                                  {TRANSPORT_COST_PER_KM} zł/km,{" "}
                                  {FREE_KM_ONE_WAY} km gratis w jedną stronę)
                                </p>
                              </div>
                            </div>
                          )}
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
                      className="py-2 bg-orange-500 hover:bg-orange-600 text-white"
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

                  {/* Custom Date Range Picker */}
                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="date-range">Date Range</Label>
                    <div className="relative">
                      <Button
                        id="date-range"
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          dateError ? "border-red-500" : ""
                        }`}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatDateRange()}</span>
                      </Button>

                      {showDatePicker && (
                        <div
                          ref={datePickerRef}
                          className="absolute z-50 mt-1 bg-background border border-border rounded-md shadow-lg p-4 w-auto"
                        >
                          <div className="flex flex-col gap-4">
                            <div>
                              <DatePicker
                                selected={dateRange[0]}
                                onChange={handleDateChange}
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                selectsRange
                                inline
                                monthsShown={1}
                                calendarClassName="custom-calendar"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label>Czas trwania</Label>
                              <RadioGroup
                                value={dayOption}
                                onValueChange={(value) =>
                                  handleDayOptionChange(value as DayOption)
                                }
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="full-day"
                                    id="full-day"
                                  />
                                  <Label
                                    htmlFor="full-day"
                                    className="cursor-pointer"
                                  >
                                    Cały dzień
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="morning"
                                    id="morning"
                                  />
                                  <Label
                                    htmlFor="morning"
                                    className="cursor-pointer"
                                  >
                                    Rano (do 12:00)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="afternoon"
                                    id="afternoon"
                                  />
                                  <Label
                                    htmlFor="afternoon"
                                    className="cursor-pointer"
                                  >
                                    Popołudnie (od 12:00)
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => setShowDatePicker(false)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {dateError && (
                      <p className="text-sm text-red-500">{dateError}</p>
                    )}
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
                        {RESERVATION_STATUSES.map(
                          (status: ReservationStatus) => (
                            <SelectItem key={status} value={status}>
                              {t(`reservations.status.${status}`)}
                            </SelectItem>
                          )
                        )}
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
                                formData.endDate,
                                dayOption
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

                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center cursor-help">
                              <Info className="h-4 w-4 mr-1 text-orange-500" />
                              <span>
                                Dostępność atrakcji zależy od wybranej daty i
                                pory dnia
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Jeśli wybierzesz opcję "pół dnia", możesz
                              zarezerwować atrakcję, która jest już
                              zarezerwowana na drugą połowę dnia.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                      className="min-h-[100px]"
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
                      className="py-2 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={nextStep}
                      disabled={
                        !dateRange[0] ||
                        !dateRange[1] ||
                        formData.attractions?.length === 0 ||
                        !!dateError
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
                            <div className="flex justify-between flex-wrap">
                              <span className="font-medium">Name:</span>
                              <span>
                                {selectedClient.firstName}{" "}
                                {selectedClient.lastName}
                              </span>
                            </div>
                            <div className="flex justify-between flex-wrap">
                              <span className="font-medium">Phone:</span>
                              <span>{selectedClient.phone}</span>
                            </div>
                            <div className="flex justify-between flex-wrap">
                              <span className="font-medium">Email:</span>
                              <span>{selectedClient.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between flex-wrap">
                              <span className="font-medium">Address:</span>
                              <span className="text-right">
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
                          <div className="flex justify-between flex-wrap">
                            <span className="font-medium">Date Range:</span>
                            <span className="text-right">
                              {formatDateRange()}
                            </span>
                          </div>
                          <div className="flex justify-between flex-wrap">
                            <span className="font-medium">Status:</span>
                            <span className="capitalize">
                              {formData.status?.replace("-", " ") ||
                                "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between flex-wrap">
                            <span className="font-medium">Notes:</span>
                            <span className="text-right max-w-[60%]">
                              {formData.notes || "None"}
                            </span>
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
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span>Suma za atrakcje:</span>
                              <span>
                                $
                                {formData.attractions?.reduce(
                                  (sum, item) =>
                                    sum + Number(item.attraction.price),
                                  0
                                ) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-orange-600">
                              <span>
                                Koszt transportu ({transportDistance} km):
                              </span>
                              <span>${transportCost}</span>
                            </div>
                            <div className="flex justify-between font-bold mt-2">
                              <span>Razem:</span>
                              <span>${formData.totalPrice}</span>
                            </div>
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
                    <Button
                      type="submit"
                      className="py-2 bg-orange-500 hover:bg-orange-600 text-white"
                    >
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
