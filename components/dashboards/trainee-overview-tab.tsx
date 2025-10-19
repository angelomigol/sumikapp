"use client";

import React from "react";
import Link from "next/link";

import { IconActivity, IconChartHistogram } from "@tabler/icons-react";
import { CalendarClock, ClipboardCheck, Clock, Megaphone } from "lucide-react";

import pathsConfig from "@/config/paths.config";
import { TraineeDashboardData } from "@/hooks/use-trainee-dashboard";

import { getDocumentStatusConfig, getEntryStatusConfig } from "@/lib/constants";

import {
  formatTimestamp,
  safeFormatDate,
  toLocaleTimeOnly,
} from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import TraineeAttendanceChart from "../charts/trainee-attendance-chart";
import { If } from "../sumikapp/if";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface TraineeOverviewTabProps {
  traineeData?: TraineeDashboardData | null;
}

export default function TraineeOverviewTab({
  traineeData,
}: TraineeOverviewTabProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
      <Card className="col-span-3 md:col-span-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="size-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
          <ScrollArea className="flex flex-col overflow-hidden">
            <div className="space-y-6">
              {traineeData?.recentActivities.length === 0 ? (
                <div className="flex h-80 items-center justify-center">
                  <div className="text-center">
                    <IconActivity className="text-muted-foreground mx-auto mb-2 size-8" />
                    <p className="text-muted-foreground text-sm">
                      No recent activities
                    </p>
                  </div>
                </div>
              ) : (
                traineeData?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex px-6">
                    <div className="mr-4 flex size-10 items-center justify-center rounded-full border">
                      {ActivityHelper.getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium tracking-tight">
                          {activity.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Announcements Card */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="size-5" />
            Announcements
            {traineeData?.announcements &&
              traineeData.announcements.filter((a) => !a.is_read).length >
                0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 rounded-full px-1 tabular-nums"
                >
                  {traineeData?.announcements.filter((a) => !a.is_read).length}
                </Badge>
              )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
          <ScrollArea className="flex flex-col overflow-hidden">
            <div className="space-y-6">
              <If
                condition={
                  traineeData?.announcements &&
                  traineeData?.announcements.length > 0
                }
                fallback={
                  <div className="flex h-80 items-center justify-center">
                    <div className="text-center">
                      <Megaphone className="text-muted-foreground mx-auto mb-2 size-7" />
                      <p className="text-muted-foreground text-sm">
                        No announcements
                      </p>
                    </div>
                  </div>
                }
              >
                {traineeData?.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex flex-col gap-1 px-6"
                  >
                    <div className="flex items-start justify-between">
                      <p
                        className={`text-sm font-medium ${!announcement.is_read ? "font-bold" : ""}`}
                      >
                        {announcement.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {!announcement.is_read && (
                          <div className="bg-blue-11 size-2 animate-pulse rounded-full" />
                        )}
                        <p className="text-muted-foreground text-xs">
                          {safeFormatDate(announcement.created_at, "PP")}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </If>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <If condition={traineeData?.ojtStatus !== "not started"}>
        {/* Weekly Attendance Chart */}
        <Card className="col-span-3 md:col-span-6 lg:col-span-5 xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartHistogram className="size-5" />
              Weekly Attendance
            </CardTitle>
            <CardDescription>
              Attendance pattern for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full max-h-80">
            <If
              condition={traineeData?.attendance.weeklyChart.length === 0}
              fallback={
                <TraineeAttendanceChart
                  entries={traineeData?.attendance.weeklyChart}
                />
              }
            >
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <IconChartHistogram className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No attendance data available
                  </p>
                </div>
              </div>
            </If>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card className="col-span-3 md:col-span-6 lg:col-span-4 xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5" />
              Recent Attendance
            </CardTitle>
            <CardDescription>Your latest attendance records</CardDescription>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-4">
                <If
                  condition={
                    traineeData?.attendance &&
                    traineeData?.attendance.recentEntries.length > 0
                  }
                  fallback={
                    <div className="flex h-80 items-center justify-center">
                      <div className="text-center">
                        <CalendarClock className="text-muted-foreground mx-auto mb-2 size-7" />
                        <p className="text-muted-foreground text-sm">
                          No recent attendance
                        </p>
                      </div>
                    </div>
                  }
                >
                  {traineeData?.attendance.recentEntries.map((entry, index) => (
                    <div
                      key={`${entry.date}-${index}`}
                      className="flex items-start justify-between border-b px-6 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm">
                          {safeFormatDate(entry.date, "PP")}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Clock className="size-3" />
                          <span>{entry.hours} hours logged</span>
                        </div>
                        {entry.time_in && entry.time_out && (
                          <p className="text-muted-foreground text-xs">
                            {toLocaleTimeOnly(entry.time_in)} -{" "}
                            {toLocaleTimeOnly(entry.time_out)}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`capitalize ${getEntryStatusConfig(entry.status).badgeColor}`}
                      >
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </If>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Weekly Reports */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5" />
              Recent Weekly Reports
            </CardTitle>
            <CardDescription>Your latest weekly reports</CardDescription>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-4">
                <If
                  condition={
                    traineeData?.recentReports &&
                    traineeData?.recentReports.length > 0
                  }
                  fallback={
                    <div className="flex h-80 items-center justify-center">
                      <div className="text-center">
                        <ClipboardCheck className="text-muted-foreground mx-auto mb-2 size-7" />
                        <p className="text-muted-foreground text-sm">
                          No recent reports
                        </p>
                      </div>
                    </div>
                  }
                >
                  {traineeData?.recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col justify-between gap-2 border-b px-6 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {safeFormatDate(report.start_date, "PP")} -{" "}
                            {safeFormatDate(report.end_date, "PP")}
                          </p>
                          <Badge
                            className={`capitalize ${getDocumentStatusConfig(report.status).badgeColor}`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-8 text-sm">
                          {report.submitted_at && (
                            <span>
                              Submitted on{" "}
                              {safeFormatDate(report.submitted_at, "PP")}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <span className="text-sm">
                              {report.total_hours} hours total
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={pathsConfig.dynamic.weeklyReport(report.id)}>
                        <Button variant={"outline"} size={"sm"}>
                          View Report
                        </Button>
                      </Link>
                    </div>
                  ))}
                </If>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </If>
    </div>
  );
}
