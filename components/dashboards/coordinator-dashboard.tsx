"use client";

import { IconActivity, IconBrandAmongUs } from "@tabler/icons-react";
import { AlertCircle, BookOpen, FileText, Users2 } from "lucide-react";

import { useFetchCoordinatorDashboard } from "@/hooks/use-coordinator-dashboard";

import { getInternCodeConfig } from "@/lib/constants";

import { formatTimestamp } from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import { Alert, AlertDescription } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import DashboardStatsCard from "./dashboard-stats-card";

export default function CoordinatorDashboard() {
  const {
    data: coordinatorData,
    isLoading,
    error,
    isError,
  } = useFetchCoordinatorDashboard();

  const dashboard = [
    {
      name: "Total Students",
      icon: Users2,
      data: {
        main: isLoading
          ? "..."
          : `${coordinatorData?.dashboardStats.totalStudents}`,
      },
      tooltip: "Total number of students currently enrolled",
    },
    {
      name: "Total Sections",
      icon: BookOpen,
      data: {
        main: isLoading
          ? "..."
          : `${coordinatorData?.dashboardStats.totalSections}`,
      },
      tooltip: "Total number of class/sections you are managing",
    },
    {
      name: "Pending Requirements",
      icon: FileText,
      data: {
        main: isLoading
          ? "..."
          : `${coordinatorData?.dashboardStats.pendingRequirements}`,
      },
      tooltip:
        "Number of requirements submitted by students that are waiting for your review",
    },
  ];

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (isError && !coordinatorData) {
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
      <PageTitle text={"Dashboard"} />

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {dashboard.map((card, index) => (
          <DashboardStatsCard
            key={index}
            icon={card.icon}
            title={card.name}
            tooltip={card.tooltip}
            data={card.data}
          />
        ))}
      </div>

      <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
        <Card className="col-span-3 md:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full max-h-80 flex-col px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                {coordinatorData?.recentActivities.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No recent activities
                    </p>
                  </div>
                ) : (
                  coordinatorData?.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 px-6"
                    >
                      <div className="mt-1 flex size-10 items-center justify-center rounded-full border">
                        {ActivityHelper.getActivityIcon(activity.activity_type)}
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

        <Card className="col-span-3 md:col-span-6 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrandAmongUs className="size-5" />
              Section Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full max-h-80 flex-col px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                {coordinatorData?.sectionProgress.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No sections created
                    </p>
                  </div>
                ) : (
                  coordinatorData?.sectionProgress.map((section) => (
                    <div
                      key={section.program}
                      className="flex items-center justify-between px-6"
                    >
                      <div className="space-y-1">
                        <p
                          className="block max-w-[140px] truncate text-sm leading-none font-medium"
                          title={section.program}
                        >
                          {section.program}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {getInternCodeConfig(section.internship_code).label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {section.progress_percentage}%
                        </span>
                        <Progress
                          value={section.progress_percentage}
                          className="h-2 w-16"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
