"use client"
import { Moon, Sun, User, Search, Globe, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n/translation-context"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/contexts/notification-context"
import { formatDistanceToNow } from "date-fns"
import { pl, enUS } from "date-fns/locale"
import { useAuth } from "@/lib/auth-context"

interface TopNavProps {
  className?: string
}

export default function TopNav({ className }: TopNavProps) {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const [searchVisible, setSearchVisible] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()

  // Ustaw mounted na true po zamontowaniu komponentu
  useEffect(() => {
    setMounted(true)
  }, [])

  // Funkcje obsługujące kliknięcia
  const handleThemeChange = () => {
    console.log("Current theme:", theme)
    const newTheme = theme === "dark" ? "light" : "dark"
    console.log("Changing theme to:", newTheme)
    setTheme(newTheme)
  }

  const handleLanguageChange = () => {
    // Przełączanie między językami (en -> pl -> en)
    const newLanguage = language === "en" ? "pl" : "en"
    console.log("Changing language to:", newLanguage)
    setLanguage(newLanguage)
  }

  const handleProfileClick = () => {
    console.log("Profile clicked")
    setProfileMenuOpen(!profileMenuOpen)
    setNotificationsMenuOpen(false)
  }

  const handleNotificationsClick = () => {
    console.log("Notifications clicked")
    setNotificationsMenuOpen(!notificationsMenuOpen)
    setProfileMenuOpen(false)
  }

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path)
    setProfileMenuOpen(false)
    router.push(path)
  }

  const handleLogout = async () => {
    console.log("Logout clicked")
    setProfileMenuOpen(false)
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

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

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (profileMenuOpen && !target.closest(".profile-menu-container")) {
        setProfileMenuOpen(false)
      }
      if (notificationsMenuOpen && !target.closest(".notifications-menu-container")) {
        setNotificationsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileMenuOpen, notificationsMenuOpen])

  return (
    <div
      className={`h-16 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between ${className}`}
    >
      {/* Left side - Search */}
      <div className="flex items-center">
        {searchVisible ? (
          <div className="relative">
            <Input
              type="text"
              placeholder={t("common.search")}
              className="w-64 pl-10"
              autoFocus
              onBlur={() => setSearchVisible(false)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setSearchVisible(true)} aria-label={t("common.search")}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleLanguageChange}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{language === "en" ? "English" : "Polski"}</span>
        </Button>

        {/* Notifications */}
        <div className="relative notifications-menu-container">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotificationsClick}
            aria-label={t("common.notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 text-[10px] font-medium flex items-center justify-center rounded-full bg-red-500 text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          {notificationsMenuOpen && (
            <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-50 w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">{t("notifications.title")}</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                    {t("notifications.markAllRead")}
                  </Button>
                )}
              </div>
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
                            <span className="sr-only">{t("common.remove")}</span>
                            <span aria-hidden="true">&times;</span>
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
                            onClick={() => {
                              markAsRead(notification.id)
                              router.push(notification.actionUrl!)
                              setNotificationsMenuOpen(false)
                            }}
                          >
                            {t("notifications.actions.view")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push("/notifications")
                    setNotificationsMenuOpen(false)
                  }}
                >
                  {t("notifications.viewAll")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <Button variant="ghost" size="icon" onClick={handleThemeChange}>
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        )}

        {/* User Menu */}
        <div className="relative profile-menu-container">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleProfileClick}>
            <User className="h-5 w-5" />
          </Button>
          {profileMenuOpen && (
            <div className="flex flex-col gap-1 absolute top-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-2 z-50 min-w-[150px]">
              <Button variant="ghost" size="sm" onClick={() => handleNavigate("/profile")}>
                {t("common.profile")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleNavigate("/settings")}>
                {t("common.settings")}
              </Button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t("common.logout")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
