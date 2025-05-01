"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailTemplate } from "@/components/email/email-template"
import { sendConfirmationEmail } from "@/lib/email-service"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmailPreviewPage() {
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  const sampleData = {
    firstName: "John",
    lastName: "Doe",
    reservationDate: "May 15, 2023",
    attractions: [
      { name: "Vibrant Kingdom Bounce", price: 150 },
      { name: "Pirate Adventure Bounce", price: 175 },
      { name: "Giant Backyard Slide", price: 125 },
    ],
    totalPrice: 450,
    confirmationCode: "BR1234",
  }

  const handleSendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test email.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const result = await sendConfirmationEmail({
        to: email,
        subject: "Your BouncyRent Reservation Confirmation",
        ...sampleData,
      })

      if (result.success) {
        toast({
          title: "Email Sent",
          description: "Test email was sent successfully (simulated).",
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
      <h1 className="text-3xl font-bold mb-6">Email Template Preview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 overflow-auto max-h-[600px]">
                <EmailTemplate {...sampleData} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button onClick={handleSendTestEmail} disabled={isSending} className="w-full">
                  {isSending ? "Sending..." : "Send Test Email"}
                </Button>

                <div className="text-sm text-gray-500 mt-4">
                  <p>Note: This is a simulation. No actual emails will be sent.</p>
                  <p>In production, you would connect this to your SMTP service.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
