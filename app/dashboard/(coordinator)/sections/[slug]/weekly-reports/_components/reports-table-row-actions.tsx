"use client";

import Link from "next/link";

import { IconEye } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { ReviewReports } from "@/hooks/use-review-reports";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableRowActionsProps {
  row: Row<ReviewReports>;
  slug: string;
}

export function ReportsTableRowActions({
  row,
  slug,
}: DataTableRowActionsProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={pathsConfig.dynamic.viewReport(row.original.report_id, slug)}
        >
          <Button variant={"outline"} size={"sm"}>
            <IconEye />
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>View</p>
      </TooltipContent>
    </Tooltip>
  );
}
