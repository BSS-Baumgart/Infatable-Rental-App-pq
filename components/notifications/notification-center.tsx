"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/lib/contexts/notification-context"
import { useTranslation } from "@/lib/i18n/translation-context"
import { formatDistanceToNow } from "date-fns"
import { pl, enUS } from "date-fns/locale"

export function NotificationCenter() {
  const { t, language } = useTranslation()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getLocale = () => {
    return language === "pl" ? pl : enUS
  }

  const formatTimeAgo = (date: Date) => {
    const distance = formatDistanceToNow(date, { locale: getLocale(), addSuffix: true })
    return distance
  }

  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-500"
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors relative"
          variant="ghost"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-[10px] font-medium flex items-center justify-center rounded-full bg-red-500 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="font-semibold p-0">{t("notifications.title")}</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              <Check className="h-3 w-3 mr-1" />
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("notifications.noNotifications")}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                  !notification.read ? "bg-gray-50 dark:bg-gray-900/50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`mr-2 h-2 w-2 rounded-full ${getNotificationTypeClass(notification.type)}`} />
                    <p className="font-medium text-sm">{notification.title}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-4 mt-1">{notification.message}</p>
                {notification.actionUrl && (
                  <div className="pl-4 mt-2">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-6 p-0 text-xs text-blue-600 dark:text-blue-400"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      {t("notifications.actions.view")}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link
            href="/notifications"
            className="text-center text-sm font-medium text-blue-600 dark:text-blue-400 w-full"
          >
            {t("notifications.viewAll")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
