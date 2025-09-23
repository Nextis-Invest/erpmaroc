"use client"

import React from 'react'
import { DatePickerFormExample, BasicDatePickerExamples, AdvancedDatePickerForm } from './date-picker-examples'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DatePickerShowcase() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">shadcn/ui Date Picker</h1>
          <p className="text-muted-foreground mt-2">
            Modern, accessible date picker components with form validation
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Examples</TabsTrigger>
            <TabsTrigger value="form">Form Integration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <BasicDatePickerExamples />
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            <div className="flex justify-center">
              <DatePickerFormExample />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <div className="flex justify-center">
              <AdvancedDatePickerForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}