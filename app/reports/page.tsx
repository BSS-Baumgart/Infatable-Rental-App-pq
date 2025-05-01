"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleDateRangePicker } from "@/components/ui/simple-date-range-picker"
import { format, subDays } from "date-fns"
import { Download, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function ReportsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [reportType, setReportType] = useState<"standard" | "custom">("standard")
  const [selectedStandardReport, setSelectedStandardReport] = useState("reservations")
  const [reportFormat, setReportFormat] = useState("excel")
  const [joinedTables, setJoinedTables] = useState({
    clients: true,
    reservations: true,
    attractions: true,
    invoices: false,
    documents: false,
  })
  const [selectedFields, setSelectedFields] = useState({
    clients: ["id", "firstName", "lastName", "email", "phone"],
    reservations: ["id", "startDate", "endDate", "status", "totalPrice"],
    attractions: ["id", "name", "price"],
    invoices: ["id", "amount", "status"],
    documents: ["id", "name", "type"],
  })
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null)

  const availableFields = {
    clients: [
      { id: "id", label: t("reports.fields.id") },
      { id: "firstName", label: t("reports.fields.firstName") },
      { id: "lastName", label: t("reports.fields.lastName") },
      { id: "email", label: t("reports.fields.email") },
      { id: "phone", label: t("reports.fields.phone") },
      { id: "street", label: t("reports.fields.street") },
      { id: "buildingNumber", label: t("reports.fields.buildingNumber") },
      { id: "postalCode", label: t("reports.fields.postalCode") },
      { id: "city", label: t("reports.fields.city") },
      { id: "createdAt", label: t("reports.fields.createdAt") },
    ],
    reservations: [
      { id: "id", label: t("reports.fields.id") },
      { id: "clientId", label: t("reports.fields.clientId") },
      { id: "status", label: t("reports.fields.status") },
      { id: "startDate", label: t("reports.fields.startDate") },
      { id: "endDate", label: t("reports.fields.endDate") },
      { id: "totalPrice", label: t("reports.fields.totalPrice") },
      { id: "notes", label: t("reports.fields.notes") },
      { id: "createdAt", label: t("reports.fields.createdAt") },
      { id: "updatedAt", label: t("reports.fields.updatedAt") },
    ],
    attractions: [
      { id: "id", label: t("reports.fields.id") },
      { id: "name", label: t("reports.fields.name") },
      { id: "width", label: t("reports.fields.width") },
      { id: "height", label: t("reports.fields.height") },
      { id: "length", label: t("reports.fields.length") },
      { id: "weight", label: t("reports.fields.weight") },
      { id: "price", label: t("reports.fields.price") },
      { id: "setupTime", label: t("reports.fields.setupTime") },
    ],
    invoices: [
      { id: "id", label: t("reports.fields.id") },
      { id: "reservationId", label: t("reports.fields.reservationId") },
      { id: "clientId", label: t("reports.fields.clientId") },
      { id: "issueDate", label: t("reports.fields.issueDate") },
      { id: "dueDate", label: t("reports.fields.dueDate") },
      { id: "amount", label: t("reports.fields.amount") },
      { id: "status", label: t("reports.fields.status") },
    ],
    documents: [
      { id: "id", label: t("reports.fields.id") },
      { id: "name", label: t("reports.fields.name") },
      { id: "type", label: t("reports.fields.type") },
      { id: "size", label: t("reports.fields.size") },
      { id: "uploadedAt", label: t("reports.fields.uploadedAt") },
      { id: "description", label: t("reports.fields.description") },
    ],
  }

  const standardReports = [
    {
      id: "reservations",
      name: t("reports.standardReports.reservations.name"),
      description: t("reports.standardReports.reservations.description"),
      tables: ["reservations", "clients", "attractions"],
    },
    {
      id: "clients",
      name: t("reports.standardReports.clients.name"),
      description: t("reports.standardReports.clients.description"),
      tables: ["clients", "reservations"],
    },
    {
      id: "attractions",
      name: t("reports.standardReports.attractions.name"),
      description: t("reports.standardReports.attractions.description"),
      tables: ["attractions", "reservations"],
    },
    {
      id: "financial",
      name: t("reports.standardReports.financial.name"),
      description: t("reports.standardReports.financial.description"),
      tables: ["reservations", "invoices"],
    },
    {
      id: "comprehensive",
      name: t("reports.standardReports.comprehensive.name"),
      description: t("reports.standardReports.comprehensive.description"),
      tables: ["clients", "reservations", "attractions", "invoices", "documents"],
    },
  ]

  const toggleField = (table: string, field: string) => {
    setSelectedFields((prev) => {
      const currentFields = prev[table as keyof typeof prev] || []
      if (currentFields.includes(field)) {
        return {
          ...prev,
          [table]: currentFields.filter((f) => f !== field),
        }
      } else {
        return {
          ...prev,
          [table]: [...currentFields, field],
        }
      }
    })
  }

  const toggleTable = (table: string, checked: boolean) => {
    setJoinedTables((prev) => ({
      ...prev,
      [table]: checked,
    }))

    // If unchecking a table, clear its selected fields
    if (!checked) {
      setSelectedFields((prev) => ({
        ...prev,
        [table]: [],
      }))
    } else {
      // If checking a table, add default fields
      const defaultFields = availableFields[table as keyof typeof availableFields].slice(0, 5).map((field) => field.id)
      setSelectedFields((prev) => ({
        ...prev,
        [table]: defaultFields,
      }))
    }
  }

  const generateReportSpecification = () => {
    // Create a specification object that would be sent to the backend
    const tables = Object.entries(joinedTables)
      .filter(([_, isSelected]) => isSelected)
      .map(([tableName]) => tableName)

    const fields = Object.entries(selectedFields)
      .filter(([tableName]) => joinedTables[tableName as keyof typeof joinedTables])
      .reduce(
        (acc, [tableName, tableFields]) => ({
          ...acc,
          [tableName]: tableFields,
        }),
        {},
      )

    return {
      type: reportType,
      standardReportId: reportType === "standard" ? selectedStandardReport : undefined,
      format: reportFormat,
      dateRange: {
        from: format(startDate, "yyyy-MM-dd"),
        to: format(endDate, "yyyy-MM-dd"),
      },
      tables,
      fields,
    }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedReportUrl(null)

    const reportSpec = generateReportSpecification()
    console.log("Report Specification:", reportSpec)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 500)

    try {
      // Simulate API call to generate report
      await new Promise((resolve) => setTimeout(resolve, 3000))

      clearInterval(progressInterval)
      setGenerationProgress(100)

      // Simulate a generated report URL
      setGeneratedReportUrl("/api/reports/download/report-" + Date.now() + ".xlsx")

      toast({
        title: t("reports.toast.generateSuccess"),
        description: t("reports.toast.generateSuccessDescription"),
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: t("reports.toast.generateError"),
        description: t("reports.toast.generateErrorDescription"),
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
      }, 500)
    }
  }

  const handleDownloadReport = () => {
    if (!generatedReportUrl) return

    // In a real implementation, this would trigger the actual download
    // For now, we'll just show a toast
    toast({
      title: t("reports.toast.downloadStarted"),
      description: t("reports.toast.downloadStartedDescription"),
    })

    // Simulate download completion
    setTimeout(() => {
      toast({
        title: t("reports.toast.downloadComplete"),
        description: t("reports.toast.downloadCompleteDescription"),
      })
    }, 2000)
  }

  const getSelectedTablesCount = () => {
    return Object.values(joinedTables).filter(Boolean).length
  }

  const getSelectedFieldsCount = () => {
    return Object.values(selectedFields).reduce((acc, fields) => acc + fields.length, 0)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("reports.title")}</h1>
          {generatedReportUrl && (
            <Button onClick={handleDownloadReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t("reports.downloadReport")}
            </Button>
          )}
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate">{t("reports.generateReport")}</TabsTrigger>
            <TabsTrigger value="history">{t("reports.reportHistory")}</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{t("reports.type")}</CardTitle>
                  <CardDescription>{t("reports.configureSettings")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t("reports.reportType")}</Label>
                    <div className="flex items-center space-x-2">
                      <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("reports.selectReportType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">{t("reports.standardReport")}</SelectItem>
                          <SelectItem value="custom">{t("reports.customReport")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {reportType === "standard" && (
                    <div className="space-y-2">
                      <Label>{t("reports.standardReportTemplate")}</Label>
                      <Select value={selectedStandardReport} onValueChange={setSelectedStandardReport}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("reports.selectTemplate")} />
                        </SelectTrigger>
                        <SelectContent>
                          {standardReports.map((report) => (
                            <SelectItem key={report.id} value={report.id}>
                              {report.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {standardReports.find((r) => r.id === selectedStandardReport)?.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t("reports.dateRange")}</Label>
                    <SimpleDateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("reports.reportFormat")}</Label>
                    <Select value={reportFormat} onValueChange={setReportFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("reports.selectFormat")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">{t("reports.formats.excel")}</SelectItem>
                        <SelectItem value="csv">{t("reports.formats.csv")}</SelectItem>
                        <SelectItem value="pdf">{t("reports.formats.pdf")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("reports.generating")}
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {t("reports.generateReport")}
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="h-2 w-full" />
                      <p className="text-center text-sm text-muted-foreground">
                        {generationProgress < 100
                          ? `${t("reports.generatingReport")}... ${Math.round(generationProgress)}%`
                          : t("reports.reportGenerated")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {reportType === "custom" && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>{t("reports.customReportConfiguration")}</CardTitle>
                    <CardDescription>
                      {t("reports.selectTablesAndFields")}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                          {getSelectedTablesCount()} {t("reports.tablesSelected")}
                        </Badge>
                        <Badge variant="outline" className="bg-primary/10">
                          {getSelectedFieldsCount()} {t("reports.fieldsSelected")}
                        </Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    <Accordion type="multiple" defaultValue={["clients", "reservations", "attractions"]}>
                      <AccordionItem value="clients">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={joinedTables.clients}
                              onCheckedChange={(checked) => toggleTable("clients", checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{t("reports.tables.clients")}</span>
                            {joinedTables.clients && (
                              <Badge variant="outline" className="ml-2">
                                {selectedFields.clients.length} {t("reports.fields")}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {joinedTables.clients && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {availableFields.clients.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`clients-${field.id}`}
                                    checked={selectedFields.clients.includes(field.id)}
                                    onCheckedChange={() => toggleField("clients", field.id)}
                                  />
                                  <Label htmlFor={`clients-${field.id}`} className="cursor-pointer">
                                    {field.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="reservations">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={joinedTables.reservations}
                              onCheckedChange={(checked) => toggleTable("reservations", checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{t("reports.tables.reservations")}</span>
                            {joinedTables.reservations && (
                              <Badge variant="outline" className="ml-2">
                                {selectedFields.reservations.length} {t("reports.fields")}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {joinedTables.reservations && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {availableFields.reservations.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`reservations-${field.id}`}
                                    checked={selectedFields.reservations.includes(field.id)}
                                    onCheckedChange={() => toggleField("reservations", field.id)}
                                  />
                                  <Label htmlFor={`reservations-${field.id}`} className="cursor-pointer">
                                    {field.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="attractions">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={joinedTables.attractions}
                              onCheckedChange={(checked) => toggleTable("attractions", checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{t("reports.tables.attractions")}</span>
                            {joinedTables.attractions && (
                              <Badge variant="outline" className="ml-2">
                                {selectedFields.attractions.length} {t("reports.fields")}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {joinedTables.attractions && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {availableFields.attractions.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`attractions-${field.id}`}
                                    checked={selectedFields.attractions.includes(field.id)}
                                    onCheckedChange={() => toggleField("attractions", field.id)}
                                  />
                                  <Label htmlFor={`attractions-${field.id}`} className="cursor-pointer">
                                    {field.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="invoices">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={joinedTables.invoices}
                              onCheckedChange={(checked) => toggleTable("invoices", checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{t("reports.tables.invoices")}</span>
                            {joinedTables.invoices && (
                              <Badge variant="outline" className="ml-2">
                                {selectedFields.invoices.length} {t("reports.fields")}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {joinedTables.invoices && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {availableFields.invoices.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`invoices-${field.id}`}
                                    checked={selectedFields.invoices.includes(field.id)}
                                    onCheckedChange={() => toggleField("invoices", field.id)}
                                  />
                                  <Label htmlFor={`invoices-${field.id}`} className="cursor-pointer">
                                    {field.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="documents">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={joinedTables.documents}
                              onCheckedChange={(checked) => toggleTable("documents", checked)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{t("reports.tables.documents")}</span>
                            {joinedTables.documents && (
                              <Badge variant="outline" className="ml-2">
                                {selectedFields.documents.length} {t("reports.fields")}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {joinedTables.documents && (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {availableFields.documents.map((field) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`documents-${field.id}`}
                                    checked={selectedFields.documents.includes(field.id)}
                                    onCheckedChange={() => toggleField("documents", field.id)}
                                  />
                                  <Label htmlFor={`documents-${field.id}`} className="cursor-pointer">
                                    {field.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {reportType === "standard" && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {standardReports.find((r) => r.id === selectedStandardReport)?.name || t("reports.reportPreview")}
                    </CardTitle>
                    <CardDescription>
                      {t("reports.includeDataFromTables")}:
                      <div className="mt-2 flex flex-wrap gap-2">
                        {standardReports
                          .find((r) => r.id === selectedStandardReport)
                          ?.tables.map((table) => (
                            <Badge key={table} variant="outline" className="bg-primary/10">
                              {t(`reports.tables.${table}`)}
                            </Badge>
                          ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium">{t("reports.reportPreview")}</h3>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{t("reports.previewDescription")}</p>

                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse">
                            <thead>
                              <tr className="border-b">
                                {selectedStandardReport === "reservations" && (
                                  <>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.reservationId")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.client")}</th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.date")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.attractions")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.status")}</th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.total")}</th>
                                  </>
                                )}

                                {selectedStandardReport === "clients" && (
                                  <>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.clientId")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.name")}</th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.email")}</th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.phone")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.reservations")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.totalSpent")}
                                    </th>
                                  </>
                                )}

                                {selectedStandardReport === "attractions" && (
                                  <>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.attractionId")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.name")}</th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.price")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.bookings")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.revenue")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.utilization")}
                                    </th>
                                  </>
                                )}

                                {selectedStandardReport === "financial" && (
                                  <>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.month")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.reservations")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.revenue")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.paid")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.outstanding")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.growth")}</th>
                                  </>
                                )}

                                {selectedStandardReport === "comprehensive" && (
                                  <>
                                    <th className="p-2 text-left text-sm font-medium">{t("reports.columns.date")}</th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.reservations")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.clients")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.revenue")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.attractions")}
                                    </th>
                                    <th className="p-2 text-left text-sm font-medium">
                                      {t("reports.columns.documents")}
                                    </th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {/* Sample data rows */}
                              <tr className="border-b">
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                                <td className="p-2">{t("reports.sampleData")}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("reports.reportHistory")}</CardTitle>
                <CardDescription>{t("reports.previouslyGeneratedReports")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">{t("reports.columns.reportName")}</th>
                        <th className="p-2 text-left">{t("reports.columns.type")}</th>
                        <th className="p-2 text-left">{t("reports.columns.dateGenerated")}</th>
                        <th className="p-2 text-left">{t("reports.columns.format")}</th>
                        <th className="p-2 text-left">{t("reports.columns.generatedBy")}</th>
                        <th className="p-2 text-left">{t("reports.columns.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">{t("reports.history.monthlyReservations")}</td>
                        <td className="p-2">{t("reports.standardReport")}</td>
                        <td className="p-2">2023-04-15 14:30</td>
                        <td className="p-2">{t("reports.formats.excel")}</td>
                        <td className="p-2">John Doe</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">{t("reports.history.q1FinancialReport")}</td>
                        <td className="p-2">{t("reports.customReport")}</td>
                        <td className="p-2">2023-04-01 09:15</td>
                        <td className="p-2">{t("reports.formats.pdf")}</td>
                        <td className="p-2">Jane Smith</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">{t("reports.history.clientActivity")}</td>
                        <td className="p-2">{t("reports.standardReport")}</td>
                        <td className="p-2">2023-03-22 16:45</td>
                        <td className="p-2">{t("reports.formats.csv")}</td>
                        <td className="p-2">John Doe</td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
