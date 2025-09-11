import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchTraineeSkills } from "@/hooks/use-skills";

import { getQueryClient } from "@/components/get-query-client";

import SkillsContainer from "./_components/skills-container";

export const generateMetadata = async () => {
  return {
    title: "Skills",
  };
};

export default async function SkillsPage() {
  const queryClient = getQueryClient();

  await prefetchTraineeSkills(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SkillsContainer />
    </HydrationBoundary>
  );
}
