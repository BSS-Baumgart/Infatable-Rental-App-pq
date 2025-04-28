"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Client } from "@/lib/types"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
  onSave: (client: Partial<Client>) => void
}

export default function ClientModal({ isOpen, onClose, client, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    street: "",
    buildingNumber: "",
    postalCode: "",
    city: "",
  })

  // Initialize form with client data if editing
  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email || "",
        street: client.street,
        buildingNumber: client.buildingNumber,
        postalCode: client.postalCode,
        city: client.city,
      })
    } else {
      // Reset form for new client
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        street: "",
        buildingNumber: "",
        postalCode: "",
        city: "",
      })
    }
  }, [client, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="street">Street</Label>
              <Input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="buildingNumber">Building Number</Label>
              <Input
                type="text"
                id="buildingNumber"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="city">City</Label>
              <Input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
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
