"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ReviewReports } from "@/hooks/use-review-reports";

import { getDocumentStatusConfig } from "@/lib/constants";

import { formatHoursDisplay, safeFormatDate } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { ProfileAvatar } from "@/components/sumikapp/profile-avatar";

import { ReviewReportsTableRowActions } from "./review-reports-table-row-actions";

export const reviewReportColumns: ColumnDef<ReviewReports>[] = [
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
    id: "trainee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trainee" />
    ),
    cell: ({ row }) => {
      const trainee = row.original;
      const fullName = [
        trainee?.last_name,
        ", ",
        trainee?.first_name,
        trainee?.middle_name ? ` ${trainee.middle_name}` : "",
      ]
        .filter(Boolean)
        .join("");

      return (
        <div className="flex items-center gap-3">
          <ProfileAvatar displayName={fullName} />
          <span
            className="block max-w-20 truncate lg:max-w-32"
            title={fullName}
          >
            {fullName}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
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
      return formatHoursDisplay(totalHours);
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
      const status = getDocumentStatusConfig(row.getValue("status"));

      if (!status) return null;

      return (
        <Badge variant={"outline"} className="text-muted-foreground">
          {status.icon && (
            <status.icon
              className={`${status.label === "pending" ? "" : status.textColor}`}
            />
          )}
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <ReviewReportsTableRowActions row={row} />,
  },
];
