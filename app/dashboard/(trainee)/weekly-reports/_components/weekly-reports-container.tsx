"use client";

import React from "react";

import { TriangleAlert } from "lucide-react";

import { useFetchWeeklyReports } from "@/hooks/use-weekly-reports";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import AddWeeklyReportDialog from "./add-weekly-report-dialog";
import { weeklyReportsColumns } from "./weekly-reports-columns";
import { WeeklyReportsTableToolbar } from "./weekly-reports-table-toolbar";

export default function WeeklyReportsContainer() {
  const { data = [], isLoading, error } = useFetchWeeklyReports();

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle text={"Weekly Reports"} />
          <p className="text-muted-foreground text-[10px] text-balance md:text-sm">
            View and track your weekly work hours, accomplishments, and receive
            supervisor feedback
          </p>
        </div>

        <AddWeeklyReportDialog existingReports={data} />
      </div>

      <If condition={error}>
        <Alert variant="destructive" className="border-destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>ERROR!</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV === "development"
              ? error?.stack
              : (error?.message ?? "Error fetching weekly reports.")}
          </AlertDescription>
        </Alert>
      </If>

      <DataTable
        data={data}
        columns={weeklyReportsColumns}
        Toolbar={WeeklyReportsTableToolbar}
      />
    </>
  );
}
