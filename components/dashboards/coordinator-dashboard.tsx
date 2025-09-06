"use client";

import { IconActivity, IconBrandAmongUs } from "@tabler/icons-react";
import { BookOpen, FileText, Users2 } from "lucide-react";

import { useFetchCoordinatorDashboard } from "@/hooks/use-coordinator-dashboard";

import { getInternCodeConfig } from "@/lib/constants";

import { formatTimestamp } from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import DashboardStatsCard from "./dashboard-stats-card";

export default function CoordinatorDashboard() {
  const coordinator = useFetchCoordinatorDashboard();

  if (coordinator.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const dashboard = [
    {
      name: "Total Students",
      icon: Users2,
      data: {
        main: coordinator.isLoading
          ? "..."
          : `${coordinator.data?.dashboardStats.total_students || 0}`,
      },
      tooltip: "Total number of students currently enrolled",
    },
    {
      name: "Total Sections",
      icon: BookOpen,
      data: {
        main: coordinator.isLoading
          ? "..."
          : `${coordinator.data?.dashboardStats.total_sections || 0}`,
      },
      tooltip: "Total number of class/sections you are managing",
    },
    {
      name: "Pending Requirements",
      icon: FileText,
      data: {
        main: coordinator.isLoading
          ? "..."
          : `${coordinator.data?.dashboardStats.pending_requirements || 0}`,
      },
      tooltip:
        "Number of requirements submitted by students that are waiting for your review",
    },
  ];

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
                {coordinator.data?.recentActivities.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No recent activities
                    </p>
                  </div>
                ) : (
                  coordinator.data?.recentActivities.map((activity) => (
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
                {coordinator.data?.sectionProgress.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No sections created
                    </p>
                  </div>
                ) : (
                  coordinator.data?.sectionProgress.map((section) => (
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
