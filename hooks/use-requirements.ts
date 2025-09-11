import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DocumentStatus } from "@/lib/constants";

import {
  deleteRequirementAction,
  getRequirementsAction,
  submitRequirementAction,
  uploadRequirementAction,
} from "@/app/dashboard/(trainee)/requirements/server/server-actions";

export type RequirementWithHistory = {
  id: string;
  requirement_name: string;
  requirement_description: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  submitted_at: string | null;
  status: DocumentStatus;
  history: {
    id: string;
    document_id: string;
    status: DocumentStatus;
    title: string;
    description: string;
    date: Date;
  }[];
};

export const REQUIREMENTS_QUERY_KEY = ["supabase:requirements"] as const;

export function useFetchRequirements() {
  return useQuery<RequirementWithHistory[]>({
    queryKey: REQUIREMENTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getRequirementsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadRequirement() {
  const revalidateRequirements = useRevalidateFetchRequirements();

  return useMutation({
    mutationFn: async (data: { file: File; requirement_name: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("requirement_name", data.requirement_name);

      return await uploadRequirementAction(formData);
    },
    onSuccess: () => {
      revalidateRequirements();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
}

export function useSubmitRequirement() {
  const revalidateRequirements = useRevalidateFetchRequirements();

  return useMutation({
    mutationFn: async (requirementId: string) => {
      return await submitRequirementAction(requirementId);
    },
    onSuccess: () => {
      revalidateRequirements();
    },
    onError: (error) => {
      console.error("Submit failed:", error);
    },
  });
}

export function useDeleteRequirement() {
  const revalidateRequirements = useRevalidateFetchRequirements();

  return useMutation({
    mutationFn: async (requirementId: string) => {
      return await deleteRequirementAction(requirementId);
    },
    onSuccess: () => {
      revalidateRequirements();
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
}

export function useRevalidateFetchRequirements() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: REQUIREMENTS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export async function prefetchRequirements(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: REQUIREMENTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getRequirementsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
