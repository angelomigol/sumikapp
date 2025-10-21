import React from "react";

import { cleanSlugAdvanced } from "@/utils/shared";

import AddSectionTraineesContainer from "./_components/add-section-trainees-container";

export default async function AddSectionTraineesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  return <AddSectionTraineesContainer slug={cleanedSlug} />;
}
