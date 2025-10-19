"use client";

import React from "react";

import { IconDotsVertical } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DailyEntryMoreOptionsProps {
  entryId: string;
  isAbsent: boolean;
  isHoliday: boolean;
  disabled?: boolean;
  onToggleAbsent: (entryId: string) => void;
  onToggleHoliday: (entryId: string) => void;
}

export default function DailyEntryMoreOptions({
  entryId,
  isAbsent,
  isHoliday,
  disabled = false,
  onToggleAbsent,
  onToggleHoliday,
}: DailyEntryMoreOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          className="rounded-full"
          disabled={disabled}
        >
          <IconDotsVertical />
          <span className="sr-only">More Options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 duration-400"
        align="end"
      >
        <DropdownMenuLabel>More Options</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={isAbsent}
            onCheckedChange={() => onToggleAbsent(entryId)}
            disabled={disabled}
          >
            Mark as Absent
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isHoliday}
            onCheckedChange={() => onToggleHoliday(entryId)}
            disabled={disabled}
          >
            Mark as Holiday
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
