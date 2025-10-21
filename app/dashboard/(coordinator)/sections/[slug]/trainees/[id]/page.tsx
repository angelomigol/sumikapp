import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import SectionTraineeDetailsContainer from "./_components/section-trainee-details-container";
import { prefetchSupervisorTrainee } from "@/hooks/use-supervisor-trainees";

export default async function SectionTraineeDetailsPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const queryClient = getQueryClient();

  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchSupervisorTrainee(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionTraineeDetailsContainer traineeId={id} slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
