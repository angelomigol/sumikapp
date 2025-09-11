import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSection } from "@/hooks/use-sections";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import SectionSettingsContainer from "./_components/section-settings-container";

export default async function SectionSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();
  const { slug } = await params;

  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchSection(queryClient, cleanedSlug);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionSettingsContainer slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
