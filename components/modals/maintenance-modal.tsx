"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Upload } from "lucide-react"
import type { MaintenanceRecord } from "@/lib/types"

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  attractionId: string
  maintenanceRecord?: MaintenanceRecord | null
  onSave: (data: Partial<MaintenanceRecord>) => void
}

export default function MaintenanceModal({
  isOpen,
  onClose,
  attractionId,
  maintenanceRecord,
  onSave,
}: MaintenanceModalProps) {
  const [date, setDate] = useState<string>(
    maintenanceRecord?.date
      ? new Date(maintenanceRecord.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  )
  const [cost, setCost] = useState<string>(maintenanceRecord?.cost?.toString() || "")
  const [description, setDescription] = useState(maintenanceRecord?.description || "")
  const [performedBy, setPerformedBy] = useState(maintenanceRecord?.performedBy || "")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>(maintenanceRecord?.images || [])

  useEffect(() => {
    if (maintenanceRecord) {
      setDate(new Date(maintenanceRecord.date).toISOString().split("T")[0])
      setCost(maintenanceRecord.cost.toString())
      setDescription(maintenanceRecord.description)
      setPerformedBy(maintenanceRecord.performedBy)
      setImageUrls(maintenanceRecord.images || [])
    } else {
      resetForm()
    }
  }, [maintenanceRecord])

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0])
    setCost("")
    setDescription("")
    setPerformedBy("")
    setImages([])
    setImageUrls([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate image upload
    const newImageUrls = [...imageUrls]
    if (images.length > 0) {
      // In a real app, you would upload the images to a server
      // For now, we'll just create placeholder URLs
      for (let i = 0; i < images.length; i++) {
        newImageUrls.push(`/placeholder.svg?height=300&width=300&query=maintenance${i}`)
      }
    }

    const maintenanceData: Partial<MaintenanceRecord> = {
      date: new Date(date),
      cost: Number.parseFloat(cost),
      description,
      performedBy,
      images: newImageUrls,
      attractionId,
    }

    onSave(maintenanceData)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newImages])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{maintenanceRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="performedBy">Performed By</Label>
            <Input
              id="performedBy"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="Enter technician name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter maintenance details"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="images" className="flex flex-col items-center justify-center cursor-pointer space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload maintenance images</span>
              </label>
            </div>
            {(images.length > 0 || imageUrls.length > 0) && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {images.length + imageUrls.length} image(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Maintenance ${index}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  {Array.from(images).map((file, index) => (
                    <div key={`new-${index}`} className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      <div className="flex items-center justify-center h-full text-xs text-gray-500">New Image</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{maintenanceRecord ? "Update Maintenance Record" : "Add Maintenance Record"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
