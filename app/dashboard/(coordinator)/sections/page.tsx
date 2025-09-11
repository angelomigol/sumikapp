import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchSections } from "@/hooks/use-sections";

import { getQueryClient } from "@/components/get-query-client";

import SectionsContainer from "./_components/sections-container";

export const generateMetadata = async () => {
  return {
    title: "Sections",
  };
};

export default async function SectionsPage() {
  const queryClient = getQueryClient();

  await prefetchSections(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionsContainer />
    </HydrationBoundary>
  );
}
