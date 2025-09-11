"use client";

import React from "react";

import {
  IconActivity,
  IconCalendarEvent,
  IconCircleDashedCheck,
  IconClock12,
} from "@tabler/icons-react";
import { AlertCircle, Clock } from "lucide-react";

import { useFetchSectionDashboard } from "@/hooks/use-section-dashboard";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
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

  const pbActivities = {
    recentActivities: [],
  };

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
        <div>
          <PageTitle text={"Overview"} />
        </div>
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
              <CardTitle className="flex items-center gap-2">
                Weekly Reports Statistics
              </CardTitle>
              <CardDescription className="flex">
                <div className="flex flex-1 items-center gap-2 text-xs">
                  <p className="text-foreground text-2xl font-semibold">
                    {sectionData?.totalAttendanceReports.toLocaleString()}
                  </p>
                  Total Attendance Reports
                </div>
                <div className="flex flex-1 items-center gap-2 text-xs">
                  <p className="text-foreground text-2xl font-semibold">
                    {sectionData?.totalActivityReports.toLocaleString()}
                  </p>
                  Total Accomplishment Reports
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <ReportStatisticsBarChart data={sectionData} />
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
                  {pbActivities?.recentActivities.length === 0 ? (
                    <div className="flex h-80 items-center justify-center">
                      <div className="text-center">
                        <IconActivity className="text-muted-foreground mx-auto mb-2 size-8" />
                        <p className="text-muted-foreground text-sm">
                          No recent activities
                        </p>
                      </div>
                    </div>
                  ) : (
                    // pbActivities?.recentActivities.map((activity) => (
                    //   <div key={activity.id} className="flex px-6">
                    //     <div className="mr-4 flex size-10 items-center justify-center rounded-full border">
                    //       {ActivityHelper.getActivityIcon(
                    //         activity.activity_type
                    //       )}
                    //     </div>
                    //     <div className="flex-1 space-y-1">
                    //       <div className="flex items-center justify-between">
                    //         <p className="text-sm font-medium tracking-tight">
                    //           {activity.title}
                    //         </p>
                    //         <p className="text-muted-foreground text-xs">
                    //           {formatTimestamp(activity.timestamp)}
                    //         </p>
                    //       </div>
                    //       <p className="text-muted-foreground text-xs">
                    //         {activity.description}
                    //       </p>
                    //     </div>
                    //   </div>
                    // )
                    <></>
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
