import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchActivityReports } from "@/hooks/use-activity-reports";

import { getQueryClient } from "@/components/get-query-client";

import ActivityLogContainer from "./_components/activity-log-container";

export const generateMetadata = async () => {
  return {
    title: "My Activity Reports",
  };
};

export default async function AccomplishmentsLogPage() {
  const queryClient = getQueryClient();

  await prefetchActivityReports(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActivityLogContainer />
    </HydrationBoundary>
  );
}
