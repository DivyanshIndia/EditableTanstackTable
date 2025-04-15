// table-types.d.ts
import { SelectOption } from '@/components/ui/editable-data-table/editable-cell-types';
import '@tanstack/react-table'
declare module "@tanstack/react-table" {
    interface ColumnMeta<> {
        options?: SelectOption[];
        type?: "number" | "combobox" | "boolean" | "select";
    }

    interface TableMeta<> {
        updateData: (rowIndex: number, columnId: string, value: string | boolean | number) => void;
        isEditing: (rowIndex: number) => boolean;
    }
}