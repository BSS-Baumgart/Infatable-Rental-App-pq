"use client"

import { type ReactNode, useState, useEffect } from "react"
import AppSidebar from "./app-sidebar"
import TopNav from "./top-nav"
import { useTheme } from "next-themes"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      <AppSidebar />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-white dark:bg-[#0F0F12]">{children}</main>
      </div>
    </div>
  )
}
