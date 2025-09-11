import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  prefetchBatchRequirements,
  prefetchTraineeRequirements,
} from "@/hooks/use-batch-requirements";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import RequirementsTrackerContainer from "./_components/requirements-tracker-container";

export default async function RequirementsTrackerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();
  const { slug } = await params;

  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await Promise.all([
    prefetchTraineeRequirements(queryClient, cleanedSlug),
    prefetchBatchRequirements(queryClient, cleanedSlug),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequirementsTrackerContainer slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
