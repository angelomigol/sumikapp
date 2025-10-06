"use client";

import React from "react";

import pathsConfig from "@/config/paths.config";
import {
  AccomplishmentEntryData,
  AttendanceEntryData,
} from "@/hooks/use-review-reports";
import { useFetchSectionTraineeReport } from "@/hooks/use-section-weekly-reports";

import { documentStatusMap, internCodeMap } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import ReportMoreOptions from "@/components/sumikapp/report-more-options";

import NotFoundPage from "@/app/not-found";

export default function ViewWeeklyReportContainer(params: {
  reportId: string;
  slug: string;
}) {
  const reportData = useFetchSectionTraineeReport(params.reportId);

  if (reportData.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!reportData.data || !params.reportId || !params.slug) {
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

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <BackButton
          title={`Weekly ${reportData.data.report_type === "attendance" ? "Attendance" : "Activity"} Report`}
          link={pathsConfig.dynamic.sectionReports(params.slug)}
        />

        <div className="flex flex-1 justify-end">
          <ReportMoreOptions id={params.reportId} status={status} />
        </div>
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
              <AvatarFallback>
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
                        <div className="max-w-md">
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
        </CardContent>
        <Separator />
        <CardFooter className="justify-between space-y-8 md:flex md:gap-8">
          <div className="space-y-2">
            <Label>Intern Signature</Label>
            <Label htmlFor="internSignature">
              <Checkbox
                id="internSignature"
                checked={reportData.data.submitted_at !== null}
                disabled
              />
              I verify that the above information is correct
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor-signature">Supervisor Signature</Label>
            {reportData.data.supervisor_approved_at ? (
              <Label>
                Approved by the Supervisor on{" "}
                {safeFormatDate(reportData.data.supervisor_approved_at, "PP")}
              </Label>
            ) : (
              <Label className="text-muted-foreground italic">
                (To be reviewed by the supervisor)
              </Label>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
