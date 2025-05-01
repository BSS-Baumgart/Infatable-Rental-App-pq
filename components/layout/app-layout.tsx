"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AppSidebar from "./app-sidebar"
import TopNav from "./top-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { useTranslation } from "@/lib/i18n/translation-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0C]">
      <AppSidebar />
      <div
        className={`flex flex-col ${isMobile ? "ml-0" : "ml-64"} min-h-screen transition-all duration-300 ease-in-out`}
      >
        <TopNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
