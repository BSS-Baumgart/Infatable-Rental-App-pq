"use client"

import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SimpleDateRangePickerProps {
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  className?: string
}

export function SimpleDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: SimpleDateRangePickerProps) {
  // Format dates for input fields
  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  // Handle preset selections
  const applyPreset = (preset: string) => {
    const today = new Date()

    switch (preset) {
      case "today":
        onStartDateChange(today)
        onEndDateChange(today)
        break
      case "yesterday":
        const yesterday = subDays(today, 1)
        onStartDateChange(yesterday)
        onEndDateChange(yesterday)
        break
      case "last7days":
        onStartDateChange(subDays(today, 6))
        onEndDateChange(today)
        break
      case "last30days":
        onStartDateChange(subDays(today, 29))
        onEndDateChange(today)
        break
      case "thisMonth":
        onStartDateChange(startOfMonth(today))
        onEndDateChange(endOfMonth(today))
        break
      case "lastMonth":
        const lastMonth = subMonths(today, 1)
        onStartDateChange(startOfMonth(lastMonth))
        onEndDateChange(endOfMonth(lastMonth))
        break
    }
  }

  const presets = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date" className="mb-1 block">
              Start Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                id="start-date"
                className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formatDateForInput(startDate)}
                onChange={(e) => onStartDateChange(new Date(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="end-date" className="mb-1 block">
              End Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                id="end-date"
                className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formatDateForInput(endDate)}
                onChange={(e) => onEndDateChange(new Date(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Label className="mb-1 block">Preset Ranges</Label>
        <Select onValueChange={applyPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
