import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSkillAction,
  deleteSkillAction,
  getSkillsAction,
} from "@/app/dashboard/settings/skills/server/server-actions";

export type Skill = {
  id: string;
  name: string;
};

export const SKILLS_QUERY_KEY = ["supabase:skills"] as const;
export const CREATE_MUTATION_KEY = ["create-skill"] as const;
export const DELETE_MUTATION_KEY = ["delete-skill"] as const;

export function useFetchSkills() {
  return useQuery<Skill[]>({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSkillsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddSkill() {
  const mutationKey = CREATE_MUTATION_KEY;
  const revalidateSkills = useRevalidateFetchTraineeSkills();

  const mutationFn = async (skillName: string) => {
    const result = await createSkillAction(skillName);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateSkills();
    },
  });
}

export function useRemoveSkill() {
  const mutationKey = DELETE_MUTATION_KEY;
  const revalidateSkills = useRevalidateFetchTraineeSkills();

  const mutationFn = async (skillName: string) => {
    const result = await deleteSkillAction(skillName);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateSkills();
    },
  });
}

export function useRevalidateFetchTraineeSkills() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: SKILLS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export async function prefetchTraineeSkills(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSkillsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
