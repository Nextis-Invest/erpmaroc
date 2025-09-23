"use client"

import * as React from "react"
import { DatePicker, DateRangePicker, DatePickerWithPresets } from "./date-picker"

// Basic DatePicker demo with controlled state
export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Date</label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Pick a date"
        />
      </div>
    </div>
  )
}

// DateRangePicker demo
export function DateRangePickerDemo() {
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>()

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Date Range</label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Pick a date range"
        />
      </div>
    </div>
  )
}

// DatePicker with presets demo
export function DatePickerWithPresetsDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Date with Presets</label>
        <DatePickerWithPresets
          value={date}
          onChange={setDate}
          placeholder="Pick a date"
        />
      </div>
    </div>
  )
}

// Form integration example with react-hook-form (if you want to use it in forms)
export function DatePickerFormExample() {
  const [formData, setFormData] = React.useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    dateRange: undefined as { from: Date | undefined; to: Date | undefined } | undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label className="text-sm font-medium mb-2 block">Start Date</label>
        <DatePicker
          value={formData.startDate}
          onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
          placeholder="Select start date"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">End Date</label>
        <DatePicker
          value={formData.endDate}
          onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
          placeholder="Select end date"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Date Range</label>
        <DateRangePicker
          value={formData.dateRange}
          onChange={(range) => setFormData(prev => ({ ...prev, dateRange: range }))}
          placeholder="Select date range"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Submit
      </button>
    </form>
  )
}