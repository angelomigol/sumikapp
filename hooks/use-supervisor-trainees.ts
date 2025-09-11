import { useCallback } from "react";

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { OJTStatus } from "@/lib/constants";
import { UserStatus } from "@/lib/constants/userStatus";

import { getTraineesForEvaluationAction } from "@/app/dashboard/(supervisor)/evaluations/server/server-actions";
import {
  getSupervisorTraineeByIdAction,
  getSupervisorTraineesAction,
} from "@/app/dashboard/(supervisor)/trainees/server/server-actions";

import { NormalizedAccomplishmentReport } from "./use-activity-reports";
import { NormalizedAttendanceReport } from "./use-attendance-reports";

export const SUPERVISOR_TRAINEES_QUERY_KEY = [
  "supabase:supervisor_trainees",
] as const;
export const TRAINEES_EVAL_QUERY_KEY = [
  "supabase:trainees_for_evaluation",
] as const;
export const getSupervisorTraineeQueryKey = (id: string) =>
  ["supabase:supervisor_trainees", id] as const;

export type SupervisorTrainees = {
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
  trainee_id: string;
  student_id_number: string;
  course: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
};

export type InternshipDetails = {
  company_name: string | null;
  job_role: string | null;
  start_date: string;
  end_date: string;
};

export type TraineeFullDetails = SupervisorTrainees & {
  section: string | null;
  status: UserStatus;
  internship_details: InternshipDetails;

  program_batch: {
    required_hours: number;
    start_date: string;
    end_date: string;
  };

  attendance_reports: NormalizedAttendanceReport[];
  accomplishment_reports: NormalizedAccomplishmentReport[];
};

export function useFetchSupervisorTrainees() {
  return useQuery<SupervisorTrainees[]>({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEY,
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
    queryKey: getSupervisorTraineeQueryKey(id),
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
    queryKey: TRAINEES_EVAL_QUERY_KEY,
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
      queryKey: SUPERVISOR_TRAINEES_QUERY_KEY,
    });
  }, [queryClient]);
}

export function useRevalidateFetchTraineesForEvaluation() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: TRAINEES_EVAL_QUERY_KEY,
    });
  }, [queryClient]);
}

export async function prefetchSupervisorTrainees(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: SUPERVISOR_TRAINEES_QUERY_KEY,
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
    queryKey: getSupervisorTraineeQueryKey(id),
    queryFn: async () => {
      const result = await getSupervisorTraineeByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchTraineesForEvaluation(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: TRAINEES_EVAL_QUERY_KEY,
    queryFn: async () => {
      const result = await getTraineesForEvaluationAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
