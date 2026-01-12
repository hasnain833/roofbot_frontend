import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"

export const userColumns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
  ];
  