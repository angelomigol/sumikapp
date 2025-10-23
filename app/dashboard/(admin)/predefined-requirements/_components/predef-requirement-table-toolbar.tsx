"use client";

import { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface PredefRequirementsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function PredefRequirementsTableToolbar<TData>({
  table,
}: PredefRequirementsTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <CustomSearchbar
        searchQuery={
          (table.getColumn("requirement")?.getFilterValue() as string) ?? ""
        }
        setSearchQuery={(value) =>
          table.getColumn("requirement")?.setFilterValue(value)
        }
        placeholder="Search requirements..."
      />

      <DataTableViewOptions table={table} />
    </div>
  );
}
