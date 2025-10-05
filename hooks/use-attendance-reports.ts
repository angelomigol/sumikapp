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
  insertAttendanceEntryAction,
  submitAttendanceReportAction,
} from "@/app/dashboard/(trainee)/attendance/[id]/server/server-actions";
import {
  AttendanceEntrySchema,
  AttendanceFormValues,
} from "@/app/dashboard/(trainee)/attendance/schema/attendance-report-schema";
import {
  createAttendanceReportAction,
  getAttendanceReportByIdAction,
  getAttendanceReportsAction,
} from "@/app/dashboard/(trainee)/attendance/server/server-actions";

export type AttendanceReport = {
  created_at: string;
  end_date: string;
  id: string;
  period_total: number;
  previous_total: number;
  start_date: string;
  status: DocumentStatus;
  submitted_at: string | null;
  total_hours_served: number;
  internship_code?: InternshipCode;
  supervisor_approved_at?: string | null;
  company_name?: string;
};

export type AttendanceEntry = Tables<"attendance_entries">;

export type NormalizedAttendanceReport = AttendanceReport & {
  attendance_entries: AttendanceEntry[];
};

export const ATTEDANCE_REPORTS_QUERY_KEY = [
  "supabase:attendance_reports",
] as const;
export const getAttendanceReportQueryKey = (id: string) =>
  ["supabase:attendance_report", id] as const;
export const CREATE_REPORT_MUTATION_KEY = ["create_attendance_report"] as const;
export const INSERT_ENTRY_MUTATION_KEY = ["insert_attendance_entry"] as const;
export const SUBMIT_REPORT_MUTATION_KEY = ["submit_attendance_report"] as const;

export function useFetchAttendanceReports() {
  return useQuery<AttendanceReport[]>({
    queryKey: ATTEDANCE_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getAttendanceReportsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchAttendanceReport(id: string) {
  return useQuery<NormalizedAttendanceReport>({
    queryKey: getAttendanceReportQueryKey(id),
    queryFn: async () => {
      const result = await getAttendanceReportByIdAction(id);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCreateAttendanceReport() {
  const mutationKey = CREATE_REPORT_MUTATION_KEY;
  const revalidateReports = useRevalidateFetchAttendanceReportsQuery();

  const mutationFn = async (payload: AttendanceFormValues) => {
    const result = await createAttendanceReportAction(payload);
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

export function useSubmitAttendanceReport(id: string) {
  const mutationKey = SUBMIT_REPORT_MUTATION_KEY;
  const revalidateReport = useRevalidateFetchAttendanceReportQuery();
  const revalidateReports = useRevalidateFetchAttendanceReportsQuery();

  const mutationFn = async (reportId: string) => {
    const result = await submitAttendanceReportAction(reportId);

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

export function useInsertAttendanceEntry(id: string) {
  const mutationKey = INSERT_ENTRY_MUTATION_KEY;
  const revalidateReport = useRevalidateFetchAttendanceReportQuery();
  const revalidateReports = useRevalidateFetchAttendanceReportsQuery();

  const mutationFn = async (payload: AttendanceEntrySchema) => {
    const result = await insertAttendanceEntryAction(payload);

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

export function useRevalidateFetchAttendanceReportsQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ATTEDANCE_REPORTS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export function useRevalidateFetchAttendanceReportQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.invalidateQueries({
        queryKey: getAttendanceReportQueryKey(id),
      });
    },
    [queryClient]
  );
}

export async function prefetchAttendanceReports(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ATTEDANCE_REPORTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getAttendanceReportsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchAttendanceReport(
  queryClient: QueryClient,
  id: string
) {
  await queryClient.prefetchQuery({
    queryKey: getAttendanceReportQueryKey(id),
    queryFn: async () => {
      const result = await getAttendanceReportByIdAction(id);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
