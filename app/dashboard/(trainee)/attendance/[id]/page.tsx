import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchAttendanceReport } from "@/hooks/use-attendance-reports";

import { getQueryClient } from "@/components/get-query-client";

import AttendanceReportDetailsContainer from "./_components/attendance-report-details-container";

export default async function AttendanceReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = getQueryClient();
  const { id } = await params;

  await prefetchAttendanceReport(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AttendanceReportDetailsContainer reportId={id} />
    </HydrationBoundary>
  );
}
