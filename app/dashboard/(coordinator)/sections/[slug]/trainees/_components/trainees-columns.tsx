"use client";

import { ColumnDef } from "@tanstack/react-table";

import { TraineeWithUserAndHours } from "@/hooks/use-section-trainees";

import { getOJTStatusConfig } from "@/lib/constants/ojtStatus";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";

import { TraineesTableRowActions } from "./trainees-table-row-actions";

export const traineeColumns: ColumnDef<TraineeWithUserAndHours>[] = [
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
    accessorKey: "student_id_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => <span>{row.getValue("student_id_number")}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const trainee = row.original;
      const fullName = `${trainee.last_name}, ${trainee.first_name} ${
        trainee.middle_name ? trainee.middle_name + " " : ""
      }`;
      return <span className="max-w-20 truncate lg:max-w-32">{fullName}</span>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const trainee = row.original;
      return (
        <span className="max-w-20 truncate lg:max-w-32">{trainee.email}</span>
      );
    },
  },
  {
    accessorKey: "hours_logged",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hours Logged" />
    ),
    cell: ({ row }) => {
      const hoursLogged = row.original.hours_logged;
      return <span>{hoursLogged ? `${hoursLogged} hrs` : "-"}</span>;
    },
  },
  {
    accessorKey: "ojt_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="OJT Status" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue("ojt_status") as string;
      const status = getOJTStatusConfig(statusValue);

      if (!status) return null;

      return <Badge className={`${status.badgeColor}`}>{status.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    id: "actions",
  },
];
