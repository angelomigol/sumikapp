import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchWeeklyReports } from "@/hooks/use-weekly-reports";

import { getQueryClient } from "@/components/get-query-client";

import WeeklyReportsContainer from "./_components/weekly-reports-container";

export const generateMetadata = async () => {
  return {
    title: "My Weekly Reports",
  };
};

export default async function WeeklyReports() {
  const queryClient = getQueryClient();

  await prefetchWeeklyReports(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReportsContainer />
    </HydrationBoundary>
  );
}
