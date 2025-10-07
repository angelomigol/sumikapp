"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { AttendanceReport } from "@/hooks/use-attendance-reports";

import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps {
  row: Row<AttendanceReport>;
}

export function AttendanceTableRowActions({ row }: DataTableRowActionsProps) {
  return (
    <Button asChild variant={"outline"} size={"sm"} className="cursor-pointer">
      <Link href={pathsConfig.dynamic.attendanceReport(row.original.id)}>
        View
      </Link>
    </Button>
  );
}
