"use client"

import type React from "react"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n/translation-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: t("profile.profileUpdated"),
      description: new Date().toLocaleTimeString(),
    })
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: t("profile.passwordChanged"),
      description: new Date().toLocaleTimeString(),
    })
  }

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: t("profile.settingsSaved"),
      description: new Date().toLocaleTimeString(),
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">John Doe</h2>
                <p className="text-muted-foreground">john.doe@example.com</p>
                <div className="mt-4 space-y-2 w-full">
                  <Button variant="outline" className="w-full">
                    {t("profile.uploadPhoto")}
                  </Button>
                  <Button variant="outline" className="w-full text-destructive">
                    {t("profile.removePhoto")}
                  </Button>
                </div>
                <div className="mt-6 w-full border-t pt-4">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t("profile.lastLogin")}</span>
                    <span>2023-04-15</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t("profile.memberSince")}</span>
                    <span>2022-01-10</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t("profile.accountType")}</span>
                    <span>Administrator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="personal">{t("profile.personalInfo")}</TabsTrigger>
                <TabsTrigger value="security">{t("profile.accountSettings")}</TabsTrigger>
                <TabsTrigger value="notifications">{t("profile.notifications")}</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.personalInfo")}</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSaveProfile}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                          <Input id="firstName" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                          <Input id="lastName" defaultValue="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("profile.email")}</Label>
                        <Input id="email" type="email" defaultValue="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("profile.phone")}</Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">{t("profile.position")}</Label>
                          <Input id="position" defaultValue="Manager" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">{t("profile.department")}</Label>
                          <Input id="department" defaultValue="Operations" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">{t("profile.language")}</Label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="pl">Polski</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">{t("profile.timezone")}</Label>
                          <Select defaultValue="utc">
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">Eastern Time (ET)</SelectItem>
                              <SelectItem value="cet">Central European Time (CET)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">{t("profile.cancel")}</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : t("profile.saveChanges")}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{t("profile.changePassword")}</CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleChangePassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">{t("profile.cancel")}</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : t("profile.saveChanges")}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{t("profile.twoFactorAuth")}</CardTitle>
                    <CardDescription>{t("profile.twoFactorDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Switch id="twoFactor" />
                      <Label htmlFor="twoFactor">{t("profile.enableTwoFactor")}</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">{t("profile.deleteAccount")}</CardTitle>
                    <CardDescription>{t("profile.deleteAccountWarning")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">{t("profile.iUnderstand")}</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.notifications")}</CardTitle>
                    <CardDescription>Configure how you want to receive notifications.</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSaveSettings}>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("profile.emailNotifications")}</p>
                          <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                        </div>
                        <Switch id="emailNotifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("profile.smsNotifications")}</p>
                          <p className="text-sm text-muted-foreground">Receive notifications via SMS.</p>
                        </div>
                        <Switch id="smsNotifications" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("profile.pushNotifications")}</p>
                          <p className="text-sm text-muted-foreground">Receive push notifications in the app.</p>
                        </div>
                        <Switch id="pushNotifications" defaultChecked />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">{t("profile.cancel")}</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : t("profile.saveChanges")}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
