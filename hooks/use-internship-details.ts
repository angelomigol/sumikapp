import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DocumentStatus, OJTStatus } from "@/lib/constants";

import { InternshipDetailsFormValues } from "@/app/dashboard/settings/internship-details/schema/internship-details-form.schema";
import {
  createInternshipAction,
  getInternshipsAction,
  submitInternshipAction,
  updateInternshipAction,
} from "@/app/dashboard/settings/internship-details/server/server-actions";

export type InternshipDetails = {
  id: string;
  companyName: string;
  contactNumber: string;
  natureOfBusiness: string;
  companyAddress: string;
  job_role: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  dailySchedule: string[];
  supervisorEmail: string | null;
  status: DocumentStatus;
  lunchBreak: number;
  ojtStatus?: OJTStatus;
};

export const INTERNSHIPS_QUERY_KEY = ["supabase:intership_details"] as const;
export const CREATE_INTERNSHIP_MUTATION_KEY = ["create_internship"] as const;
export const UPDATE_INTERNSHIP_MUTATION_KEY = ["update_internship"] as const;
export const SUBMIT_INTERNSHIP_MUTATION_KEY = ["submit_internship"] as const;

export function useFetchInternships() {
  return useQuery<InternshipDetails[]>({
    queryKey: INTERNSHIPS_QUERY_KEY,
    queryFn: async () => {
      const result = await getInternshipsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateInternshipPlacement() {
  const mutationKey = CREATE_INTERNSHIP_MUTATION_KEY;
  const revalidateInternships = useRevalidateFetchInternships();

  const mutationFn = async (payload: InternshipDetailsFormValues) => {
    const formData = new FormData();

    formData.append("companyAddress", payload.companyAddress);
    formData.append("companyName", payload.companyName);
    formData.append("contactNumber", payload.contactNumber);
    formData.append("dailySchedule", JSON.stringify(payload.dailySchedule));
    formData.append("endDate", payload.endDate);
    formData.append("endTime", payload.endTime);
    formData.append("jobRole", payload.jobRole);
    formData.append("natureOfBusiness", payload.natureOfBusiness);
    formData.append("startDate", payload.startDate);
    formData.append("startTime", payload.startTime);
    formData.append("supervisorEmail", payload.supervisorEmail);
    formData.append("lunchBreak", payload.lunchBreak.toLocaleString());

    const result = await createInternshipAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateInternships();
    },
  });
}

export function useUpdateInternshipPlacement() {
  const mutationKey = UPDATE_INTERNSHIP_MUTATION_KEY;
  const revalidateInternships = useRevalidateFetchInternships();

  const mutationFn = async (payload: InternshipDetailsFormValues) => {
    const formData = new FormData();

    if (payload.id) {
      formData.append("id", payload.id);
    }
    formData.append("companyAddress", payload.companyAddress);
    formData.append("companyName", payload.companyName);
    formData.append("contactNumber", payload.contactNumber);
    formData.append("dailySchedule", JSON.stringify(payload.dailySchedule));
    formData.append("endDate", payload.endDate);
    formData.append("endTime", payload.endTime);
    formData.append("jobRole", payload.jobRole);
    formData.append("natureOfBusiness", payload.natureOfBusiness);
    formData.append("startDate", payload.startDate);
    formData.append("startTime", payload.startTime);
    formData.append("supervisorEmail", payload.supervisorEmail);
    formData.append("lunchBreak", payload.lunchBreak.toLocaleString());

    const result = await updateInternshipAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateInternships();
    },
  });
}

export function useSubmitInternshipForm() {
  const mutationKey = SUBMIT_INTERNSHIP_MUTATION_KEY;
  const revalidateInternships = useRevalidateFetchInternships();

  const mutationFn = async (internshipId: string) => {
    const result = await submitInternshipAction(internshipId);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateInternships();
    },
  });
}

export function useRevalidateFetchInternships() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: INTERNSHIPS_QUERY_KEY,
    });
  }, [queryClient]);
}

export async function prefetchInternships(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: INTERNSHIPS_QUERY_KEY,
    queryFn: async () => {
      const result = await getInternshipsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
