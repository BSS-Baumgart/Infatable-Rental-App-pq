"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { attractions } from "@/lib/mock-data"
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Package, User } from "lucide-react"
import Link from "next/link"

export default function ClientReservation() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    startDate: "",
    endDate: "",
    selectedAttractions: [] as string[],
    notes: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAttractionToggle = (attractionId: string) => {
    setFormData((prev) => {
      if (prev.selectedAttractions.includes(attractionId)) {
        return {
          ...prev,
          selectedAttractions: prev.selectedAttractions.filter((id) => id !== attractionId),
        }
      } else {
        return {
          ...prev,
          selectedAttractions: [...prev.selectedAttractions, attractionId],
        }
      }
    })
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // In a real application, you would send this data to your backend
    console.log("Form submitted:", formData)
  }

  const selectedAttractionObjects = attractions.filter((attraction) =>
    formData.selectedAttractions.includes(attraction.id),
  )

  const totalPrice = selectedAttractionObjects.reduce((sum, attraction) => sum + attraction.price, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple Navigation */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-500">BouncyRent</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/#attractions"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              Attractions
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              How It Works
            </Link>
            <Link href="/login">
              <Button variant="outline" className="ml-4">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Book Your Bounce House</h1>

          {/* Stepper */}
          <div className="mb-10">
            <div className="flex justify-between">
              <div
                className={`flex flex-col items-center ${
                  step >= 1 ? "text-orange-500" : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step >= 1
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs">Date</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div
                  className={`h-1 w-full ${
                    step > 1 ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-800"
                  } transition-colors duration-300 rounded-full`}
                ></div>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 2 ? "text-orange-500" : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step >= 2
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-xs">Attractions</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div
                  className={`h-1 w-full ${
                    step > 2 ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-800"
                  } transition-colors duration-300 rounded-full`}
                ></div>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 3 ? "text-orange-500" : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step >= 3
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs">Your Info</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div
                  className={`h-1 w-full ${
                    step > 3 ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-800"
                  } transition-colors duration-300 rounded-full`}
                ></div>
              </div>
              <div
                className={`flex flex-col items-center ${
                  step >= 4 ? "text-orange-500" : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step >= 4
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-xs">Confirm</span>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Date Selection */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Select Your Dates</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Please select the date(s) you would like to rent our attractions. For single-day events,
                          select the same date for both start and end dates.
                        </p>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="button" onClick={nextStep} disabled={!formData.startDate || !formData.endDate}>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Attraction Selection */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Select Attractions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attractions.map((attraction) => (
                          <div
                            key={attraction.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              formData.selectedAttractions.includes(attraction.id)
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
                            }`}
                            onClick={() => handleAttractionToggle(attraction.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-4">
                                <img
                                  src={
                                    attraction.imageUrl ||
                                    `/placeholder.svg?height=80&width=80&query=Inflatable ${attraction.name}`
                                  }
                                  alt={attraction.name}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{attraction.name}</h3>
                                <p className="text-orange-500 font-bold">${attraction.price}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {attraction.description}
                                </p>
                              </div>
                              {formData.selectedAttractions.includes(attraction.id) && (
                                <div className="ml-2">
                                  <CheckCircle className="h-5 w-5 text-orange-500" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep} disabled={formData.selectedAttractions.length === 0}>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            required
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="Any special requests or information we should know..."
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Confirm Your Reservation</h2>

                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Rental Dates</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Start Date:</div>
                            <div>{formData.startDate}</div>
                            <div>End Date:</div>
                            <div>{formData.endDate}</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Selected Attractions</h3>
                          <div className="space-y-2">
                            {selectedAttractionObjects.map((attraction) => (
                              <div key={attraction.id} className="flex justify-between">
                                <span>{attraction.name}</span>
                                <span>${attraction.price}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                              <span>Total:</span>
                              <span>${totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Your Information</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Name:</div>
                            <div>
                              {formData.firstName} {formData.lastName}
                            </div>
                            <div>Email:</div>
                            <div>{formData.email}</div>
                            <div>Phone:</div>
                            <div>{formData.phone}</div>
                            <div>Address:</div>
                            <div>
                              {formData.address}, {formData.city}, {formData.postalCode}
                            </div>
                          </div>
                        </div>

                        {formData.notes && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Additional Notes</h3>
                            <p className="text-sm">{formData.notes}</p>
                          </div>
                        )}

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm">
                            <strong>Note:</strong> We will contact you regarding payment options after reviewing your
                            reservation request.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit">Complete Reservation</Button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Reservation Submitted!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Thank you for your reservation request. We will review your request and contact you shortly
                    regarding payment options and to confirm your booking.
                  </p>
                  <div className="space-y-4">
                    <p className="font-medium">What happens next?</p>
                    <ol className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          1
                        </span>
                        <span>Our team will review your reservation request</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          2
                        </span>
                        <span>We'll contact you to discuss payment options and confirm details</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          3
                        </span>
                        <span>Once payment is received, your reservation will be confirmed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          4
                        </span>
                        <span>We'll deliver and set up your attractions on the scheduled date</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-8">
                    <Link href="/">
                      <Button variant="outline">Return to Home</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
