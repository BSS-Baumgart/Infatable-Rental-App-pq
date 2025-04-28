"use client"

import type React from "react"

import {
  BarChart2,
  Calendar,
  FileText,
  Package,
  Users,
  Settings,
  HelpCircle,
  Menu,
  Home,
  Folder,
  User,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { users } from "@/lib/mock-data"
import { useThemeContext } from "@/components/theme-provider"

export function AppSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const currentUser = users[0] // Using the first user as the current user
  const isAdmin = currentUser.role === "admin"
  const { themeOptions } = useThemeContext()

  // Apply sidebar collapsed state from theme options
  useEffect(() => {
    setIsSidebarCollapsed(themeOptions.collapsedSidebar)
  }, [themeOptions.collapsedSidebar])

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
    adminOnly = false,
  }: {
    href: string
    icon: any
    children: React.ReactNode
    adminOnly?: boolean
  }) {
    // Skip rendering if this is an admin-only item and the user is not an admin
    if (adminOnly && !isAdmin) {
      return null
    }

    const isActive = pathname === href

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? "bg-gray-100 text-gray-900 dark:bg-[#1F1F23] dark:text-white"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
            `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                BC
              </div>
              {!isSidebarCollapsed && (
                <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                  BouncyRent
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div
                  className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? "text-center" : ""}`}
                >
                  {!isSidebarCollapsed ? "Main" : ""}
                </div>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    {!isSidebarCollapsed && "Dashboard"}
                  </NavItem>
                  <NavItem href="/calendar" icon={Calendar}>
                    {!isSidebarCollapsed && "Calendar"}
                  </NavItem>
                  <NavItem href="/reservations" icon={BarChart2}>
                    {!isSidebarCollapsed && "Reservations"}
                  </NavItem>
                </div>
              </div>

              <div>
                <div
                  className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? "text-center" : ""}`}
                >
                  {!isSidebarCollapsed ? "Management" : ""}
                </div>
                <div className="space-y-1">
                  <NavItem href="/attractions" icon={Package}>
                    {!isSidebarCollapsed && "Attractions"}
                  </NavItem>
                  <NavItem href="/clients" icon={Users}>
                    {!isSidebarCollapsed && "Clients"}
                  </NavItem>
                  <NavItem href="/invoices" icon={FileText}>
                    {!isSidebarCollapsed && "Invoices"}
                  </NavItem>
                  <NavItem href="/documents" icon={Folder}>
                    {!isSidebarCollapsed && "Documents"}
                  </NavItem>
                </div>
              </div>

              <div>
                <div
                  className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? "text-center" : ""}`}
                >
                  {!isSidebarCollapsed ? "Account" : ""}
                </div>
                <div className="space-y-1">
                  <NavItem href="/profile" icon={User}>
                    {!isSidebarCollapsed && "My Profile"}
                  </NavItem>
                  <NavItem href="/settings" icon={Settings}>
                    {!isSidebarCollapsed && "Settings"}
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="/help" icon={HelpCircle}>
                {!isSidebarCollapsed && "Help"}
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
