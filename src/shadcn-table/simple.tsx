"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { EditableDataTable } from "./editable-data-table"
import {
  TextCell,
  NumberCell,
  CheckboxCell,
  SelectCell,
  ComboboxCell,
  type SelectOption,
} from "./editable-cell-types"

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
  {
    id: "PRD006",
    name: "Desk Organizer",
    category: "accessories",
    price: 24.99,
    stock: 52,
    isActive: true,
    rating: 3.5,
    supplier: "home-goods",
  },
  {
    id: "PRD007",
    name: "Mechanical Keyboard",
    category: "electronics",
    price: 149.99,
    stock: 28,
    isActive: true,
    rating: 4.8,
    supplier: "tech-world",
  },
  {
    id: "PRD008",
    name: "Office Chair",
    category: "furniture",
    price: 199.99,
    stock: 17,
    isActive: true,
    rating: 4.1,
    supplier: "office-plus",
  },
  {
    id: "PRD009",
    name: "Desk Mat",
    category: "accessories",
    price: 19.99,
    stock: 63,
    isActive: true,
    rating: 3.9,
    supplier: "home-goods",
  },
  {
    id: "PRD010",
    name: "USB Hub",
    category: "electronics",
    price: 39.99,
    stock: 42,
    isActive: false,
    rating: 3.7,
    supplier: "tech-world",
  },
  {
    id: "PRD011",
    name: "Standing Desk",
    category: "furniture",
    price: 399.99,
    stock: 8,
    isActive: true,
    rating: 4.6,
    supplier: "office-plus",
  },
  {
    id: "PRD012",
    name: "Desk Drawer",
    category: "accessories",
    price: 89.99,
    stock: 23,
    isActive: true,
    rating: 4.0,
    supplier: "home-goods",
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

export default function EditableTableExample() {
  const [data, setData] = React.useState<Product[]>(initialData)

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
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: NumberCell,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: NumberCell,
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: CheckboxCell,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: NumberCell,
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ComboboxCell,
      meta: {
        options: supplierOptions,
      },
    },
  ]

  // Handle data changes
  const handleDataChange = (updatedData: Product[]) => {
    setData(updatedData)
    console.log("Data updated:", updatedData)
    // Here you would typically save to your backend
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Editable Product Table</h1>
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
      />
    </div>
  )
}
