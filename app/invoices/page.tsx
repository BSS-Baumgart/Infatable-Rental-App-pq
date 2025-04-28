"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { invoices as initialInvoices } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, Plus, Search, Edit, Trash } from "lucide-react"
import type { InvoiceStatus, Invoice } from "@/lib/types"
import InvoiceModal from "@/components/modals/invoice-modal"
import { useToast } from "@/components/ui/use-toast"

const statusColors: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (invoice?: Invoice) => {
    setCurrentInvoice(invoice || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentInvoice(null)
  }

  const handleSaveInvoice = (data: Partial<Invoice>) => {
    if (currentInvoice) {
      // Update existing invoice
      setInvoices((prev) => prev.map((inv) => (inv.id === currentInvoice.id ? ({ ...inv, ...data } as Invoice) : inv)))
      toast({
        title: "Invoice updated",
        description: `Invoice #${currentInvoice.id} has been updated successfully.`,
      })
    } else {
      // Create new invoice
      const newInvoice = {
        ...data,
        id: `INV-${Math.floor(Math.random() * 10000)}`,
      } as Invoice

      setInvoices((prev) => [...prev, newInvoice])
      toast({
        title: "Invoice created",
        description: `New invoice has been created successfully.`,
      })
    }
    handleCloseModal()
  }

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
      toast({
        title: "Invoice deleted",
        description: `Invoice #${id} has been deleted.`,
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left font-medium p-2">Invoice</th>
                    <th className="text-left font-medium p-2">Client</th>
                    <th className="text-left font-medium p-2">Issue Date</th>
                    <th className="text-left font-medium p-2">Due Date</th>
                    <th className="text-left font-medium p-2">Amount</th>
                    <th className="text-left font-medium p-2">Status</th>
                    <th className="text-right font-medium p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="font-medium">INV-{invoice.id}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        {invoice.client ? `${invoice.client.firstName} ${invoice.client.lastName}` : "No client"}
                      </td>
                      <td className="p-2">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="p-2">${invoice.amount}</td>
                      <td className="p-2">
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(invoice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                          {invoice.pdfUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
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

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        invoice={currentInvoice}
        onSave={handleSaveInvoice}
      />
    </AppLayout>
  )
}
