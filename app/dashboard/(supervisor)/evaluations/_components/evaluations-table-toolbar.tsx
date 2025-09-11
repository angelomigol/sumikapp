"use client";

import { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface EvaluationsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function EvaluationsTableToolbar<TData>({
  table,
}: EvaluationsTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <CustomSearchbar
        searchQuery={
          (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
        }
        setSearchQuery={(value) =>
          table.getColumn("fullName")?.setFilterValue(value)
        }
        placeholder="Search students..."
      />

      <DataTableViewOptions table={table} />
    </div>
  );
}
