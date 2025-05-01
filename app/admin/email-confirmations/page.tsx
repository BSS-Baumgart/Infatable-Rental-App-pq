"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendConfirmationEmail } from "@/lib/email-service"
import { toast } from "@/components/ui/use-toast"
import { EmailTemplate } from "@/components/email/email-template"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { attractions } from "@/lib/mock-data"

export default function EmailConfirmationsPage() {
  const [activeTab, setActiveTab] = useState("preview")
  const [emailData, setEmailData] = useState({
    to: "",
    firstName: "John",
    lastName: "Doe",
    reservationDate: "May 15, 2023",
    attractions: [{ name: "Vibrant Kingdom Bounce", price: 150 }],
    totalPrice: 150,
    confirmationCode: "BR1234",
  })
  const [isSending, setIsSending] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: any) => {
    setEmailData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAttraction = (attractionId: string) => {
    const attraction = attractions.find((a) => a.id === attractionId)
    if (!attraction) return

    const newAttraction = { name: attraction.name, price: attraction.price }
    const updatedAttractions = [...emailData.attractions, newAttraction]
    const newTotal = updatedAttractions.reduce((sum, a) => sum + a.price, 0)

    setEmailData((prev) => ({
      ...prev,
      attractions: updatedAttractions,
      totalPrice: newTotal,
    }))
  }

  const handleRemoveAttraction = (index: number) => {
    const updatedAttractions = emailData.attractions.filter((_, i) => i !== index)
    const newTotal = updatedAttractions.reduce((sum, a) => sum + a.price, 0)

    setEmailData((prev) => ({
      ...prev,
      attractions: updatedAttractions,
      totalPrice: newTotal,
    }))
  }

  const handleSendEmail = async () => {
    if (!emailData.to) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the confirmation.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const result = await sendConfirmationEmail({
        ...emailData,
        subject: "Your BouncyRent Reservation Confirmation",
      })

      if (result.success) {
        toast({
          title: "Email Sent",
          description: "Confirmation email was sent successfully (simulated).",
        })
      } else {
        toast({
          title: "Failed to Send Email",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Confirmations</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Email Preview</TabsTrigger>
          <TabsTrigger value="send">Send Email</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 overflow-auto max-h-[600px]">
                <EmailTemplate {...emailData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Confirmation Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="to">Recipient Email</Label>
                  <Input
                    id="to"
                    name="to"
                    type="email"
                    placeholder="client@example.com"
                    value={emailData.to}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={emailData.firstName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={emailData.lastName} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservationDate">Reservation Date</Label>
                  <Input
                    id="reservationDate"
                    name="reservationDate"
                    value={emailData.reservationDate}
                    onChange={handleInputChange}
                    placeholder="May 15, 2023 or May 15-16, 2023"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    id="confirmationCode"
                    name="confirmationCode"
                    value={emailData.confirmationCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attractions</Label>
                  <div className="space-y-2">
                    {emailData.attractions.map((attraction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <span className="font-medium">{attraction.name}</span>
                          <span className="ml-2 text-gray-500">${attraction.price}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveAttraction(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <Select onValueChange={(value) => handleAddAttraction(value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Add attraction" />
                        </SelectTrigger>
                        <SelectContent>
                          {attractions.map((attraction) => (
                            <SelectItem key={attraction.id} value={attraction.id}>
                              {attraction.name} - ${attraction.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSendEmail} disabled={isSending || !emailData.to} className="w-full">
                    {isSending ? "Sending..." : "Send Confirmation Email"}
                  </Button>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  <p>Note: This is a simulation. No actual emails will be sent.</p>
                  <p>In production, you would connect this to your SMTP service.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
