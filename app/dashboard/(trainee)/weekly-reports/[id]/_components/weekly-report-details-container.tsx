"use client";

import React, { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  useFetchWeeklyReport,
  useInsertWeeklyReportEntry,
  useSubmitWeeklyReport,
} from "@/hooks/use-weekly-reports";

import { documentStatusMap, EntryStatus, internCodeMap } from "@/lib/constants";

import {
  calculateTotalHours,
  createTableEntries,
  formatHoursDisplay,
  safeFormatDate,
} from "@/utils/shared";

import {
  EntryUploadedFile,
  WeeklyReportEntryWithFiles,
} from "@/schemas/weekly-report/weekly-report.schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import ReportMoreOptions from "@/components/sumikapp/report-more-options";

import NotFoundPage from "@/app/not-found";

import {
  deleteWeeklyReportAction,
  uploadEntryFileAttachmentsAction,
} from "../server/server-actions";
import DailyEntryRow from "./daily-entry-row";

export default function WeeklyReportDetailsContainer(params: {
  reportId: string;
}) {
  const report = useFetchWeeklyReport(params.reportId);
  const insertEntryMutation = useInsertWeeklyReportEntry(params.reportId);
  const submitReportMutation = useSubmitWeeklyReport(params.reportId);

  const [activeTab, setActiveTab] = useState("0");
  const [tableEntries, setTableEntries] = useState<
    WeeklyReportEntryWithFiles[]
  >([]);

  const [isInternSigned, setIsInternSigned] = useState(false);

  const startDate = report.data?.start_date ?? "";
  const endDate = report.data?.end_date ?? "";
  const status = report.data?.status ?? "not submitted";
  const internCode = report.data?.internship_code ?? "CTNTERN1";
  const lunchBreak = report.data?.lunch_break ?? 0;

  useEffect(() => {
    if (report.data) {
      const entries = createTableEntries(
        startDate,
        endDate,
        report.data?.weekly_report_entries,
        params.reportId
      );

      const entriesWithFiles = entries.map((entry) => {
        const entryFiles =
          report.data.file_attachments
            ?.filter((file) => file.entry_id === entry.id)
            .map((file) => ({
              entry_id: file.entry_id,
              file_name: file.file_name,
              file_size: file.file_size,
              file_type: file.file_type,
              file_path: file.file_path,
            })) || [];

        return {
          ...entry,
          files: entryFiles,
        };
      });

      setTableEntries(entriesWithFiles);
    }
  }, [report.data, startDate, endDate, params.reportId]);

  useEffect(() => {
    if (status === "pending" || status === "approved") {
      setIsInternSigned(true);
    }
  }, [status]);

  useEffect(() => {
    if (tableEntries.length > 0 && Number(activeTab) >= tableEntries.length) {
      setActiveTab("0");
    }
  }, [tableEntries, activeTab]);

  if (report.isLoading) return <LoadingOverlay fullPage />;

  if (!report.data) return <NotFoundPage />;

  const allEntriesConfirmed =
    tableEntries.length > 0 && tableEntries.every((e) => e.is_confirmed);

  const handlePrevTab = () => {
    setActiveTab((prev) => {
      const prevIndex = Math.max(Number(prev) - 1, 0);
      return prevIndex.toString();
    });
  };

  const handleNextTab = () => {
    setActiveTab((prev) => {
      const nextIndex = Math.min(Number(prev) + 1, tableEntries.length - 1);
      return nextIndex.toString();
    });
  };

  const handleTimeInChange = (entryId: string, timeIn: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const totalHours = calculateTotalHours(
            timeIn,
            entry.time_out || "",
            lunchBreak
          );
          return {
            ...entry,
            time_in: timeIn,
            total_hours: totalHours,
          };
        }
        return entry;
      })
    );
  };

  const handleTimeOutChange = (entryId: string, timeOut: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const totalHours = calculateTotalHours(
            entry.time_in || "",
            timeOut,
            lunchBreak
          );
          return {
            ...entry,
            time_out: timeOut,
            total_hours: totalHours,
          };
        }
        return entry;
      })
    );
  };

  const handleDailyAccomplishmentsChange = (
    entryId: string,
    dailyAccomplishments: string
  ) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId
          ? { ...entry, daily_accomplishments: dailyAccomplishments }
          : entry
      )
    );
  };

  const handleAdditionalNotesChange = (entryId: string, notes: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, additional_notes: notes } : entry
      )
    );
  };

  const handleToggleAbsent = (entryId: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const newStatus = entry.status === "absent" ? "present" : "absent";

          if (newStatus === "absent") {
            return {
              ...entry,
              status: newStatus,
              time_in: null,
              time_out: null,
              total_hours: 0,
              daily_accomplishments: null,
              is_confirmed: false,
            };
          }

          return {
            ...entry,
            status: newStatus,
          };
        }
        return entry;
      })
    );

    toast.info(
      tableEntries.find((e) => e.id === entryId)?.status === "absent"
        ? "Entry unmarked as absent"
        : "Entry marked as absent"
    );
  };

  const handleToggleHoliday = (entryId: string) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          const newStatus = entry.status === "holiday" ? "present" : "holiday";

          if (newStatus === "holiday") {
            return {
              ...entry,
              status: newStatus,
              time_in: null,
              time_out: null,
              total_hours: 0,
              daily_accomplishments: null,
              is_confirmed: false,
            };
          }

          return {
            ...entry,
            status: newStatus,
          };
        }
        return entry;
      })
    );

    toast.info(
      tableEntries.find((e) => e.id === entryId)?.status === "holiday"
        ? "Entry unmarked as holiday"
        : "Entry marked as holiday"
    );
  };

  const handleFilesChange = (entryId: string, files: EntryUploadedFile[]) => {
    setTableEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === entryId ? { ...entry, files } : entry
      )
    );
  };

  const handleConfirmEntry = (entryId: string) => {
    const entryToConfirm = tableEntries.find((entry) => entry.id === entryId);

    if (!entryToConfirm) return;

    if (new Date(entryToConfirm?.entry_date) > new Date()) {
      toast.error("The entry date cannot be later than today.");
      return;
    }

    let status: EntryStatus | null = entryToConfirm.status;

    if (status !== "absent" && status !== "holiday") {
      status =
        entryToConfirm.time_in && entryToConfirm.time_out ? "present" : null;
    }

    const updatedEntry = {
      ...entryToConfirm,
      status: status,
      files: entryToConfirm.files || [],
    };

    const promise = async () => {
      const result = await insertEntryMutation.mutateAsync(updatedEntry);

      if (
        entryToConfirm.files &&
        entryToConfirm.files.length > 0 &&
        result?.data?.id
      ) {
        const formData = new FormData();
        formData.append("entry_id", result.data.id);
        formData.append("report_id", params.reportId);

        // Add all files to FormData
        entryToConfirm.files.forEach((fileData) => {
          if (fileData.file instanceof File) {
            formData.append("files", fileData.file);
          }
        });

        await uploadEntryFileAttachmentsAction(formData);
      }
    };

    toast.promise(promise, {
      loading: "Saving Entry...",
      success: () => {
        setTableEntries((prevEntries) =>
          prevEntries.map((entry) => {
            if (entry.id === entryId) {
              return {
                ...entry,
                is_confirmed: true,
                status: updatedEntry.status as EntryStatus,
              };
            }
            return entry;
          })
        );
        return "Entry saved successfully!";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while saving entry. Please try again.";
      },
    });
  };

  const handleSubmitReport = () => {
    if (!allEntriesConfirmed) {
      toast.error("Please confirm all entries before submitting the report.");
      return;
    }

    if (!isInternSigned) {
      toast.error("Please sign the report before submitting.");
      return;
    }

    const promise = async () => {
      await submitReportMutation.mutateAsync(params.reportId);
    };

    toast.promise(promise, {
      loading: "Submitting report...",
      success: "Weekly report successfully submitted!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while submitting report. Please try again.";
      },
    });
  };

  const isLoading =
    insertEntryMutation.isPending || submitReportMutation.isPending;

  // Prepare export data
  const exportData = {
    internName: "N/A",
    companyName: report.data.company_name || "N/A",
    entries: tableEntries,
    previousTotal: 0,
    periodTotal: report.data.period_total || 0,
    startDate: startDate,
    endDate: endDate,
  };

  return (
    <>
      <If condition={isLoading}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <div className="flex flex-row items-center gap-2">
        <BackButton
          title="Weekly Log Report"
          link={pathsConfig.app.weeklyReports}
        />

        <div className="flex-end">
          <ReportMoreOptions
            id={report.data.id}
            deleteAction={deleteWeeklyReportAction}
            redirectPath={pathsConfig.app.weeklyReports}
            status={status}
            options={{ canDelete: true }}
            exportData={exportData}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>
                {`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}{" "}
              </CardTitle>
              <Badge
                className={`capitalize ${documentStatusMap[status].badgeColor}`}
              >
                {status}
              </Badge>
            </div>
            <CardDescription>
              {report.data.company_name} &bull;{" "}
              {internCodeMap[internCode].label}
            </CardDescription>
          </div>
          <CardAction>
            <ButtonGroup>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={handlePrevTab}
                disabled={Number(activeTab) === 0}
              >
                <ChevronLeft />
                <span className="hidden md:block">Prev</span>
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={handleNextTab}
                disabled={Number(activeTab) === tableEntries.length - 1}
              >
                <span className="hidden md:block">Next</span>
                <ChevronRight />
              </Button>
            </ButtonGroup>
          </CardAction>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6">
          <DailyEntryRow
            key={report.data.id}
            entries={tableEntries}
            status={status}
            isLoading={isLoading}
            lunchBreak={lunchBreak}
            onTimeInChange={handleTimeInChange}
            onTimeOutChange={handleTimeOutChange}
            onDailyAccomplishmentChange={handleDailyAccomplishmentsChange}
            onAdditionalNotesChange={handleAdditionalNotesChange}
            onConfirmEntry={handleConfirmEntry}
            onToggleAbsent={handleToggleAbsent}
            onToggleHoliday={handleToggleHoliday}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onFilesChange={handleFilesChange}
          />
          <Separator />
        </CardContent>

        <div className="bg-accent/50 mx-6 rounded-lg border p-3 md:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-muted-foreground mb-0.5 text-xs">
                Total Hours Logged This Week
              </p>
              <p className="text-xl font-bold md:text-2xl">
                {formatHoursDisplay(report.data.period_total)}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-muted-foreground mb-0.5 text-xs">
                Days Logged
              </p>
              <p className="text-xl font-bold md:text-2xl">
                {tableEntries.filter((d) => d.is_confirmed).length}/
                {tableEntries.length}
              </p>
            </div>
          </div>
        </div>

        <If condition={status === "not submitted" || status === "rejected"}>
          <Separator />
          <CardFooter className="justify-between">
            <div className="space-y-2">
              <Label>Intern Confirmation</Label>
              <Label
                htmlFor="internSignature"
                className={`${!allEntriesConfirmed ? "text-muted-foreground" : "text-foreground"}`}
              >
                <Checkbox
                  id="internSignature"
                  checked={isInternSigned}
                  disabled={
                    !allEntriesConfirmed ||
                    isLoading ||
                    status === "pending" ||
                    status === "approved"
                  }
                  //   onCheckedChange={(checked) =>
                  //     onInternSignChange(checked === true)
                  //   }
                />
                I verify that the above information is correct
              </Label>
            </div>
            <Button
              size="sm"
              disabled={!allEntriesConfirmed || !isInternSigned || isLoading}
              onClick={handleSubmitReport}
            >
              <Save className="size-4" />
              Submit Report
            </Button>
          </CardFooter>
        </If>
      </Card>
    </>
  );
}
