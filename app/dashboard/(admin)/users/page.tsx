import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { prefetchUsers } from "@/hooks/use-users";

import { getQueryClient } from "@/components/get-query-client";

import UserListContainer from "./_components/user-management-container";

export const generateMetadata = async () => {
  return {
    title: "User List",
  };
};

export default async function UserListPage() {
  const queryClient = getQueryClient();

  await prefetchUsers(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserListContainer />
    </HydrationBoundary>
  );
}
