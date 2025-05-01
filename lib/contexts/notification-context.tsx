"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Notification, NotificationContextType } from "../types/notifications"

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications)
        // Convert string dates back to Date objects
        const notificationsWithDates = parsedNotifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }))
        setNotifications(notificationsWithDates)
      } catch (error) {
        console.error("Failed to parse stored notifications:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
