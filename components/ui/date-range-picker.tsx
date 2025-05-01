"use client"

import * as React from "react"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DatePickerWithRangeProps {
  date: DateRange | undefined
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  className?: string
}

const presets = [
  {
    id: "today",
    name: "Today",
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
  },
  {
    id: "yesterday",
    name: "Yesterday",
    dateRange: {
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    },
  },
  {
    id: "last7",
    name: "Last 7 days",
    dateRange: {
      from: subDays(new Date(), 6),
      to: new Date(),
    },
  },
  {
    id: "last14",
    name: "Last 14 days",
    dateRange: {
      from: subDays(new Date(), 13),
      to: new Date(),
    },
  },
  {
    id: "last30",
    name: "Last 30 days",
    dateRange: {
      from: subDays(new Date(), 29),
      to: new Date(),
    },
  },
  {
    id: "thisWeek",
    name: "This week",
    dateRange: {
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    },
  },
  {
    id: "thisMonth",
    name: "This month",
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  },
  {
    id: "lastMonth",
    name: "Last month",
    dateRange: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
]

export function DatePickerWithRange({ date, setDate, className }: DatePickerWithRangeProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal md:w-[260px]",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, yyyy")} - {format(date.to, "LLL dd, yyyy")}
                  </>
                ) : (
                  format(date.from, "LLL dd, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                if (newDate?.from && newDate?.to) {
                  setIsCalendarOpen(false)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between md:w-[200px]">
              Select range
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            {presets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => {
                  setDate(preset.dateRange)
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", isPresetActive(preset, date) ? "opacity-100" : "opacity-0")} />
                {preset.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Helper function to check if a preset is currently active
function isPresetActive(preset: (typeof presets)[number], currentDateRange: DateRange | undefined): boolean {
  if (!currentDateRange?.from || !currentDateRange?.to) return false

  const presetFromStr = format(preset.dateRange.from, "yyyy-MM-dd")
  const presetToStr = format(preset.dateRange.to, "yyyy-MM-dd")
  const currentFromStr = format(currentDateRange.from, "yyyy-MM-dd")
  const currentToStr = format(currentDateRange.to, "yyyy-MM-dd")

  return presetFromStr === currentFromStr && presetToStr === currentToStr
}
