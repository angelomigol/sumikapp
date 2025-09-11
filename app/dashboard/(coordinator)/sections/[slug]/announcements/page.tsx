import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchAnnouncements } from "@/hooks/use-announcements";

import { cleanSlugAdvanced } from "@/utils/shared";

import { getQueryClient } from "@/components/get-query-client";

import AnnouncementContainer from "./_components/announcement-container";

export const generateMetadata = async () => {
  return {
    title: "Announcements",
  };
};

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const queryClient = getQueryClient();

  const { slug } = await params;
  const cleanedSlug = cleanSlugAdvanced(slug, {
    preserveOriginal: true,
  });

  await prefetchAnnouncements(queryClient, cleanedSlug);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnnouncementContainer slug={cleanedSlug} />
    </HydrationBoundary>
  );
}
