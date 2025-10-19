"use client";

import React from "react";

import { IconInfoCircle } from "@tabler/icons-react";
import { format } from "date-fns";
import { CircleAlertIcon } from "lucide-react";

import { getEntryStatusConfig } from "@/lib/constants";

import { formatHoursDisplay } from "@/utils/shared";

import {
  EntryUploadedFile,
  WeeklyReportEntryWithFiles,
} from "@/schemas/weekly-report/weekly-report.schema";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { If } from "@/components/sumikapp/if";

import DailyEntryMoreOptions from "./daily-entry-more-options";
import EntryFileUpload from "./entry-file-upload";

interface DailyEntryRowProps {
  entries: WeeklyReportEntryWithFiles[];
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
  onAdditionalNotesChange: (entryId: string, notes: string) => void;
  onConfirmEntry: (entryId: string) => void;
  onTabChange: (val: string) => void;
  onToggleAbsent: (entryId: string) => void;
  onToggleHoliday: (entryId: string) => void;
  onFilesChange?: (entryId: string, files: EntryUploadedFile[]) => void;
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
  onAdditionalNotesChange,
  onConfirmEntry,
  onTabChange,
  onToggleAbsent,
  onToggleHoliday,
  onFilesChange,
}: DailyEntryRowProps) {
  const canEditEntry = (entry: WeeklyReportEntryWithFiles) => {
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
            className="mt-3 space-y-6 md:space-y-8"
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {format(entry.entry_date, "PPPP")}
                  </span>
                  {entry.status === "absent" && (
                    <Badge
                      className={`px-1.5 py-px ${getEntryStatusConfig("absent").badgeColor}`}
                    >
                      Absent
                    </Badge>
                  )}
                  {entry.status === "holiday" && (
                    <Badge
                      className={`px-1.5 py-px ${getEntryStatusConfig("holiday").badgeColor}`}
                    >
                      Holiday
                    </Badge>
                  )}
                </div>

                <If
                  condition={
                    status === "not submitted" || status === "rejected"
                  }
                >
                  <DailyEntryMoreOptions
                    entryId={entry.id}
                    isAbsent={entry.status === "absent"}
                    isHoliday={entry.status === "holiday"}
                    disabled={!canEditEntry(entry)}
                    onToggleAbsent={onToggleAbsent}
                    onToggleHoliday={onToggleHoliday}
                  />
                </If>
              </div>

              <Separator />

              <div className="space-y-4">
                <If condition={entry.feedback}>
                  <Alert className="flex items-center justify-between">
                    <Avatar className="rounded-sm">
                      <AvatarImage
                        src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
                        alt="Hallie Richards"
                        className="rounded-sm"
                      />
                      <AvatarFallback className="text-xs">HR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex-col justify-center gap-1">
                      <AlertTitle className="flex-1">
                        Your supervisor provided a feedback.
                      </AlertTitle>
                      <AlertDescription>{entry.feedback}</AlertDescription>
                    </div>
                    <CircleAlertIcon />
                  </Alert>
                </If>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-in">Time In</Label>
                    <Input
                      id="time-in"
                      type={"time"}
                      value={entry.time_in || ""}
                      onChange={(e) => onTimeInChange(entry.id, e.target.value)}
                      max={entry.entry_date + "T23:59"}
                      className={
                        !canEditEntry(entry) || isFieldsDisabled
                          ? "cursor-not-allowed"
                          : ""
                      }
                      disabled={!canEditEntry(entry) || isFieldsDisabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-out">Time Out</Label>
                    <Input
                      id="time-out"
                      type={"time"}
                      value={entry.time_out || ""}
                      onChange={(e) =>
                        onTimeOutChange(entry.id, e.target.value)
                      }
                      min={entry.time_in ?? undefined}
                      max={entry.entry_date + "T23:59"}
                      className={
                        !canEditEntry(entry) || isFieldsDisabled
                          ? "cursor-not-allowed"
                          : ""
                      }
                      disabled={!canEditEntry(entry) || isFieldsDisabled}
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
                      <Label htmlFor="working-hours">Working Hours</Label>
                    </div>
                    <Input
                      id="working-hours"
                      readOnly
                      value={formatHoursDisplay(entry.total_hours)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Label htmlFor="daily-accomplishments">
                      Daily Accomplishments
                      {isFieldsDisabled && (
                        <Badge variant={"secondary"} className="px-1.5 py-px">
                          Disabled
                        </Badge>
                      )}
                    </Label>
                  </div>
                  <RichTextEditor
                    value={entry.daily_accomplishments || ""}
                    onChange={(html) =>
                      onDailyAccomplishmentChange(entry.id, html)
                    }
                    placeholder="Describe accomplishments for this day..."
                    disabled={!canEditEntry(entry) || isFieldsDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Label htmlFor="additional-notes">Your Notes</Label>
                    <span className="text-muted-foreground text-xs">
                      Optional field
                    </span>
                  </div>
                  <Textarea
                    id="additonal-notes"
                    value={entry.additional_notes || ""}
                    onChange={(e) =>
                      onAdditionalNotesChange(entry.id, e.target.value)
                    }
                    placeholder="Any additional notes..."
                    rows={3}
                    className="resize-none text-sm"
                    disabled={!canEditEntry(entry)}
                  />

                  <EntryFileUpload
                    existingFiles={entry.files || []}
                    disabled={!canEditEntry(entry)}
                    maxFiles={5}
                    maxFileSize={10}
                    onFilesChange={(files) => onFilesChange?.(entry.id, files)}
                  />
                </div>
              </div>
            </div>

            <CheckboxEntryDialog
              disabled={isLoading}
              isConfirmed={entry.is_confirmed}
              canConfirm={canEditEntry(entry)}
              onConfirm={() => onConfirmEntry(entry.id)}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
