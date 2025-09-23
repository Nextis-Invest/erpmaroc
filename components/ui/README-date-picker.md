# shadcn/ui Date Picker Components

Modern, accessible date picker components built with React Hook Form integration and Zod validation.

## 🚀 Features

- **Single Date Selection**: Basic date picker with calendar popup
- **Date Range Selection**: Pick start and end dates with visual range selection
- **Preset Options**: Quick date selection with common presets (today, tomorrow, next week)
- **Form Integration**: Seamless integration with React Hook Form and Zod validation
- **Accessibility**: Full keyboard navigation and ARIA support
- **Customizable**: Flexible styling and configuration options

## 📦 Dependencies

All required dependencies have been installed:

```bash
pnpm add date-fns react-day-picker @radix-ui/react-popover @hookform/resolvers zod
```

## 🎯 Components

### Core Components
- `/components/ui/calendar.tsx` - Base calendar component
- `/components/ui/popover.tsx` - Popover wrapper for date picker
- `/components/ui/date-picker.tsx` - Main date picker components
- `/components/ui/form.tsx` - Form components for validation

### Example Components
- `/components/examples/date-picker-examples.tsx` - Complete usage examples
- `/components/examples/date-picker-showcase.tsx` - Interactive showcase

## 🔧 Basic Usage

### Single Date Picker

```tsx
import { DatePicker } from "@/components/ui/date-picker"

function MyComponent() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Pick a date"
    />
  )
}
```

### Date Range Picker

```tsx
import { DateRangePicker } from "@/components/ui/date-picker"

function MyComponent() {
  const [range, setRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>()

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      placeholder="Pick a date range"
    />
  )
}
```

### Date Picker with Presets

```tsx
import { DatePickerWithPresets } from "@/components/ui/date-picker"

function MyComponent() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePickerWithPresets
      value={date}
      onChange={setDate}
      placeholder="Choose or select preset"
    />
  )
}
```

## 📝 Form Integration

### With React Hook Form + Zod

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"

const formSchema = z.object({
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## 🎨 Customization

### Styling
All components use Tailwind CSS classes and can be customized with the `className` prop:

```tsx
<DatePicker
  className="w-full max-w-sm"
  value={date}
  onChange={setDate}
/>
```

### Disabled State
```tsx
<DatePicker
  disabled={true}
  value={date}
  onChange={setDate}
/>
```

### Custom Placeholder
```tsx
<DatePicker
  placeholder="When were you born?"
  value={date}
  onChange={setDate}
/>
```

## 🧪 Testing the Components

To see the components in action, you can:

1. Import and use the example components:
```tsx
import { DatePickerShowcase } from "@/components/examples/date-picker-showcase"

// Use in your page or component
<DatePickerShowcase />
```

2. Or create a simple test page:
```tsx
import { BasicDatePickerExamples } from "@/components/examples/date-picker-examples"

export default function TestPage() {
  return <BasicDatePickerExamples />
}
```

## 🔍 Advanced Features

### Date Validation
```tsx
const schema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => {
  return data.endDate >= data.startDate
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})
```

### Conditional Enabling
```tsx
<DatePicker
  disabled={!startDate}
  value={endDate}
  onChange={setEndDate}
/>
```

## 🐛 Troubleshooting

### TypeScript Errors
Make sure you have the correct types installed:
```bash
pnpm add -D @types/react @types/react-dom
```

### Styling Issues
Ensure Tailwind CSS is properly configured and includes the necessary color variables in your CSS.

### Form Validation
Make sure to use the `FormField` component wrapper for proper validation display.

## 📚 References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs/components/date-picker)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [date-fns](https://date-fns.org/)
- [React DayPicker](https://react-day-picker.js.org/)