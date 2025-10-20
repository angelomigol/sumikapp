"use client";

import React, { useState } from "react";

import { IconDownload, IconExternalLink } from "@tabler/icons-react";
import { format } from "date-fns";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
} from "lucide-react";
import * as motion from "motion/react-client";
import { toast } from "sonner";

import {
  DocumentStatus,
  EntryStatus,
  entryStatusOptions,
  getEntryStatusConfig,
} from "@/lib/constants";

import { formatFileSize, formatHoursDisplay } from "@/utils/shared";
import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { WeeklyReportEntryWithFiles } from "@/schemas/weekly-report/weekly-report.schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RichTextEditor from "@/components/rich-text-editor";
import { If } from "@/components/sumikapp/if";

interface ReviewReportDailyEntriesProps {
  entries: WeeklyReportEntryWithFiles[];
  reportStatus: DocumentStatus;
  isSubmitting: boolean;
  onStatusChange: (entryId: string, status: EntryStatus) => void;
  onFeedbackSubmit: (entryId: string, feedback: string) => void;
}

export default function ReviewReportDailyEntries({
  entries,
  reportStatus,
  isSubmitting,
  onStatusChange,
  onFeedbackSubmit,
}: ReviewReportDailyEntriesProps) {
  const supabase = useSupabase();

  const [activeTab, setActiveTab] = useState("0");

  const canEditStatus = reportStatus === "pending";
  const [feedbackValues, setFeedbackValues] = useState<Record<string, string>>(
    entries.reduce(
      (acc, entry) => {
        acc[entry.id] = entry.feedback || "";
        return acc;
      },
      {} as Record<string, string>
    )
  );

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="size-4" />;
    if (fileType.includes("pdf")) return <FileTextIcon className="size-4" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheetIcon className="size-4" />;
    return <FileIcon className="size-4" />;
  };

  const handleFeedbackChange = (entryId: string, value: string) => {
    setFeedbackValues((prev) => ({
      ...prev,
      [entryId]: value,
    }));
  };

  const handleDownloadFile = async ({
    filePath,
    fileName,
  }: {
    filePath: string;
    fileName: string;
  }) => {
    if (fileName && filePath) {
      try {
        const { data, error } = await supabase.storage
          .from("additional-attachments")
          .download(filePath);

        if (error) {
          toast.error(`Failed to download ${fileName}.`);
          console.error("Error downloading file:", error);
          return;
        }

        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download file:", err);
      }
    }
  };

  const handleViewFile = async ({ filePath }: { filePath: string }) => {
    if (filePath) {
      try {
        const { data, error } = await supabase.storage
          .from("additional-attachments")
          .createSignedUrl(filePath, 3600);

        if (error) {
          toast.error("Failed to view file.");
          console.error("Error getting file URL:", error);
          return;
        }

        window.open(data.signedUrl, "_blank");
      } catch (err) {
        console.error("Failed to view file:", err);
        toast.error("Something went wrong while opening the file.");
      }
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              {entry.status !== null && (
                <div className="size-1 rounded-full bg-green-500 md:size-1.5" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {entries.map((entry, index) => (
        <TabsContent
          key={entry.entry_date}
          value={index.toString()}
          className="mt-3 space-y-6 md:space-y-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
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

              <If condition={canEditStatus && onStatusChange}>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Status:</Label>
                  <Select
                    value={entry.status || undefined}
                    onValueChange={(value) =>
                      onStatusChange?.(entry.id, value as EntryStatus)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entryStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </If>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
                <div className="space-y-2">
                  <Label>Time In</Label>
                  <Input
                    type="time"
                    value={entry.time_in || ""}
                    readOnly
                    className="cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Out</Label>
                  <Input
                    type="time"
                    value={entry.time_out || ""}
                    readOnly
                    className="cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input
                    readOnly
                    value={formatHoursDisplay(entry.total_hours)}
                    className="cursor-default"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Label>Daily Accomplishments</Label>
                </div>
                <RichTextEditor
                  value={entry.daily_accomplishments || ""}
                  disabled
                />
              </div>

              <If condition={entry.additional_notes}>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    readOnly
                    value={entry.additional_notes ?? ""}
                    className="cursor-default resize-none"
                  />
                </div>
              </If>

              <If condition={entry.files && entry.files.length > 0}>
                <div className="space-y-3">
                  <Label>Attachments</Label>

                  <div className="space-y-2">
                    {entry.files?.map((file) => (
                      <div
                        key={`${file.entry_id}-${file.file_name}`}
                        className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="bg-muted flex size-10 items-center justify-center rounded">
                            {getFileIcon(file.file_type)}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="truncate text-sm font-medium">
                                {file.file_name}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{file.file_name}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant={"ghost"}
                            size={"icon-sm"}
                            onClick={() =>
                              handleViewFile({ filePath: file.file_path })
                            }
                            asChild
                          >
                            <motion.button whileTap={{ scale: 0.85 }}>
                              <a>
                                <IconExternalLink className="size-4" />
                                <span className="sr-only">View</span>
                              </a>
                            </motion.button>
                          </Button>

                          <Button
                            variant={"ghost"}
                            size={"icon-sm"}
                            onClick={() =>
                              handleDownloadFile({
                                filePath: file.file_path,
                                fileName: file.file_name,
                              })
                            }
                            asChild
                          >
                            <motion.button whileTap={{ scale: 0.85 }}>
                              <IconDownload className="size-4" />
                              <span className="sr-only">Download</span>
                            </motion.button>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </If>

              <If
                condition={
                  reportStatus === "pending" || reportStatus === "rejected"
                }
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Label htmlFor="feedback">Your Feedback</Label>

                    <span className="text-muted-foreground text-xs">
                      Optional field
                    </span>
                  </div>
                  <Textarea
                    value={feedbackValues[entry.id] ?? ""}
                    onChange={(e) =>
                      handleFeedbackChange(entry.id, e.target.value)
                    }
                    id={`feedback-${entry.id}`}
                    placeholder="Type your feedback here..."
                    maxLength={200}
                    className="field-sizing-content max-h-30 min-h-20 resize-none py-1.75"
                  />
                  <div className="flex justify-between gap-1">
                    <p className="text-muted-foreground text-xs">
                      <span className="tabular-nums">
                        {200 - (feedbackValues[entry.id]?.length || 0)}
                      </span>{" "}
                      characters left
                    </p>
                    <Button
                      size={"sm"}
                      onClick={() =>
                        onFeedbackSubmit(
                          entry.id,
                          feedbackValues[entry.id] ?? ""
                        )
                      }
                      disabled={
                        feedbackValues[entry.id]?.length > 200 || isSubmitting
                      }
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </If>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
