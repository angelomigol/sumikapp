import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchWeeklyReport } from "@/hooks/use-weekly-reports";

import { getQueryClient } from "@/components/get-query-client";

import WeeklyReportDetailsContainer from "./_components/weekly-report-details-container";

export default async function WeeklyReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = getQueryClient();
  const { id } = await params;

  await prefetchWeeklyReport(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReportDetailsContainer reportId={id} />
    </HydrationBoundary>
  );
}
