"use client";

import { Table } from "@tanstack/react-table";
import { FileText, X } from "lucide-react";

import {
  documentStatusFilterOptions,
  internCodeSelectOptions,
} from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  DataTableFacetedFilter,
  InternCodeSelectFilter,
} from "@/components/data-table";

interface WeeklyReportsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function WeeklyReportsTableToolbar<TData>({
  table,
}: WeeklyReportsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        {table.getColumn("internship_code") && (
          <InternCodeSelectFilter
            column={table.getColumn("internship_code")}
            options={internCodeSelectOptions}
            defaultValue={"all"}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            icon={FileText}
            options={documentStatusFilterOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
