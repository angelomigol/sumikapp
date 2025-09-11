import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/components/get-query-client";

import SectionTraineeDetailsContainer from "./_components/section-trainee-details-container";

export default async function SectionTraineeDetailsPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const queryClient = getQueryClient();

  //   await prefetchSupervisorTrainee(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionTraineeDetailsContainer traineeId={id} slug={slug} />
    </HydrationBoundary>
  );
}
