import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DocumentStatus, EntryStatus } from "@/lib/constants";

import { Database } from "@/utils/supabase/supabase.types";

import { UpdateEntryStatusFormValues } from "@/app/dashboard/(supervisor)/review-reports/[slug]/[id]/schema/update-entry-status.schema";
import {
  approveReportAction,
  rejectReportAction,
  updateEntryAction,
} from "@/app/dashboard/(supervisor)/review-reports/[slug]/[id]/server/server-actions";
import {
  getTraineeReportByIdAction,
  getTraineeReportsAction,
} from "@/app/dashboard/(supervisor)/review-reports/server/server-actions";

export const REVIEW_REPORTS_QUERY_KEY = ["supabase:review_reports"] as const;
export const REVIEW_REPORT_QUERY_KEY = (id: string) =>
  ["supabase:review_report", id] as const;
export const UPDATE_REPORT_MUTATION_KEY = [
  "supabase:update_review_report",
] as const;
export const UPDATE_ENTRY_MUTATION_KEY = [
  "supabase:update_report_entry",
] as const;

export type ReviewReports = {
  trainee_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  report_type: "attendance" | "accomplishment";
  report_id: string;
  start_date: string;
  end_date: string;
  total_hours: string;
  submitted_at: string;
  status: DocumentStatus;
  supervisor_approved_at?: string | null;
};

export type AttendanceEntryData = {
  id: string;
  entry_date: string;
  time_in: string | null;
  time_out: string | null;
  report_id: string;
  total_hours: number;
  status: EntryStatus | null;
  is_confirmed: boolean;
  created_at: string;
};

export type AccomplishmentEntryData = {
  created_at: string;
  daily_accomplishment: string | null;
  entry_date: string;
  id: string;
  is_confirmed: boolean;
  no_of_working_hours: number;
  report_id: string;
  status: EntryStatus | null;
};

export type NormalizedReviewReport = ReviewReports & {
  entries: AccomplishmentEntryData[] | AttendanceEntryData[];
  email: string;
  supervisor_approved_at: string | null;
  intern_code: string;
  company_name: string | null;
  job_role: string | null;
};

export function useFetchTraineeReports() {
  return useQuery<ReviewReports[]>({
    queryKey: REVIEW_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getTraineeReportsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchTraineeReport(id: string) {
  return useQuery<NormalizedReviewReport>({
    queryKey: REVIEW_REPORT_QUERY_KEY(id),
    queryFn: async () => {
      const result = await getTraineeReportByIdAction(id);
      return result;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useApproveTraineeReport(id: string) {
  const revalidateReport = useRevalidateFetchTraineeReport();

  return useMutation({
    mutationKey: [UPDATE_REPORT_MUTATION_KEY, "approve"],
    mutationFn: (reportId: string) => approveReportAction(reportId),
    onSuccess: () => {
      revalidateReport(id);
    },
  });
}

export function useRejectTraineeReport(id: string) {
  const revalidateReport = useRevalidateFetchTraineeReport();

  return useMutation({
    mutationKey: [UPDATE_REPORT_MUTATION_KEY, "reject"],
    mutationFn: (reportId: string) => rejectReportAction(reportId),
    onSuccess: () => {
      revalidateReport(id);
    },
  });
}

export function useUpdateEntryStatus(id: string) {
  const mutationKey = UPDATE_ENTRY_MUTATION_KEY;
  const revalidateReport = useRevalidateFetchTraineeReport();

  const mutationFn = async (payload: UpdateEntryStatusFormValues) => {
    const formData = new FormData();

    formData.append("entryId", payload.entryId);
    formData.append("status", payload.status);

    const result = await updateEntryAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateReport(id);
    },
  });
}

export function useRevalidateFetchTraineeReport() {
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

export async function prefetchTraineeReports(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: REVIEW_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getTraineeReportsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchTraineeReport(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: REVIEW_REPORT_QUERY_KEY(id),
    queryFn: async () => {
      const result = await getTraineeReportByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
