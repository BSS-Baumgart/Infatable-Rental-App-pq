"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/lib/i18n/translation-context"
import { useThemeContext } from "@/components/theme-provider"

interface SidebarProps {
  className?: string
}

export default function AppSidebar({ className }: SidebarProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { themeOptions } = useThemeContext()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const sidebarItems = [
    // Grupa 1: Zarządzanie główne
    {
      title: t("sidebar.dashboard"),
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      group: "main",
    },
    {
      title: t("sidebar.calendar"),
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
      group: "main",
    },
    {
      title: t("sidebar.reservations"),
      href: "/reservations",
      icon: <FileText className="h-5 w-5" />,
      group: "main",
    },
    // Grupa 2: Zasoby
    {
      title: t("sidebar.attractions"),
      href: "/attractions",
      icon: <Package className="h-5 w-5" />,
      group: "resources",
    },
    {
      title: t("sidebar.clients"),
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
      group: "resources",
    },
    {
      title: t("sidebar.invoices"),
      href: "/invoices",
      icon: <CreditCard className="h-5 w-5" />,
      group: "resources",
    },
    {
      title: t("sidebar.documents"),
      href: "/documents",
      icon: <FileText className="h-5 w-5" />,
      group: "resources",
    },
    // Grupa 3: System
    {
      title: t("sidebar.reports"),
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      group: "system",
    },
    {
      title: t("sidebar.settings"),
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      group: "system",
    },
  ]

  // Grupowanie elementów menu
  const groupedItems = {
    main: {
      label: t("sidebar.groups.main"),
      items: sidebarItems.filter((item) => item.group === "main"),
    },
    resources: {
      label: t("sidebar.groups.resources"),
      items: sidebarItems.filter((item) => item.group === "resources"),
    },
    system: {
      label: t("sidebar.groups.system"),
      items: sidebarItems.filter((item) => item.group === "system"),
    },
  }

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
          aria-label={isOpen ? t("common.closeSidebar") : t("common.openSidebar")}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      <div
        className={cn("fixed inset-0 z-40 bg-black/80 md:hidden", isOpen ? "block" : "hidden")}
        onClick={closeSidebar}
      />

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
          !isMobile && "translate-x-0",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="h-8 w-8 overflow-hidden">
                <img
                  src={themeOptions.logoUrl || "/bouncy-castle.png"}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl">{t("sidebar.appName")}</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {Object.entries(groupedItems).map(([groupKey, group], index) => (
              <div key={groupKey}>
                {index > 0 && <div className="my-2 mx-3 border-t border-gray-200 dark:border-gray-800"></div>}
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                </div>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href || pathname?.startsWith(`${item.href}/`)
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" className="w-full justify-start" onClick={() => console.log("Logout")}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
