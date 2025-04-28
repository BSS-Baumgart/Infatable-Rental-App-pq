"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { reservations as initialReservations, clients } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Plus, Search, Trash, FileText } from "lucide-react"
import type { Reservation, ReservationStatus } from "@/lib/types"
import ReservationWizard from "@/components/modals/reservation-wizard"
import InvoiceModal from "@/components/modals/invoice-modal"
import { useToast } from "@/components/ui/use-toast"

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all")
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const { toast } = useToast()

  // Filter reservations based on search term and status
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenReservationModal = (reservation?: Reservation) => {
    setCurrentReservation(reservation || null)
    setIsReservationModalOpen(true)
  }

  const handleCloseReservationModal = () => {
    setIsReservationModalOpen(false)
    setCurrentReservation(null)
  }

  const handleOpenInvoiceModal = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setIsInvoiceModalOpen(true)
  }

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
  }

  const handleSaveReservation = (data: Partial<Reservation>) => {
    if (currentReservation) {
      // Update existing reservation
      setReservations((prev) =>
        prev.map((res) => (res.id === currentReservation.id ? ({ ...res, ...data } as Reservation) : res)),
      )
      toast({
        title: "Reservation updated",
        description: `Reservation #${currentReservation.id} has been updated successfully.`,
      })
    } else {
      // Create new reservation
      // Make sure we have the client object from the clients array
      const clientObj = data.clientId ? clients.find((c) => c.id === data.clientId) : null

      const newReservation = {
        ...data,
        id: `RES-${Math.floor(Math.random() * 10000)}`,
        client: clientObj, // Ensure client object is included
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Reservation

      setReservations((prev) => [...prev, newReservation])
      toast({
        title: "Reservation created",
        description: `New reservation has been created successfully.`,
      })
    }
    handleCloseReservationModal()
  }

  const handleSaveInvoice = (data: any) => {
    toast({
      title: "Invoice created",
      description: `Invoice for reservation #${currentReservation?.id} has been created successfully.`,
    })
    handleCloseInvoiceModal()
  }

  const handleDeleteReservation = (id: string) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      setReservations((prev) => prev.filter((res) => res.id !== id))
      toast({
        title: "Reservation deleted",
        description: `Reservation #${id} has been deleted.`,
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Reservations</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenReservationModal()}>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === "cancelled" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("cancelled")}
          >
            Cancelled
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left font-medium p-2">ID</th>
                    <th className="text-left font-medium p-2">Client</th>
                    <th className="text-left font-medium p-2">Date</th>
                    <th className="text-left font-medium p-2">Attractions</th>
                    <th className="text-left font-medium p-2">Price</th>
                    <th className="text-left font-medium p-2">Status</th>
                    <th className="text-right font-medium p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-2">{reservation.id}</td>
                      <td className="p-2">
                        {reservation.client
                          ? `${reservation.client.firstName} ${reservation.client.lastName}`
                          : "No client"}
                      </td>
                      <td className="p-2">
                        {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                        {new Date(reservation.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">{reservation.attractions.length}</td>
                      <td className="p-2">${reservation.totalPrice}</td>
                      <td className="p-2">
                        <Badge className={statusColors[reservation.status]}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1).replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenReservationModal(reservation)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenReservationModal(reservation)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenInvoiceModal(reservation)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteReservation(reservation.id)}>
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
  )
}
