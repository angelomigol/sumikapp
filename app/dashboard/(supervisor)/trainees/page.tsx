import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSupervisorTrainees } from "@/hooks/use-supervisor-trainees";

import { getQueryClient } from "@/components/get-query-client";

import SupervisorTraineesContainer from "./_components/supervisor-trainees-container";

export const generateMetadata = async () => {
  return {
    title: "Trainee List",
  };
};

export default async function SupervisorTraineesPage() {
  const queryClient = getQueryClient();

  await prefetchSupervisorTrainees(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SupervisorTraineesContainer />
    </HydrationBoundary>
  );
}
