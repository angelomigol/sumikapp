"use client";

import React from "react";

import { Check, CircleAlert, X } from "lucide-react";
import { toast } from "sonner";

import pathsConfig from "@/config/paths.config";
import {
  AccomplishmentEntryData,
  AttendanceEntryData,
  useApproveTraineeReport,
  useFetchTraineeReport,
  useRejectTraineeReport,
  useUpdateEntryStatus,
} from "@/hooks/use-review-reports";

import {
  documentStatusMap,
  EntryStatus,
  entryStatusOptions,
  internCodeMap,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

import { safeFormatDate } from "@/utils/shared";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import NotFoundPage from "@/app/not-found";

import { UpdateEntryStatusFormValues } from "../schema/update-entry-status.schema";

export default function ReviewReportDetailsContainer(params: {
  reportId: string;
}) {
  const reportData = useFetchTraineeReport(params.reportId);

  console.log(reportData.data);

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

  const isAttendanceEntry = (
    entry: AttendanceEntryData | AccomplishmentEntryData
  ): entry is AttendanceEntryData => {
    return reportData.data.report_type === "attendance";
  };

  const isAccomplishmentEntry = (
    entry: AttendanceEntryData | AccomplishmentEntryData
  ): entry is AccomplishmentEntryData => {
    return reportData.data.report_type === "accomplishment";
  };

  const handleApproveReport = () => {
    const promise = async () => {
      await approveMutation.mutateAsync(params.reportId);
    };

    toast.promise(promise, {
      loading: "Updating report...",
      success: `${reportData.data.report_type === "attendance" ? "Attendance" : "Activity"} report successfully approved!`,
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
      success: `${reportData.data.report_type === "attendance" ? "Attendance" : "Activity"} report successfully rejected!`,
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

  return (
    <>
      <If condition={approveMutation.isPending || rejectMutation.isPending}>
        <LoadingOverlay fullPage className="opacity-50" />
      </If>

      <div className="flex flex-row items-center gap-2">
        <BackButton
          title={`Weekly ${reportData.data.report_type === "attendance" ? "Attendance" : "Activity"} Report`}
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {reportData.data.report_type === "attendance" ? (
                  <>
                    <TableHead>Time-In</TableHead>
                    <TableHead>Time-Out</TableHead>
                  </>
                ) : (
                  <TableHead>Daily Accomplishments</TableHead>
                )}
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.data.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {safeFormatDate(entry.entry_date, "PP")}
                  </TableCell>

                  {reportData.data.report_type === "attendance" ? (
                    <>
                      <TableCell>
                        {isAttendanceEntry(entry) ? (
                          <Input
                            type="time"
                            value={entry.time_in || ""}
                            readOnly
                            className="cursor-default"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {isAttendanceEntry(entry) ? (
                          <Input
                            type="time"
                            value={entry.time_out || ""}
                            readOnly
                            className="cursor-default"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell>
                      {isAccomplishmentEntry(entry) ? (
                        <div className="max-w-md text-wrap">
                          <p className="text-sm">
                            {entry.daily_accomplishment ||
                              "No accomplishments recorded"}
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <Input
                      className="bg-muted w-fit"
                      readOnly
                      value={
                        reportData.data.report_type === "attendance"
                          ? isAttendanceEntry(entry)
                            ? `${entry.total_hours} hrs`
                            : "0 hrs"
                          : isAccomplishmentEntry(entry)
                            ? `${entry.no_of_working_hours} hrs`
                            : "0 hrs"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      value={entry.status ?? ""}
                      onValueChange={(value) =>
                        handleUpdateStatus(
                          entry.id,
                          value as UpdateEntryStatusFormValues["status"]
                        )
                      }
                      disabled={reportData.data.status !== "pending"}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-fit capitalize",
                          reportData.data.status !== "pending" &&
                            "cursor-not-allowed data-[disabled]:opacity-100"
                        )}
                      >
                        {entry.status ?? ""}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          {entryStatusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="space-y-2">
              <Label>Total Hours</Label>
              <span className="font-medium">
                {reportData.data.total_hours} hrs
              </span>
            </div>
          </div>

          <If
            condition={reportData.data.status === "pending"}
            fallback={
              <>
                {reportData.data.supervisor_approved_at && (
                  <>
                    <Separator />
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
            <Separator />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleRejectReport}
              >
                <X className="size-4" />
                Reject Report
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveReport}
                disabled={hasEntriesWithNullStatus}
              >
                <Check className="size-4" />
                Approve Report
              </Button>
            </div>
          </If>
        </CardContent>
      </Card>
    </>
  );
}
