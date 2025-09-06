import * as React from "react";

import { Column } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InternCodeSelectFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  options: {
    label: string;
    value: string;
  }[];
  defaultValue: string;
}

export function InternCodeSelectFilter<TData, TValue>({
  column,
  options,
  defaultValue,
}: InternCodeSelectFilterProps<TData, TValue>) {
  const filterValue = (column?.getFilterValue() as string) || defaultValue;

  return (
    <Select
      defaultValue={defaultValue}
      value={filterValue}
      onValueChange={(value) => {
        column?.setFilterValue(value === "all" ? undefined : value);
      }}
    >
      <SelectTrigger size={"sm"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Reports</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
