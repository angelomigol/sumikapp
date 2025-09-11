import React from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchUser } from "@/hooks/use-users";

import { getQueryClient } from "@/components/get-query-client";

import UserDetailsContainer from "./_components/user-details-container";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const queryClient = getQueryClient();

  await prefetchUser(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetailsContainer userId={id} />
    </HydrationBoundary>
  );
}
