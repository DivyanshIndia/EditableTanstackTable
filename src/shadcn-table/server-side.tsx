"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { EditableDataTable } from "./editable-data-table"
import { TextCell, CheckboxCell, SelectCell } from "./editable-cell-types"

// Define the data type
interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
  isVerified: boolean
}

// Role options
const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Viewer", label: "Viewer" },
  { value: "Guest", label: "Guest" },
]

// Status options
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
]

// Mock API endpoint using a class to maintain state
class MockAPI {
  static users: User[] = [];
  static totalCount: number = 100;
  
  // Generate all users once
  static {
    this.users = Array.from({ length: this.totalCount }).map((_, i) => ({
      id: `USR${(i + 1).toString().padStart(3, "0")}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ["Admin", "Editor", "Viewer", "Guest"][Math.floor(Math.random() * 4)],
      status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split("T")[0],
      isVerified: Math.random() > 0.3,
    }));
  }
  
  static async getUsers(page: number, pageSize: number) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, this.totalCount);
    const paginatedUsers = this.users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      totalCount: this.totalCount
    };
  }
  
  static async updateUser(updatedUser: User) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      return { success: true, user: updatedUser };
    }
    return { success: false };
  }
}

export default function ServerSideTableExample() {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: TextCell,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: TextCell,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: TextCell,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: SelectCell,
      meta: {
        options: roleOptions,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: SelectCell,
      meta: {
        options: statusOptions,
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: TextCell,
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: CheckboxCell,
    },
  ];

  // Fetch data when pagination changes
  React.useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await MockAPI.getUsers(pagination.pageIndex, pagination.pageSize);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setData(result.users);
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [pagination.pageIndex, pagination.pageSize]);

  // Handle pagination changes
  const handlePaginationChange = React.useCallback((pageIndex: number, pageSize: number) => {
    setPagination({ pageIndex, pageSize });
  }, []);

  // Handle data changes
  const handleDataChange = React.useCallback(async (updatedData: User[]) => {
    setData(updatedData);
    
    // Find the changed user by comparing with previous data
    const changedUser = updatedData.find((user, index) => 
      JSON.stringify(user) !== JSON.stringify(data[index])
    );
    
    if (changedUser) {
      console.log("Updating user:", changedUser);
      try {
        const result = await MockAPI.updateUser(changedUser);
        if (result.success) {
          console.log("User updated successfully");
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  }, [data]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Server-Side Paginated User Table</h1>
      {loading && <div className="text-center py-4">Loading...</div>}
      <EditableDataTable
        columns={columns}
        data={data}
        onDataChange={handleDataChange}
        enableEditing={true}
        enableRowSelection={true}
        enablePagination={true}
        enableSorting={true}
        enableFiltering={true}
        isServerSide={true}
        manualPagination={true}
        pageCount={Math.ceil(totalCount / pagination.pageSize)}
        onPaginationChange={handlePaginationChange}
        initialPageSize={10}
      />
    </div>
  );
}