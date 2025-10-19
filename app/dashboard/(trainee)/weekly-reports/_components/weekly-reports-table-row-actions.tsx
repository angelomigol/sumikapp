"use client";

import Link from "next/link";

import { IconEye } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";

import { Tables } from "@/utils/supabase/supabase.types";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeeklyReportsTableRowActionsProps {
  row: Row<Tables<"weekly_reports">>;
}

export function WeeklyReportsTableRowActions({
  row,
}: WeeklyReportsTableRowActionsProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={pathsConfig.dynamic.weeklyReport(row.original.id)}>
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
