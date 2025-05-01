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
import { sendConfirmationEmail, generateConfirmationCode } from "@/lib/email-service"
import { toast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function ClientReservation() {
  const { t } = useTranslation()
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate a confirmation code
      const code = generateConfirmationCode()
      setConfirmationCode(code)

      // Get selected attraction objects
      const selectedAttractionObjects = attractions.filter((attraction) =>
        formData.selectedAttractions.includes(attraction.id),
      )

      // Format date range for email
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const dateRange =
        startDate.toLocaleDateString() === endDate.toLocaleDateString()
          ? startDate.toLocaleDateString()
          : `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`

      // Send confirmation email
      const emailResult = await sendConfirmationEmail({
        to: formData.email,
        subject: "Your BouncyRent Reservation Confirmation",
        firstName: formData.firstName,
        lastName: formData.lastName,
        reservationDate: dateRange,
        attractions: selectedAttractionObjects.map((a) => ({ name: a.name, price: a.price })),
        totalPrice: selectedAttractionObjects.reduce((sum, a) => sum + a.price, 0),
        confirmationCode: code,
      })

      if (emailResult.success) {
        toast({
          title: "Confirmation Email Sent",
          description: "Check your inbox for reservation details.",
        })
      }

      // In a real app, you would save the reservation to your database here
      console.log("Form submitted:", formData)

      // Mark as submitted
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting your reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              {t("clientReservation.attractions")}
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("clientReservation.howItWorks")}
            </Link>
            <Link href="/login">
              <Button variant="outline" className="ml-4">
                {t("clientReservation.login")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            {t("clientReservation.title")}
          </h1>

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
                <span className="text-xs">{t("clientReservation.step1")}</span>
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
                <span className="text-xs">{t("clientReservation.step2")}</span>
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
                <span className="text-xs">{t("clientReservation.step3")}</span>
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
                <span className="text-xs">{t("clientReservation.step4")}</span>
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
                      <h2 className="text-xl font-semibold mb-4">{t("clientReservation.selectDates")}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">{t("clientReservation.startDate")}</Label>
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
                          <Label htmlFor="endDate">{t("clientReservation.endDate")}</Label>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("clientReservation.dateHelp")}</p>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="button" onClick={nextStep} disabled={!formData.startDate || !formData.endDate}>
                          {t("clientReservation.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Attraction Selection */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("clientReservation.selectAttractions")}</h2>
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
                                    attraction.image ||
                                    `/placeholder.svg?height=80&width=80&query=Inflatable ${attraction.name || "/placeholder.svg"}`
                                  }
                                  alt={attraction.name}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{attraction.name}</h3>
                                <p className="text-orange-500 font-bold">${attraction.price}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {attraction.description || `${attraction.width}x${attraction.height} bounce house`}
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
                          {t("clientReservation.back")}
                        </Button>
                        <Button type="button" onClick={nextStep} disabled={formData.selectedAttractions.length === 0}>
                          {t("clientReservation.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("clientReservation.yourInformation")}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("clientReservation.firstName")}</Label>
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
                          <Label htmlFor="lastName">{t("clientReservation.lastName")}</Label>
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
                          <Label htmlFor="email">{t("clientReservation.email")}</Label>
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
                          <Label htmlFor="phone">{t("clientReservation.phone")}</Label>
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
                          <Label htmlFor="address">{t("clientReservation.address")}</Label>
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
                          <Label htmlFor="city">{t("clientReservation.city")}</Label>
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
                          <Label htmlFor="postalCode">{t("clientReservation.postalCode")}</Label>
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
                        <Label htmlFor="notes">{t("clientReservation.additionalNotes")}</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder={t("clientReservation.notesPlaceholder")}
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t("clientReservation.back")}
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                        >
                          {t("clientReservation.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("clientReservation.confirmReservation")}</h2>

                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("clientReservation.rentalDates")}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>{t("clientReservation.startDate")}:</div>
                            <div>{formData.startDate}</div>
                            <div>{t("clientReservation.endDate")}:</div>
                            <div>{formData.endDate}</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("clientReservation.selectedAttractions")}</h3>
                          <div className="space-y-2">
                            {selectedAttractionObjects.map((attraction) => (
                              <div key={attraction.id} className="flex justify-between">
                                <span>{attraction.name}</span>
                                <span>${attraction.price}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                              <span>{t("clientReservation.total")}:</span>
                              <span>${totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("clientReservation.yourInfo")}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>{t("clientReservation.name")}:</div>
                            <div>
                              {formData.firstName} {formData.lastName}
                            </div>
                            <div>{t("clientReservation.email")}:</div>
                            <div>{formData.email}</div>
                            <div>{t("clientReservation.phone")}:</div>
                            <div>{formData.phone}</div>
                            <div>{t("clientReservation.address")}:</div>
                            <div>
                              {formData.address}, {formData.city}, {formData.postalCode}
                            </div>
                          </div>
                        </div>

                        {formData.notes && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">{t("clientReservation.notes")}</h3>
                            <p className="text-sm">{formData.notes}</p>
                          </div>
                        )}

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm">
                            <strong>{t("common.note")}:</strong> {t("clientReservation.paymentNote")}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t("clientReservation.back")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting
                            ? t("clientReservation.submitting")
                            : t("clientReservation.completeReservation")}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{t("clientReservation.reservationSubmitted")}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{t("clientReservation.thankYou")}</p>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
                    <p className="font-medium mb-2">
                      {t("clientReservation.confirmationCode")}{" "}
                      <span className="text-orange-600 dark:text-orange-400">{confirmationCode}</span>
                    </p>
                    <p className="text-sm">
                      {t("clientReservation.emailSent")} {formData.email}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-medium">{t("clientReservation.whatNext")}</p>
                    <ol className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          1
                        </span>
                        <span>{t("clientReservation.step1Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          2
                        </span>
                        <span>{t("clientReservation.step2Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          3
                        </span>
                        <span>{t("clientReservation.step3Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          4
                        </span>
                        <span>{t("clientReservation.step4Next")}</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-8">
                    <Link href="/">
                      <Button variant="outline">{t("clientReservation.returnHome")}</Button>
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
