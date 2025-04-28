"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { attractions as initialAttractions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Search, Trash } from "lucide-react"
import Image from "next/image"
import AttractionModal from "@/components/modals/attraction-modal"
import { useToast } from "@/components/ui/use-toast"
import type { Attraction } from "@/lib/types"

export default function AttractionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [attractions, setAttractions] = useState<Attraction[]>(initialAttractions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(null)
  const { toast } = useToast()

  // Filter attractions based on search term
  const filteredAttractions = attractions.filter((attraction) =>
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (attraction?: Attraction) => {
    setCurrentAttraction(attraction || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentAttraction(null)
  }

  const handleSaveAttraction = (data: Partial<Attraction>) => {
    if (currentAttraction) {
      // Update existing attraction
      setAttractions((prev) =>
        prev.map((attr) => (attr.id === currentAttraction.id ? ({ ...attr, ...data } as Attraction) : attr)),
      )
      toast({
        title: "Attraction updated",
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      // Create new attraction
      const newAttraction = {
        ...data,
        id: `ATT-${Math.floor(Math.random() * 10000)}`,
      } as Attraction

      setAttractions((prev) => [...prev, newAttraction])
      toast({
        title: "Attraction created",
        description: `${data.name} has been created successfully.`,
      })
    }
    handleCloseModal()
  }

  const handleDeleteAttraction = (id: string) => {
    if (confirm("Are you sure you want to delete this attraction?")) {
      setAttractions((prev) => prev.filter((attr) => attr.id !== id))
      toast({
        title: "Attraction deleted",
        description: `Attraction has been deleted.`,
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Attractions</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search attractions..."
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Attraction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAttractions.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={attraction.image || "/placeholder.svg?height=300&width=300&query=bouncy%20castle"}
                  alt={attraction.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{attraction.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                    <span>
                      {attraction.width}cm × {attraction.length}cm × {attraction.height}cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span>{attraction.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Setup Time:</span>
                    <span>{attraction.setupTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Price:</span>
                    <span className="font-medium">${attraction.price}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(attraction)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 dark:text-red-400"
                  onClick={() => handleDeleteAttraction(attraction.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <AttractionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        attraction={currentAttraction}
        onSave={handleSaveAttraction}
      />
    </AppLayout>
  )
}
