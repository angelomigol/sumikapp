"use client";

import { IconActivity, IconBuilding, IconRefresh } from "@tabler/icons-react";
import { AlertCircle, Users2 } from "lucide-react";

import { useFetchAdminDashboard } from "@/hooks/use-admin-dashboard";

import { formatTimestamp } from "@/utils/shared";

import { ActivityHelper } from "@/schemas/dashboard/recent_activity.schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import { Alert, AlertDescription } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import DashboardStatsCard from "./dashboard-stats-card";

export default function AdminDashboard() {
  const {
    data: adminData,
    isLoading,
    error,
    isError,
    refetch,
  } = useFetchAdminDashboard();

  const dashboard = [
    {
      name: "Total Trainees",
      icon: Users2,
      data: {
        main: isLoading ? "..." : `${adminData?.totalTrainees}`,
      },
      tooltip: "Total number of trainee accounts",
    },
    {
      name: "Total OJT Coordinators",
      icon: Users2,
      data: {
        main: isLoading ? "..." : `${adminData?.totalCoordinators}`,
      },
      tooltip: "Total number of coordinator accounts",
    },
    {
      name: "Total Industry Partners",
      icon: IconBuilding,
      data: {
        main: isLoading ? "..." : `${adminData?.totalIndustryPartners}`,
      },
      tooltip: "Total number of registered industry partners",
    },
  ];

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (isError && !adminData) {
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
      <div className="flex items-center justify-between">
        <div>
          <PageTitle text={"Admin Dashboard"} />
          <p className="text-muted-foreground text-sm">
            System overview and management tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <IconRefresh
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

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
        <Card className="col-span-9"> {/* md:col-span-6 */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 max-h-80 flex-col gap-4 px-0">
            <ScrollArea className="flex flex-col overflow-hidden">
              <div className="space-y-6">
                {!adminData?.recentActivities ||
                adminData.recentActivities.length === 0 ? (
                  <div className="flex h-80 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      {isLoading
                        ? "Loading activities..."
                        : "No recent activities"}
                    </p>
                  </div>
                ) : (
                  adminData.recentActivities.map((activity, index) => (
                    <div
                      key={activity.id || index}
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
                          {activity.description || ""}
                        </p>

                        {activity.user_name && (
                          <div className="flex items-center pt-2">
                            <Avatar className="mr-2 font-medium">
                              <AvatarFallback>
                                {activity.user_name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-muted-foreground text-xs">
                                {activity.user_name}
                              </p>
                              {activity.batch_title && (
                                <p className="text-muted-foreground text-xs">
                                  {activity.batch_title}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
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
