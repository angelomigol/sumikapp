import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  DocumentStatus,
  InternshipCode,
  OJTStatus,
  UserStatus,
} from "@/lib/constants";

import { SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";

import { addAllStudentsAction } from "@/app/dashboard/(coordinator)/sections/[slug]/trainees/add/server/server-actions";
import {
  getSectionTraineeByIdAction,
  getSectionTraineesAction,
} from "@/app/dashboard/(coordinator)/sections/[slug]/trainees/server/server-actions";

import { RequirementWithHistory } from "./use-batch-requirements";

export type TraineeFullDetails = {
  trainee_id: string;
  student_id_number: string;
  course: string | null;
  section: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  hours_logged: number;
  ojt_status: OJTStatus;
  status: UserStatus;
  internship_details?: {
    company_name: string;
    job_role: string;
    start_date: string;
    end_date: string;
  };
  program_batch: {
    internship_code: InternshipCode;
    required_hours: number;
    start_date: string;
    end_date: string;
  };
  weekly_reports?: {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string | null;
    period_total: number;
    status: DocumentStatus;
    submitted_at: string | null;
  }[];
  submitted_requirements?: RequirementWithHistory[];
  evaluation_results: {
    prediction_label: string;
    prediction_probability: number | null;
    confidence_level: string | null;
    prediction_date: string | null;
    evaluation_scores: Record<string, number> | null;
    feature_scores: Record<string, number> | null;
    recommendations: Record<string, number> | null;
    risk_factors: Record<string, number> | null;
  } | null;
};

export const SECTION_TRAINEES_QUERY_KEY = (slug: string) =>
  ["supabase:program_batch_trainees", slug] as const;
export const SECTION_TRAINEE_QUERY_KEY = (slug: string) =>
  ["supabase:program_batch_trainee", slug] as const;
export const MUTATION_KEY = ["add_all_students"] as const;

export type TraineeWithUserAndHours = {
  trainee_id: string;
  student_id_number: string;
  ojt_status: OJTStatus;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  hours_logged: number;
};

export function useFetchSectionTrainees(slug: string) {
  return useQuery<TraineeWithUserAndHours[]>({
    queryKey: SECTION_TRAINEES_QUERY_KEY(slug),
    queryFn: async () => {
      const result = await getSectionTraineesAction(slug);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchSectionTrainee(data: { slug: string; id: string }) {
  return useQuery<TraineeFullDetails>({
    queryKey: SECTION_TRAINEE_QUERY_KEY(data.id),
    queryFn: async () => {
      const result = await getSectionTraineeByIdAction({
        sectionName: data.slug,
        traineeId: data.id,
      });
      return result;
    },
    enabled: !!data,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddAllStudents(slug: string) {
  const mutationKey = MUTATION_KEY;
  const revalidateTrainees = useRevalidateFetchSectionTrainees();

  const mutationFn = async (payload: {
    trainees: SearchableTrainee[];
    slug: string;
  }) => {
    const result = await addAllStudentsAction(payload);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateTrainees(slug);
    },
  });
}

export function useRevalidateFetchSectionTrainees() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) =>
      queryClient.invalidateQueries({
        queryKey: SECTION_TRAINEES_QUERY_KEY(slug),
      }),
    [queryClient]
  );
}

export async function prefetchSectionTrainees(
  queryClient: QueryClient,
  slug: string
) {
  await queryClient.prefetchQuery({
    queryKey: SECTION_TRAINEES_QUERY_KEY(slug),
    queryFn: async () => {
      const result = await getSectionTraineesAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
