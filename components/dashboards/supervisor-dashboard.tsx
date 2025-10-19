"use client";

import { IconActivity, IconClipboardCheck } from "@tabler/icons-react";
import { FileClock, FileEdit, Users2 } from "lucide-react";

import { useFetchSupervisorDashboard } from "@/hooks/use-supervisor-dashboard";

import { formatTimestamp } from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { If } from "../sumikapp/if";
import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import RefreshButton from "../sumikapp/refresh-button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import DashboardStatsCard from "./dashboard-stats-card";

export default function SupervisorDashboard() {
  const {
    data: supervisor,
    isLoading,
    refetch,
    isFetching,
  } = useFetchSupervisorDashboard();

  if (!supervisor || isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const dashboard = [
    {
      name: "Total Trainees",
      icon: Users2,
      data: {
        main: isLoading ? "..." : `${supervisor.totalActiveTrainees || 0}`,
        sub: isLoading
          ? "..."
          : `${supervisor.completedTrainees} Completed, ${supervisor.currentlyActiveTrainees} Ongoing`,
      },

      tooltip: "Trainees currently under your supervision",
    },
    {
      name: "Pending Reports",
      icon: FileClock,
      data: {
        main: isLoading ? "..." : `${supervisor.totalPendingReports || 0}`,
      },
      tooltip:
        "Number of weekly reports submitted by trainees that are waiting for your review",
    },
    {
      name: "Pending Evaluations",
      icon: FileEdit,
      data: {
        main: isLoading ? "..." : `${supervisor.pendingEvaluationsCount}`,
      },
      tooltip:
        "Trainees needing your evaluation at the end of their OJT period",
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <PageTitle text={"Dashboard"} />

        <RefreshButton refetch={refetch} isFetching={isFetching} />
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {dashboard.map((card, index) => (
          <DashboardStatsCard
            key={index}
            title={card.name}
            icon={card.icon}
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
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                <If
                  condition={supervisor.recentActivities.length > 0}
                  fallback={
                    <div className="flex h-80 items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        No recent activities
                      </p>
                    </div>
                  }
                >
                  {supervisor.recentActivities.map((activity, index) => (
                    <div
                      key={`${activity.id}-${index}`}
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
                  ))}
                </If>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-6 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClipboardCheck className="size-5" />
              Upcoming Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                <If
                  condition={supervisor.traineesPendingEvaluation.length > 0}
                  fallback={
                    <div className="flex h-80 items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        No upcoming evaluations
                      </p>
                    </div>
                  }
                >
                  {supervisor.traineesPendingEvaluation.map(
                    (trainee, index) => (
                      <div
                        key={`${trainee.trainee_id}-${index}`}
                        className="flex px-6"
                      >
                        <Avatar className="mr-2 size-10 font-medium">
                          <AvatarFallback>
                            {trainee.trainee_name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium tracking-tight">
                            {trainee.trainee_name}
                          </p>
                          <div className="text-muted-foreground flex gap-2 text-xs">
                            <p>{trainee.section}</p>

                            <p>{trainee.course}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </If>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
