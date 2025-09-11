import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchInternships } from "@/hooks/use-internship-details";

import { getQueryClient } from "@/components/get-query-client";

import InternshipDetailsContainer from "./_components/internship-details-container";

export default async function InternshipDetailsPage() {
  const queryClient = getQueryClient();

  await prefetchInternships(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InternshipDetailsContainer />
    </HydrationBoundary>
  );
}
