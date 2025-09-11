import { useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }
) {
  const client = useSupabase();
  const queryKey = ["account:data", userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    const response = await client
      .from("users")
      .select(
        `
        id,
        first_name,
        middle_name,
        last_name
    `
      )
      .eq("id", userId)
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          first_name: partialAccount.first_name,
          middle_name: partialAccount.middle_name,
          last_name: partialAccount.last_name,
        }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ["account:data", userId],
      }),
    [queryClient]
  );
}
