"use client";

import { ColumnDef } from "@tanstack/react-table";

import { formatFileSize, safeFormatDate } from "@/utils/shared";
import { Tables } from "@/utils/supabase/supabase.types";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

import TemplateFileCell from "./template-file-cell";

export const PreDefRequirementsColumns: ColumnDef<
  Tables<"requirement_types">
>[] = [
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
    accessorFn: (row) => row.name,
    id: "requirement",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requirement" />
    ),
    cell: ({ row }) => {
      const req = row.original.name;
      const desc = row.original.description;

      return (
        <div className="block max-w-36 space-y-1 truncate lg:max-w-52">
          <div className="block truncate">{req}</div>
          {desc && (
            <div className="text-muted-foreground max-w-36 text-xs">{desc}</div>
          )}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "max_file_size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max File Size" />
    ),
    cell: ({ row }) => {
      const maxFileSize = row.original.max_file_size_bytes;
      return formatFileSize(maxFileSize);
    },
  },
  {
    accessorKey: "allowed_file_types",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Allowed File Types" />
    ),
    cell: ({ row }) => {
      const allowedFileTypes = row.original.allowed_file_types;
      return allowedFileTypes;
    },
  },
  {
    accessorKey: "template",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Template" />
    ),
    cell: ({ row }) => {
      const filePath = row.original.template_file_path;
      const fileName = row.original.template_file_name;

      if (!filePath || !fileName) {
        return;
      }

      return <TemplateFileCell fileName={fileName} filePath={filePath} />;
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      if (!createdAt) {
        return "-";
      }

      return <span>{safeFormatDate(createdAt, "PP")}</span>;
    },
  },
  {
    accessorKey: "last_updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated At" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updated_at;
      if (!updatedAt) {
        return "-";
      }

      return <span>{safeFormatDate(updatedAt, "PP")}</span>;
    },
  },
  {
    id: "actions",
  },
];
