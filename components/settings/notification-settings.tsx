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
import { useTranslation } from "@/lib/i18n/translation-context"

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
  const { t } = useTranslation()

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
      title: active ? t("settings.templateActivated") : t("settings.templateDeactivated"),
      description: `The notification template has been ${active ? "activated" : "deactivated"}.`,
    })
  }

  // Handle rule toggle
  const handleRuleToggle = (id: string, active: boolean) => {
    setNotificationRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, active } : rule)))

    toast({
      title: active ? t("settings.ruleActivated") : t("settings.ruleDeactivated"),
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
      title: t("settings.templateSaved"),
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
      title: t("settings.templateDeleted"),
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
      title: t("settings.ruleSaved"),
      description: "The notification rule has been saved successfully.",
    })
  }

  // Delete rule
  const deleteRule = (id: string) => {
    setNotificationRules((prev) => prev.filter((rule) => rule.id !== id))

    toast({
      title: t("settings.ruleDeleted"),
      description: "The notification rule has been deleted successfully.",
    })
  }

  // Save provider settings
  const saveProviderSettings = () => {
    toast({
      title: t("settings.settingsSaved"),
      description: "Notification provider settings have been saved successfully.",
    })
  }

  // Send test notification
  const sendTestNotification = (templateId: string, type: "email" | "sms") => {
    toast({
      title: t("settings.testNotificationSent"),
      description: `A test ${type} has been sent using the selected template.`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rules">
            <Bell className="h-4 w-4 mr-2" />
            {t("settings.notificationRules")}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            {t("settings.emailTemplates")}
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t("settings.smsTemplates")}
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Send className="h-4 w-4 mr-2" />
            {t("settings.providers")}
          </TabsTrigger>
        </TabsList>

        {/* Notification Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("settings.notificationRules")}</CardTitle>
              <Button onClick={() => openRuleEditor(null, true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.addRule")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.notificationRulesDescription")}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">{t("settings.ruleName")}</th>
                        <th className="text-left font-medium p-2">{t("settings.event")}</th>
                        <th className="text-left font-medium p-2">{t("settings.template")}</th>
                        <th className="text-left font-medium p-2">{t("settings.recipients")}</th>
                        <th className="text-left font-medium p-2">{t("settings.timing")}</th>
                        <th className="text-center font-medium p-2">{t("settings.active")}</th>
                        <th className="text-right font-medium p-2">{t("settings.actions")}</th>
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
                              {rule.event === "reservation_created" && t("settings.reservationCreated")}
                              {rule.event === "reservation_reminder" && t("settings.reservationReminder")}
                              {rule.event === "reservation_cancelled" && t("settings.reservationCancelled")}
                              {rule.event === "invoice_created" && t("settings.invoiceCreated")}
                              {rule.event === "payment_received" && t("settings.paymentReceived")}
                              {rule.event === "maintenance_due" && t("settings.maintenanceDue")}
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
                                <span className="text-red-500">{t("settings.templateNotFound")}</span>
                              )}
                            </td>
                            <td className="p-2">
                              {rule.recipients === "client" && t("settings.client")}
                              {rule.recipients === "admin" && t("settings.administrator")}
                              {rule.recipients === "both" && t("settings.both")}
                            </td>
                            <td className="p-2">
                              {rule.timing ? (
                                <>
                                  {rule.timing.beforeEvent &&
                                    `${rule.timing.beforeEvent} ${rule.timing.unit} ${t("settings.before")}`}
                                  {rule.timing.afterEvent &&
                                    `${rule.timing.afterEvent} ${rule.timing.unit} ${t("settings.after")}`}
                                </>
                              ) : (
                                t("settings.immediately")
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
                                  <span className="sr-only">{t("settings.edit")}</span>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                      <span className="sr-only">{t("settings.delete")}</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("settings.deleteNotificationRule")}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("settings.deleteNotificationRuleConfirmation")}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteRule(rule.id)}>
                                        {t("settings.delete")}
                                      </AlertDialogAction>
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
              <CardTitle>{t("settings.emailTemplates")}</CardTitle>
              <Button onClick={() => openTemplateEditor({ type: "email" } as NotificationTemplate, true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.addTemplate")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.emailTemplatesDescription")}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">{t("settings.templateName")}</th>
                        <th className="text-left font-medium p-2">{t("settings.subject")}</th>
                        <th className="text-center font-medium p-2">{t("settings.active")}</th>
                        <th className="text-right font-medium p-2">{t("settings.actions")}</th>
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
                                <span className="sr-only">{t("settings.preview")}</span>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openTemplateEditor(template)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">{t("settings.edit")}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestNotification(template.id, "email")}
                              >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">{t("settings.sendTest")}</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">{t("settings.delete")}</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("settings.deleteEmailTemplate")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("settings.deleteEmailTemplateConfirmation")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTemplate(template.id, "email")}>
                                      {t("settings.delete")}
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
              <CardTitle>{t("settings.smsTemplates")}</CardTitle>
              <Button onClick={() => openTemplateEditor({ type: "sms" } as NotificationTemplate, true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.addTemplate")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.smsTemplatesDescription")}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left font-medium p-2">{t("settings.templateName")}</th>
                        <th className="text-left font-medium p-2">{t("settings.contentPreview")}</th>
                        <th className="text-center font-medium p-2">{t("settings.active")}</th>
                        <th className="text-right font-medium p-2">{t("settings.actions")}</th>
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
                                <span className="sr-only">{t("settings.preview")}</span>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openTemplateEditor(template)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">{t("settings.edit")}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestNotification(template.id, "sms")}
                              >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">{t("settings.sendTest")}</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">{t("settings.delete")}</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("settings.deleteSmsTemplate")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("settings.deleteSmsTemplateConfirmation")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTemplate(template.id, "sms")}>
                                      {t("settings.delete")}
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
                <CardTitle>{t("settings.emailProvider")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">{t("settings.provider")}</Label>
                    <Select
                      value={emailSettings.provider}
                      onValueChange={(value) => setEmailSettings({ ...emailSettings, provider: value })}
                    >
                      <SelectTrigger id="emailProvider">
                        <SelectValue placeholder={t("settings.selectProvider")} />
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
                        <Label htmlFor="smtpHost">{t("settings.smtpHost")}</Label>
                        <Input
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">{t("settings.smtpPort")}</Label>
                        <Input
                          id="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">{t("settings.smtpUsername")}</Label>
                        <Input
                          id="smtpUsername"
                          value={emailSettings.smtpUsername}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">{t("settings.smtpPassword")}</Label>
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
                    <Label htmlFor="senderEmail">{t("settings.senderEmail")}</Label>
                    <Input
                      id="senderEmail"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderName">{t("settings.senderName")}</Label>
                    <Input
                      id="senderName"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                    />
                  </div>

                  <Button onClick={saveProviderSettings}>{t("settings.saveEmailSettings")}</Button>
                </div>
              </CardContent>
            </Card>

            {/* SMS Provider Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.smsProvider")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsProvider">{t("settings.provider")}</Label>
                    <Select
                      value={smsSettings.provider}
                      onValueChange={(value) => setSmsSetting({ ...smsSettings, provider: value })}
                    >
                      <SelectTrigger id="smsProvider">
                        <SelectValue placeholder={t("settings.selectProvider")} />
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
                        <Label htmlFor="accountSid">{t("settings.accountSid")}</Label>
                        <Input
                          id="accountSid"
                          value={smsSettings.accountSid}
                          onChange={(e) => setSmsSetting({ ...smsSettings, accountSid: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authToken">{t("settings.authToken")}</Label>
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
                    <Label htmlFor="fromNumber">{t("settings.fromNumber")}</Label>
                    <Input
                      id="fromNumber"
                      value={smsSettings.fromNumber}
                      onChange={(e) => setSmsSetting({ ...smsSettings, fromNumber: e.target.value })}
                    />
                  </div>

                  <Button onClick={saveProviderSettings}>{t("settings.saveSmsSettings")}</Button>
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
            <DialogTitle>{currentTemplate?.id ? t("settings.editTemplate") : t("settings.createTemplate")}</DialogTitle>
            <DialogDescription>
              {currentTemplate?.type === "email"
                ? t("settings.customizeEmailTemplate")
                : t("settings.createSmsTemplate")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">{t("settings.templateName")}</Label>
              <Input
                id="templateName"
                value={currentTemplate?.name || ""}
                onChange={(e) => setCurrentTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>

            {currentTemplate?.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="templateSubject">{t("settings.emailSubject")}</Label>
                <Input
                  id="templateSubject"
                  value={currentTemplate?.subject || ""}
                  onChange={(e) => setCurrentTemplate((prev) => (prev ? { ...prev, subject: e.target.value } : null))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="templateContent">
                {currentTemplate?.type === "email" ? t("settings.emailContent") : t("settings.smsContent")}
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
              <Label>{t("settings.availableVariables")}</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">{t("settings.client")}</p>
                  <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                    <li>{"{{client.firstName}}"}</li>
                    <li>{"{{client.lastName}}"}</li>
                    <li>{"{{client.email}}"}</li>
                    <li>{"{{client.phone}}"}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">{t("settings.reservation")}</p>
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
              {t("settings.cancel")}
            </Button>
            <Button onClick={saveTemplate}>{t("settings.saveTemplate")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("settings.preview")}: {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>{t("settings.previewDescription")}</DialogDescription>
          </DialogHeader>

          {previewTemplate?.type === "email" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("settings.subject")}:</p>
                <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">{previewTemplate.subject}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">{t("settings.content")}:</p>
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
                <p className="text-sm font-medium">{t("settings.smsContent")}:</p>
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
                <p className="text-sm font-medium">{t("settings.characterCount")}:</p>
                <p className="text-sm">
                  {previewTemplate.content.length} {t("settings.characters")}
                  {previewTemplate.content.length > 160 && (
                    <span className="text-amber-500 ml-2">({t("settings.multipleSmsWarning")})</span>
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewTemplate(null)}>{t("settings.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Editor Dialog */}
      <Dialog open={isEditingRule} onOpenChange={setIsEditingRule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentRule?.id ? t("settings.editRule") : t("settings.createRule")}</DialogTitle>
            <DialogDescription>{t("settings.configureNotifications")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">{t("settings.ruleName")}</Label>
              <Input
                id="ruleName"
                value={currentRule?.name || ""}
                onChange={(e) => setCurrentRule((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleEvent">{t("settings.event")}</Label>
              <Select
                value={currentRule?.event}
                onValueChange={(value: any) => setCurrentRule((prev) => (prev ? { ...prev, event: value } : null))}
              >
                <SelectTrigger id="ruleEvent">
                  <SelectValue placeholder={t("settings.selectEvent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_reservation_created">{t("settings.reservationCreated")}</SelectItem>
                  <SelectItem value="_reservation_reminder">{t("settings.reservationReminder")}</SelectItem>
                  <SelectItem value="_reservation_cancelled">{t("settings.reservationCancelled")}</SelectItem>
                  <SelectItem value="_invoice_created">{t("settings.invoiceCreated")}</SelectItem>
                  <SelectItem value="_payment_received">{t("settings.paymentReceived")}</SelectItem>
                  <SelectItem value="_maintenance_due">{t("settings.maintenanceDue")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruleTemplate">{t("settings.template")}</Label>
              <Select
                value={currentRule?.templateId}
                onValueChange={(value) => setCurrentRule((prev) => (prev ? { ...prev, templateId: value } : null))}
              >
                <SelectTrigger id="ruleTemplate">
                  <SelectValue placeholder={t("settings.selectTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none" disabled>
                    {t("settings.selectTemplate")}
                  </SelectItem>
                  {emailTemplates.length > 0 && (
                    <>
                      <SelectItem value="_email_header" disabled className="font-medium">
                        {t("settings.emailTemplates")}
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
                        {t("settings.smsTemplates")}
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
              <Label htmlFor="ruleRecipients">{t("settings.recipients")}</Label>
              <Select
                value={currentRule?.recipients}
                onValueChange={(value: any) => setCurrentRule((prev) => (prev ? { ...prev, recipients: value } : null))}
              >
                <SelectTrigger id="ruleRecipients">
                  <SelectValue placeholder={t("settings.selectRecipients")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">{t("settings.clientOnly")}</SelectItem>
                  <SelectItem value="admin">{t("settings.administratorOnly")}</SelectItem>
                  <SelectItem value="both">{t("settings.bothClientAndAdmin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(currentRule?.event === "reservation_reminder" || currentRule?.event === "maintenance_due") && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="timingValue">{t("settings.send")}</Label>
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
                    <Label htmlFor="timingUnit">{t("settings.unit")}</Label>
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
                        <SelectValue placeholder={t("settings.selectUnit")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">{t("settings.hours")}</SelectItem>
                        <SelectItem value="days">{t("settings.days")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="timingType">{t("settings.when")}</Label>
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
                        <SelectValue placeholder={t("settings.selectWhen")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">{t("settings.beforeEvent")}</SelectItem>
                        <SelectItem value="after">{t("settings.afterEvent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingRule(false)}>
              {t("settings.cancel")}
            </Button>
            <Button onClick={saveRule}>{t("settings.saveRule")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
