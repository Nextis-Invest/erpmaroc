"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DatePicker, DateRangePicker } from "./date-picker"
import { Button } from "./button"
import { Label } from "./label"

// Define the form schema with zod validation
const formSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function DatePickerFormExample() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data)
    // Handle form submission here
  }

  return (
    <div className="max-w-md space-y-6">
      <h3 className="text-lg font-medium">Date Picker Form Example</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Start Date Field */}
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select start date"
                className="w-full"
              />
            )}
          />
          {form.formState.errors.startDate && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date Field */}
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select end date"
                className="w-full"
              />
            )}
          />
          {form.formState.errors.endDate && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.endDate.message}
            </p>
          )}
        </div>

        {/* Date Range Field (Optional) */}
        <div>
          <Label htmlFor="dateRange">Date Range (Optional)</Label>
          <Controller
            name="dateRange"
            control={form.control}
            render={({ field }) => (
              <DateRangePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select date range"
                className="w-full"
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Submit Form
        </Button>
      </form>

      {/* Display form values for debugging */}
      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h4 className="font-medium mb-2">Form Values:</h4>
        <pre className="text-sm">
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </div>
    </div>
  )
}

// Simple example without react-hook-form for basic usage
export function SimpleDatePickerExample() {
  const [date, setDate] = React.useState<Date>()
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>()

  return (
    <div className="max-w-md space-y-6">
      <h3 className="text-lg font-medium">Simple Date Picker Examples</h3>

      <div>
        <Label>Single Date</Label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Pick a date"
        />
        {date && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {date.toLocaleDateString()}
          </p>
        )}
      </div>

      <div>
        <Label>Date Range</Label>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Pick a date range"
        />
        {dateRange?.from && (
          <p className="text-sm text-gray-600 mt-1">
            From: {dateRange.from.toLocaleDateString()}
            {dateRange.to && ` To: ${dateRange.to.toLocaleDateString()}`}
          </p>
        )}
      </div>
    </div>
  )
}