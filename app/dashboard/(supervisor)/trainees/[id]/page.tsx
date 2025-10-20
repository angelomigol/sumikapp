import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSupervisorTrainee } from "@/hooks/use-supervisor-trainees";

import { getQueryClient } from "@/components/get-query-client";

import TraineeDetailsContainer from "./_components/supervisor-trainee-details-container";

export default async function SupervisorTraineeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await prefetchSupervisorTrainee(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TraineeDetailsContainer internshipId={id} />
    </HydrationBoundary>
  );
}
