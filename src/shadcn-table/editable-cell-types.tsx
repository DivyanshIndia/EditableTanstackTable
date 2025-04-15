"use client"

import * as React from "react"
import type { CellContext } from "@tanstack/react-table"
import { Check, ChevronsUpDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Text Input Cell
export function TextCell<TData, TValue>({ getValue, row, column, table }: CellContext<TData, TValue>) {
  const initialValue = getValue() as string
  const columnId = column.id
  const rowIndex = row.index

  const tableMeta = table.options.meta as any
  const isEditing = tableMeta?.isEditing?.(rowIndex) || false

  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    tableMeta?.updateData(rowIndex, columnId, value)
  }

  if (!isEditing) {
    return <span>{initialValue}</span>
  }

  return <Input value={value} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} className="h-8" />
}

// Number Input Cell
export function NumberCell<TData, TValue>({ getValue, row, column, table }: CellContext<TData, TValue>) {
  const initialValue = getValue() as number
  const columnId = column.id
  const rowIndex = row.index

  const tableMeta = table.options.meta as any
  const isEditing = tableMeta?.isEditing?.(rowIndex) || false

  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    tableMeta?.updateData(rowIndex, columnId, Number(value))
  }

  if (!isEditing) {
    return <span>{initialValue}</span>
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(Number.parseFloat(e.target.value) || 0)}
      onBlur={onBlur}
      className="h-8"
    />
  )
}

// Checkbox Cell
export function CheckboxCell<TData, TValue>({ getValue, row, column, table }: CellContext<TData, TValue>) {
  const initialValue = getValue() as boolean
  const columnId = column.id
  const rowIndex = row.index

  const tableMeta = table.options.meta as any
  const isEditing = tableMeta?.isEditing?.(rowIndex) || false

  const [checked, setChecked] = React.useState(initialValue)

  React.useEffect(() => {
    setChecked(initialValue)
  }, [initialValue])

  const onChange = (value: boolean) => {
    setChecked(value)
    tableMeta?.updateData(rowIndex, columnId, value)
  }

  return <Checkbox checked={checked} onCheckedChange={onChange} disabled={!isEditing} />
}

// Select Cell
export interface SelectOption {
  value: string
  label: string
}

export function SelectCell<TData, TValue>({ getValue, row, column, table }: CellContext<TData, TValue>) {
  const initialValue = getValue() as string
  const columnId = column.id
  const rowIndex = row.index

  const tableMeta = table.options.meta as any
  const isEditing = tableMeta?.isEditing?.(rowIndex) || false
  const options = (column.columnDef.meta?.options as SelectOption[]) || []

  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onChange = (newValue: string) => {
    setValue(newValue)
    tableMeta?.updateData(rowIndex, columnId, newValue)
  }

  if (!isEditing) {
    const selectedOption = options.find((option) => option.value === value)
    return <span>{selectedOption?.label || value}</span>
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Combobox Cell (Searchable Select)
export function ComboboxCell<TData, TValue>({ getValue, row, column, table }: CellContext<TData, TValue>) {
  const initialValue = getValue() as string
  const columnId = column.id
  const rowIndex = row.index

  const tableMeta = table.options.meta as any
  const isEditing = tableMeta?.isEditing?.(rowIndex) || false
  const options = (column.columnDef.meta?.options as SelectOption[]) || []

  const [value, setValue] = React.useState(initialValue)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onChange = (newValue: string) => {
    setValue(newValue)
    tableMeta?.updateData(rowIndex, columnId, newValue)
    setOpen(false)
  }

  if (!isEditing) {
    const selectedOption = options.find((option) => option.value === value)
    return <span>{selectedOption?.label || value}</span>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="h-8 w-full justify-between">
          {value ? options.find((option) => option.value === value)?.label : "Select..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.value} onSelect={() => onChange(option.value)}>
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
