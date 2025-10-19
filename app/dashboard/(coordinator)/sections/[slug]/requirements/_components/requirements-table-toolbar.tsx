"use client";

import { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface RequirementTableToolbarProps<TData> {
  table: Table<TData>;
}

export function RequirementTableToolbar<TData>({
  table,
}: RequirementTableToolbarProps<TData>) {
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
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
