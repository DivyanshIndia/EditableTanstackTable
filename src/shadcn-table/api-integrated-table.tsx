"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { CheckboxCell, ComboboxCell, NumberCell, SelectCell, SelectOption, TextCell } from "@/components/ui/editable-data-table/editable-cell-types"
import { EditableDataTable } from "@/components/ui/editable-data-table/editable-data-table"



// Define the data type
interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  isActive: boolean
  rating: number
  supplier: string
}

// Sample data
const initialData: Product[] = [
  {
    id: "PRD001",
    name: "Ergonomic Chair",
    category: "furniture",
    price: 299.99,
    stock: 45,
    isActive: true,
    rating: 4.5,
    supplier: "office-plus",
  },
  {
    id: "PRD002",
    name: "Wireless Keyboard",
    category: "electronics",
    price: 89.99,
    stock: 120,
    isActive: true,
    rating: 4.2,
    supplier: "tech-world",
  },
  {
    id: "PRD003",
    name: "Desk Lamp",
    category: "lighting",
    price: 49.99,
    stock: 78,
    isActive: true,
    rating: 3.8,
    supplier: "home-goods",
  },
  {
    id: "PRD004",
    name: "Monitor Stand",
    category: "accessories",
    price: 79.99,
    stock: 34,
    isActive: false,
    rating: 4.0,
    supplier: "office-plus",
  },
  {
    id: "PRD005",
    name: "Wireless Mouse",
    category: "electronics",
    price: 59.99,
    stock: 95,
    isActive: true,
    rating: 4.7,
    supplier: "tech-world",
  },
]

// Category options
const categoryOptions: SelectOption[] = [
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "accessories", label: "Accessories" },
  { value: "lighting", label: "Lighting" },
]

// Supplier options
const supplierOptions: SelectOption[] = [
  { value: "office-plus", label: "Office Plus" },
  { value: "tech-world", label: "Tech World" },
  { value: "home-goods", label: "Home Goods" },
]

export default function ApiIntegratedTableExample() {
  const [data, setData] = React.useState<Product[]>(initialData)
//   const [isLoading, setIsLoading] = React.useState(false)

  // Define columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: TextCell,
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: TextCell,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: SelectCell,
      meta: {
        options: categoryOptions,
        type: "select",
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: NumberCell,
      meta: {
        type: "number",
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: NumberCell,
      meta: {
        type: "number",
      },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: CheckboxCell,
      meta: {
        type: "boolean",
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: NumberCell,
      meta: {
        type: "number",
      },
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ComboboxCell,
      meta: {
        options: supplierOptions,
        type: "combobox",
      },
    },
  ]

  // Simulate API call with delay
  const simulateApiCall = async <T,>(
    data: T,
    shouldSucceed = true,
    errorMessage = "API Error",
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (shouldSucceed) {
      return { success: true, data }
    } else {
      return { success: false, error: errorMessage }
    }
  }

  // API handlers
  const handleSaveRow = async (rowData: Product, rowIndex: number) => {
    console.log("Saving row:", rowData, "at index:", rowIndex)

    // Simulate API call to update a row
    // In a real app, this would be a fetch/axios call to your backend
    try {
      // Randomly fail some saves to demonstrate error handling (10% chance)
      const shouldFail = Math.random() < 0.1

      const result = await simulateApiCall(rowData, !shouldFail, "Server error: Could not update product")

      if (result.success) {
        toast.success(`Product ${rowData.name} updated successfully`)
      } else {
        toast.error(result.error)
      }

      return result
    } catch (error) {
      console.error("Error saving row:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  const handleSaveAllRows = async (rowsData: Product[]) => {
    console.log("Saving all rows:", rowsData)

    // Simulate API call to update multiple rows
    try {
      // Randomly fail some saves to demonstrate error handling (20% chance)
      const shouldFail = Math.random() < 0.2

      const result = await simulateApiCall(rowsData, !shouldFail, "Server error: Could not update multiple products")

      if (result.success) {
        toast.success(`${rowsData.length} products updated successfully`)
      } else {
        toast.error(result.error)
      }

      return result
    } catch (error) {
      console.error("Error saving all rows:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  const handleAddRow = async (newRowData: Partial<Product>) => {
    console.log("Adding new row:", newRowData)

    // Generate a new ID
    const newId = `PRD${(Math.floor(Math.random() * 900) + 100).toString()}`

    // Create the complete product object
    const newProduct: Product = {
      id: newId,
      name: newRowData.name || "New Product",
      category: newRowData.category || "accessories",
      price: newRowData.price || 0,
      stock: newRowData.stock || 0,
      isActive: newRowData.isActive !== undefined ? newRowData.isActive : true,
      rating: newRowData.rating || 0,
      supplier: newRowData.supplier || "office-plus",
    }

    // Simulate API call to create a new row
    try {
      // Randomly fail some adds to demonstrate error handling (15% chance)
      const shouldFail = Math.random() < 0.15

      const result = await simulateApiCall(newProduct, !shouldFail, "Server error: Could not create new product")

      if (result.success) {
        toast.success(`Product ${newProduct.name} created successfully`)
      } else {
        toast.error(result.error)
      }

      return result
    } catch (error) {
      console.error("Error adding row:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  const handleDeleteRow = async (rowData: Product, rowIndex: number) => {
    console.log("Deleting row:", rowData, "at index:", rowIndex)

    // Simulate API call to delete a row
    try {
      // Randomly fail some deletes to demonstrate error handling (5% chance)
      const shouldFail = Math.random() < 0.05

      const result = await simulateApiCall(null, !shouldFail, "Server error: Could not delete product")

      if (result.success) {
        toast.success(`Product ${rowData.name} deleted successfully`)
      } else {
        toast.error(result.error)
      }

      return result
    } catch (error) {
      console.error("Error deleting row:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Handle data changes
  const handleDataChange = (updatedData: Product[]) => {
    setData(updatedData)
  }

  // New row template
  const newRowTemplate: Partial<Product> = {
    name: "",
    category: "accessories",
    price: 0,
    stock: 0,
    isActive: true,
    rating: 0,
    supplier: "office-plus",
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API-Integrated Product Table</h1>
      <p className="text-muted-foreground mb-6">
        This example demonstrates a table with full API integration. All operations (add, edit, delete) make simulated
        API calls with loading states and error handling. Some operations will randomly fail to demonstrate error
        handling.
      </p>

      <EditableDataTable
        columns={columns}
        data={data}
        onDataChange={handleDataChange}
        enableEditing={true}
        enableRowSelection={true}
        enableMultiRowEditing={true}
        enablePagination={true}
        enableSorting={true}
        enableFiltering={true}
        enableStickyHeader={true}
        initialPageSize={5}
        // API integration
        onSaveRow={handleSaveRow}
        onSaveAllRows={handleSaveAllRows}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        enableAddRow={true}
        newRowTemplate={newRowTemplate}
      />
    </div>
  )
}
