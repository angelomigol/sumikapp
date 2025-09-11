"use client";

import React from "react";

import { TriangleAlert } from "lucide-react";

import { useFetchActivityReports } from "@/hooks/use-activity-reports";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { activityReportColumns } from "./activity-reports-columns";
import { ActivityTableToolbar } from "./activity-table-toolbar";
import AddActivityReportDialog from "./add-activity-report-dialog";

export default function ActivityLogContainer() {
  const { data = [], isLoading, error } = useFetchActivityReports();

  if (!data || isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle text={"My Activity Reports"} />
          <p className="text-muted-foreground text-sm">
            View and track your weekly activity reports.
          </p>
        </div>

        <AddActivityReportDialog />
      </div>

      <If condition={error}>
        <Alert variant="destructive" className="border-destructive">
          <TriangleAlert />
          <AlertTitle>ERROR!</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV === "development"
              ? error?.stack
              : (error?.message ?? "Error fetching accomplishment reports.")}
          </AlertDescription>
        </Alert>
      </If>

      <DataTable
        data={data}
        columns={activityReportColumns}
        Toolbar={ActivityTableToolbar}
      />
    </>
  );
}
