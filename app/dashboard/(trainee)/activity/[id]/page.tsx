import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchActivityReport } from "@/hooks/use-activity-reports";

import { getQueryClient } from "@/components/get-query-client";

import ActivityReportDetailsContainer from "./_components/activity-report-details-container";

export default async function ActivityReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = getQueryClient();
  const { id } = await params;

  await prefetchActivityReport(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActivityReportDetailsContainer reportId={id} />
    </HydrationBoundary>
  );
}
