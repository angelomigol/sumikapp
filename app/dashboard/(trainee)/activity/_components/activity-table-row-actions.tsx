"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import pathsConfig from "@/config/paths.config";

interface AccomplishmentTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ActivityTableRowActions<TData>({
  row,
}: AccomplishmentTableRowActionsProps<TData>) {
  return (
    <Link href={pathsConfig.dynamic.activityReport(row.original.id)}>
      <Button variant="outline" size="sm">
        View
      </Button>
    </Link>
  );
}
