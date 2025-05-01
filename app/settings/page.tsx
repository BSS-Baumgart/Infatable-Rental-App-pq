"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { users } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, Palette, Bell, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import UserManagement from "@/components/settings/user-management"
import PermissionsManagement from "@/components/settings/permissions-management"
import NotificationSettings from "@/components/settings/notification-settings"
import { useThemeContext } from "@/components/theme-provider"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation()
  const [activeTab, setActiveTab] = useState("general")
  const [currentUser] = useState(users[0]) // Using the first user as the current user
  const isAdmin = currentUser.role === "admin"
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const { themeOptions, setThemeOptions } = useThemeContext()

  const handleSaveAppearance = () => {
    toast({
      title: t("settings.saved"),
      description: "Your appearance settings have been updated successfully.",
    })
  }

  const handleSaveGeneral = () => {
    toast({
      title: t("settings.saved"),
      description: "Your general settings have been updated successfully.",
    })
  }

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const handleSystemThemeChange = (checked: boolean) => {
    if (checked) {
      setTheme("system")
    } else {
      setTheme(
        theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : "light",
      )
    }
  }

  const handleAccentColorChange = (color: "orange" | "blue" | "green" | "purple") => {
    setThemeOptions((prev) => ({ ...prev, accentColor: color }))
  }

  const handleCompactModeChange = (checked: boolean) => {
    setThemeOptions((prev) => ({ ...prev, compactMode: checked }))
  }

  const handleCollapsedSidebarChange = (checked: boolean) => {
    setThemeOptions((prev) => ({ ...prev, collapsedSidebar: checked }))
  }

  const tabsRef = useRef<HTMLDivElement>(null)

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 100
      const scrollPosition =
        direction === "left" ? tabsRef.current.scrollLeft - scrollAmount : tabsRef.current.scrollLeft + scrollAmount

      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

        <div className="relative flex items-center">
          <button
            onClick={() => scrollTabs("left")}
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md md:hidden"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={tabsRef} className="flex overflow-x-auto scrollbar-hide px-8 md:px-0">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full auto-cols-max grid-flow-col">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>{t("settings.general")}</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>{t("settings.appearance")}</span>
                </TabsTrigger>
                {isAdmin && (
                  <>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{t("settings.users")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{t("settings.permissions")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>{t("settings.notifications")}</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.generalSettings")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t("settings.companyInformation")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">{t("settings.companyName")}</Label>
                            <Input id="companyName" defaultValue="BouncyRent" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyEmail">{t("settings.companyEmail")}</Label>
                            <Input id="companyEmail" type="email" defaultValue="info@bouncyrent.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyPhone">{t("settings.companyPhone")}</Label>
                            <Input id="companyPhone" defaultValue="+48 123 456 789" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyAddress">{t("settings.companyAddress")}</Label>
                            <Input id="companyAddress" defaultValue="123 Main St, Warsaw, Poland" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t("settings.regionalSettings")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">{t("settings.language")}</Label>
                            <Select
                              value={language}
                              onValueChange={(value) => setLanguage(value as "en" | "pl" | "de" | "fr")}
                            >
                              <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">{t("language.en")}</SelectItem>
                                <SelectItem value="pl">{t("language.pl")}</SelectItem>
                                <SelectItem value="de">{t("language.de")}</SelectItem>
                                <SelectItem value="fr">{t("language.fr")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                            <Select defaultValue="europe-warsaw">
                              <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="europe-warsaw">Europe/Warsaw (GMT+1)</SelectItem>
                                <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                                <SelectItem value="america-new_york">America/New York (GMT-5)</SelectItem>
                                <SelectItem value="asia-tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateFormat">{t("settings.dateFormat")}</Label>
                            <Select defaultValue="dd-mm-yyyy">
                              <SelectTrigger id="dateFormat">
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                                <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">{t("settings.currency")}</Label>
                            <Select defaultValue="pln">
                              <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pln">Polish Złoty (PLN)</SelectItem>
                                <SelectItem value="eur">Euro (EUR)</SelectItem>
                                <SelectItem value="usd">US Dollar (USD)</SelectItem>
                                <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveGeneral}>{t("settings.saveSettings")}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.appearanceSettings")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t("settings.theme")}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="darkMode" className="font-medium">
                                {t("settings.darkMode")}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.enableDarkMode")}</p>
                            </div>
                            <Switch id="darkMode" checked={theme === "dark"} onCheckedChange={handleDarkModeChange} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="systemTheme" className="font-medium">
                                {t("settings.useSystemTheme")}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("settings.followSystemTheme")}
                              </p>
                            </div>
                            <Switch
                              id="systemTheme"
                              checked={theme === "system"}
                              onCheckedChange={handleSystemThemeChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t("settings.accentColor")}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full bg-orange-500 mb-2 cursor-pointer ${themeOptions.accentColor === "orange" ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                              onClick={() => handleAccentColorChange("orange")}
                            ></div>
                            <span className="text-sm">Orange</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full bg-blue-500 mb-2 cursor-pointer ${themeOptions.accentColor === "blue" ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                              onClick={() => handleAccentColorChange("blue")}
                            ></div>
                            <span className="text-sm">Blue</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full bg-green-500 mb-2 cursor-pointer ${themeOptions.accentColor === "green" ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                              onClick={() => handleAccentColorChange("green")}
                            ></div>
                            <span className="text-sm">Green</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full bg-purple-500 mb-2 cursor-pointer ${themeOptions.accentColor === "purple" ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
                              onClick={() => handleAccentColorChange("purple")}
                            ></div>
                            <span className="text-sm">Purple</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">{t("settings.layout")}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="compactMode" className="font-medium">
                                {t("settings.compactMode")}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("settings.compactModeDescription")}
                              </p>
                            </div>
                            <Switch
                              id="compactMode"
                              checked={themeOptions.compactMode}
                              onCheckedChange={handleCompactModeChange}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="sidebarCollapsed" className="font-medium">
                                {t("settings.collapsedSidebar")}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("settings.collapsedSidebarDescription")}
                              </p>
                            </div>
                            <Switch
                              id="sidebarCollapsed"
                              checked={themeOptions.collapsedSidebar}
                              onCheckedChange={handleCollapsedSidebarChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveAppearance} style={{ backgroundColor: "var(--accent-color)" }}>
                          {t("settings.saveAppearance")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isAdmin && (
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="permissions">
                  <PermissionsManagement />
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="notifications">
                  <NotificationSettings />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <button
            onClick={() => scrollTabs("right")}
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md md:hidden"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </AppLayout>
  )
}
