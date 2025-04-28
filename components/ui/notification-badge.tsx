"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
}

export function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Reservation",
      message: "John Doe has made a new reservation for Vibrant Kingdom Bounce",
      time: "10 minutes ago",
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Maintenance Due",
      message: "Pirate Adventure Bounce is due for maintenance check",
      time: "1 hour ago",
      read: false,
      type: "warning",
    },
    {
      id: "3",
      title: "Payment Received",
      message: "Payment of $250 received for reservation #1234",
      time: "3 hours ago",
      read: true,
      type: "success",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors relative"
          variant="ghost"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-[10px] font-medium flex items-center justify-center rounded-full bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="font-semibold p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-default ${!notification.read ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="space-y-1 w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div
                        className={`mr-2 h-2 w-2 rounded-full ${
                          notification.type === "info"
                            ? "bg-blue-500"
                            : notification.type === "success"
                              ? "bg-green-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                      />
                      <p className="font-medium text-sm">{notification.title}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{notification.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-4">{notification.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
