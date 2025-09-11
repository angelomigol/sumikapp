"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ReviewReports } from "@/hooks/use-review-reports";

import { getDocumentStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { ProfileAvatar } from "@/components/sumikapp/profile-avatar";

export const reportsTableColumns: ColumnDef<ReviewReports>[] = [
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
    accessorFn: (row) =>
      `${row.last_name}, ${row.first_name}${
        row.middle_name ? " " + row.middle_name : ""
      }`,
    id: "student",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const trainee = row.original;
      const displayName = [
        trainee?.last_name,
        ", ",
        trainee?.first_name,
        trainee?.middle_name ? ` ${trainee.middle_name}` : "",
      ]
        .filter(Boolean)
        .join("");

      return (
        <div className="flex items-center space-x-3">
          <ProfileAvatar displayName={displayName} />
          <span className="max-w-20 truncate lg:max-w-32" title={displayName}>
            {displayName}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "report_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Report" />
    ),
    cell: ({ row }) => {
      const report = row.original.report_type;
      return <span className="capitalize">{report}</span>;
    },
    enableSorting: false,
  },
  {
    accessorFn: (row) => `${row.start_date} - ${row.end_date}`,
    id: "period",
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

      return `${safeFormatDate(startDateRaw, "PP")} - ${safeFormatDate(endDateRaw, "PP")}`;
    },
    enableHiding: false,
  },
  {
    accessorKey: "total_hours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Hours" />
    ),
    cell: ({ row }) => {
      const totalHours = parseFloat(row.getValue("total_hours") as string) || 0;
      return totalHours + (totalHours === 1 ? " Hour" : " Hours");
    },
  },
  {
    accessorKey: "submitted_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted At" />
    ),
    cell: ({ row }) => {
      const submittedAtRaw = row.getValue("submitted_at") as string;
      if (!submittedAtRaw) return "-";

      return safeFormatDate(submittedAtRaw, "PP");
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const statusValue = row.original.status;
      const status = getDocumentStatusConfig(statusValue);

      if (!status) return null;

      return (
        <div className="flex items-center gap-2">
          {status.icon && (
            <status.icon className="text-muted-foreground size-4" />
          )}
          <span>{status.label}</span>
        </div>
      );
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
