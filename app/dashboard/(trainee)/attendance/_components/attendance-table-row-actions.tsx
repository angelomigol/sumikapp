"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";

import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function AttendanceTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  return (
    <Button asChild variant={"outline"} size={"sm"} className="cursor-pointer">
      <Link href={pathsConfig.dynamic.attendanceReport(row.original.id)}>
        View
      </Link>
    </Button>
  );
}
