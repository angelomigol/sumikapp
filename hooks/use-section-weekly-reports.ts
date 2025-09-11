import { useCallback } from "react";

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSectionTraineeReportByIdAction,
  getSectionTraineeReportsAction,
} from "@/app/dashboard/(coordinator)/sections/[slug]/weekly-reports/server/server-actions";

import { NormalizedReviewReport, ReviewReports } from "./use-review-reports";

export const REVIEW_REPORTS_QUERY_KEY = ["supabase:review_reports"] as const;
export const REVIEW_REPORT_QUERY_KEY = (id: string) =>
  ["supabase:review_report", id] as const;

export function useFetchSectionTraineeReports(slug: string) {
  return useQuery<ReviewReports[]>({
    queryKey: REVIEW_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSectionTraineeReportsAction(slug);
      return result;
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchSectionTraineeReport(id: string) {
  return useQuery<NormalizedReviewReport>({
    queryKey: REVIEW_REPORT_QUERY_KEY(id),
    queryFn: async () => {
      const result = await getSectionTraineeReportByIdAction(id);
      return result;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevalidateFetchSectionTraineeReport() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: REVIEW_REPORT_QUERY_KEY(id),
      });
    },
    [queryClient]
  );
}

export async function prefetchSectionTraineeReports(
  queryClient: QueryClient,
  slug: string
) {
  await queryClient.prefetchQuery({
    queryKey: REVIEW_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSectionTraineeReportsAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchSectionTraineeReport(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: REVIEW_REPORT_QUERY_KEY(id),
    queryFn: async () => {
      const result = await getSectionTraineeReportByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
