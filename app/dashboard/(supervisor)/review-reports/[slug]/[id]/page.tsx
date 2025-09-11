import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchTraineeReport } from "@/hooks/use-review-reports";

import { getQueryClient } from "@/components/get-query-client";

import NotFoundPage from "@/app/not-found";

import ReviewReportDetailsContainer from "./_components/review-report-details-container";

export default async function ReviewReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string; slug: "attendance" | "accomplishment" }>;
}) {
  const { id, slug } = await params;
  const queryClient = getQueryClient();

  if (slug !== "attendance" && slug !== "accomplishment") {
    return <NotFoundPage />;
  }

  await prefetchTraineeReport(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewReportDetailsContainer reportId={id} />
    </HydrationBoundary>
  );
}
