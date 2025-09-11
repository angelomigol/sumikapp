"use client";

import { ColumnDef } from "@tanstack/react-table";

import { SupervisorTraineesForEvaluationTable } from "@/hooks/use-supervisor-trainees";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";

import { EvaluationsTableRowActions } from "./evaluations-table-row-actions";

export const evaluationColumns: ColumnDef<SupervisorTraineesForEvaluationTable>[] =
  [
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
          <span className="max-w-20 truncate lg:max-w-32">{fullName}</span>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return <span className="max-w-20 truncate lg:max-w-32">{email}</span>;
      },
    },
    {
      accessorKey: "course",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Course" />
      ),
      cell: ({ row }) => {
        const course = row.original.course;
        return <span className="max-w-20 truncate lg:max-w-32">{course}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <EvaluationsTableRowActions row={row} />,
    },
  ];
