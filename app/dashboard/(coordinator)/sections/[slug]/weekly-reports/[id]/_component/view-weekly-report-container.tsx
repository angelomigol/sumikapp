"use client";

import React, { useState } from "react";

import { format } from "date-fns";

import pathsConfig from "@/config/paths.config";
import { useFetchSectionTraineeReport } from "@/hooks/use-section-weekly-reports";

import {
  documentStatusMap,
  getEntryStatusConfig,
  internCodeMap,
} from "@/lib/constants";

import { formatHoursDisplay, safeFormatDate } from "@/utils/shared";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import BackButton from "@/components/sumikapp/back-button";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import ReportMoreOptions from "@/components/sumikapp/report-more-options";

import NotFoundPage from "@/app/not-found";

export default function ViewWeeklyReportContainer(params: {
  reportId: string;
  slug: string;
}) {
  const [activeTab, setActiveTab] = useState("0");

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

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <BackButton
          title="Weekly Report"
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-auto w-full grid-cols-7 gap-0.5 p-1 md:gap-1">
              {reportData.data.entries.map((entry, index) => {
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

            {reportData.data.entries.map((entry, index) => {
              const isFieldsDisabled =
                entry.status === "absent" || entry.status === "holiday";

              return (
                <TabsContent
                  key={entry.entry_date}
                  value={index.toString()}
                  className="mt-3 space-y-6 md:space-y-8"
                >
                  <div className="flex flex-col gap-4">
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
                        <Label>
                          Daily Accomplishments
                          {isFieldsDisabled && (
                            <Badge
                              variant={"secondary"}
                              className="ml-2 px-1.5 py-px"
                            >
                              Disabled
                            </Badge>
                          )}
                        </Label>
                      </div>
                      <div
                        className="prose prose-sm max-w-none rounded-md border p-3"
                        dangerouslySetInnerHTML={{
                          __html:
                            entry.daily_accomplishments ||
                            "<p class='text-muted-foreground'>No accomplishments recorded</p>",
                        }}
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
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
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
        <CardFooter className="justify-between space-y-8 md:flex md:gap-8">
          <div className="space-y-2">
            <Label>Intern Confirmation</Label>
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
            <Label htmlFor="supervisor-signature">Supervisor Approval</Label>
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
