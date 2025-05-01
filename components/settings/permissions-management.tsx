"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "@/lib/i18n/translation-context"

// Define component permissions structure
interface ComponentPermission {
  id: string
  name: string
  description: string
  enabled: boolean
  roles: {
    admin: boolean
    employee: boolean
  }
}

// Define role permissions structure
interface RolePermission {
  id: string
  name: string
  description: string
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
}

export default function PermissionsManagement() {
  const { t } = useTranslation()
  // Initial component permissions
  const [componentPermissions, setComponentPermissions] = useState<ComponentPermission[]>([
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Access to the main dashboard",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "calendar",
      name: "Calendar",
      description: "Access to the calendar view",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "reservations",
      name: "Reservations",
      description: "Access to reservations management",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "attractions",
      name: "Attractions",
      description: "Access to attractions management",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "clients",
      name: "Clients",
      description: "Access to client management",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "invoices",
      name: "Invoices",
      description: "Access to invoice management",
      enabled: true,
      roles: {
        admin: true,
        employee: false,
      },
    },
    {
      id: "documents",
      name: "Documents",
      description: "Access to document management",
      enabled: true,
      roles: {
        admin: true,
        employee: true,
      },
    },
    {
      id: "settings",
      name: "Settings",
      description: "Access to system settings",
      enabled: true,
      roles: {
        admin: true,
        employee: false,
      },
    },
  ])

  // Initial role permissions
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    {
      id: "reservations",
      name: "Reservations",
      description: "Permissions for reservation management",
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    {
      id: "clients",
      name: "Clients",
      description: "Permissions for client management",
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    {
      id: "attractions",
      name: "Attractions",
      description: "Permissions for attraction management",
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    {
      id: "invoices",
      name: "Invoices",
      description: "Permissions for invoice management",
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    {
      id: "documents",
      name: "Documents",
      description: "Permissions for document management",
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  ])

  const [selectedRole, setSelectedRole] = useState<string>("employee")
  const { toast } = useToast()

  const handleComponentPermissionChange = (id: string, field: string, value: boolean) => {
    setComponentPermissions((prev) =>
      prev.map((permission) => {
        if (permission.id === id) {
          if (field === "enabled") {
            return { ...permission, enabled: value }
          } else if (field === "admin" || field === "employee") {
            return {
              ...permission,
              roles: {
                ...permission.roles,
                [field]: value,
              },
            }
          }
        }
        return permission
      }),
    )
  }

  const handleRolePermissionChange = (id: string, action: string, value: boolean) => {
    setRolePermissions((prev) =>
      prev.map((permission) => {
        if (permission.id === id) {
          return {
            ...permission,
            permissions: {
              ...permission.permissions,
              [action]: value,
            },
          }
        }
        return permission
      }),
    )
  }

  const handleSavePermissions = () => {
    toast({
      title: t("settings.permissionsSaved"),
      description: t("settings.permissionsSavedDescription"),
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="components" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="components">{t("settings.componentVisibility")}</TabsTrigger>
          <TabsTrigger value="actions">{t("settings.actionPermissions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.permissions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("settings.roles")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("settings.admin")}</SelectItem>
                      <SelectItem value="employee">{t("settings.staff")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">{t("settings.component")}</th>
                        <th className="text-left font-medium p-2">{t("settings.description")}</th>
                        <th className="text-center font-medium p-2">{t("settings.enabled")}</th>
                        <th className="text-center font-medium p-2">
                          {selectedRole === "admin" ? t("settings.adminAccess") : t("settings.employeeAccess")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentPermissions.map((permission) => (
                        <tr key={permission.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-2 font-medium">
                            {permission.name === "Dashboard"
                              ? t("nav.dashboard")
                              : permission.name === "Calendar"
                                ? t("nav.calendar")
                                : permission.name === "Reservations"
                                  ? t("nav.reservations")
                                  : permission.name === "Attractions"
                                    ? t("nav.attractions")
                                    : permission.name === "Clients"
                                      ? t("nav.clients")
                                      : permission.name === "Invoices"
                                        ? t("nav.invoices")
                                        : permission.name === "Documents"
                                          ? t("nav.documents")
                                          : permission.name === "Settings"
                                            ? t("nav.settings")
                                            : permission.name}
                          </td>
                          <td className="p-2">{permission.description}</td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={permission.enabled}
                                onCheckedChange={(checked) =>
                                  handleComponentPermissionChange(permission.id, "enabled", checked)
                                }
                              />
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={permission.roles[selectedRole as keyof typeof permission.roles]}
                                onCheckedChange={(checked) =>
                                  handleComponentPermissionChange(permission.id, selectedRole, checked)
                                }
                                disabled={!permission.enabled}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePermissions}>{t("settings.savePermissions")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.actionPermissionsByRole")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("settings.roles")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("settings.admin")}</SelectItem>
                      <SelectItem value="employee">{t("settings.staff")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">{t("settings.module")}</th>
                        <th className="text-center font-medium p-2">{t("common.create")}</th>
                        <th className="text-center font-medium p-2">{t("common.read")}</th>
                        <th className="text-center font-medium p-2">{t("common.edit")}</th>
                        <th className="text-center font-medium p-2">{t("common.delete")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolePermissions.map((permission) => (
                        <tr key={permission.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">
                                {permission.name === "Reservations"
                                  ? t("nav.reservations")
                                  : permission.name === "Clients"
                                    ? t("nav.clients")
                                    : permission.name === "Attractions"
                                      ? t("nav.attractions")
                                      : permission.name === "Invoices"
                                        ? t("nav.invoices")
                                        : permission.name === "Documents"
                                          ? t("nav.documents")
                                          : permission.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</div>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={selectedRole === "admin" ? true : permission.permissions.create}
                                onCheckedChange={(checked) =>
                                  handleRolePermissionChange(permission.id, "create", checked)
                                }
                                disabled={selectedRole === "admin"} // Admin always has all permissions
                              />
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={selectedRole === "admin" ? true : permission.permissions.read}
                                onCheckedChange={(checked) =>
                                  handleRolePermissionChange(permission.id, "read", checked)
                                }
                                disabled={selectedRole === "admin"}
                              />
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={selectedRole === "admin" ? true : permission.permissions.update}
                                onCheckedChange={(checked) =>
                                  handleRolePermissionChange(permission.id, "update", checked)
                                }
                                disabled={selectedRole === "admin"}
                              />
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={selectedRole === "admin" ? true : permission.permissions.delete}
                                onCheckedChange={(checked) =>
                                  handleRolePermissionChange(permission.id, "delete", checked)
                                }
                                disabled={selectedRole === "admin"}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePermissions}>{t("settings.savePermissions")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
