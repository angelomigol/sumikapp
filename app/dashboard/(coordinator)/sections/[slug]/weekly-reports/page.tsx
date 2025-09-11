import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSectionTraineeReports } from "@/hooks/use-section-weekly-reports";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import SectionTraineeReportsContainer from "./_components/section-trainee-report-container";

export const generateMetadata = async () => {
  return {
    title: "Weekly Reports",
  };
};

export default async function SectionTraineeReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();

  const { slug } = await params;
  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchSectionTraineeReports(queryClient, cleanedSlug);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionTraineeReportsContainer slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
