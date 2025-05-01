"use client"

import { useEffect } from "react"
import { useNotifications } from "@/lib/contexts/notification-context"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n/translation-context"

export function NotificationToast() {
  const { notifications, markAsRead } = useNotifications()
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // Find the most recent unread notification
    const unreadNotifications = notifications.filter((n) => !n.read)
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0]

      // Show toast for the latest notification
      toast({
        title: latestNotification.title,
        description: latestNotification.message,
        variant: latestNotification.type === "error" ? "destructive" : "default",
        // Zamiast obiektu action, używamy komponentu React
        action: latestNotification.actionUrl ? (
          <button
            className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              markAsRead(latestNotification.id)
              window.location.href = latestNotification.actionUrl!
            }}
          >
            {t("notifications.actions.view")}
          </button>
        ) : undefined,
        onOpenChange: (open) => {
          if (!open) {
            markAsRead(latestNotification.id)
          }
        },
      })
    }
  }, [notifications.length])

  return null
}
