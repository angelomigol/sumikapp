"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { ReviewReports } from "@/hooks/use-review-reports";

import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps {
  row: Row<ReviewReports>;
  slug: string;
}

export function ReportsTableRowActions({
  row,
  slug,
}: DataTableRowActionsProps) {
  return (
    <Link href={pathsConfig.dynamic.viewReport(row.original.report_id, slug)}>
      <Button variant={"outline"} size={"sm"}>
        View
      </Button>
    </Link>
  );
}
