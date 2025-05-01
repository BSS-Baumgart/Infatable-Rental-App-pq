"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/contexts/notification-context"
import { useTranslation } from "@/lib/i18n/translation-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function NotificationDemo() {
  const { t } = useTranslation()
  const { addNotification } = useNotifications()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info")
  const [category, setCategory] = useState<"reservation" | "payment" | "maintenance" | "system">("system")

  const handleAddNotification = () => {
    if (!title || !message) return

    addNotification({
      title,
      message,
      type,
      category,
      read: false,
      actionUrl: "/notifications",
    })

    // Reset form
    setTitle("")
    setMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.demo.title")}</CardTitle>
        <CardDescription>{t("notifications.demo.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="notification-type" className="text-sm font-medium">
              {t("notifications.demo.type")}
            </label>
            <Select value={type} onValueChange={(value) => setType(value as any)}>
              <SelectTrigger id="notification-type">
                <SelectValue placeholder={t("notifications.demo.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{t("notifications.demo.types.info")}</SelectItem>
                <SelectItem value="success">{t("notifications.demo.types.success")}</SelectItem>
                <SelectItem value="warning">{t("notifications.demo.types.warning")}</SelectItem>
                <SelectItem value="error">{t("notifications.demo.types.error")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="notification-category" className="text-sm font-medium">
              {t("notifications.demo.category")}
            </label>
            <Select value={category} onValueChange={(value) => setCategory(value as any)}>
              <SelectTrigger id="notification-category">
                <SelectValue placeholder={t("notifications.demo.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reservation">{t("notifications.demo.categories.reservation")}</SelectItem>
                <SelectItem value="payment">{t("notifications.demo.categories.payment")}</SelectItem>
                <SelectItem value="maintenance">{t("notifications.demo.categories.maintenance")}</SelectItem>
                <SelectItem value="system">{t("notifications.demo.categories.system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="notification-title" className="text-sm font-medium">
            {t("notifications.demo.notificationTitle")}
          </label>
          <Input
            id="notification-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("notifications.demo.titlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="notification-message" className="text-sm font-medium">
            {t("notifications.demo.notificationMessage")}
          </label>
          <Textarea
            id="notification-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("notifications.demo.messagePlaceholder")}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddNotification} disabled={!title || !message}>
          {t("notifications.demo.addNotification")}
        </Button>
      </CardFooter>
    </Card>
  )
}
