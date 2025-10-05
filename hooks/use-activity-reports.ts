import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DocumentStatus, InternshipCode } from "@/lib/constants";

import { Tables } from "@/utils/supabase/supabase.types";

import {
  insertActivityEntryAction,
  submitActivityReportAction,
} from "@/app/dashboard/(trainee)/activity/[id]/server/server-actions";
import {
  ActivityEntrySchema,
  ActivityFormValues,
} from "@/app/dashboard/(trainee)/activity/schema/activity-report-schema";
import {
  createActivityReportAction,
  getActivityReportByIdAction,
  getActivityReportsAction,
} from "@/app/dashboard/(trainee)/activity/server/server-actions";

export type AccomplishmentReport = {
  created_at: string;
  end_date: string;
  id: string;
  start_date: string;
  status: DocumentStatus;
  submitted_at: string | null;
  total_hours: number;
  internship_code?: InternshipCode;
  supervisor_approved_at?: string | null;
  company_name?: string;
};
export type AccomplishmentEntry = Tables<"accomplishment_entries">;

export type NormalizedAccomplishmentReport = AccomplishmentReport & {
  accomplishment_entries: AccomplishmentEntry[];
};

export const ACTIVITY_REPORTS_QUERY_KEY = [
  "supabase:activity_reports",
] as const;
export const getActivityReportQueryKey = (id: string) =>
  ["supabase:activity_report", id] as const;
export const CREATE_MUTATION_KEY = ["create_accomplishment_report"] as const;
export const INSERT_ENTRY_MUTATION_KEY = ["insert_activity_entry"] as const;
export const SUBMIT_REPORT_MUTATION_KEY = ["submit_activity_report"] as const;

export function useFetchActivityReports() {
  return useQuery<AccomplishmentReport[]>({
    queryKey: ACTIVITY_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getActivityReportsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchActivityReport(id: string) {
  return useQuery<NormalizedAccomplishmentReport>({
    queryKey: getActivityReportQueryKey(id),
    queryFn: async () => {
      const result = await getActivityReportByIdAction(id);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCreateActivityReport() {
  const mutationKey = CREATE_MUTATION_KEY;
  const revalidateReports = useRevalidateFetchActivityReportsQuery();

  const mutationFn = async (payload: ActivityFormValues) => {
    const result = await createActivityReportAction(payload);

    return result;
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      revalidateReports();
    },
  });
}

export function useSubmitActivityReport(id: string) {
  const mutationKey = SUBMIT_REPORT_MUTATION_KEY;
  const revalidateReport = useRevalidateFetchActivityReportQuery();
  const revalidateReports = useRevalidateFetchActivityReportsQuery();

  const mutationFn = async (reportId: string) => {
    const result = await submitActivityReportAction(reportId);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateReport(id);
      revalidateReports();
    },
  });
}

export function useInsertActivityEntry(id: string) {
  const mutationKey = INSERT_ENTRY_MUTATION_KEY;
  const revalidateReport = useRevalidateFetchActivityReportQuery();
  const revalidateReports = useRevalidateFetchActivityReportsQuery();

  const mutationFn = async (payload: ActivityEntrySchema) => {
    const result = await insertActivityEntryAction(payload);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateReport(id);
      revalidateReports();
    },
  });
}

export function useRevalidateFetchActivityReportsQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ACTIVITY_REPORTS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export function useRevalidateFetchActivityReportQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) =>
      queryClient.invalidateQueries({
        queryKey: getActivityReportQueryKey(id),
      }),
    [queryClient]
  );
}

export async function prefetchActivityReports(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ACTIVITY_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getActivityReportsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchActivityReport(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: getActivityReportQueryKey(id),
    queryFn: async () => {
      const result = await getActivityReportByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
