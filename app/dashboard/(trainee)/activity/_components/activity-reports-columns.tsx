"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";

import { AccomplishmentReport } from "@/hooks/use-activity-reports";

import { getDocumentStatusConfig } from "@/lib/constants/reports";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import { ActivityTableRowActions } from "./activity-table-row-actions";

export const activityReportColumns: ColumnDef<AccomplishmentReport>[] = [
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
    accessorKey: "period",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Period" />
    ),
    cell: ({ row }) => {
      const startDateRaw = row.original.start_date;
      const endDateRaw = row.original.end_date;

      if (!startDateRaw || !endDateRaw) {
        return "-";
      }

      const startDate = new Date(startDateRaw);
      const endDate = new Date(endDateRaw);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "-";
      }

      return `${formatDate(startDate, "PP")} - ${formatDate(endDate, "PP")}`;
    },
  },
  {
    accessorKey: "submitted_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted Date" />
    ),
    cell: ({ row }) => {
      const submittedAtRaw = row.getValue("submitted_at") as Date;
      if (!submittedAtRaw) return "-";

      const submittedAt = new Date(submittedAtRaw);
      if (isNaN(submittedAt.getTime())) return "-";

      return formatDate(submittedAt, "PP");
    },
  },
  {
    accessorKey: "total_hours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Hours" />
    ),
    cell: ({ row }) => {
      const totalHours = row.getValue("total_hours") as number;
      return totalHours + (totalHours === 1 ? " Hour" : " Hours");
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = getDocumentStatusConfig(row.getValue("status"));

      if (!status) return null;

      return (
        <div className="flex items-center gap-2">
          {status.icon && <status.icon className="size-4" />}
          {status.label}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "internship_code",
    header: () => null,
    cell: () => null,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActivityTableRowActions row={row} />,
  },
];
