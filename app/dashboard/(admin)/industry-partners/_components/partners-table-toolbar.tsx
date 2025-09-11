"use client";

import { Table } from "@tanstack/react-table";

import { DataTableViewOptions } from "@/components/data-table";
import CustomSearchbar from "@/components/sumikapp/custom-search-bar";

interface IndustryPartnerTableToolbarProps<TData> {
  table: Table<TData>;
}

export function IndustryPartnerTableToolbar<TData>({
  table,
}: IndustryPartnerTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <CustomSearchbar
        searchQuery={
          (table.getColumn("company_name")?.getFilterValue() as string) ?? ""
        }
        setSearchQuery={(value) =>
          table.getColumn("company_name")?.setFilterValue(value)
        }
        placeholder="Search industry partners..."
      />

      <DataTableViewOptions table={table} />
    </div>
  );
}
