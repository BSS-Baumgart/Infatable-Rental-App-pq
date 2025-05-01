"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { clients as initialClients } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Search, Trash, User } from "lucide-react"
import ClientModal from "@/components/modals/client-modal"
import { useToast } from "@/components/ui/use-toast"
import type { Client } from "@/lib/types"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function ClientsPage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const { toast } = useToast()

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm),
  )

  const handleOpenModal = (client?: Client) => {
    setCurrentClient(client || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentClient(null)
  }

  const handleSaveClient = (data: Partial<Client>) => {
    if (currentClient) {
      // Update existing client
      setClients((prev) => prev.map((c) => (c.id === currentClient.id ? ({ ...c, ...data } as Client) : c)))
      toast({
        title: t("clients.updated"),
        description: t("clients.updateSuccess", { firstName: data.firstName, lastName: data.lastName }),
      })
    } else {
      // Create new client
      const newClient = {
        ...data,
        id: `CL-${Math.floor(Math.random() * 10000)}`,
        createdAt: new Date(),
      } as Client

      setClients((prev) => [...prev, newClient])
      toast({
        title: t("clients.created"),
        description: t("clients.createSuccess", { firstName: data.firstName, lastName: data.lastName }),
      })
    }
    handleCloseModal()
  }

  const handleDeleteClient = (id: string) => {
    if (confirm(t("clients.confirmDelete"))) {
      setClients((prev) => prev.filter((c) => c.id !== id))
      toast({
        title: t("clients.deleted"),
        description: t("clients.deleteSuccess"),
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t("clients.search")}
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              {t("clients.addClient")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("clients.allClients")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left font-medium p-2">{t("clients.name")}</th>
                    <th className="text-left font-medium p-2">{t("clients.contact")}</th>
                    <th className="text-left font-medium p-2">{t("clients.address")}</th>
                    <th className="text-left font-medium p-2">{t("clients.created")}</th>
                    <th className="text-right font-medium p-2">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {client.firstName} {client.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>{client.phone}</div>
                        <div className="text-gray-500 dark:text-gray-400">{client.email || t("clients.noEmail")}</div>
                      </td>
                      <td className="p-2">
                        <div>
                          {client.street} {client.buildingNumber}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {client.postalCode}, {client.city}
                        </div>
                      </td>
                      <td className="p-2">{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientModal isOpen={isModalOpen} onClose={handleCloseModal} client={currentClient} onSave={handleSaveClient} />
    </AppLayout>
  )
}
