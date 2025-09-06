"use client";

import {
  AlertCircle,
  BadgeCheck,
  Bolt,
  CalendarCheck,
  Clock,
  FileText,
} from "lucide-react";

import { useFetchTraineeDashboard } from "@/hooks/use-trainee-dashboard";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { If } from "../sumikapp/if";
import { LoadingOverlay } from "../sumikapp/loading-overlay";
import PageTitle from "../sumikapp/page-title";
import DashboardStatsCard from "./dashboard-stats-card";
import TraineeOverviewTab from "./trainee-overview-tab";

export default function TraineeDashboard() {
  const {
    data: traineeData,
    isLoading,
    error,
    isError,
  } = useFetchTraineeDashboard();

  const getAccomplishmentReportSummary = () => {
    if (isLoading || !traineeData) return "";

    const approved = traineeData.approvedAccomplishmentReports;
    const rejected = traineeData.rejectedAccomplishmentReports;
    const pending = traineeData.pendingAccomplishmentReports;

    const parts = [];
    if (approved > 0) parts.push(`${approved} approved`);
    if (rejected > 0) parts.push(`${rejected} rejected`);
    if (pending > 0) parts.push(`${pending} pending`);

    return parts.length > 0 ? parts.join(", ") : "No reports submitted";
  };

  const dashboard = [
    {
      name: "Attendance Rate",
      icon: CalendarCheck,
      data: {
        main: isLoading
          ? "..."
          : `${traineeData?.attendanceRatePercentage || 0}%`,
      },
      tooltip:
        "Based on the percentage of approved attendance reports you've submitted",
    },
    {
      name: "Hours Logged",
      icon: Clock,
      data: {
        main: isLoading ? "..." : `${traineeData?.hours.total || 0}`,
        sub: isLoading
          ? "..."
          : traineeData?.hours.required
            ? `of ${traineeData.hours.required} hours required`
            : "No requirement set",
      },
      tooltip:
        "Your total completed OJT hours based on approved attendance reports",
    },
    {
      name: "Activity Reports",
      icon: FileText,
      data: {
        main: isLoading
          ? "..."
          : `${traineeData?.totalAccomplishmentReports || 0}`,
        sub: getAccomplishmentReportSummary(),
      },
      tooltip: "Your total number of weekly activity reports",
    },
  ];

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (isError && !traineeData) {
    return (
      <div className="space-y-6">
        <PageTitle text={"Dashboard"} />

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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

      <If
        condition={
          traineeData?.ojtStatus === "active" ||
          traineeData?.ojtStatus === "completed"
        }
      >
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
      </If>

      <If condition={traineeData?.ojtStatus === "not started"}>
        <Alert className="border-blue-11 bg-blue-3 border-l-4">
          <AlertCircle className="size-5" />
          <AlertDescription className="text-blue-11/80 text-sm">
            Welcome to your OJT dashboard! Once your internship details are
            approved and you begin your OJT, you'll see your progress and
            statistics here.
          </AlertDescription>
        </Alert>
      </If>

      <Tabs defaultValue="overview" className="max-h-full space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Bolt />
            Overview
          </TabsTrigger>

          <If condition={traineeData?.ojtStatus === "completed"}>
            <TabsTrigger value="intern1">
              <BadgeCheck />
              Internship 1
            </TabsTrigger>
            <TabsTrigger value="intern2">
              <BadgeCheck />
              Internship 2
            </TabsTrigger>
          </If>
        </TabsList>

        <TabsContent value="overview">
          <TraineeOverviewTab traineeData={traineeData} />
        </TabsContent>

        <If condition={traineeData?.ojtStatus === "completed"}>
          <TabsContent value="intern1">Internship 1 Results</TabsContent>
          <TabsContent value="intern2">Internship 2 Results</TabsContent>
        </If>
      </Tabs>
    </>
  );
}
