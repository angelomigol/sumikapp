"use client";

import React from "react";

import { CircleAlert, ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  useApproveTraineeReport,
  useFetchTraineeReport,
  useRejectTraineeReport,
  useUpdateEntryStatus,
} from "@/hooks/use-review-reports";

import { documentStatusMap, EntryStatus, internCodeMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { formatHoursDisplay, safeFormatDate } from "@/utils/shared";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import NotFoundPage from "@/app/not-found";

import ReviewReportDailyEntries from "./review-report-daily-entries";

export default function ReviewReportDetailsContainer(params: {
  reportId: string;
}) {
  const reportData = useFetchTraineeReport(params.reportId);

  const approveMutation = useApproveTraineeReport(params.reportId);
  const rejectMutation = useRejectTraineeReport(params.reportId);
  const updateEntryMutation = useUpdateEntryStatus(params.reportId);

  if (reportData.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!reportData.data) {
    return <NotFoundPage />;
  }

  const startDate = reportData.data.start_date ?? "";
  const endDate = reportData.data.end_date ?? "";
  const status = reportData.data.status ?? "not submitted";
  const internCode = "CTNTERN1";
  const displayName = [
    reportData.data.first_name,
    reportData.data.middle_name,
    reportData.data.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const hasEntriesWithNullStatus = reportData.data.entries.some(
    (entry) => entry.status === null || entry.status === undefined
  );

  const handleApproveReport = () => {
    const promise = async () => {
      await approveMutation.mutateAsync(params.reportId);
    };

    toast.promise(promise, {
      loading: "Updating report...",
      success: "Weekly report successfully approved!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating report. Please try again.";
      },
    });
  };

  const handleRejectReport = () => {
    const promise = async () => {
      await rejectMutation.mutateAsync(params.reportId);
    };

    toast.promise(promise, {
      loading: "Updating report...",
      success: "Weekly report successfully rejected!",
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while updating report. Please try again.";
      },
    });
  };

  const handleUpdateStatus = (entryId: string, status: EntryStatus) => {
    const promise = async () => {
      await updateEntryMutation.mutateAsync({ entryId, status });
    };

    toast.promise(promise, {
      loading: "Updating entry status...",
      success: "Entry status successfully updated!",
      error: (err) =>
        err instanceof Error
          ? err.message
          : "Sorry, we encountered an error while updating entry status. Please try again.",
    });
  };

  const handleFeedbackChange = (entryId: string, feedback: string) => {};

  return (
    <>
      <If condition={approveMutation.isPending || rejectMutation.isPending}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <div className="flex flex-row items-center gap-2">
        <BackButton
          title={`Weekly Report`}
          link={pathsConfig.app.reviewReports}
        />

        <div className="flex flex-1 justify-end"></div>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <div className="space-y-2">
            <CardTitle>{`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}</CardTitle>
            <CardDescription>{internCodeMap[internCode].label}</CardDescription>
          </div>
          <Badge
            className={`text-white capitalize md:text-xs ${documentStatusMap[status].badgeColor}`}
          >
            {status}
          </Badge>
        </CardHeader>

        <div className="flex flex-col gap-6 px-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <Avatar className="size-16">
              <AvatarImage src={undefined} />

              <AvatarFallback className={cn("animate-in fade-in")}>
                <span
                  suppressHydrationWarning
                  className="font-semibold uppercase"
                >
                  {displayName.slice(0, 1) ?? "?"}
                </span>
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-muted-foreground text-sm">
                {reportData.data.email}
              </p>
              <p className="text-muted-foreground text-sm">
                {reportData.data.job_role}
              </p>
            </div>
          </div>

          <div className="flex flex-col text-center md:ml-auto md:text-right">
            <p className="font-medium">{`Company: ${reportData.data.company_name}`}</p>
            <p className="text-muted-foreground text-sm">
              {`Submitted: ${safeFormatDate(reportData.data.submitted_at, "PPp")}`}
            </p>
          </div>
        </div>

        <Separator />

        <CardContent className="space-y-6">
          <If condition={reportData.data.status === "pending"}>
            <Alert className="border-blue-11 bg-blue-3 text-blue-11">
              <CircleAlert className="size-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                <p>
                  Please review and verify each{" "}
                  <span className="font-semibold">entry statuses</span> (e.g.{" "}
                  <em>Present, Absent, Late, Holiday</em>). You may update the
                  status if there is a mismatch. Once the report is{" "}
                  <span className="font-semibold">approved</span>, it will be
                  locked and can no longer be edited.
                </p>
              </AlertDescription>
            </Alert>
          </If>

          <ReviewReportDailyEntries
            entries={reportData.data.entries}
            reportStatus={reportData.data.status}
            onStatusChange={handleUpdateStatus}
            onFeedbackChange={handleFeedbackChange}
          />

          <div className="bg-accent/50 rounded-lg border p-3 md:p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-muted-foreground mb-0.5 text-xs">
                  Total Hours Logged This Week
                </p>
                <p className="text-xl font-bold md:text-2xl">
                  {formatHoursDisplay(Number(reportData.data.total_hours))}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-muted-foreground mb-0.5 text-xs">
                  Days Logged
                </p>
                <p className="text-xl font-bold md:text-2xl">
                  {reportData.data.entries.filter((d) => d.is_confirmed).length}
                  /{reportData.data.entries.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="justify-between">
          <If
            condition={reportData.data.status === "pending"}
            fallback={
              <>
                {reportData.data.supervisor_approved_at && (
                  <>
                    <div className="flex justify-end gap-2">
                      <Label>
                        You approved this report on{" "}
                        {safeFormatDate(
                          reportData.data.supervisor_approved_at,
                          "PPPP"
                        )}
                      </Label>
                    </div>
                  </>
                )}
              </>
            }
          >
            <Button
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
              onClick={handleRejectReport}
            >
              Reject Report
              <ShieldXIcon className="size-4" />
            </Button>
            <Button
              className="bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:ring-green-400/40"
              onClick={handleApproveReport}
              disabled={hasEntriesWithNullStatus}
            >
              Approve Report
              <ShieldCheckIcon className="size-4" />
            </Button>
          </If>
        </CardFooter>
      </Card>
    </>
  );
}
