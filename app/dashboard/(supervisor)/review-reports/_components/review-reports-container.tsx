"use client";

import React from "react";

import { TriangleAlert } from "lucide-react";

import { useFetchTraineeReports } from "@/hooks/use-review-reports";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import { ReviewReportTableToolbar } from "./review-report-table-toolbar";
import { reviewReportColumns } from "./review-reports-columns";

export default function ReviewReportsContainer() {
  const reports = useFetchTraineeReports();

  if (!reports.data || reports.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div>
        <PageTitle text={"Review & Approve Reports"} />
        <p className="text-muted-foreground text-sm">
          Review and approve weekly reports submitted by trainees
        </p>
      </div>

      <If condition={reports.error}>
        <Alert variant="destructive" className="border-destructive">
          <TriangleAlert />
          <AlertTitle>ERROR!</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV === "development"
              ? reports.error?.stack
              : (reports.error?.message ??
                "Error fetching accomplishment and attendance reports reports.")}
          </AlertDescription>
        </Alert>
      </If>

      <DataTable
        data={reports.data}
        columns={reviewReportColumns}
        Toolbar={ReviewReportTableToolbar}
      />
    </>
  );
}
