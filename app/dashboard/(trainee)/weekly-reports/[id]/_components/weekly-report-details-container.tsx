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

import { documentStatusMap, internCodeMap } from "@/lib/constants";

import {
  calculateTotalHours,
  createTableEntries,
  safeFormatDate,
} from "@/utils/shared";

import { WeeklyReportEntry } from "@/schemas/weekly-report/weekly-report.schema";

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

import { deleteWeeklyReportAction } from "../server/server-actions";
import DailyEntryRow from "./daily-entry-row";

export default function WeeklyReportDetailsContainer(params: {
  reportId: string;
}) {
  const report = useFetchWeeklyReport(params.reportId);
  const insertEntryMutation = useInsertWeeklyReportEntry(params.reportId);
  const submitReportMutation = useSubmitWeeklyReport(params.reportId);

  if (report.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!report.data) {
    return <NotFoundPage />;
  }

  const startDate = report.data.start_date ?? "";
  const endDate = report.data.end_date ?? "";
  const status = report.data.status ?? "not submitted";
  const internCode = report.data.internship_code ?? "CTNTERN1";

  const [activeTab, setActiveTab] = useState("0");
  const [tableEntries, setTableEntries] = useState<WeeklyReportEntry[]>([]);
  const [isInternSigned, setIsInternSigned] = useState(false);

  useEffect(() => {
    if (report.data) {
      const entries = createTableEntries(
        startDate,
        endDate,
        report.data?.weekly_report_entries,
        params.reportId
      );
      setTableEntries(entries);
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
          const totalHours = calculateTotalHours(timeIn, entry.time_out || "");
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
          const totalHours = calculateTotalHours(entry.time_in || "", timeOut);
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

  const handleConfirmEntry = (entryId: string) => {
    const entryToConfirm = tableEntries.find((entry) => entry.id === entryId);

    if (!entryToConfirm?.time_in || !entryToConfirm?.time_out) {
      toast.error("Time in and time out are required");
      return;
    }

    if (!entryToConfirm.daily_accomplishments) {
      toast.error("Daily accomplishments are required");
      return;
    }

    const promise = async () => {
      await insertEntryMutation.mutateAsync(entryToConfirm);
    };

    toast.promise(promise, {
      loading: "Saving Entry...",
      success: () => {
        setTableEntries((prevEntries) =>
          prevEntries.map((entry) => {
            if (entry.id === entryId) {
              return { ...entry, is_confirmed: true };
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
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
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
            onTimeInChange={handleTimeInChange}
            onTimeOutChange={handleTimeOutChange}
            onDailyAccomplishmentChange={handleDailyAccomplishmentsChange}
            onConfirmEntry={handleConfirmEntry}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
                {report.data.period_total.toFixed(0)} hrs
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
