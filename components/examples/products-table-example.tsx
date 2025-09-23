"use client"

import { DataTableFull } from "@/components/ui/data-table-full"
import { productColumns } from "@/components/ui/data-table-examples"
import { Product } from "@/types/data-table"

interface ProductsTableProps {
  data: Product[]
  onRowClick?: (product: Product) => void
}

export function ProductsTableExample({ data, onRowClick }: ProductsTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTableFull
        columns={productColumns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search products..."
        onRowClick={onRowClick}
      />
    </div>
  )
}

// Example usage in a page component:
export function ExampleUsage() {
  const sampleProducts: Product[] = [
    {
      _id: "1",
      name: "Laptop Pro",
      category: "Électronique",
      description: "Ordinateur portable haute performance",
      notes: "Meilleure vente",
      price: 12999.99,
      quantity: 25,
    },
    {
      _id: "2",
      name: "Chaise de Bureau",
      category: "Mobilier",
      description: "Chaise de bureau ergonomique",
      notes: "Assise confortable",
      price: 2999.99,
      quantity: 50,
    },
    {
      _id: "3",
      name: "Souris Sans Fil",
      category: "Électronique",
      description: "Souris sans fil Bluetooth",
      notes: "Idéal pour la productivité",
      price: 499.99,
      quantity: 100,
    },
  ]

  const handleRowClick = (product: Product) => {
    console.log("Selected product:", product)
    // Handle row click - navigate to detail page, open modal, etc.
  }

  return (
    <ProductsTableExample
      data={sampleProducts}
      onRowClick={handleRowClick}
    />
  )
}