"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { reservations } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Grid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReservationStatus, Reservation } from "@/lib/types"
import ReservationWizard from "@/components/modals/reservation-wizard"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

type CalendarView = "month" | "list"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<CalendarView>("month")
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Set default view based on screen size
  useEffect(() => {
    setView(isMobile ? "list" : "month")
  }, [isMobile])

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

  // Sort reservations by date for list view
  const sortedReservations = [...monthReservations].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })

  // Group reservations by date for list view
  const reservationsByDate = sortedReservations.reduce(
    (acc, reservation) => {
      const date = new Date(reservation.startDate).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(reservation)
      return acc
    },
    {} as Record<string, typeof reservations>,
  )

  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleOpenModal = (reservation?: Reservation, date?: Date) => {
    setCurrentReservation(reservation || null)
    setSelectedDate(date || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentReservation(null)
    setSelectedDate(null)
  }

  const handleDayClick = (day: Date) => {
    // Open the modal with the selected date
    handleOpenModal(undefined, day)
  }

  const handleSaveReservation = (data: Partial<Reservation>) => {
    // In a real app, this would update the reservation in the database
    toast({
      title: currentReservation ? "Reservation updated" : "Reservation created",
      description: currentReservation
        ? `Reservation #${currentReservation?.id} has been updated successfully.`
        : "New reservation has been created successfully.",
    })
    handleCloseModal()
  }

  const toggleView = () => {
    setView(view === "month" ? "list" : "month")
  }

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Calendar</h1>
            <Button onClick={() => handleOpenModal()} size="sm" className="md:ml-2">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Reservation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium text-sm md:text-base text-center min-w-[120px]">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleView}
              className="ml-2"
              title={view === "month" ? "Switch to list view" : "Switch to month view"}
            >
              {view === "month" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              <span className="sr-only md:not-sr-only md:ml-2">{view === "month" ? "List" : "Month"}</span>
            </Button>
          </div>
        </div>

        {view === "month" ? (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <div className="grid grid-cols-7 text-center min-w-[700px]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 font-medium text-sm border-b border-gray-200 dark:border-gray-800">
                    {day}
                  </div>
                ))}

                {days.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] md:min-h-[120px] p-1 border border-gray-200 dark:border-gray-800",
                      day &&
                        day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth() &&
                        day.getFullYear() === new Date().getFullYear()
                        ? "bg-gray-50 dark:bg-gray-900"
                        : "",
                      day ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50" : "",
                    )}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <>
                        <div className="text-right p-1 font-medium text-sm">{day.getDate()}</div>
                        <div className="space-y-1 max-h-[80px] overflow-y-auto">
                          {reservationsByDay[day.getDate()]?.map((reservation) => (
                            <div
                              key={reservation.id}
                              className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent triggering the day click
                                handleOpenModal(reservation)
                              }}
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
        ) : (
          <Card>
            <CardContent className="p-4">
              {Object.keys(reservationsByDate).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(reservationsByDate).map(([date, dayReservations]) => (
                    <div key={date} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </h3>
                      </div>
                      <div className="space-y-2 pl-6">
                        {dayReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            onClick={() => handleOpenModal(reservation)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {reservation.client.firstName} {reservation.client.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {reservation.attractions.map((a) => a.name).join(", ")}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge className={statusColors[reservation.status]}>{reservation.status}</Badge>
                                <div className="text-sm font-medium mt-1">${reservation.totalPrice}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(reservation.startDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {new Date(reservation.endDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No reservations found for this month</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ReservationWizard
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={currentReservation}
        onSave={handleSaveReservation}
        initialDate={selectedDate}
      />
    </AppLayout>
  )
}
