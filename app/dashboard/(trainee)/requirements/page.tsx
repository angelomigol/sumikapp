import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchRequirements } from "@/hooks/use-requirements";

import { getQueryClient } from "@/components/get-query-client";

import RequirementsContainer from "./_components/requirements-container";

export const generateMetadata = async () => {
  return {
    title: "Requirements",
  };
};

export default async function RequirementsPage() {
  const queryClient = getQueryClient();

  await prefetchRequirements(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequirementsContainer />
    </HydrationBoundary>
  );
}
