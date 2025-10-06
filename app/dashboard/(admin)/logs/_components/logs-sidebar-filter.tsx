"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, ChevronRight } from "lucide-react";

import { logsFilterConfig } from "@/config/logs-filter.config";

import { cn } from "@/lib/utils";

import { LogEntry } from "@/utils/logger/log-store";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { If } from "@/components/sumikapp/if";

interface LogsSidebarFilterProps {
  // onFiltersChange: (filters: Record<string, any>) => void;
  // currentFilters: Record<string, any>;
  logs: LogEntry[];
}

export default function LogsSidebarFilter({
  // onFiltersChange,
  // currentFilters,
  logs,
}: LogsSidebarFilterProps) {
  // const [filterValues, setFilterValues] = useState<Record<string, any>>({
  //   timeline: "custom",
  //   date: new Date(),
  //   ...currentFilters,
  // });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    timeline: true,
    level: true,
    environment: false,
    source: false,
  });

  // useEffect(() => {
  //   onFiltersChange(filterValues);
  // }, [filterValues, onFiltersChange]);

  // const handleValueChange = (key: string, value: any) => {
  //   setFilterValues((prev) => ({ ...prev, [key]: value }));
  // };

  // const handleReset = () => {
  //   const resetValues = {
  //     timeline: "custom",
  //     date: new Date(),
  //     level: [],
  //     environment: [],
  //     source: [],
  //   };
  //   setFilterValues(resetValues);
  // };

  const getOptionCount = (filterKey: string, optionValue: string) => {
    if (!logs || logs.length === 0) return 0;

    return logs.filter((log) => {
      switch (filterKey) {
        case "level":
          return log.level === optionValue;

        case "environment":
          return log.env === optionValue;

        case "source":
          // Extract source from log data or message
          // This assumes you're logging with source info in your data
          const source =
            log.data?.source || log.data?.component || log.data?.module;
          if (source) {
            return source.toLowerCase() === optionValue.toLowerCase();
          }

          // Fallback: try to infer source from message content
          const message = log.message.toLowerCase();
          if (
            optionValue === "api" &&
            (message.includes("api") ||
              message.includes("endpoint") ||
              message.includes("request"))
          ) {
            return true;
          }
          if (
            optionValue === "database" &&
            (message.includes("db") ||
              message.includes("database") ||
              message.includes("query"))
          ) {
            return true;
          }
          if (
            optionValue === "auth" &&
            (message.includes("auth") ||
              message.includes("login") ||
              message.includes("token"))
          ) {
            return true;
          }
          if (
            optionValue === "frontend" &&
            (message.includes("ui") ||
              message.includes("component") ||
              message.includes("render"))
          ) {
            return true;
          }
          return false;

        default:
          return false;
      }
    }).length;
  };

  return (
    <div className="border-muted row-start-1 row-end-4 hidden border-r px-0 py-3 lg:col-start-1 lg:col-end-2 lg:block">
      <div className="flex h-full flex-col gap-4 md:max-h-[380px]">
        <div className="flex items-center justify-between px-4">
          <h4 className="text-sm font-semibold">Filters</h4>
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={"outline"} size={"sm"} onClick={handleReset}>
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset filter</p>
            </TooltipContent>
          </Tooltip> */}
        </div>

        {/* <ScrollArea className="flex flex-col overflow-hidden">
          {logsFilterConfig.filters.map((filter) => {
            const isOpen = openSections[filter.key] ?? true;
            const toggleOpen = () =>
              setOpenSections((prev) => ({
                ...prev,
                [filter.key]: !prev[filter.key],
              }));

            return (
              <Collapsible
                key={filter.key}
                open={isOpen}
                onOpenChange={() => toggleOpen}
                className="px-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="w-full justify-start"
                    onClick={toggleOpen}
                  >
                    <ChevronRight
                      className={cn(
                        "scale-125 transition-transform duration-200",
                        {
                          "rotate-90 transform": isOpen,
                        }
                      )}
                    />
                    <p className="text-sm">{filter.label}</p>
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 px-2 pt-1 pb-3 duration-75!">
                  <If condition={filter.type === "select"}>
                    <Select
                      value={filterValues[filter.key] || filter.defaultValue}
                      onValueChange={(val) =>
                        handleValueChange(filter.key, val)
                      }
                    >
                      <SelectTrigger className="mb-2 w-full">
                        <SelectValue placeholder={`Select ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </If>

                  <If condition={filter.type === "checkbox"}>
                    <div className="border-muted flex flex-col overflow-hidden rounded-md border">
                      {filter.options?.map((opt) => {
                        const count = getOptionCount(filter.key, opt.value);
                        const isChecked =
                          filterValues[filter.key]?.includes(opt.value) ??
                          false;

                        return (
                          <div
                            key={opt.value}
                            className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Checkbox
                              id={`${filter.key}-${opt.value}`}
                              checked={
                                filterValues[filter.key]?.includes(opt.value) ??
                                false
                              }
                              onCheckedChange={(checked) => {
                                const existing = filterValues[filter.key] || [];
                                const next = checked
                                  ? [...existing, opt.value]
                                  : existing.filter(
                                      (v: string) => v !== opt.value
                                    );
                                handleValueChange(filter.key, next);
                              }}
                            />
                            <Label
                              htmlFor={`${filter.key}-${opt.value}`}
                              className="h-full flex-1 cursor-pointer justify-between py-2"
                            >
                              <p className="text-xs">{opt.label}</p>
                              <Badge
                                className="rounded-full text-[10px] opacity-70"
                                variant={count === 0 ? "secondary" : "default"}
                              >
                                {count}
                              </Badge>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </If>

                  <If condition={filter.type === "date"}>
                    <Select
                      value={filterValues[filter.key] || filter.defaultValue}
                      onValueChange={(val) =>
                        handleValueChange(filter.key, val)
                      }
                    >
                      <SelectTrigger className="mb-2 w-full">
                        <SelectValue placeholder={`Select ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <If condition={filterValues.timeline === "custom"}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-center font-normal"
                          >
                            <CalendarIcon className="size-4" />
                            {filterValues.date
                              ? format(filterValues.date, "dd MMM, yyyy")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            autoFocus
                            mode="single"
                            selected={filterValues.date}
                            onSelect={(newDate) =>
                              newDate && handleValueChange("date", newDate)
                            }
                            className="rounded-md border shadow-sm"
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </If>
                  </If>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </ScrollArea> */}
      </div>
    </div>
  );
}
