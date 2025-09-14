"use client";

import { IconActivity, IconClipboardCheck } from "@tabler/icons-react";
import {
  Calendar,
  FileClock,
  FileEdit,
  FileQuestionMark,
  FileText,
  MessageSquare,
  Users2,
} from "lucide-react";

import { useFetchSupervisorDashboard } from "@/hooks/use-supervisor-dashboard";

import { formatTimestamp } from "@/utils/shared";

import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import DashboardStatsCard from "./dashboard-stats-card";
import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

export default function SupervisorDashboard() {
  const supervisor = useFetchSupervisorDashboard();
  
  if (!supervisor.data || supervisor.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  const dashboard = [
    {
      name: "Total Trainees",
      icon: Users2,
      data: {
        main: supervisor.isLoading
          ? "..."
          : `${supervisor.data.totalActiveTrainees || 0}`,
        sub: supervisor.isLoading
          ? "..."
          : `${supervisor.data.completedTrainees} Completed, ${supervisor.data.currentlyActiveTrainees} Ongoing`,
      },

      tooltip: "Trainees currently under your supervision",
    },
    {
      name: "Pending Reports",
      icon: FileClock,
      data: {
        main: supervisor.isLoading
          ? "..."
          : `${(supervisor.data.pendingAccomplishmentReports || 0) + (supervisor.data.pendingAttendanceReports || 0)}`,
      },
      tooltip:
        "Number of weekly reports submitted by trainees that are waiting for your review",
    },
    {
      name: "Pending Evaluations",
      icon: FileEdit,
      data: {
        main: supervisor.isLoading
          ? "..."
          : `${supervisor.data.pendingEvaluationsCount}`,
      },
      tooltip:
        "Trainees needing your evaluation at the end of their OJT period",
    },
  ];

  return (
    <>
      <PageTitle text={"Dashboard"} />

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
                {supervisor.data.recentActivities.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No recent activities
                    </p>
                  </div>
                ) : (
                  supervisor.data.recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 px-6"
                    >
                      <div className="mt-1 flex size-10 items-center justify-center rounded-full border">
                        {ActivityHelper.getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium tracking-tight">
                            {activity.description}
                          </p>
                          <span className="text-muted-foreground text-xs">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-xs">{""}</p>
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
              <IconClipboardCheck className="size-5" />
              Upcoming Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                {supervisor.data.traineesPendingEvaluation.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      No upcoming evaluations
                    </p>
                  </div>
                ) : (
                  supervisor.data.traineesPendingEvaluation.map((trainee) => (
                    <div key={trainee.trainee_id} className="flex px-6">
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
