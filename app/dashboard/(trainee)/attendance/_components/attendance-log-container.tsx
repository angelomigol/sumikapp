"use client";

import React from "react";

import { TriangleAlert } from "lucide-react";

import { useFetchAttendanceReports } from "@/hooks/use-attendance-reports";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import PageTitle from "@/components/sumikapp/page-title";

import AddAttendanceReportDialog from "./add-attendance-report-dialog";
import { attendanceReportColumns } from "./attendance-report-columns";
import { AttendanceTableToolbar } from "./attendance-table-toolbar";

export default function AttendanceLogContainer() {
  const { data = [], isLoading, error } = useFetchAttendanceReports();

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle text={"My Attendance Reports"} />
          <p className="text-muted-foreground text-sm">
            View and track your weekly attendance reports.
          </p>
        </div>

        <AddAttendanceReportDialog />
      </div>

      <If condition={error}>
        <Alert variant="destructive" className="border-destructive">
          <TriangleAlert />
          <AlertTitle>ERROR!</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV === "development"
              ? error?.stack
              : (error?.message ?? "Error fetching attendance reports.")}
          </AlertDescription>
        </Alert>
      </If>

      <DataTable
        data={data}
        columns={attendanceReportColumns}
        Toolbar={AttendanceTableToolbar}
      />
    </>
  );
}
