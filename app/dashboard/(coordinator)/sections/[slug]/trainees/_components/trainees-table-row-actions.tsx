"use client";

import Link from "next/link";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { TraineeWithUserAndHours } from "@/hooks/use-section-trainees";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TraineesTableRowActionsProps {
  row: Row<TraineeWithUserAndHours>;
  slug: string;
}

export function TraineesTableRowActions({
  row,
  slug,
}: TraineesTableRowActionsProps) {
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
        <DropdownMenuItem asChild>
          <Link
            href={pathsConfig.dynamic.sectionTraineeDetails(
              row.original.trainee_id,
              slug
            )}
          >
            View Student
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Remove Student</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
