"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker, DateRangePicker, DatePickerWithPresets } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Form schema with date validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
})

type FormData = z.infer<typeof formSchema>

export function DatePickerFormExample() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  function onSubmit(values: FormData) {
    console.log("Form submitted:", values)
    alert(`Form submitted! Check console for details. Birth date: ${values.birthDate ? format(values.birthDate, "PPP") : "Not selected"}`)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Form with Date Picker</CardTitle>
        <CardDescription>
          Example form with various date picker implementations and validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select your birth date"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date with Presets</FormLabel>
                  <FormControl>
                    <DatePickerWithPresets
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a start date with quick preset options.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    This field is optional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range (Optional)</FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select date range"
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Select a range of dates for your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Simple standalone examples
export function BasicDatePickerExamples() {
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [selectedRange, setSelectedRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>()
  const [presetDate, setPresetDate] = React.useState<Date>()

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Date Picker</CardTitle>
          <CardDescription>Simple single date selection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Choose a date"
          />
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              Selected: {format(selectedDate, "PPP")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Picker</CardTitle>
          <CardDescription>Select a range of dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePicker
            value={selectedRange}
            onChange={setSelectedRange}
            placeholder="Choose date range"
          />
          {selectedRange?.from && (
            <p className="text-sm text-muted-foreground">
              From: {format(selectedRange.from, "PPP")}
              {selectedRange.to && ` to ${format(selectedRange.to, "PPP")}`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Picker with Presets</CardTitle>
          <CardDescription>Quick date selection with preset options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DatePickerWithPresets
            value={presetDate}
            onChange={setPresetDate}
            placeholder="Choose or select preset"
          />
          {presetDate && (
            <p className="text-sm text-muted-foreground">
              Selected: {format(presetDate, "PPP")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Advanced example with custom validation
const advancedFormSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate
  }
  return true
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

type AdvancedFormData = z.infer<typeof advancedFormSchema>

export function AdvancedDatePickerForm() {
  const form = useForm<AdvancedFormData>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      eventName: "",
    },
  })

  const startDate = form.watch("startDate")

  function onSubmit(values: AdvancedFormData) {
    console.log("Advanced form submitted:", values)
    alert(`Event "${values.eventName}" scheduled from ${format(values.startDate, "PPP")} to ${format(values.endDate, "PPP")}`)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Event Scheduling</CardTitle>
        <CardDescription>
          Advanced form with date validation and constraints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date"
                      disabled={!startDate}
                    />
                  </FormControl>
                  <FormDescription>
                    {!startDate ? "Please select a start date first" : "Must be after start date"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Schedule Event
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}