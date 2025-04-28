"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { reservations } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReservationStatus, Reservation } from "@/lib/types"
import ReservationWizard from "@/components/modals/reservation-wizard"
import { useToast } from "@/components/ui/use-toast"

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const { toast } = useToast()

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // Create array of days for the calendar
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i))
  }

  // Get reservations for the current month
  const monthReservations = reservations.filter((reservation) => {
    const startDate = new Date(reservation.startDate)
    return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear
  })

  // Group reservations by day
  const reservationsByDay = monthReservations.reduce(
    (acc, reservation) => {
      const startDate = new Date(reservation.startDate)
      const day = startDate.getDate()

      if (!acc[day]) {
        acc[day] = []
      }

      acc[day].push(reservation)
      return acc
    },
    {} as Record<number, typeof reservations>,
  )

  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleOpenModal = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentReservation(null)
  }

  const handleSaveReservation = (data: Partial<Reservation>) => {
    // In a real app, this would update the reservation in the database
    toast({
      title: "Reservation updated",
      description: `Reservation #${currentReservation?.id} has been updated successfully.`,
    })
    handleCloseModal()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 font-medium text-sm border-b border-gray-200 dark:border-gray-800">
                  {day}
                </div>
              ))}

              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-1 border border-gray-200 dark:border-gray-800 ${
                    day &&
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear()
                      ? "bg-gray-50 dark:bg-gray-900"
                      : ""
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-right p-1 font-medium text-sm">{day.getDate()}</div>
                      <div className="space-y-1">
                        {reservationsByDay[day.getDate()]?.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                            onClick={() => handleOpenModal(reservation)}
                          >
                            <Badge className={`${statusColors[reservation.status]} w-full justify-between`}>
                              <span className="truncate">{reservation.client.lastName}</span>
                              <span className="ml-1">${reservation.totalPrice}</span>
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ReservationWizard
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={currentReservation}
        onSave={handleSaveReservation}
      />
    </AppLayout>
  )
}
