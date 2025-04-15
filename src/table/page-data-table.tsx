import { 
    getCoreRowModel, 
    useReactTable, 
    getSortedRowModel, 
    flexRender, 
    ColumnDef, 
    Row, 
    getPaginationRowModel,
    PaginationState,
    OnChangeFn,
    functionalUpdate,
    RowData
  } from "@tanstack/react-table";
  import { useEffect, useState } from "react";
  import { ArrowDown, ArrowUp } from "lucide-react";
  
  export type ValueType = string | number | readonly string[] | undefined | boolean
  
  type TableMeta = { 
    handleInputChange: (rowId: string, columnId: string, value: ValueType) => void;
    toggleEdit: (rowId: string) => void;
    deleteRow: (rowId: string) => void;
    enableEditAll?: boolean;
  }
  
  type ColumnSort = {
    id: string
    desc: boolean
  }
  
  type SortingState = ColumnSort[]
  
  type CommonProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    enableSorting?: boolean
    enableEditing?: boolean
    renderFooter?: React.ReactNode
    rowClassName?: (row: Row<TData>) => string
    className?: string
    onDataChange?: (updatedData: TData[]) => void
    createNewRow?: () => TData,
    onRowUpdate? : () => TData,
    onRowDelete? : () => TData,
  }
  
  type WithServerPagination<TData> = {
    manualPagination: true
    pageCount: number
    onPaginationChange?: (pagination: PaginationState) => void
    currentPageData?: TData[]
  }
  
  type WithClientPagination = {
    manualPagination?: false
    pageCount?: never
    onPaginationChange?: never
    currentPageData?: never
  }
  
  type DataTableProps<TData> = CommonProps<TData> & (WithServerPagination<TData> | WithClientPagination)
  
  function DataTable<TData extends { id: string, isEditing?: boolean }>({
    data,
    columns,
    enableSorting = true,
    enableEditing = true,
    manualPagination = false,
    pageCount = 0,
    onPaginationChange,
    onDataChange,
    createNewRow,
    currentPageData,
    onRowUpdate,
    onRowDelete,
  }: DataTableProps<TData>) {
    const [tableData, setTableData] = useState<TData[]>(data);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  
    useEffect(() => {
      setTableData(data);
    }, [data]);
  
    const handleInputChange = (rowId: string, columnId: string, value: ValueType) => {
      const updatedData = tableData.map((row) =>  
        (row.id === rowId ? { ...row, [columnId]: value } : row)
      );
      setTableData(updatedData);
      onDataChange?.(updatedData);
    };
  
    const toggleEdit = (rowId: string) => {
      const updatedData = tableData.map((row) =>
        row.id === rowId ? { ...row, isEditing: !row.isEditing } : row
      );
      setTableData(updatedData);
      onDataChange?.(updatedData);
    };
  
    const deleteRow = (rowId: string) => {
      if(onRowDelete)  onRowDelete()
      const updatedData = tableData.filter(row => row.id !== rowId);
      setTableData(updatedData);
      onDataChange?.(updatedData);
    };
  
    const handlePaginationChange: OnChangeFn<PaginationState> = updater => {
        const newPagination = functionalUpdate(updater, pagination);
        setPagination(newPagination);
        
        if (manualPagination) {
          onPaginationChange?.(newPagination);
        }
      };
  
    const table = useReactTable({
      columns,
      data: manualPagination && currentPageData ? currentPageData : tableData,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
      enableSorting,
      manualPagination,
      pageCount: manualPagination ? pageCount : undefined,
      state: {
        sorting,
        pagination
      },
      onSortingChange: setSorting,
      onPaginationChange: handlePaginationChange,
      meta: {
        handleInputChange,
        toggleEdit,
        deleteRow,
        enableEditAll: enableEditing
      } 
    });
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    colSpan={header.colSpan}
                    className="px-4 py-2 text-left border border-gray-300"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                      }
                      {{
                        asc: <ArrowDown size={16}/>,
                        desc: <ArrowUp size={16}/>,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={row.original.isEditing ? "bg-blue-50" : ""}>
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="px-4 py-2 border border-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between gap-2 mt-4 px-4">
          {/* <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<<"}
          </button> */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
          {"<"}  Previous Page
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
           Next Page {">"}
          </button>
          {/* <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {">>"}
          </button> */}
          {/* <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span> */}
          {/* <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 border rounded"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select> */}
          
          {/* Flexible Add New Row Button */}
          {createNewRow && (
            <div className="ml-auto">
              <button 
                onClick={() => {
                  const newRow = createNewRow();
                  const updatedData = [...tableData, {...newRow, isEditing: true}];
                  setTableData(updatedData);
                  onDataChange?.(updatedData);
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Add New Row
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default DataTable;
  
