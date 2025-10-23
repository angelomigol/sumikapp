import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  DailyEntrySchema,
  NormalizedWeeklyReport,
  WeeklyReport,
  WeeklyReportFormValues,
  WeeklyReportServerPayload,
} from "@/schemas/weekly-report/weekly-report.schema";

import {
  insertWeeklyReportEntryAction,
  submitWeeklyReportAction,
} from "@/app/dashboard/(trainee)/weekly-reports/[id]/server/server-actions";
import {
  createWeeklyReportAction,
  getWeeklyReportByIdAction,
  getWeeklyReportsAction,
} from "@/app/dashboard/(trainee)/weekly-reports/server/server-actions";

export const WEEKLY_REPORTS_QUERY_KEYS = {
  all: ["supabase:weekly_reports"] as const,
  detail: (id: string) => ["supabase:weekly_report", id] as const,
  entryFiles: (entryId: string) => ["supabase:entry_files", entryId] as const,
  mutations: {
    create: ["create_weekly_report"] as const,
    insertEntry: ["insert_weekly_report_entry"] as const,
    submit: ["submit_weekly_report"] as const,
    uploadFiles: ["upload_entry_files"] as const,
    deleteFile: ["delete_entry_file"] as const,
  },
};

export function useFetchWeeklyReports() {
  return useQuery<WeeklyReport[]>({
    queryKey: WEEKLY_REPORTS_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getWeeklyReportsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchWeeklyReport(id: string) {
  return useQuery<NormalizedWeeklyReport>({
    queryKey: WEEKLY_REPORTS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getWeeklyReportByIdAction(id);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCreateWeeklyReport() {
  const mutationKey = WEEKLY_REPORTS_QUERY_KEYS.mutations.create;
  const revalidateReports = useRevalidateFetchWeeklyReportsQuery();

  const mutationFn = async (payload: WeeklyReportServerPayload) => {
    const result = await createWeeklyReportAction(payload);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateReports();
    },
  });
}

export function useSubmitWeeklyReport(id: string) {
  const mutationKey = WEEKLY_REPORTS_QUERY_KEYS.mutations.submit;
  const revalidateReport = useRevalidateFetchWeeklyReportQuery();
  const revalidateReports = useRevalidateFetchWeeklyReportsQuery();

  const mutationFn = async (reportId: string) => {
    const result = await submitWeeklyReportAction(reportId);

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

export function useInsertWeeklyReportEntry(id: string) {
  const mutationKey = WEEKLY_REPORTS_QUERY_KEYS.mutations.insertEntry;
  const revalidateReport = useRevalidateFetchWeeklyReportQuery();
  const revalidateReports = useRevalidateFetchWeeklyReportsQuery();

  const mutationFn = async (payload: DailyEntrySchema) => {
    const result = await insertWeeklyReportEntryAction(payload);

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

export function useRevalidateFetchWeeklyReportsQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: WEEKLY_REPORTS_QUERY_KEYS.all,
      }),
    [queryClient]
  );
}

export function useRevalidateFetchWeeklyReportQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: WEEKLY_REPORTS_QUERY_KEYS.detail(id),
      });
    },
    [queryClient]
  );
}

export async function prefetchWeeklyReports(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: WEEKLY_REPORTS_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await getWeeklyReportsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchWeeklyReport(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: WEEKLY_REPORTS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getWeeklyReportByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
