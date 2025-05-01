"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { attractions } from "@/lib/mock-data"
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Menu, Package, User, X } from "lucide-react"
import Link from "next/link"
import { sendConfirmationEmail, generateConfirmationCode } from "@/lib/email-service"
import { toast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n/translation-context"
import { LanguageSelector } from "@/components/language-selector"
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay as isSameDayFn,
} from "date-fns"
import { pl, enUS } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function ClientReservation() {
  const { t, language } = useTranslation()
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
    isAllDay: true,
    selectedAttractions: [] as string[],
    notes: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Stany dla kalendarza
  const [startDateCalendarOpen, setStartDateCalendarOpen] = useState(false)
  const [endDateCalendarOpen, setEndDateCalendarOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [endCurrentMonth, setEndCurrentMonth] = useState(new Date())

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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

  const handleDateChange = (date: Date, field: "startDate" | "endDate") => {
    const formattedDate = format(date, "yyyy-MM-dd")

    setFormData((prev) => {
      // If start date is being set and it's after the end date, update end date too
      if (field === "startDate" && prev.endDate && formattedDate > prev.endDate) {
        return { ...prev, [field]: formattedDate, endDate: formattedDate }
      }

      // If end date is being set and it's before the start date, update start date too
      if (field === "endDate" && prev.startDate && formattedDate < prev.startDate) {
        return { ...prev, [field]: formattedDate, startDate: formattedDate }
      }

      return { ...prev, [field]: formattedDate }
    })

    // Zamykamy kalendarz po wyborze daty
    if (field === "startDate") {
      setStartDateCalendarOpen(false)
      // Jeśli data końcowa nie jest ustawiona, otwieramy kalendarz daty końcowej
      if (!formData.endDate) {
        setTimeout(() => setEndDateCalendarOpen(true), 100)
      }
    } else {
      setEndDateCalendarOpen(false)
    }
  }

  const toggleAllDay = () => {
    setFormData((prev) => ({ ...prev, isAllDay: !prev.isAllDay }))
  }

  const nextStep = () => {
    // Sprawdzamy warunki dla każdego kroku przed przejściem dalej
    if (step === 1) {
      if (!formData.startDate || !formData.endDate) {
        toast({
          title: t("common.error"),
          description: t("common.fillAllFields"),
          variant: "destructive",
        })
        return
      }
    } else if (step === 2) {
      if (formData.selectedAttractions.length === 0) {
        toast({
          title: t("common.error"),
          description: t("common.fillAllFields"),
          variant: "destructive",
        })
        return
      }
    } else if (step === 3) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.postalCode
      ) {
        toast({
          title: t("common.error"),
          description: t("common.fillAllFields"),
          variant: "destructive",
        })
        return
      }
    }

    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Sprawdź czy wszystkie wymagane pola są wypełnione
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.postalCode ||
      !formData.startDate ||
      !formData.endDate ||
      formData.selectedAttractions.length === 0
    ) {
      toast({
        title: t("common.error"),
        description: t("common.fillAllFields"),
        variant: "destructive",
      })
      return
    }

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

  // Get the appropriate locale for date formatting
  const getLocale = () => {
    return language === "pl" ? pl : enUS
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return format(date, "PPP", { locale: getLocale() })
  }

  // Check if start and end dates are the same
  const isSameDay = formData.startDate && formData.endDate && formData.startDate === formData.endDate

  const startDateRef = useRef<HTMLDivElement>(null)
  const endDateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startDateRef.current && !startDateRef.current.contains(event.target as Node) && startDateCalendarOpen) {
        setStartDateCalendarOpen(false)
      }

      if (endDateRef.current && !endDateRef.current.contains(event.target as Node) && endDateCalendarOpen) {
        setEndDateCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [startDateCalendarOpen, endDateCalendarOpen])

  // Funkcje pomocnicze dla kalendarza
  const nextMonth = (isEndDate = false) => {
    if (isEndDate) {
      setEndCurrentMonth(addMonths(endCurrentMonth, 1))
    } else {
      setCurrentMonth(addMonths(currentMonth, 1))
    }
  }

  const prevMonth = (isEndDate = false) => {
    if (isEndDate) {
      setEndCurrentMonth(subMonths(endCurrentMonth, 1))
    } else {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }

  const renderCalendar = (isEndDate = false) => {
    const monthToRender = isEndDate ? endCurrentMonth : currentMonth
    const monthStart = startOfMonth(monthToRender)
    const monthEnd = endOfMonth(monthToRender)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Dodajemy dni z poprzedniego i następnego miesiąca, aby wypełnić siatkę
    const dayOfWeek = monthStart.getDay()
    const daysFromPrevMonth = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Dostosowanie do poniedziałku jako pierwszy dzień tygodnia

    const prevMonthDays = []
    for (let i = daysFromPrevMonth; i > 0; i--) {
      prevMonthDays.push(addDays(monthStart, -i))
    }

    const nextMonthDays = []
    const totalDaysInGrid = 42 // 6 tygodni po 7 dni
    const remainingDays = totalDaysInGrid - (prevMonthDays.length + days.length)
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push(addDays(monthEnd, i))
    }

    const allDays = [...prevMonthDays, ...days, ...nextMonthDays]

    const weekDays =
      getLocale() === pl ? ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

    const selectedDate = isEndDate
      ? formData.endDate
        ? new Date(formData.endDate)
        : null
      : formData.startDate
        ? new Date(formData.startDate)
        : null

    const isDateDisabled = (date: Date) => {
      if (isEndDate && formData.startDate) {
        return date < new Date(formData.startDate)
      }
      return false
    }

    return (
      <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => prevMonth(isEndDate)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="font-medium">{format(monthToRender, "MMMM yyyy", { locale: getLocale() })}</div>
          <button
            type="button"
            onClick={() => nextMonth(isEndDate)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthToRender)
            const isSelected = selectedDate ? isSameDayFn(day, selectedDate) : false
            const isDisabled = isDateDisabled(day)

            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateChange(day, isEndDate ? "endDate" : "startDate")}
                className={`
                  h-8 w-8 flex items-center justify-center rounded-full text-sm
                  ${!isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                  ${isSelected ? "bg-orange-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation - Same as on the home page */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-orange-500">BouncyRent</h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/#attractions"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.attractions")}
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              href="/client-reservation"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.bookNow")}
            </Link>

            {/* Language Selector */}
            <LanguageSelector variant="landing" />

            <Link href="/login">
              <Button variant="outline" className="ml-4">
                {t("nav.login")}
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <span className="sr-only">{mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/#attractions"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.attractions")}
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </Link>
              <Link
                href="/client-reservation"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.bookNow")}
              </Link>
              <div className="px-3 py-2">
                <LanguageSelector variant="landing" />
              </div>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.login")}
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t("nav.bookNow")}</h1>

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
                <span className="text-xs">{t("common.date")}</span>
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
                <span className="text-xs">{t("nav.attractions")}</span>
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
                <span className="text-xs">{t("common.yourInfo")}</span>
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
                <span className="text-xs">{t("common.confirm")}</span>
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
                      <h2 className="text-xl font-semibold mb-4">{t("common.selectDates")}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">{t("common.startDate")}</Label>
                          <div className="relative" ref={startDateRef}>
                            <Button
                              id="startDateButton"
                              type="button"
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-10"
                              onClick={() => {
                                setStartDateCalendarOpen(!startDateCalendarOpen)
                                if (endDateCalendarOpen) setEndDateCalendarOpen(false)
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.startDate ? (
                                formatDate(formData.startDate)
                              ) : (
                                <span className="text-muted-foreground">{t("common.selectDate")}</span>
                              )}
                            </Button>
                            {startDateCalendarOpen && <div className="absolute z-50 mt-1">{renderCalendar(false)}</div>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">{t("common.endDate")}</Label>
                          <div className="relative" ref={endDateRef}>
                            <Button
                              id="endDateButton"
                              type="button"
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-10"
                              onClick={() => {
                                setEndDateCalendarOpen(!endDateCalendarOpen)
                                if (startDateCalendarOpen) setStartDateCalendarOpen(false)
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.endDate ? (
                                formatDate(formData.endDate)
                              ) : (
                                <span className="text-muted-foreground">{t("common.selectDate")}</span>
                              )}
                            </Button>
                            {endDateCalendarOpen && <div className="absolute z-50 mt-1">{renderCalendar(true)}</div>}
                          </div>
                        </div>
                      </div>

                      {/* All Day Option - Only show when start and end dates are the same */}
                      {isSameDay && (
                        <div className="flex items-center space-x-2 mt-4">
                          <Switch id="all-day" checked={formData.isAllDay} onCheckedChange={toggleAllDay} />
                          <Label htmlFor="all-day" className="cursor-pointer">
                            {t("common.allDay")}
                          </Label>
                        </div>
                      )}

                      <div className="pt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                          <p>{t("common.dateHelp")}</p>

                          {/* Show selected date range */}
                          {formData.startDate && formData.endDate && (
                            <div className="flex flex-wrap gap-2 mt-2 items-center">
                              <span>{t("common.selected")}:</span>
                              <Badge
                                variant="outline"
                                className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                              >
                                {formatDate(formData.startDate)}
                                {formData.startDate !== formData.endDate && ` - ${formatDate(formData.endDate)}`}
                                {isSameDay && formData.isAllDay && ` (${t("common.allDay")})`}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="button" onClick={nextStep}>
                          {t("common.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Attraction Selection */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("common.selectAttractions")}</h2>
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
                          {t("common.back")}
                        </Button>
                        <Button type="button" onClick={nextStep}>
                          {t("common.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("common.yourInformation")}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("common.firstName")}</Label>
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
                          <Label htmlFor="lastName">{t("common.lastName")}</Label>
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
                          <Label htmlFor="email">{t("common.email")}</Label>
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
                          <Label htmlFor="phone">{t("common.phone")}</Label>
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
                          <Label htmlFor="address">{t("common.address")}</Label>
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
                          <Label htmlFor="city">{t("common.city")}</Label>
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
                          <Label htmlFor="postalCode">{t("common.postalCode")}</Label>
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
                        <Label htmlFor="notes">{t("common.additionalNotes")}</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder={t("common.notesPlaceholder")}
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t("common.back")}
                        </Button>
                        <Button type="button" onClick={nextStep}>
                          {t("common.next")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">{t("common.confirmReservation")}</h2>

                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("common.rentalDates")}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>{t("common.startDate")}:</div>
                            <div>{formatDate(formData.startDate)}</div>
                            <div>{t("common.endDate")}:</div>
                            <div>{formatDate(formData.endDate)}</div>
                            {isSameDay && (
                              <>
                                <div>{t("common.allDay")}:</div>
                                <div>{formData.isAllDay ? t("common.yes") : t("common.no")}</div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("common.selectedAttractions")}</h3>
                          <div className="space-y-2">
                            {selectedAttractionObjects.map((attraction) => (
                              <div key={attraction.id} className="flex justify-between">
                                <span>{attraction.name}</span>
                                <span>${attraction.price}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                              <span>{t("common.total")}:</span>
                              <span>${totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{t("common.yourInfo")}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>{t("common.name")}:</div>
                            <div>
                              {formData.firstName} {formData.lastName}
                            </div>
                            <div>{t("common.email")}:</div>
                            <div>{formData.email}</div>
                            <div>{t("common.phone")}:</div>
                            <div>{formData.phone}</div>
                            <div>{t("common.address")}:</div>
                            <div>
                              {formData.address}, {formData.city}, {formData.postalCode}
                            </div>
                          </div>
                        </div>

                        {formData.notes && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">{t("common.notes")}</h3>
                            <p className="text-sm">{formData.notes}</p>
                          </div>
                        )}

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm">
                            <strong>{t("common.note")}:</strong> {t("common.paymentNote")}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t("common.back")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? t("common.submitting") : t("common.completeReservation")}
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
                  <h2 className="text-2xl font-bold mb-2">{t("common.reservationSubmitted")}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{t("common.thankYou")}</p>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
                    <p className="font-medium mb-2">
                      {t("common.confirmationCode")}{" "}
                      <span className="text-orange-600 dark:text-orange-400">{confirmationCode}</span>
                    </p>
                    <p className="text-sm">
                      {t("common.emailSent")} {formData.email}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-medium">{t("common.whatNext")}</p>
                    <ol className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          1
                        </span>
                        <span>{t("common.step1Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          2
                        </span>
                        <span>{t("common.step2Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          3
                        </span>
                        <span>{t("common.step3Next")}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 mr-2 flex-shrink-0">
                          4
                        </span>
                        <span>{t("common.step4Next")}</span>
                      </li>
                    </ol>
                  </div>
                  <div className="mt-8">
                    <Link href="/">
                      <Button variant="outline">{t("common.returnHome")}</Button>
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
