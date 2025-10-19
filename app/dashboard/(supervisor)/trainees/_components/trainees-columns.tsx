"use client";

import { ColumnDef } from "@tanstack/react-table";

import { SupervisorTrainees } from "@/hooks/use-supervisor-trainees";

import { getOJTStatusConfig } from "@/lib/constants";

import { formatHoursDisplay } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";

import { TraineesTableRowActions } from "./trainees-table-row-actions";

export const traineeColumns: ColumnDef<SupervisorTrainees>[] = [
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
      return (
        <span className="block max-w-20 truncate lg:max-w-32" title={fullName}>
          {fullName}
        </span>
      );
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
      const email = row.original.email;
      return (
        <span className="block max-w-20 truncate lg:max-w-32" title={email}>
          {email}
        </span>
      );
    },
  },
  {
    accessorKey: "course",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => {
      const course = row.original.course;
      return (
        <span
          className="block max-w-20 truncate lg:max-w-32"
          title={course ?? undefined}
        >
          {course}
        </span>
      );
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
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "hours_logged",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hours Logged" />
    ),
    cell: ({ row }) => {
      const hoursLogged = row.original.hours_logged;
      return formatHoursDisplay(hoursLogged);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TraineesTableRowActions row={row} />,
  },
];
