export type NotificationType = "info" | "success" | "warning" | "error"
export type NotificationCategory = "reservation" | "payment" | "maintenance" | "system"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  createdAt: Date
  read: boolean
  actionUrl?: string
  data?: Record<string, any>
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}
