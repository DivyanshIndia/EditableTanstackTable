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
  isServerSide?: boolean
  pageCount?: number
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  manualPagination?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]
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
  isServerSide = false,
  pageCount,
  onPaginationChange,
  manualPagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
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

  const saveEditingRow = (rowId: string) => {
    // Save changes for this row
    setOriginalData(tableData)
    if (onDataChange) {
      onDataChange(tableData)
    }
    stopEditingRow(rowId)
  }

  const updateCellValue = (rowIndex: number, columnId: string, value: any) => {
    setTableData((currentData) => {
      return currentData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          }
        }
        return row
      })
    })
  }

  const startEditingAllRows = () => {
    const allRows: Record<string, boolean> = {}
    tableData.forEach((_, index) => {
      allRows[`${index}`] = true
    })
    setEditingRows(allRows)
  }

  const saveAllRows = () => {
    setOriginalData(tableData)
    if (onDataChange) {
      onDataChange(tableData)
    }
    setEditingRows({})
  }

  const cancelAllEdits = () => {
    setTableData(originalData)
    setEditingRows({})
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
      updateData: (rowIndex: number, columnId: string, value: any) => {
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

        {enableEditing && (
          <div className="flex items-center gap-2">
            {Object.keys(editingRows).length > 0 ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelAllEdits}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveAllRows}>
                  Save All
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={startEditingAllRows}>
                Edit All
              </Button>
            )}
          </div>
        )}
      </div>

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
                    {flexRender(column.columnDef.header, column.getContext ? column.getContext() : { column, table })}
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
                        cell.getContext() ? cell.getContext() : { cell, row, column: cell.column, table },
                      )}
                    </TableCell>
                  ))}
                  {enableEditing && (
                    <TableCell className="p-2">
                      {editingRows[row.id] ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => cancelEditingRow(row.id)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveEditingRow(row.id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => startEditingRow(row.id)}>
                          Edit
                        </Button>
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
