"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";

import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps<TData> {
  reportType: "attendance" | "accomplishment";
  row: Row<TData>;
}

export function ReviewReportsTableRowActions<TData>({
  reportType,
  row,
}: DataTableRowActionsProps<TData>) {
  return (
    <Link
      href={pathsConfig.dynamic.reviewReport(
        row.original.report_id,
        reportType
      )}
    >
      <Button variant="outline" size="sm">
        View
      </Button>
    </Link>
  );
}
