"use client";

import React from "react";

import {
  IconActivity,
  IconCalendarEvent,
  IconCircleDashedCheck,
  IconClock12,
  IconRefresh,
} from "@tabler/icons-react";
import { AlertCircle, Clock } from "lucide-react";
import * as motion from "motion/react-client";

import { useFetchSectionDashboard } from "@/hooks/use-section-dashboard";

import { cn } from "@/lib/utils";

import { formatTimestamp } from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReportStatisticsBarChart from "@/components/charts/report-statistics-bar-chart";
import TraineeStatusPieChart from "@/components/charts/trainee-status-pie-cart";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import SectionKPICard from "./section-kpi-card";

export default function SectionDashboardContainer(params: { slug: string }) {
  const {
    data: sectionData,
    isLoading,
    error,
    isError,
    refetch,
    isFetching,
  } = useFetchSectionDashboard(params.slug);

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (isError && !sectionData) {
    return (
      <div className="space-y-6">
        <PageTitle text={"Dashboard"} />

        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Unable to load dashboard data. Please try refreshing the page.
            {error instanceof Error && ` (${error.message})`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <PageTitle text={"Overview"} />

        <Button
          variant={"outline"}
          size={"sm"}
          className="transition-none"
          onClick={() => refetch()}
          disabled={isFetching}
          asChild
        >
          <motion.button whileTap={{ scale: 0.85 }}>
            <IconRefresh
              className={cn("size-4", isFetching && "animate-spin")}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </motion.button>
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-5 lg:grid-cols-12">
        <div className="col-span-6 grid grid-cols-6 gap-4">
          {[
            {
              icon: <Clock className="size-3.5" />,
              label: "Total Hours Logged",
              value: sectionData?.totalHoursLogged.toLocaleString(),
              description: "Total hours served across all trainees",
            },
            {
              icon: <IconClock12 className="size-4" />,
              label: "Avg. Hours Per Trainee",
              value: sectionData?.avgHoursPerTrainee.toLocaleString(),
              description: "Average logged hours per trainee",
            },
            {
              icon: <IconCalendarEvent className="size-4" />,
              label: "Avg. Attendance Rate",
              value: `${sectionData?.avgAttendanceRate.toLocaleString()}%`,
              description: "Average attendance rate across submitted reports",
            },
            {
              icon: <IconCircleDashedCheck className="size-4" />,
              label: "Completion Percentage",
              value: `${sectionData?.completionPercentage.toLocaleString()}%`,
              description: "Progress toward required OJT hours",
            },
          ].map((card, i) => (
            <div className="col-span-3" key={i}>
              <SectionKPICard {...card} />
            </div>
          ))}
        </div>
        <div className="col-span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Weekly Reports Statistics</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <ReportStatisticsBarChart
                data={sectionData?.weeklyReportStatistics}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6 lg:col-span-8">
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
                  {sectionData?.recentActivities.length === 0 ? (
                    <div className="flex h-80 items-center justify-center">
                      <div className="text-center">
                        <IconActivity className="text-muted-foreground mx-auto mb-2 size-8" />
                        <p className="text-muted-foreground text-sm">
                          No recent activities
                        </p>
                      </div>
                    </div>
                  ) : (
                    sectionData?.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 px-6"
                      >
                        <div className="mt-1 flex size-10 items-center justify-center rounded-full border">
                          {ActivityHelper.getActivityIcon(
                            activity.activity_type
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium tracking-tight">
                              {activity.title}
                            </p>
                            <span className="text-muted-foreground text-xs">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-xs">
                            {activity.description}
                          </p>
                          <div className="flex items-center pt-2">
                            <Avatar className="mr-2 font-medium">
                              <AvatarFallback>
                                {activity.user_name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-muted-foreground text-xs">
                              {activity.user_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6 lg:col-span-4">
          <Card className="gap-0">
            <CardHeader className="text-center">
              <CardTitle>Total Students - Chart</CardTitle>
            </CardHeader>
            <CardContent className="h-80 max-h-80">
              <TraineeStatusPieChart data={sectionData} />
            </CardContent>
            <CardFooter className="text-sm">
              <div className="text-muted-foreground leading-none">
                Showing total students added in this section
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
