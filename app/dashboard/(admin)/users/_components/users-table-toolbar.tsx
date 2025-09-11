"use client";

import { Table } from "@tanstack/react-table";
import { Users2, X } from "lucide-react";

import { roleFilterOptions } from "@/lib/constants";

import { Button } from "@/components/ui/button";

import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface UserTableToolbarProps<TData> {
  table: Table<TData>;
}

export function UserTableToolbar<TData>({
  table,
}: UserTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-4">
        <CustomSearchbar
          searchQuery={
            (table.getColumn("user")?.getFilterValue() as string) ?? ""
          }
          setSearchQuery={(value) =>
            table.getColumn("user")?.setFilterValue(value)
          }
          placeholder="Search users..."
        />
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            icon={Users2}
            options={roleFilterOptions}
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
