import React from "react";

import { cleanSlugAdvanced } from "@/utils/shared";

import SectionDashboardContainer from "./_components/section-dashboard-container";

export default async function SectionDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  return <SectionDashboardContainer slug={cleanedSlug} />;
}
