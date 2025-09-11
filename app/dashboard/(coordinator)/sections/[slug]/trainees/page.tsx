import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSectionTrainees } from "@/hooks/use-section-trainees";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import SectionTraineesContainer from "./_components/section-trainees-container";

export default async function SectionTraineesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();
  const { slug } = await params;

  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchSectionTrainees(queryClient, cleanedSlug);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionTraineesContainer slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
