import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchIndustryPartners } from "@/hooks/use-industry-partner";

import { getQueryClient } from "@/components/get-query-client";

import IndestryPartnersContainer from "./_components/industry-partners-container";

export const generateMetadata = async () => {
  return {
    title: "Industry Partners",
  };
};

export default async function IndestryPartnersPage() {
  const queryClient = getQueryClient();

  await prefetchIndustryPartners(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IndestryPartnersContainer />
    </HydrationBoundary>
  );
}
