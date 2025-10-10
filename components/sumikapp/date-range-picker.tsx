"use client";

import React from "react";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

cn;

interface DateRangePickerProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  side?: "top" | "bottom" | "left" | "right";
  disabledDates?: Date[];
}

export default function DateRangePicker({
  selected,
  onSelect,
  side,
  disabledDates = [],
}: DateRangePickerProps) {
  const isDateDisabled = (date: Date) => {
    return disabledDates.some(
      (disabledDate) =>
        date.getFullYear() === disabledDate.getFullYear() &&
        date.getMonth() === disabledDate.getMonth() &&
        date.getDate() === disabledDate.getDate()
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-[260px] justify-start text-left",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected?.from ? (
            selected.to ? (
              <>
                {format(selected.from, "LLL dd, y")} -{" "}
                {format(selected.to, "LLL dd, y")}
              </>
            ) : (
              format(selected.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" side={side}>
        <Calendar
          autoFocus
          mode="range"
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={onSelect}
          disabled={isDateDisabled}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
