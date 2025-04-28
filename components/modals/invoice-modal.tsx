"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reservations } from "@/lib/mock-data"
import type { Invoice, InvoiceStatus } from "@/lib/types"

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice?: Invoice | null
  reservationId?: string
  onSave: (invoice: Partial<Invoice>) => void
}

export default function InvoiceModal({ isOpen, onClose, invoice, reservationId, onSave }: InvoiceModalProps) {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    reservationId: "",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default due date is 14 days from now
    amount: 0,
    status: "unpaid",
  })

  // Initialize form with invoice data if editing
  useEffect(() => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        reservationId: invoice.reservationId,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        amount: invoice.amount,
        status: invoice.status,
        pdfUrl: invoice.pdfUrl || "",
      })
    } else if (reservationId) {
      // If creating a new invoice for a specific reservation
      const reservation = reservations.find((r) => r.id === reservationId)
      if (reservation) {
        setFormData({
          reservationId: reservation.id,
          clientId: reservation.clientId,
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
          amount: reservation.totalPrice,
          status: "unpaid",
        })
      }
    } else {
      // Reset form for new invoice
      setFormData({
        reservationId: "",
        issueDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        amount: 0,
        status: "unpaid",
      })
    }
  }, [invoice, reservationId, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: new Date(value) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Reservation Selection */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="reservationId">Reservation</Label>
            <Select
              value={formData.reservationId}
              onValueChange={(value) => handleSelectChange("reservationId", value)}
              disabled={!!reservationId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reservation" />
              </SelectTrigger>
              <SelectContent>
                {reservations.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.id} - {res.client.firstName} {res.client.lastName} (${res.totalPrice})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate ? new Date(formData.issueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateChange("issueDate", e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Status */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value as InvoiceStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PDF URL */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="pdfUrl">PDF URL (Optional)</Label>
            <Input
              type="text"
              id="pdfUrl"
              name="pdfUrl"
              value={formData.pdfUrl || ""}
              onChange={handleInputChange}
              placeholder="/documents/invoice.pdf"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
