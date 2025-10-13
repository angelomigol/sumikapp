"use client";

import React from "react";

import { IconInfoCircle } from "@tabler/icons-react";
import { format } from "date-fns";

import { WeeklyReportEntry } from "@/schemas/weekly-report/weekly-report.schema";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RichTextEditor from "@/components/rich-text-editor";
import CheckboxEntryDialog from "@/components/sumikapp/checkbox-entry-dialog";

interface DailyEntryRowProps {
  entries: WeeklyReportEntry[];
  status: string;
  isLoading: boolean;
  activeTab: string;
  lunchBreak: number;
  onTimeInChange: (entryId: string, timeIn: string) => void;
  onTimeOutChange: (entryId: string, timeOut: string) => void;
  onDailyAccomplishmentChange: (
    entryId: string,
    dailyAccomplishments: string
  ) => void;
  onConfirmEntry: (entryId: string) => void;
  onTabChange: (val: string) => void;
}

export default function DailyEntryRow({
  entries,
  status,
  isLoading,
  activeTab,
  lunchBreak = 0,
  onTimeInChange,
  onTimeOutChange,
  onDailyAccomplishmentChange,
  onConfirmEntry,
  onTabChange,
}: DailyEntryRowProps) {
  const canEditEntry = (entry: WeeklyReportEntry) => {
    return (
      (!entry.is_confirmed && status === "not submitted") ||
      status === "rejected"
    );
  };

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid h-auto w-full grid-cols-7 gap-0.5 p-1 md:gap-1">
        {entries.map((entry, index) => {
          const dayDate = new Date(entry.entry_date);
          const dayInitial = dayDate
            .toLocaleDateString("en-PH", { weekday: "short" })
            .slice(0, 1);
          const dayShort = new Date(entry.entry_date).toLocaleDateString(
            "en-PH",
            {
              weekday: "short",
            }
          );

          return (
            <TabsTrigger
              key={entry.entry_date}
              value={index.toString()}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-h-[3rem] flex-col gap-0.5 px-1 py-2 md:min-h-[3.5rem] md:gap-1 md:px-2 md:py-2.5"
            >
              <span className="text-sm font-medium md:hidden md:text-xs">
                {dayInitial}
              </span>
              <span className="hidden text-sm md:inline md:text-xs">
                {dayShort}
              </span>
              <span className="text-sm opacity-70 md:text-xs">
                {String(dayDate.getDate()).padStart(2, "0")}
              </span>
              {entry.is_confirmed && (
                <div className="size-1 rounded-full bg-green-500 md:size-1.5" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {entries.map((entry, index) => {
        const isFieldsDisabled =
          entry.status === "absent" || entry.status === "holiday";

        return (
          <TabsContent
            key={entry.entry_date}
            value={index.toString()}
            className="mt-3 space-y-3 md:mt-4 md:space-y-4"
          >
            <div className="flex flex-col gap-6">
              <div className="flex justify-between">
                <span className="leading-none font-semibold">
                  {format(entry.entry_date, "PPPP")}
                </span>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
                  <div className="space-y-2">
                    <Label>Time In</Label>
                    <Input
                      type={"time"}
                      value={entry.time_in || ""}
                      onChange={(e) => onTimeInChange(entry.id, e.target.value)}
                      className={
                        !canEditEntry(entry) ? "cursor-not-allowed" : ""
                      }
                      disabled={!canEditEntry(entry)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Out</Label>
                    <Input
                      type={"time"}
                      value={entry.time_out || ""}
                      onChange={(e) =>
                        onTimeOutChange(entry.id, e.target.value)
                      }
                      className={
                        !canEditEntry(entry) ? "cursor-not-allowed" : ""
                      }
                      disabled={!canEditEntry(entry)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle className="text-muted-foreground size-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Automatically calculated from time in and time out.
                            {lunchBreak > 0 &&
                              ` Lunch break (${lunchBreak} min) is deducted.`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Label>Working Hours</Label>
                    </div>
                    <Input
                      readOnly
                      value={
                        entry.total_hours > 0
                          ? `${entry.total_hours} hrs`
                          : "0 hrs"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Daily Accomplishments
                    {isFieldsDisabled && (
                      <Badge variant={"secondary"}>Disabled</Badge>
                    )}
                  </Label>
                  <RichTextEditor
                    value={entry.daily_accomplishments || ""}
                    onChange={(html) =>
                      onDailyAccomplishmentChange(entry.id, html)
                    }
                    placeholder="Describe accomplishments for this day..."
                    disabled={!canEditEntry(entry)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="justify-self-end">
              <CheckboxEntryDialog
                disabled={isLoading}
                isConfirmed={entry.is_confirmed}
                canConfirm={canEditEntry(entry)}
                onConfirm={() => onConfirmEntry(entry.id)}
              />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
