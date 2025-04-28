"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Mail, MessageSquare, Edit, Eye, Send, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Define notification template types
interface NotificationTemplate {
  id: string
  name: string
  subject?: string
  content: string
  type: "email" | "sms"
  active: boolean
}

// Define notification rule types
interface NotificationRule {
  id: string
  name: string
  event:
    | "reservation_created"
    | "reservation_reminder"
    | "reservation_cancelled"
    | "invoice_created"
    | "payment_received"
    | "maintenance_due"
  templateId: string
  recipients: "client" | "admin" | "both"
  timing?: {
    beforeEvent?: number
    afterEvent?: number
    unit: "hours" | "days"
  }
  active: boolean
}

export default function NotificationSettings() {
  const { toast } = useToast()

  // Initial email templates
  const [emailTemplates, setEmailTemplates] = useState<NotificationTemplate[]>([
    {
      id: "email-reservation-confirmation",
      name: "Reservation Confirmation",
      subject: "Your reservation has been confirmed",
      content: `<p>Dear {{client.firstName}},</p>
<p>Thank you for your reservation with BouncyRent!</p>
<p>Your reservation details:</p>
<ul>
  <li><strong>Date:</strong> {{reservation.startDate}}</li>
  <li><strong>Attractions:</strong> {{reservation.attractions}}</li>
  <li><strong>Total Price:</strong> {{reservation.totalPrice}}</li>
</ul>
<p>We're looking forward to providing you with a great experience!</p>
<p>Best regards,<br>The BouncyRent Team</p>`,
      type: "email",
      active: true,
    },
    {
      id: "email-reservation-reminder",
      name: "Reservation Reminder",
      subject: "Reminder: Your upcoming reservation",
      content: `<p>Dear {{client.firstName}},</p>
<p>This is a friendly reminder about your upcoming reservation with BouncyRent.</p>
<p>Your reservation is scheduled for <strong>{{reservation.startDate}}</strong>.</p>
<p>If you need to make any changes, please contact us as soon as possible.</p>
<p>Best regards,<br>The BouncyRent Team</p>`,
      type: "email",
      active: true,
    },
    {
      id: "email-invoice",
      name: "Invoice Created",
      subject: "Your invoice from BouncyRent",
      content: `<p>Dear {{client.firstName}},</p>
<p>Please find attached your invoice #{{invoice.id}} for your recent reservation.</p>
<p><strong>Amount due:</strong> {{invoice.amount}}</p>
<p><strong>Due date:</strong> {{invoice.dueDate}}</p>
<p>Payment methods are detailed in the attached invoice.</p>
<p>Thank you for your business!</p>
<p>Best regards,<br>The BouncyRent Team</p>`,
      type: "email",
      active: true,
    },
  ])

  // Initial SMS templates
  const [smsTemplates, setSmsTemplates] = useState<NotificationTemplate[]>([
    {
      id: "sms-reservation-confirmation",
      name: "Reservation Confirmation SMS",
      content:
        "BouncyRent: Your reservation for {{reservation.startDate}} is confirmed. Total: {{reservation.totalPrice}}. Questions? Call us at +48 123 456 789.",
      type: "sms",
      active: true,
    },
    {
      id: "sms-reservation-reminder",
      name: "Reservation Reminder SMS",
      content:
        "BouncyRent reminder: Your reservation is tomorrow at {{reservation.startDate}}. We're looking forward to seeing you!",
      type: "sms",
      active: true,
    },
  ])

  // Initial notification rules
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: "rule-reservation-created",
      name: "Reservation Confirmation",
      event: "reservation_created",
      templateId: "email-reservation-confirmation",
      recipients: "client",
      active: true,
    },
    {
      id: "rule-reservation-reminder",
      name: "Reservation Reminder",
      event: "reservation_reminder",
      templateId: "email-reservation-reminder",
      recipients: "client",
      timing: {
        beforeEvent: 1,
        unit: "days",
      },
      active: true,
    },
    {
      id: "rule-invoice-created",
      name: "Invoice Notification",
      event: "invoice_created",
      templateId: "email-invoice",
      recipients: "client",
      active: true,
    },
    {
      id: "rule-sms-confirmation",
      name: "SMS Confirmation",
      event: "reservation_created",
      templateId: "sms-reservation-confirmation",
      recipients: "client",
      active: true,
    },
  ])

  // State for editing templates
  const [currentTemplate, setCurrentTemplate] = useState<NotificationTemplate | null>(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null)

  // State for editing rules
  const [currentRule, setCurrentRule] = useState<NotificationRule | null>(null)
  const [isEditingRule, setIsEditingRule] = useState(false)

  // Email provider settings
  const [emailSettings, setEmailSettings] = useState({
    provider: "smtp",
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@bouncyrent.com",
    smtpPassword: "••••••••••••",
    senderEmail: "notifications@bouncyrent.com",
    senderName: "BouncyRent Notifications",
  })

  // SMS provider settings
  const [smsSettings, setSmsSetting] = useState({
    provider: "twilio",
    accountSid: "AC1234567890abcdef1234567890abcdef",
    authToken: "••••••••••••••••••••••••••••••",
    fromNumber: "+48123456789",
  })

  // Handle template toggle
  const handleTemplateToggle = (id: string, type: "email" | "sms", active: boolean) => {
    if (type === "email") {
      setEmailTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, active } : template)))
    } else {
      setSmsTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, active } : template)))
    }

    toast({
      title: active ? "Template activated" : "Template deactivated",
      description: `The notification template has been ${active ? "activated" : "deactivated"}.`,
    })
  }

  // Handle rule toggle
  const handleRuleToggle = (id: string, active: boolean) => {
    setNotificationRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, active } : rule)))

    toast({
      title: active ? "Rule activated" : "Rule deactivated",
      description: `The notification rule has been ${active ? "activated" : "deactivated"}.`,
    })
  }

  // Open template editor
  const openTemplateEditor = (template: NotificationTemplate | null, isNew = false) => {
    if (isNew) {
      setCurrentTemplate({
        id: `${template?.type || "email"}-${Date.now()}`,
        name: "",
        subject: template?.type === "email" ? "" : undefined,
        content: "",
        type: template?.type || "email",
        active: true,
      })
    } else {
      setCurrentTemplate(template)
    }
    setIsEditingTemplate(true)
  }

  // Save template
  const saveTemplate = () => {
    if (!currentTemplate) return

    if (currentTemplate.type === "email") {
      if (emailTemplates.some((t) => t.id === currentTemplate.id)) {
        setEmailTemplates((prev) =>
          prev.map((template) => (template.id === currentTemplate.id ? currentTemplate : template)),
        )
      } else {
        setEmailTemplates((prev) => [...prev, currentTemplate])
      }
    } else {
      if (smsTemplates.some((t) => t.id === currentTemplate.id)) {
        setSmsTemplates((prev) =>
          prev.map((template) => (template.id === currentTemplate.id ? currentTemplate : template)),
        )
      } else {
        setSmsTemplates((prev) => [...prev, currentTemplate])
      }
    }

    setIsEditingTemplate(false)
    setCurrentTemplate(null)

    toast({
      title: "Template saved",
      description: "The notification template has been saved successfully.",
    })
  }

  // Delete template
  const deleteTemplate = (id: string, type: "email" | "sms") => {
    if (type === "email") {
      setEmailTemplates((prev) => prev.filter((template) => template.id !== id))
    } else {
      setSmsTemplates((prev) => prev.filter((template) => template.id !== id))
    }

    // Also remove any rules using this template
    setNotificationRules((prev) => prev.filter((rule) => rule.templateId !== id))

    toast({
      title: "Template deleted",
      description: "The notification template has been deleted successfully.",
    })
  }

  // Open rule editor
  const openRuleEditor = (rule: NotificationRule | null, isNew = false) => {
    if (isNew) {
      setCurrentRule({
        id: `rule-${Date.now()}`,
        name: "",
        event: "reservation_created",
        templateId: "",
        recipients: "client",
        active: true,
      })
    } else {
      setCurrentRule(rule)
    }
    setIsEditingRule(true)
  }

  // Save rule
  const saveRule = () => {
    if (!currentRule) return

    if (notificationRules.some((r) => r.id === currentRule.id)) {
      setNotificationRules((prev) => prev.map((rule) => (rule.id === currentRule.id ? currentRule : rule)))
    } else {
      setNotificationRules((prev) => [...prev, currentRule])
    }

    setIsEditingRule(false)
    setCurrentRule(null)

    toast({
      title: "Rule saved",
      description: "The notification rule has been saved successfully.",
    })
  }

  // Delete rule
  const deleteRule = (id: string) => {
    setNotificationRules((prev) => prev.filter((rule) => rule.id !== id))

    toast({
      title: "Rule deleted",
      description: "The notification rule has been deleted successfully.",
    })
  }

  // Save provider settings
  const saveProviderSettings = () => {
    toast({
      title: "Settings saved",
      description: "Notification provider settings have been saved successfully.",
    })
  }

  // Send test notification
  const sendTestNotification = (templateId: string, type: "email" | "sms") => {
    toast({
      title: "Test notification sent",
      description: `A test ${type} has been sent using the selected template.`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rules">
            <Bell className="h-4 w-4 mr-2" />
            Notification Rules
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS Templates
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Send className="h-4 w-4 mr-2" />
            Providers
          </TabsTrigger>
        </TabsList>

        {/* Notification Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notification Rules</CardTitle>
              <Button onClick={() => openRuleEditor(null, true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure when and how notifications are sent to clients and administrators.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">Rule Name</th>
                        <th className="text-left font-medium p-2">Event</th>
                        <th className="text-left font-medium p-2">Template</th>
                        <th className="text-left font-medium p-2">Recipients</th>
                        <th className="text-left font-medium p-2">Timing</th>
                        <th className="text-center font-medium p-2">Active</th>
                        <th className="text-right font-medium p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationRules.map((rule) => {
                        // Find the associated template
                        const template = [...emailTemplates, ...smsTemplates].find((t) => t.id === rule.templateId)

                        return (
                          <tr key={rule.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-2 font-medium">{rule.name}</td>
                            <td className="p-2">
                              {rule.event === "reservation_created" && "Reservation Created"}
                              {rule.event === "reservation_reminder" && "Reservation Reminder"}
                              {rule.event === "reservation_cancelled" && "Reservation Cancelled"}
                              {rule.event === "invoice_created" && "Invoice Created"}
                              {rule.event === "payment_received" && "Payment Received"}
                              {rule.event === "maintenance_due" && "Maintenance Due"}
                            </td>
                            <td className="p-2">
                              {template ? (
                                <span className="flex items-center">
                                  {template.type === "email" ? (
                                    <Mail className="h-3 w-3 mr-1 text-blue-500" />
                                  ) : (
                                    <MessageSquare className="h-3 w-3 mr-1 text-green-500" />
                                  )}
                                  {template.name}
                                </span>
                              ) : (
                                <span className="text-red-500">Template not found</span>
                              )}
                            </td>
                            <td className="p-2">
                              {rule.recipients === "client" && "Client"}
                              {rule.recipients === "admin" && "Administrator"}
                              {rule.recipients === "both" && "Both"}
                            </td>
                            <td className="p-2">
                              {rule.timing ? (
                                <>
                                  {rule.timing.beforeEvent && `${rule.timing.beforeEvent} ${rule.timing.unit} before`}
                                  {rule.timing.afterEvent && `${rule.timing.afterEvent} ${rule.timing.unit} after`}
                                </>
                              ) : (
                                "Immediately"
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <Switch
                                checked={rule.active}
                                onCheckedChange={(checked) => handleRuleToggle(rule.id, checked)}
                              />
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openRuleEditor(rule)}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete notification rule</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this notification rule? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteRule(rule.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Email Templates</CardTitle>
              <Button onClick={() => openTemplateEditor({ type: "email" } as NotificationTemplate, true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize email templates for different notification types. You can use variables like
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{client.firstName}}"}</code> or
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{reservation.startDate}}"}</code>.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">Template Name</th>
                        <th className="text-left font-medium p-2">Subject</th>
                        <th className="text-center font-medium p-2">Active</th>
                        <th className="text-right font-medium p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailTemplates.map((template) => (
                        <tr key={template.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-2 font-medium">{template.name}</td>
                          <td className="p-2">{template.subject}</td>
                          <td className="p-2 text-center">
                            <Switch
                              checked={template.active}
                              onCheckedChange={(checked) => handleTemplateToggle(template.id, "email", checked)}
                            />
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openTemplateEditor(template)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestNotification(template.id, "email")}
                              >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send Test</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete email template</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this email template? This will also remove any
                                      notification rules using this template.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTemplate(template.id, "email")}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Templates Tab */}
        <TabsContent value="sms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SMS Templates</CardTitle>
              <Button onClick={() => openTemplateEditor({ type: "sms" } as NotificationTemplate, true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create SMS templates for different notification types. Keep messages concise and under 160 characters
                  when possible.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">Template Name</th>
                        <th className="text-left font-medium p-2">Content Preview</th>
                        <th className="text-center font-medium p-2">Active</th>
                        <th className="text-right font-medium p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {smsTemplates.map((template) => (
                        <tr key={template.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-2 font-medium">{template.name}</td>
                          <td className="p-2">
                            {template.content.length > 50
                              ? `${template.content.substring(0, 50)}...`
                              : template.content}
                          </td>
                          <td className="p-2 text-center">
                            <Switch
                              checked={template.active}
                              onCheckedChange={(checked) => handleTemplateToggle(template.id, "sms", checked)}
                            />
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openTemplateEditor(template)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestNotification(template.id, "sms")}
                              >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send Test</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete SMS template</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this SMS template? This will also remove any
                                      notification rules using this template.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTemplate(template.id, "sms")}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Provider Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Email Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Provider</Label>
                    <Select
                      value={emailSettings.provider}
                      onValueChange={(value) => setEmailSettings({ ...emailSettings, provider: value })}
                    >
                      <SelectTrigger id="emailProvider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP Server</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {emailSettings.provider === "smtp" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          value={emailSettings.smtpUsername}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input
                      id="senderEmail"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input
                      id="senderName"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                    />
                  </div>

                  <Button onClick={saveProviderSettings}>Save Email Settings</Button>
                </div>
              </CardContent>
            </Card>

            {/* SMS Provider Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SMS Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsProvider">Provider</Label>
                    <Select
                      value={smsSettings.provider}
                      onValueChange={(value) => setSmsSetting({ ...smsSettings, provider: value })}
                    >
                      <SelectTrigger id="smsProvider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo / Vonage</SelectItem>
                        <SelectItem value="messagebird">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {smsSettings.provider === "twilio" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accountSid">Account SID</Label>
                        <Input
                          id="accountSid"
                          value={smsSettings.accountSid}
                          onChange={(e) => setSmsSetting({ ...smsSettings, accountSid: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authToken">Auth Token</Label>
                        <Input
                          id="authToken"
                          type="password"
                          value={smsSettings.authToken}
                          onChange={(e) => setSmsSetting({ ...smsSettings, authToken: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fromNumber">From Number</Label>
                    <Input
                      id="fromNumber"
                      value={smsSettings.fromNumber}
                      onChange={(e) => setSmsSetting({ ...smsSettings, fromNumber: e.target.value })}
                    />
                  </div>

                  <Button onClick={saveProviderSettings}>Save SMS Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentTemplate?.id ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {currentTemplate?.type === "email"
                ? "Customize the email template. You can use HTML and variables like {{client.firstName}}."
                : "Create an SMS template. Keep it concise and under 160 characters when possible."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={currentTemplate?.name || ""}
                onChange={(e) => setCurrentTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>

            {currentTemplate?.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="templateSubject">Email Subject</Label>
                <Input
                  id="templateSubject"
                  value={currentTemplate?.subject || ""}
                  onChange={(e) => setCurrentTemplate((prev) => (prev ? { ...prev, subject: e.target.value } : null))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="templateContent">
                {currentTemplate?.type === "email" ? "Email Content (HTML)" : "SMS Content"}
              </Label>
              <Textarea
                id="templateContent"
                rows={currentTemplate?.type === "email" ? 10 : 4}
                value={currentTemplate?.content || ""}
                onChange={(e) => setCurrentTemplate((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Client</p>
                  <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                    <li>{"{{client.firstName}}"}</li>
                    <li>{"{{client.lastName}}"}</li>
                    <li>{"{{client.email}}"}</li>
                    <li>{"{{client.phone}}"}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Reservation</p>
                  <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                    <li>{"{{reservation.startDate}}"}</li>
                    <li>{"{{reservation.endDate}}"}</li>
                    <li>{"{{reservation.attractions}}"}</li>
                    <li>{"{{reservation.totalPrice}}"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>This is how your notification will appear with sample data.</DialogDescription>
          </DialogHeader>

          {previewTemplate?.type === "email" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Subject:</p>
                <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">{previewTemplate.subject}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Content:</p>
                <div className="border rounded p-4 bg-white dark:bg-gray-950">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: previewTemplate.content
                        .replace(/{{client\.firstName}}/g, "John")
                        .replace(/{{client\.lastName}}/g, "Doe")
                        .replace(/{{client\.email}}/g, "john.doe@example.com")
                        .replace(/{{client\.phone}}/g, "+48 123 456 789")
                        .replace(/{{reservation\.startDate}}/g, "2023-06-15 14:00")
                        .replace(/{{reservation\.endDate}}/g, "2023-06-15 18:00")
                        .replace(/{{reservation\.attractions}}/g, "Vibrant Kingdom Bounce, Pirate Adventure Bounce")
                        .replace(/{{reservation\.totalPrice}}/g, "$250.00")
                        .replace(/{{invoice\.id}}/g, "INV-2023-001")
                        .replace(/{{invoice\.amount}}/g, "$250.00")
                        .replace(/{{invoice\.dueDate}}/g, "2023-06-22"),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {previewTemplate?.type === "sms" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">SMS Content:</p>
                <div className="border rounded p-4 bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm">
                    {previewTemplate.content
                      .replace(/{{client\.firstName}}/g, "John")
                      .replace(/{{client\.lastName}}/g, "Doe")
                      .replace(/{{client\.phone}}/g, "+48 123 456 789")
                      .replace(/{{reservation\.startDate}}/g, "June 15 at 2:00 PM")
                      .replace(/{{reservation\.endDate}}/g, "June 15 at 6:00 PM")
                      .replace(/{{reservation\.attractions}}/g, "Vibrant Kingdom, Pirate Adventure")
                      .replace(/{{reservation\.totalPrice}}/g, "$250.00")}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Character Count:</p>
                <p className="text-sm">
                  {previewTemplate.content.length} characters
                  {previewTemplate.content.length > 160 && (
                    <span className="text-amber-500 ml-2">(May be split into multiple messages)</span>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Editor Dialog */}
      <Dialog open={isEditingRule} onOpenChange={setIsEditingRule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentRule?.id ? "Edit Rule" : "Create Rule"}</DialogTitle>
            <DialogDescription>Configure when and how notifications are sent.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                value={currentRule?.name || ""}
                onChange={(e) => setCurrentRule((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleEvent">Event</Label>
              <Select
                value={currentRule?.event}
                onValueChange={(value: any) => setCurrentRule((prev) => (prev ? { ...prev, event: value } : null))}
              >
                <SelectTrigger id="ruleEvent">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_reservation_created">Reservation Created</SelectItem>
                  <SelectItem value="_reservation_reminder">Reservation Reminder</SelectItem>
                  <SelectItem value="_reservation_cancelled">Reservation Cancelled</SelectItem>
                  <SelectItem value="_invoice_created">Invoice Created</SelectItem>
                  <SelectItem value="_payment_received">Payment Received</SelectItem>
                  <SelectItem value="_maintenance_due">Maintenance Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleTemplate">Template</Label>
              <Select
                value={currentRule?.templateId}
                onValueChange={(value) => setCurrentRule((prev) => (prev ? { ...prev, templateId: value } : null))}
              >
                <SelectTrigger id="ruleTemplate">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none" disabled>
                    Select a template
                  </SelectItem>
                  {emailTemplates.length > 0 && (
                    <>
                      <SelectItem value="_email_header" disabled className="font-medium">
                        Email Templates
                      </SelectItem>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {smsTemplates.length > 0 && (
                    <>
                      <SelectItem value="_sms_header" disabled className="font-medium">
                        SMS Templates
                      </SelectItem>
                      {smsTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleRecipients">Recipients</Label>
              <Select
                value={currentRule?.recipients}
                onValueChange={(value: any) => setCurrentRule((prev) => (prev ? { ...prev, recipients: value } : null))}
              >
                <SelectTrigger id="ruleRecipients">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client Only</SelectItem>
                  <SelectItem value="admin">Administrator Only</SelectItem>
                  <SelectItem value="both">Both Client and Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(currentRule?.event === "reservation_reminder" || currentRule?.event === "maintenance_due") && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="timingValue">Send</Label>
                    <Input
                      id="timingValue"
                      type="number"
                      min="1"
                      value={currentRule?.timing?.beforeEvent || 1}
                      onChange={(e) =>
                        setCurrentRule((prev) =>
                          prev
                            ? {
                                ...prev,
                                timing: {
                                  ...prev.timing,
                                  beforeEvent: Number.parseInt(e.target.value),
                                  afterEvent: undefined,
                                },
                              }
                            : null,
                        )
                      }
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="timingUnit">Unit</Label>
                    <Select
                      value={currentRule?.timing?.unit || "days"}
                      onValueChange={(value: any) =>
                        setCurrentRule((prev) =>
                          prev
                            ? {
                                ...prev,
                                timing: {
                                  ...prev.timing,
                                  unit: value,
                                },
                              }
                            : null,
                        )
                      }
                    >
                      <SelectTrigger id="timingUnit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="timingType">When</Label>
                    <Select
                      value={currentRule?.timing?.beforeEvent ? "before" : "after"}
                      onValueChange={(value) => {
                        if (value === "before") {
                          setCurrentRule((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  timing: {
                                    beforeEvent: prev.timing?.beforeEvent || 1,
                                    unit: prev.timing?.unit || "days",
                                  },
                                }
                              : null,
                          )
                        } else {
                          setCurrentRule((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  timing: {
                                    afterEvent: prev.timing?.beforeEvent || 1,
                                    unit: prev.timing?.unit || "days",
                                  },
                                }
                              : null,
                          )
                        }
                      }}
                    >
                      <SelectTrigger id="timingType">
                        <SelectValue placeholder="Select when" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before Event</SelectItem>
                        <SelectItem value="after">After Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingRule(false)}>
              Cancel
            </Button>
            <Button onClick={saveRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
