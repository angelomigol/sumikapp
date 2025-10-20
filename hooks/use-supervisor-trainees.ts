import { useCallback } from "react";

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { OJTStatus } from "@/lib/constants";
import { UserStatus } from "@/lib/constants/userStatus";

import { Tables } from "@/utils/supabase/supabase.types";

import { getTraineesForEvaluationAction } from "@/app/dashboard/(supervisor)/evaluations/server/server-actions";
import {
  getSupervisorTraineeByIdAction,
  getSupervisorTraineesAction,
} from "@/app/dashboard/(supervisor)/trainees/server/server-actions";

import { TraineeFullDetails } from "./use-section-trainees";

export const SUPERVISOR_TRAINEES_QUERY_KEYS = {
  all: ["supabase:supervisor_trainees"] as const,
  detail: (id: string) => ["supabase:supervisor_trainees", id] as const,
  evaluation: ["supabase:trainees_for_evaluation"] as const,
};

export type SupervisorTrainees = {
  internship_id: string;
  trainee_id: string;
  student_id_number: string;
  course: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  hours_logged: number;
  ojt_status: OJTStatus;
};

export type SupervisorTraineesForEvaluationTable = {
  tbe_id: string;
  trainee_id: string;
  student_id_number: string;
  course: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
};

export function useFetchSupervisorTrainees() {
  return useQuery<SupervisorTrainees[]>({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getSupervisorTraineesAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchSupervisorTrainee(id: string) {
  return useQuery<TraineeFullDetails>({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getSupervisorTraineeByIdAction(id);
      return result;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchTraineesForEvaluation() {
  return useQuery<SupervisorTraineesForEvaluationTable[]>({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.evaluation,
    queryFn: async () => {
      const result = await getTraineesForEvaluationAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevalidateFetchSuperviorTrainees() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.all,
    });
  }, [queryClient]);
}

export function useRevalidateFetchTraineesForEvaluation() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.evaluation,
    });
  }, [queryClient]);
}

export async function prefetchSupervisorTrainees(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getSupervisorTraineesAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchSupervisorTrainee(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getSupervisorTraineeByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchTraineesForEvaluation(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEYS.evaluation,
    queryFn: async () => {
      const result = await getTraineesForEvaluationAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
