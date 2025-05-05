"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clients as initialClients, attractions, reservations } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { X, Plus, User, Package, FileText, ChevronRight, ChevronLeft, Search } from "lucide-react"
import type { ReservationStatus, Client, Reservation as ReservationType } from "@/lib/types"
import ClientModal from "./client-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ReservationWizardProps {
  isOpen: boolean
  onClose: () => void
  reservation?: ReservationType | null
  onSave: (reservation: Partial<ReservationType>) => void
  initialDate?: Date | null
}

const statusOptions: ReservationStatus[] = ["pending", "in-progress", "completed", "cancelled"]

// Mockowany aktualny użytkownik - w rzeczywistej aplikacji będzie pobierany z kontekstu uwierzytelniania
const currentUser = { id: "user-1", role: "admin" }

export default function ReservationWizard({
  isOpen,
  onClose,
  reservation,
  onSave,
  initialDate,
}: ReservationWizardProps) {
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ReservationType>>({
    clientId: "",
    attractions: [],
    status: "pending",
    startDate: new Date(),
    endDate: new Date(),
    totalPrice: 0,
    notes: "",
    assignedUsers: [currentUser.id], // Automatycznie przypisz aktualnego użytkownika
  })
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>("")
  const router = useRouter()

  // Initialize form with reservation data if editing or initialDate if creating new
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
        assignedUsers: reservation.assignedUsers || [], // Zachowaj przypisanych użytkowników przy edycji
      })
    } else {
      // Reset form for new reservation
      setFormData({
        clientId: "",
        attractions: [],
        status: "pending",
        startDate: initialDate || new Date(),
        endDate: initialDate || new Date(),
        totalPrice: 0,
        notes: "",
        assignedUsers: [currentUser.id], // Automatycznie przypisz aktualnego użytkownika przy tworzeniu nowej rezerwacji
      })
    }
    setStep(1)
  }, [reservation, isOpen, initialDate])

  // Calculate total price based on selected attractions
  useEffect(() => {
    if (formData.attractions && formData.attractions.length > 0) {
      const total = formData.attractions.reduce((sum, item) => sum + item.attraction.price, 0)
      setFormData((prev) => ({ ...prev, totalPrice: total }))
    } else {
      setFormData((prev) => ({ ...prev, totalPrice: 0 }))
    }
  }, [formData.attractions])

  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: new Date(value) }))
  }

  const handleRemoveAttraction = (attractionId: string) => {
    setFormData((prev) => ({
      ...prev,
      attractions: prev.attractions?.filter((a) => a.attractionId !== attractionId) || [],
    }))
  }

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the selected client to include in the saved data
    const selectedClient = clients.find((c) => c.id === formData.clientId)

    // Include the full client object in the data being saved
    const dataToSave = {
      ...formData,
      client: selectedClient, // Add the full client object
    }

    onSave(dataToSave)
  }

  const handleSaveClient = (clientData: Partial<Client>) => {
    const newClient = {
      ...clientData,
      id: clientData.id || `CL-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
    } as Client

    if (clientData.id) {
      // Update existing client
      setClients((prev) => prev.map((c) => (c.id === clientData.id ? newClient : c)))
    } else {
      // Add new client
      setClients((prev) => [...prev, newClient])
    }

    // Select the client in the form
    setFormData((prev) => ({ ...prev, clientId: newClient.id }))
    setIsClientModalOpen(false)
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const selectedClient = clients.find((c) => c.id === formData.clientId)

  const currentReservation = reservation

  // Function to check if an attraction is available for the selected dates
  const isAttractionAvailable = (attractionId: string, startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return true

    // Get all reservations that include this attraction
    const attractionReservations = reservations.filter((res) =>
      res.attractions.some((att) => att.attractionId === attractionId),
    )

    // Check if any of these reservations overlap with the selected dates
    for (const res of attractionReservations) {
      const resStart = new Date(res.startDate)
      const resEnd = new Date(res.endDate)

      // Skip the current reservation if we're editing
      if (currentReservation && res.id === currentReservation.id) continue

      // Check for date overlap
      if (startDate <= resEnd && endDate >= resStart) {
        return false // Not available - dates overlap
      }
    }

    return true // Available
  }

  // Modified function to add attraction without quantity input
  const handleAddAttraction = (attractionId: string) => {
    if (!attractionId) return

    const attraction = attractions.find((a) => a.id === attractionId)
    if (!attraction) return

    // Add new attraction with quantity 1
    const newAttraction = {
      attractionId: attraction.id,
      attraction,
      quantity: 1,
    }

    setFormData((prev) => ({
      ...prev,
      attractions: [...(prev.attractions || []), newAttraction],
    }))

    // Reset selection
    setSelectedAttractionId("")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reservation ? "Edit Reservation" : "New Reservation"}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Stepper - Updated with rounded design */}
            <div className="mb-8">
              <div className="flex justify-between">
                <div
                  className={`flex flex-col items-center ${
                    step >= 1 ? "text-primary" : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= 1
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <User className="h-5 w-5" />
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
                    step >= 2 ? "text-primary" : "text-gray-400 dark:text-gray-600"
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
                    step >= 3 ? "text-primary" : "text-gray-400 dark:text-gray-600"
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
                    <Button type="button" size="sm" className="py-2" onClick={() => setIsClientModalOpen(true)}>
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
                        onClick={() => setFormData((prev) => ({ ...prev, clientId: client.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</div>
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
                    <Button type="button" className="py-2" onClick={nextStep} disabled={!formData.clientId}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Attractions and Dates */}
              {step === 2 && (
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg font-medium mb-4">Select Attractions & Dates</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        className="h-10"
                        value={formData.startDate ? new Date(formData.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleDateChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        className="h-10"
                        value={formData.endDate ? new Date(formData.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleDateChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value as ReservationStatus)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
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
                        <Badge key={item.attractionId} variant="secondary" className="flex items-center gap-1 py-1.5">
                          {item.attraction.name}
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
                      {formData.attractions?.length === 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No attractions selected</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedAttractionId}
                        onValueChange={(value) => {
                          setSelectedAttractionId(value)
                          // Auto-add the attraction when selected
                          if (value) {
                            handleAddAttraction(value)
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1 h-10">
                          <SelectValue placeholder="Add attraction" />
                        </SelectTrigger>
                        <SelectContent>
                          {attractions
                            .filter(
                              (attraction) =>
                                // Filter out already selected attractions
                                !formData.attractions?.some((item) => item.attractionId === attraction.id),
                            )
                            .filter((attraction) =>
                              // Filter out attractions that are not available for the selected dates
                              isAttractionAvailable(attraction.id, formData.startDate, formData.endDate),
                            )
                            .map((attraction) => (
                              <SelectItem key={attraction.id} value={attraction.id}>
                                {attraction.name} - ${attraction.price}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                    <Button type="button" variant="outline" className="py-2" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="py-2"
                      onClick={nextStep}
                      disabled={!formData.startDate || !formData.endDate || formData.attractions?.length === 0}
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
                  <h3 className="text-lg font-medium mb-4">Reservation Summary</h3>

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
                                {selectedClient.firstName} {selectedClient.lastName}
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
                                {selectedClient.street} {selectedClient.buildingNumber}, {selectedClient.postalCode}{" "}
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
                              {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">End Date:</span>
                            <span>
                              {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : "Not specified"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <span className="capitalize">{formData.status?.replace("-", " ") || "Not specified"}</span>
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
                            <div key={item.attractionId} className="flex justify-between">
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
                    <Button type="button" variant="outline" className="py-2" onClick={prevStep}>
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

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} />
    </>
  )
}
