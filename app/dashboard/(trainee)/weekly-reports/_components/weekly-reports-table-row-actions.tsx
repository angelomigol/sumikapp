"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";

import { Tables } from "@/utils/supabase/supabase.types";

import { Button } from "@/components/ui/button";

interface WeeklyReportsTableRowActionsProps {
  row: Row<Tables<"weekly_reports">>;
}

export function WeeklyReportsTableRowActions({
  row,
}: WeeklyReportsTableRowActionsProps) {
  return (
    <Button asChild variant={"outline"} size={"sm"} className="cursor-pointer">
      <Link href={pathsConfig.dynamic.weeklyReport(row.original.id)}>
        View
      </Link>
    </Button>
  );
}
