"use client";

import React from "react";
import Link from "next/link";

import pathsConfig from "@/config/paths.config";
import { useFetchSupervisorTrainee } from "@/hooks/use-supervisor-trainees";

import { getDocumentStatusConfig, getOJTStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

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
import { Progress } from "@/components/ui/progress";
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

import NotFoundPage from "@/app/not-found";

export default function TraineeDetailsContainer(params: { traineeId: string }) {
  const trainee = useFetchSupervisorTrainee(params.traineeId);

  if (trainee.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!trainee.data) {
    return <NotFoundPage />;
  }

  const displayName = [
    trainee.data.first_name,
    trainee.data.middle_name,
    trainee.data.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const hoursCompleted = trainee.data.hours_logged ?? 0;
  const requiredHours = trainee.data.program_batch.required_hours ?? 0;
  const remainingHours = Math.max(requiredHours - hoursCompleted, 0);

  const progress =
    requiredHours > 0 ? (hoursCompleted / requiredHours) * 100 : 0;

  return (
    <>
      <div>
        <BackButton title="Trainee Details" link={pathsConfig.app.trainees} />
      </div>

      <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
        <Card className="col-span-3 md:col-span-6 lg:col-span-2">
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="size-24">
              <AvatarImage src={undefined} alt={trainee.data.first_name} />
              <AvatarFallback className="text-4xl font-bold">
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-balance">
                {displayName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {trainee.data.email}
              </p>
              <div className="mt-2">
                <Badge
                  className={`${getOJTStatusConfig(trainee.data.ojt_status)?.badgeColor} capitalize`}
                >
                  {trainee.data.ojt_status}
                </Badge>
              </div>
            </div>
            <Separator />

            <div className="w-full space-y-4">
              <div>
                <p className="text-sm font-medium">Student ID Number</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.student_id_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Section</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.section}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Program</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.course}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.internship_details.company_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Job Role</p>
                <p className="text-muted-foreground text-sm">
                  {trainee.data.internship_details.job_role}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-muted-foreground text-sm">
                  {safeFormatDate(
                    trainee.data.internship_details.start_date,
                    "PP"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-muted-foreground text-sm">
                  {safeFormatDate(
                    trainee.data.internship_details.end_date,
                    "PP"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 md:col-span-7">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>
              Overall progress and hours completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <p>OJT Completion</p>
                <p>{progress.toFixed(1)}%</p>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">
                  Total Hours Completed
                </p>
                <p className="text-right text-xl font-bold">{hoursCompleted}</p>
              </div>
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">Required Hours</p>
                <p className="text-right text-xl font-bold">{requiredHours}</p>
              </div>
              <div className="space-y-2 rounded-md border p-4">
                <p className="text-muted-foreground text-sm">Remaining Hours</p>
                <p className="text-right text-xl font-bold">{remainingHours}</p>
              </div>
            </div>

            <Separator />

            <Card className="gap-2 border-none py-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle>Weekly Reports</CardTitle>
              </CardHeader>

              <CardContent className="max-h-11/12 px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
                        Period
                      </TableHead>
                      <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
                        Submitted Date
                      </TableHead>
                      <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
                        Total Hours
                      </TableHead>
                      <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r">
                        Status
                      </TableHead>
                      <TableHead className="bg-muted h-8 border-t border-b border-none px-3 text-xs font-semibold first:rounded-l-xl first:border-l last:rounded-r-xl last:border-r"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainee.data.weekly_reports.map((report) => {
                      const status = getDocumentStatusConfig(report.status);
                      const startDate = report.start_date ?? "";
                      const endDate = report.end_date ?? "";

                      return (
                        <TableRow key={report.id}>
                          <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                            {`${safeFormatDate(startDate, "PP")} - ${safeFormatDate(endDate, "PP")}`}
                          </TableCell>
                          <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                            {report.submitted_at
                              ? safeFormatDate(report.submitted_at, "PP")
                              : "-"}
                          </TableCell>
                          <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                            {`${report.period_total} ${report.period_total === 1 ? " Hour" : " Hours"}`}
                          </TableCell>
                          <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                            <div className="flex items-center gap-2">
                              {status.icon && (
                                <status.icon className="size-4" />
                              )}
                              {status.label}
                            </div>
                          </TableCell>
                          <TableCell className="h-10 overflow-hidden border-b px-3 py-2 text-sm text-ellipsis">
                            <Button size={"sm"} variant={"outline"} asChild>
                              <Link
                                href={pathsConfig.dynamic.weeklyReport(
                                  report.id
                                )}
                              >
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
