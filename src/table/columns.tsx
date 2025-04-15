import EditableCell from "./EditableCell";
import { createColumnHelper } from "@tanstack/react-table";
import { User } from "./data";

const columnHelper = createColumnHelper<User>();

export const userColumns = [
  columnHelper.accessor("id", {
    header: () => <span>ID</span>,
    cell: (info) => info.getValue(), // Keep this non-editable as ID is unique
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor(row => row.name, {
    id: "name",
    cell: (info) => (
      <EditableCell
        value={info.getValue()}
        columnId="name"
        rowId={info.row.original.id}
        isEditing={info.row.original.isEditing ?? false}
        onChange={info.table.options.meta?.handleInputChange}
        inputType="text"
        placeholder="Enter name"
        className={`w-full px-2 py-1 border-0 outline-0 rounded ${info.row.original.isEditing ? "border-blue-300 border-2": ""}`}
      />
    ),
    header: () => <span>Name</span>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("wealth", {
    header: () => <span>Wealth</span>,
    cell: (info) => (
      <EditableCell
        value={info.getValue()}
        columnId="wealth"
        rowId={info.row.original.id}
        isEditing={info.row.original.isEditing ?? false}
        onChange={info.table.options.meta?.handleInputChange}
        inputType="number"
        min={0}
        step={1000}
        className={`w-full px-2 py-1 border-0 outline-0 rounded ${info.row.original.isEditing ? "border-blue-300 border-2": ""}`}
      />
    ),
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("active", {
    header: () => <span>Active</span>,
    cell: (info) => (
      <EditableCell
        value={info.getValue()}
        columnId="active"
        rowId={info.row.original.id}
        isEditing={info.row.original.isEditing ?? false}
        onChange={info.table.options.meta?.handleInputChange}
        inputType="checkbox"
        className={`w-full px-2 py-1 border-0 outline-0 rounded ${info.row.original.isEditing ? "border-blue-300 border-2": ""}`}
      />
    ),
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("bio", {
    header: () => <span>Bio</span>,
    cell: (info) => (
      <EditableCell
        value={info.getValue()}
        columnId="bio"
        rowId={info.row.original.id}
        isEditing={info.row.original.isEditing ?? false}
        onChange={info.table.options.meta?.handleInputChange}
        inputType="textarea"
        placeholder="Enter biography"
        className={`w-full px-2 py-1 border-0 outline-0 resize-y min-h-10 rounded ${info.row.original.isEditing ? "border-blue-300 border-2": ""}`}
      />
    ),
    footer: (props) => props.column.id,
  }),
  // Actions column definition
  columnHelper.display({
    id: 'actions',
    header: () => <span>Actions</span>,
    cell: (info) => (
      <div className="flex gap-2">
        <button
          onClick={() => info.table.options.meta?.toggleEdit(info.row.original.id)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          {info.row.original.isEditing ? 'Save' : 'Edit'}
        </button>
        {info.row.original.isEditing && (
          <button
            onClick={() => info.table.options.meta?.toggleEdit(info.row.original.id)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => info.table.options.meta?.deleteRow?.(info.row.original.id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
        >
          Delete
        </button>
      </div>
    ),
  }),
];