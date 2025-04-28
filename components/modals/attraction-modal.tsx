"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Attraction } from "@/lib/types"

interface AttractionModalProps {
  isOpen: boolean
  onClose: () => void
  attraction?: Attraction | null
  onSave: (attraction: Partial<Attraction>) => void
}

export default function AttractionModal({ isOpen, onClose, attraction, onSave }: AttractionModalProps) {
  const [formData, setFormData] = useState<Partial<Attraction>>({
    name: "",
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
    price: 0,
    setupTime: 0,
    image: "",
  })

  // Initialize form with attraction data if editing
  useEffect(() => {
    if (attraction) {
      setFormData({
        id: attraction.id,
        name: attraction.name,
        width: attraction.width,
        height: attraction.height,
        length: attraction.length,
        weight: attraction.weight,
        price: attraction.price,
        setupTime: attraction.setupTime,
        image: attraction.image || "",
      })
    } else {
      // Reset form for new attraction
      setFormData({
        name: "",
        width: 0,
        height: 0,
        length: 0,
        weight: 0,
        price: 0,
        setupTime: 0,
        image: "",
      })
    }
  }, [attraction, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{attraction ? "Edit Attraction" : "New Attraction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Bouncy Castle - Princess"
              required
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          {/* Weight and Setup Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="setupTime">Setup Time (min)</Label>
              <Input
                type="number"
                id="setupTime"
                name="setupTime"
                value={formData.setupTime}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          {/* Image URL */}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              type="text"
              id="image"
              name="image"
              value={formData.image || ""}
              onChange={handleInputChange}
              placeholder="/path/to/image.jpg"
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
