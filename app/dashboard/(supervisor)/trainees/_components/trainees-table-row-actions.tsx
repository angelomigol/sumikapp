"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import pathsConfig from "@/config/paths.config";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TraineesTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function TraineesTableRowActions<TData>({
  row,
}: TraineesTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex size-8 p-0"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem>
          <Link href={pathsConfig.dynamic.traineeDetails(row.original.trainee_id)}>
            View Student
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
