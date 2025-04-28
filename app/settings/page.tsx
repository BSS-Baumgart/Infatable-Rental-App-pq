"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { users } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, Shield, Palette } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import UserManagement from "@/components/settings/user-management"
import PermissionsManagement from "@/components/settings/permissions-management"

export default function SettingsPage() {
  const [currentUser] = useState(users[0]) // Using the first user as the current user
  const isAdmin = currentUser.role === "admin"
  const { toast } = useToast()

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance settings saved",
      description: "Your appearance settings have been updated successfully.",
    })
  }

  const handleSaveGeneral = () => {
    toast({
      title: "General settings saved",
      description: "Your general settings have been updated successfully.",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="permissions">
                  <Shield className="h-4 w-4 mr-2" />
                  Permissions
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" defaultValue="BouncyRent" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Company Email</Label>
                        <Input id="companyEmail" type="email" defaultValue="info@bouncyrent.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyPhone">Company Phone</Label>
                        <Input id="companyPhone" defaultValue="+48 123 456 789" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Input id="companyAddress" defaultValue="123 Main St, Warsaw, Poland" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Regional Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pl">Polish</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
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
                        <Label htmlFor="dateFormat">Date Format</Label>
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
                        <Label htmlFor="currency">Currency</Label>
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
                    <Button onClick={handleSaveGeneral}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="darkMode" className="font-medium">
                            Dark Mode
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable dark mode for the application
                          </p>
                        </div>
                        <Switch id="darkMode" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="systemTheme" className="font-medium">
                            Use System Theme
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Follow your system's theme settings
                          </p>
                        </div>
                        <Switch id="systemTheme" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Accent Color</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-pink-500 mb-2 cursor-pointer ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-gray-900"></div>
                        <span className="text-sm">Pink</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500 mb-2 cursor-pointer"></div>
                        <span className="text-sm">Blue</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-500 mb-2 cursor-pointer"></div>
                        <span className="text-sm">Green</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-purple-500 mb-2 cursor-pointer"></div>
                        <span className="text-sm">Purple</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Layout</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="compactMode" className="font-medium">
                            Compact Mode
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Use a more compact layout with less whitespace
                          </p>
                        </div>
                        <Switch id="compactMode" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sidebarCollapsed" className="font-medium">
                            Collapsed Sidebar by Default
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Start with the sidebar collapsed</p>
                        </div>
                        <Switch id="sidebarCollapsed" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance}>Save Appearance</Button>
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
        </Tabs>
      </div>
    </AppLayout>
  )
}
