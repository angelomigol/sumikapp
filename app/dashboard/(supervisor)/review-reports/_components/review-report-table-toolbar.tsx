"use client";

import { Table } from "@tanstack/react-table";
import { FileQuestion, FileText, X } from "lucide-react";

import { documentStatusFilterOptions } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

import { ReportTypeFacetedFilter } from "./report-type-faceted-filter";

interface ReviewReportTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ReviewReportTableToolbar<TData>({
  table,
}: ReviewReportTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex flex-1 items-center space-x-4">
        <CustomSearchbar
          searchQuery={
            (table.getColumn("trainee")?.getFilterValue() as string) ?? ""
          }
          setSearchQuery={(value) =>
            table.getColumn("trainee")?.setFilterValue(value)
          }
          placeholder="Search trainees..."
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

        {table.getColumn("report_type") && (
          <ReportTypeFacetedFilter
            column={table.getColumn("report_type")}
            title="Report Type"
            icon={FileText}
            options={[
              {
                label: "Attendance",
                value: "attendance",
              },
              {
                label: "Accomplishment",
                value: "accomplishment",
              },
            ]}
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
