import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchTraineeReports } from "@/hooks/use-review-reports";

import { getQueryClient } from "@/components/get-query-client";

import ReviewReportsContainer from "./_components/review-reports-container";

export const generateMetadata = async () => {
  return {
    title: "Review & Approve Reports",
  };
};

export default async function ReviewReportsPage() {
  const queryClient = getQueryClient();

  await prefetchTraineeReports(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewReportsContainer />
    </HydrationBoundary>
  );
}
