"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"





export type EditableDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onDataChange?: (data: TData[]) => void
  enableEditing?: boolean
  enableRowSelection?: boolean
  enableMultiRowEditing?: boolean
  enablePagination?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enableStickyHeader?: boolean
  enableStickyFooter?: boolean
  pageCount?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  manualPagination?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]
  // API integration handlers
  onSaveRow?: (rowData: TData, rowIndex: number) => Promise<{ success: boolean; data?: TData; error?: string }>
  onSaveAllRows?: (rowsData: TData[]) => Promise<{ success: boolean; data?: TData[]; error?: string }>
  onAddRow?: (newRowData: Partial<TData>) => Promise<{ success: boolean; data?: TData; error?: string }>
  onDeleteRow?: (rowData: TData, rowIndex: number) => Promise<{ success: boolean; error?: string }>
  enableAddRow?: boolean
  newRowTemplate?: Partial<TData>
}

export function EditableDataTable<TData, TValue>({
  columns,
  data,
  onDataChange,
  enableEditing = false,
  enableRowSelection = false,
  enableMultiRowEditing = false,
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableStickyHeader = false,
  enableStickyFooter = false,
  pageCount,
  onPaginationChange,
  manualPagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  // API handlers
  onSaveRow,
  onSaveAllRows,
  onAddRow,
  onDeleteRow,
  enableAddRow = false,
  newRowTemplate = {} as Partial<TData>,
}: EditableDataTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState<TData[]>(data)
  const [originalData, setOriginalData] = React.useState<TData[]>(data)
  const [editingRows, setEditingRows] = React.useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  // New state for API operations
  const [isLoading, setIsLoading] = React.useState<Record<string, boolean>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isAddingRow, setIsAddingRow] = React.useState(false)
  const [newRowData, setNewRowData] = React.useState<Partial<TData>>(newRowTemplate)

  // Update internal data when external data changes
  React.useEffect(() => {
    setTableData(data)
    setOriginalData(data)
  }, [data])

  // Handle row editing
  const startEditingRow = (rowId: string) => {
    if (!enableMultiRowEditing) {
      // If not multi-row editing, clear other editing rows
      setEditingRows({ [rowId]: true })
    } else {
      setEditingRows((prev) => ({ ...prev, [rowId]: true }))
    }
  }

  const stopEditingRow = (rowId: string) => {
    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
  }

  const cancelEditingRow = (rowId: string) => {
    // Revert changes for this row
    setTableData((currentData) => {
      return currentData.map((row, index) => {
        const rowKey = `${index}`
        return rowKey === rowId ? originalData[index] : row
      })
    })
    stopEditingRow(rowId)
  }

  const saveEditingRow = async (rowId: string) => {
    if (!onSaveRow) {
      // Local-only save
      setOriginalData(tableData)
      if (onDataChange) {
        onDataChange(tableData)
      }
      stopEditingRow(rowId)
      return
    }

    // API save
    const rowIndex = Number.parseInt(rowId)
    const rowData = tableData[rowIndex]

    setIsLoading({ ...isLoading, [rowId]: true })
    setErrors({ ...errors, [rowId]: "" })

    try {
      const result = await onSaveRow(rowData, rowIndex)

      if (result.success) {
        if (result.data) {
          // Update with server data
          setTableData((prev) => prev.map((item, idx) => (idx === rowIndex ? (result.data as TData) : item)))
          setOriginalData((prev) => prev.map((item, idx) => (idx === rowIndex ? (result.data as TData) : item)))
        } else {
          // Use local data
          setOriginalData(tableData)
        }

        if (onDataChange) {
          onDataChange(tableData)
        }
        stopEditingRow(rowId)
      } else {
        setErrors({ ...errors, [rowId]: result.error || "Failed to save" })
      }
    } catch (error) {
      setErrors({ ...errors, [rowId]: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading({ ...isLoading, [rowId]: false })
    }
  }

  const saveAllRows = async () => {
    if (!onSaveAllRows) {
      // Local-only save
      setOriginalData(tableData)
      if (onDataChange) {
        onDataChange(tableData)
      }
      setEditingRows({})
      return
    }

    // API save all
    setIsLoading({ ...isLoading, all: true })
    setErrors({ ...errors, all: "" })

    try {
      const result = await onSaveAllRows(tableData)

      if (result.success) {
        if (result.data) {
          // Update with server data
          setTableData(result.data)
          setOriginalData(result.data)
        } else {
          // Use local data
          setOriginalData(tableData)
        }

        if (onDataChange) {
          onDataChange(tableData)
        }
        setEditingRows({})
      } else {
        setErrors({ ...errors, all: result.error || "Failed to save all rows" })
      }
    } catch (error) {
      setErrors({ ...errors, all: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading({ ...isLoading, all: false })
    }
  }

  const startAddingRow = () => {
    setIsAddingRow(true)
    setNewRowData(newRowTemplate)
  }

  const cancelAddingRow = () => {
    setIsAddingRow(false)
    setNewRowData(newRowTemplate)
    setErrors({ ...errors, newRow: "" })
  }

  const updateNewRowField = (field: string, value: string | number | undefined | boolean| null) => {
    setNewRowData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveNewRow = async () => {
    if (!onAddRow) {
      return
    }

    setIsLoading({ ...isLoading, newRow: true })
    setErrors({ ...errors, newRow: "" })

    try {
      const result = await onAddRow(newRowData)

      if (result.success && result.data) {
        // Add the new row to the table
        const updatedData = [...tableData, result.data as TData]
        setTableData(updatedData)
        setOriginalData(updatedData)

        if (onDataChange) {
          onDataChange(updatedData)
        }

        setIsAddingRow(false)
        setNewRowData(newRowTemplate)
      } else {
        setErrors({ ...errors, newRow: result.error || "Failed to add row" })
      }
    } catch (error) {
      setErrors({ ...errors, newRow: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading({ ...isLoading, newRow: false })
    }
  }

  const deleteRow = async (rowId: string) => {
    if (!onDeleteRow) {
      return
    }

    const rowIndex = Number.parseInt(rowId)
    const rowData = tableData[rowIndex]

    setIsLoading({ ...isLoading, [`delete-${rowId}`]: true })
    setErrors({ ...errors, [`delete-${rowId}`]: "" })

    try {
      const result = await onDeleteRow(rowData, rowIndex)

      if (result.success) {
        // Remove the row from the table
        const updatedData = tableData.filter((_, idx) => idx !== rowIndex)
        setTableData(updatedData)
        setOriginalData(updatedData)

        if (onDataChange) {
          onDataChange(updatedData)
        }
      } else {
        setErrors({ ...errors, [`delete-${rowId}`]: result.error || "Failed to delete row" })
      }
    } catch (error) {
      setErrors({ ...errors, [`delete-${rowId}`]: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading({ ...isLoading, [`delete-${rowId}`]: false })
    }
  }

  const updateCellValue = (rowIndex: number, columnId: string, value: string| number | boolean) => {
    setTableData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          }
        }
        return row
      }),
    )
  }

  const cancelAllEdits = () => {
    setTableData(originalData)
    setEditingRows({})
  }

  const startEditingAllRows = () => {
    const newEditingRows: Record<string, boolean> = {}
    tableData.forEach((_, index) => {
      newEditingRows[`${index}`] = true
    })
    setEditingRows(newEditingRows)
  }

  // Create table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: manualPagination,
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string | boolean | number) => {
        updateCellValue(rowIndex, columnId, value)
      },
      isEditing: (rowIndex: number) => {
        return editingRows[`${rowIndex}`] === true
      },
    },
  })

  // Handle server-side pagination
  React.useEffect(() => {
    if (manualPagination && onPaginationChange) {
      onPaginationChange(pagination.pageIndex, pagination.pageSize)
    }
  }, [pagination.pageIndex, pagination.pageSize, manualPagination, onPaginationChange])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {enableFiltering && (
          <div className="flex items-center">
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {enableAddRow && !isAddingRow && (
            <Button size="sm" onClick={startAddingRow}>
              Add Row
            </Button>
          )}

          {enableEditing && (
            <>
              {Object.keys(editingRows).length > 0 ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelAllEdits} disabled={isLoading.all}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveAllRows} disabled={isLoading.all}>
                    {isLoading.all ? "Saving..." : "Save All"}
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={startEditingAllRows}>
                  Edit All
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {errors.all && <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md">{errors.all}</div>}

      {/* New Row Form */}
      {isAddingRow && (
        <div className="border rounded-md p-4 mb-4 bg-muted/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Add New Row</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancelAddingRow}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveNewRow} disabled={isLoading.newRow}>
                {isLoading.newRow ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>

          {errors.newRow && (
            <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md mb-4">{errors.newRow}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => {
              if (column.id === "id" || column.id === "actions") return null

              const accessorKey = column.accessorKey 
              if (!accessorKey) return null

              return (
                <div key={accessorKey} className="space-y-2">
                  <label htmlFor={`new-${accessorKey}`} className="text-sm font-medium">
                    {column.header?.toString() || accessorKey}
                  </label>

                  {/* Render appropriate input based on column type */}
                  {column.meta?.type === "number" ? (
                    <Input
                      id={`new-${accessorKey}`}
                      type="number"
                      value={(newRowData[accessorKey as keyof Partial<TData>] as string) || ""}
                      onChange={(e) => updateNewRowField(accessorKey, Number(e.target.value))}
                    />
                  ) : column.meta?.type === "boolean" ? (
                    <Checkbox
                      id={`new-${accessorKey}`}
                      checked={Boolean(newRowData[accessorKey as keyof Partial<TData>])}
                      onCheckedChange={(checked) => updateNewRowField(accessorKey, checked)}
                    />
                  ) : column.meta?.options ? (
                    <Select
                      value={(newRowData[accessorKey as keyof Partial<TData>] as string) || ""}
                      onValueChange={(value) => updateNewRowField(accessorKey, value)}
                    >
                      <SelectTrigger id={`new-${accessorKey}`}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(column.meta.options as { value: string; label: string }[]).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`new-${accessorKey}`}
                      value={(newRowData[accessorKey as keyof Partial<TData>] as string) || ""}
                      onChange={(e) => updateNewRowField(accessorKey, e.target.value)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table className={enableStickyHeader || enableStickyFooter ? "relative" : ""}>
          <TableHeader className={enableStickyHeader ? "sticky top-0 z-10 bg-background" : ""}>
            <TableRow>
              {enableRowSelection && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {table.getVisibleLeafColumns().map((column) => (
                <TableHead key={column.id} className={column.getCanSort() ? "cursor-pointer select-none" : ""}>
                  <div
                    className="flex items-center gap-1"
                    onClick={column.getCanSort() ? () => column.toggleSorting() : undefined}
                  > 
        {flexRender(column.columnDef.header, { column, table , header: undefined })}
        {column.getCanSort() && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          column.getIsSorted() === "asc"
                            ? "rotate-180"
                            : column.getIsSorted() === "desc"
                              ? "rotate-0"
                              : "opacity-0"
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {enableEditing && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {enableRowSelection && (
                    <TableCell className="p-2">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  {enableEditing && (
                    <TableCell className="p-2">
                      {editingRows[row.id] ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelEditingRow(row.id)}
                              disabled={isLoading[row.id]}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveEditingRow(row.id)} disabled={isLoading[row.id]}>
                              {isLoading[row.id] ? "Saving..." : "Save"}
                            </Button>
                          </div>
                          {errors[row.id] && <div className="text-destructive text-xs">{errors[row.id]}</div>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEditingRow(row.id)}>
                            Edit
                          </Button>
                          {onDeleteRow && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteRow(row.id)}
                              disabled={isLoading[`delete-${row.id}`]}
                            >
                              {isLoading[`delete-${row.id}`] ? "..." : "Delete"}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getVisibleLeafColumns().length + (enableRowSelection ? 1 : 0) + (enableEditing ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {enableStickyFooter && (
            <tfoot className="sticky bottom-0 z-10 bg-background">
              <tr>
                <td
                  colSpan={
                    table.getVisibleLeafColumns().length + (enableRowSelection ? 1 : 0) + (enableEditing ? 1 : 0)
                  }
                  className="p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{" "}
                      row(s) selected.
                    </div>
                    {enablePagination && renderPagination()}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && !enableStickyFooter && (
        <div className="flex items-center justify-end space-x-2 py-4">{renderPagination()}</div>
      )}
    </div>
  )

  function renderPagination() {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }
}
