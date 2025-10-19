"use client";

import { Table } from "@tanstack/react-table";
import { FileQuestion, X } from "lucide-react";

import { documentStatusFilterOptions } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface SectionReportTableToolbarProps<TData> {
  table: Table<TData>;
}

export function SectionReportTableToolbar<TData>({
  table,
}: SectionReportTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex flex-1 items-center space-x-4">
        <CustomSearchbar
          searchQuery={
            (table.getColumn("student")?.getFilterValue() as string) ?? ""
          }
          setSearchQuery={(value) =>
            table.getColumn("student")?.setFilterValue(value)
          }
          placeholder="Search students..."
        />

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            icon={FileQuestion}
            options={documentStatusFilterOptions.filter(
              (option) => option.value !== "not submitted"
            )}
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

      <DataTableViewOptions table={table} />
    </div>
  );
}
