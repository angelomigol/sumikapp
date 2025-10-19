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
}

export function ReviewReportsTableRowActions({
  row,
}: DataTableRowActionsProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={pathsConfig.dynamic.reviewReport(row.original.report_id)}>
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
