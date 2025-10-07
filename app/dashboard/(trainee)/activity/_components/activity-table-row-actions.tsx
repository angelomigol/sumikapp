"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import pathsConfig from "@/config/paths.config";
import { AccomplishmentReport } from "@/hooks/use-activity-reports";

import { Button } from "@/components/ui/button";

interface AccomplishmentTableRowActionsProps {
  row: Row<AccomplishmentReport>;
}

export function ActivityTableRowActions({
  row,
}: AccomplishmentTableRowActionsProps) {
  return (
    <Link href={pathsConfig.dynamic.activityReport(row.original.id)}>
      <Button variant="outline" size="sm">
        View
      </Button>
    </Link>
  );
}
