import { ColumnDef } from "@tanstack/react-table"

// Generic interfaces for data table components
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
}

// Common data types for your ERP system
export interface Product {
  _id: string
  name: string
  category: string
  description: string
  notes: string
  price: number
  quantity: number
  branchId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  _id: string
  name: string
  email: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: "active" | "inactive" | "terminated"
}

export interface Branch {
  _id: string
  name: string
  location: string
  manager: string
  employeeCount: number
  revenue: number
  status: "active" | "inactive"
}

// Status types commonly used in ERP
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled"
export type PaymentStatus = "pending" | "processing" | "success" | "failed"
export type EmployeeStatus = "active" | "inactive" | "terminated"