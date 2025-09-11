import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSectionTraineeReport } from "@/hooks/use-section-weekly-reports";

import { getQueryClient } from "@/components/get-query-client";

import ViewWeeklyReportContainer from "./_component/view-weekly-report-container";

export default async function ViewWeeklyReportPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const queryClient = getQueryClient();
  const { id, slug } = await params;

  await prefetchSectionTraineeReport(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ViewWeeklyReportContainer reportId={id} slug={slug} />
    </HydrationBoundary>
  );
}
