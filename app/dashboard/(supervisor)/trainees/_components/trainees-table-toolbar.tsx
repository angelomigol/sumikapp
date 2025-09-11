"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { ojtStatusFilterOptions } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface TraineeTableToolbarProps<TData> {
  table: Table<TData>;
}

export function TraineesTableToolbar<TData>({
  table,
}: TraineeTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <CustomSearchbar
          searchQuery={
            (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
          }
          setSearchQuery={(value) =>
            table.getColumn("fullName")?.setFilterValue(value)
          }
          placeholder="Search students..."
        />
        {table.getColumn("ojt_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("ojt_status")}
            title="OJT Status"
            options={ojtStatusFilterOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
