"use client"

import { useState, useMemo } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardStats, reservations as allReservations } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { BarChart2, Calendar, Package, Users, ArrowRight, Filter, TrendingUp } from "lucide-react"
import type { ReservationStatus, Reservation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import ReservationWizard from "@/components/modals/reservation-wizard"
import { useToast } from "@/components/ui/use-toast"

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

type TimeFilter = "week" | "month" | "year" | "all"
type GroupBy = "week" | "month"

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [groupBy, setGroupBy] = useState<GroupBy>("week")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Filter reservations based on time filter
  const filteredReservations = useMemo(() => {
    const now = new Date()
    const filterDate = new Date()

    switch (timeFilter) {
      case "week":
        filterDate.setDate(now.getDate() - 7)
        break
      case "month":
        filterDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        // "all" - no filtering
        return allReservations
    }

    return allReservations.filter((reservation) => new Date(reservation.createdAt) >= filterDate)
  }, [timeFilter])

  // Prepare data for the bar chart
  const barChartData = useMemo(() => {
    const data: Record<string, number> = {}
    const now = new Date()

    filteredReservations.forEach((reservation) => {
      const date = new Date(reservation.createdAt)
      let key: string

      if (groupBy === "week") {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        key = `Week ${weekNumber}`
      } else {
        // Get month name
        key = date.toLocaleString("default", { month: "short" })
      }

      data[key] = (data[key] || 0) + 1
    })

    // Convert to array format for Recharts
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredReservations, groupBy])

  // Prepare data for the pie chart
  const pieChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    }

    filteredReservations.forEach((reservation) => {
      statusCounts[reservation.status] = (statusCounts[reservation.status] || 0) + 1
    })

    // Convert to array format for Recharts
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
    }))
  }, [filteredReservations])

  // Calculate total revenue for filtered reservations
  const totalRevenue = useMemo(() => {
    return filteredReservations.reduce((sum, reservation) => sum + reservation.totalPrice, 0)
  }, [filteredReservations])

  const handleViewReservation = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentReservation(null)
  }

  const handleSaveReservation = (data: Partial<Reservation>) => {
    toast({
      title: "Reservation updated",
      description: `Reservation #${currentReservation?.id} has been updated successfully.`,
    })
    handleCloseModal()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Time Period:</span>
              <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Group By:</span>
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredReservations.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredReservations.filter((r) => r.status === "pending").length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalClients}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active customer base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Attractions</CardTitle>
              <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalAttractions}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Available for rent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {timeFilter === "all" ? "All time" : `Last ${timeFilter}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Reservations by {groupBy === "week" ? "Week" : "Month"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ec4899" name="Reservations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Reservation Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reservations</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push("/reservations")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReservations.slice(0, 5).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleViewReservation(reservation)}
                >
                  <div>
                    <div className="font-medium">
                      {reservation.client?.firstName} {reservation.client?.lastName || "Unknown Client"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                      {new Date(reservation.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {reservation.attractions.length} attraction(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">${reservation.totalPrice}</div>
                      <Badge className={statusColors[reservation.status]}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1).replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {filteredReservations.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No reservations found for the selected time period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Attractions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Popular Attractions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push("/attractions")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardStats.popularAttractions.map(({ attraction, count }) => (
                <div
                  key={attraction.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                  onClick={() => router.push(`/attractions/${attraction.id}`)}
                >
                  <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">{attraction.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Booked {count} times</div>
                  </div>
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
