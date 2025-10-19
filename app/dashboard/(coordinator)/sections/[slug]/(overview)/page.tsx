import React from "react";

import { prefetchSectionDashboard } from "@/hooks/use-section-dashboard";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import SectionDashboardContainer from "./_components/section-dashboard-container";

export default async function SectionDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();

  const { slug } = await params;
  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchSectionDashboard(queryClient, cleanedSlug);

  return <SectionDashboardContainer slug={cleanedSlug} />;
}
