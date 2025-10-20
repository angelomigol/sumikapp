"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";

import { getRoleConfig } from "@/lib/constants";

import { formatDatePH } from "@/utils/shared";
import { Tables } from "@/utils/supabase/supabase.types";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ProfileAvatar } from "@/components/sumikapp/profile-avatar";

import { UserTableRowActions } from "./users-table-row-actions";

export const userColumns: ColumnDef<Tables<"users">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    id: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const displayName = [user?.first_name, user?.middle_name, user?.last_name]
        .filter(Boolean)
        .join(" ");

      return (
        <div className="flex items-center gap-3">
          <ProfileAvatar displayName={displayName} />
          <Link
            href={pathsConfig.dynamic.userDetails(user.id)}
            className="block max-w-36 truncate underline-offset-2 hover:underline lg:max-w-52"
          >
            {displayName}
          </Link>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const roleValue = row.getValue("role") as string;
      const role = getRoleConfig(roleValue);

      if (!role) return null;

      return (
        <div className="flex items-center gap-2">
          {role.icon && <role.icon className="text-muted-foreground size-4" />}
          {role.label}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     const status = userStatus.find(
  //       (status) => status.value === row.getValue("status"),
  //     );

  //     return (
  //       <Badge className={`${getBadgeStatus(status.label)} text-`}>
  //         {status.label}
  //       </Badge>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  //   enableSorting: false,
  // },
  {
    accessorKey: "last_login",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.original.last_login;
      if (!lastLogin) {
        return "-";
      }

      return formatDatePH(lastLogin);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserTableRowActions row={row} />,
  },
];
