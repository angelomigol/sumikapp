"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { ReviewReports } from "@/hooks/use-review-reports";

import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps {
  reportType: "attendance" | "accomplishment";
  row: Row<ReviewReports>;
}

export function ReviewReportsTableRowActions({
  reportType,
  row,
}: DataTableRowActionsProps) {
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
