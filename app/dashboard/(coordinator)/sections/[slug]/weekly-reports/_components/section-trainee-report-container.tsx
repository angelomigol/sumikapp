"use client";

import React from "react";

import { TriangleAlert } from "lucide-react";

import { useFetchSectionTraineeReports } from "@/hooks/use-section-weekly-reports";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import NotFoundPage from "@/app/not-found";

import { reportsTableColumns } from "./reports-table-columns";
import { ReportsTableRowActions } from "./reports-table-row-actions";
import { SectionReportTableToolbar } from "./section-report-table-toolbar";

export default function SectionTraineeReportsContainer(params: {
  slug: string;
}) {
  const reports = useFetchSectionTraineeReports(params.slug);

  if (!reports.data || reports.isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!params.slug) {
    return <NotFoundPage />;
  }

  const columnsWithActions = reportsTableColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => (
          <ReportsTableRowActions slug={params.slug} row={row} />
        ),
      };
    }
    return column;
  });

  return (
    <>
      <div>
        <PageTitle text={"Weekly Reports"} />
        <p className="text-muted-foreground text-sm">
          Submitted weekly attendace and accomplishment reports of the students.
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
        columns={columnsWithActions}
        Toolbar={SectionReportTableToolbar}
      />
    </>
  );
}
