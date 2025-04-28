"use client"

import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardStats, reservations } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { BarChart2, Calendar, Package, Users } from "lucide-react"
import type { ReservationStatus } from "@/lib/types"

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalReservations}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dashboardStats.reservationsByStatus.pending} pending
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.totalRevenue}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">From all reservations</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.slice(0, 5).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      {reservation.client.firstName} {reservation.client.lastName}
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
            </div>
          </CardContent>
        </Card>

        {/* Popular Attractions */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardStats.popularAttractions.map(({ attraction, count }) => (
                <div
                  key={attraction.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
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
    </AppLayout>
  )
}
