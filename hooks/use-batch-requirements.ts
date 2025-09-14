import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { DocumentStatus } from "@/lib/constants";

import { BatchRequirementsWithCompliance } from "@/schemas/batch-requirements-with-compliance";

import {
  approveDocumentAction,
  approveInternshipFormAction,
  createCustomRequirementAction,
  deleteCustomRequirementAction,
  getBatchRequirementsAction,
  getTraineeRequirementsAction,
  rejectDocumentAction,
  rejectInternshipFormAction,
  updateCustomRequirementAction,
} from "@/app/dashboard/(coordinator)/sections/[slug]/requirements/server/server-actions";
import { CustomRequirementFormValues } from "@/app/dashboard/(coordinator)/sections/schemas/requirement.schema";

const BATCH_REQUIREMENTS_QUERY_KEY = ["supabase:batch_requirements"] as const;
const TRAINEE_REQUIREMENTS_QUERY_KEY = [
  "supabase:trainee_requirements",
] as const;
const CREATE_MUTATION_KEY = ["supabase:requirement_types", "create"] as const;
const UPDATE_MUTATION_KEY = ["supabase:requirement_types", "update"] as const;
const INTERNSHIP_STATUS_MUTATION_KEY = [
  "supabase:internship_details",
  "update",
] as const;
const DELETE_MUTATION_KEY = ["supabase:requirement_types", "delete"] as const;
const UPDATE_DOCUMENT_MUTATION_KEY = ["supabase:requirement_types"] as const;

export type RequirementWithHistory = {
  id: string;
  requirement_name: string;
  requirement_description: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: string;
  submitted_at: string;
  status: DocumentStatus;
  history: {
    document_status: DocumentStatus;
    date: string;
  }[];
};

export interface TraineeWithRequirementsAndInternship
  extends TraineeWithRequirements {
  internship_details?: {
    id: string;
    company_name: string | null;
    contact_number: string | null;
    nature_of_business: string | null;
    address: string | null;
    job_role: string | null;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    daily_schedule: string | null;
    status: DocumentStatus;
    supervisor_email: string | null;
    created_at: string;
  } | null;
}

export type TraineeWithRequirements = {
  trainee_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  requirements: RequirementWithHistory[];
};

export function useFetchTraineeRequirements(slug: string) {
  return useQuery<TraineeWithRequirements[]>({
    queryKey: [...TRAINEE_REQUIREMENTS_QUERY_KEY, slug],
    queryFn: async () => {
      const result = await getTraineeRequirementsAction(slug);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchBatchRequirements(slug: string) {
  return useQuery<BatchRequirementsWithCompliance[]>({
    queryKey: [...BATCH_REQUIREMENTS_QUERY_KEY, slug],
    queryFn: async () => {
      const result = await getBatchRequirementsAction(slug);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCustomRequirement(slug: string) {
  const mutationKey = CREATE_MUTATION_KEY;
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  const mutationFn = async (payload: CustomRequirementFormValues) => {
    const formData = new FormData();

    if (payload.description) {
      formData.append("description", payload.description);
    }
    formData.append("name", payload.name);
    formData.append("slug", payload.slug || slug);

    const result = await createCustomRequirementAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateBatchRequirements(slug);
    },
  });
}

export function useUpdateCustomRequirement(slug: string) {
  const mutationKey = UPDATE_MUTATION_KEY;
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  const mutationFn = async (payload: CustomRequirementFormValues) => {
    const formData = new FormData();

    if (payload.id) {
      formData.append("id", payload.id);
    }
    if (payload.description) {
      formData.append("description", payload.description);
    }
    formData.append("name", payload.name);
    formData.append("slug", payload.slug || slug);

    const result = await updateCustomRequirementAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateBatchRequirements(slug);
    },
  });
}

export function useDeleteCustomRequirement(slug: string) {
  const mutationKey = DELETE_MUTATION_KEY;
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  const mutationFn = async (id: string) => {
    const result = await deleteCustomRequirementAction(id);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateBatchRequirements(slug);
    },
  });
}

export function useApproveTraineeSubmission(slug: string) {
  const revalidateTraineeRequirements = useRevalidateFetchTraineeRequirements();
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  return useMutation({
    mutationKey: [...UPDATE_DOCUMENT_MUTATION_KEY, "approve"],
    mutationFn: (documentId: string) => approveDocumentAction(documentId),
    onSuccess: () => {
      revalidateTraineeRequirements(slug);
      revalidateBatchRequirements(slug);
    },
  });
}

export function useRejectTraineeSubmission(slug: string) {
  const revalidateTraineeRequirements = useRevalidateFetchTraineeRequirements();
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  return useMutation({
    mutationKey: [...UPDATE_DOCUMENT_MUTATION_KEY, "reject"],
    mutationFn: (params: { documentId: string; feedback?: string }) =>
      rejectDocumentAction(params),
    onSuccess: () => {
      revalidateTraineeRequirements(slug);
      revalidateBatchRequirements(slug);
    },
  });
}

export function useApproveInternshipForm(slug: string) {
  const revalidateTraineeRequirements = useRevalidateFetchTraineeRequirements();
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  return useMutation({
    mutationKey: [...INTERNSHIP_STATUS_MUTATION_KEY, "approve"],
    mutationFn: (internshipId: string) =>
      approveInternshipFormAction(internshipId),
    onSuccess: () => {
      revalidateTraineeRequirements(slug);
      revalidateBatchRequirements(slug);
    },
  });
}

export function useRejectInternshipForm(slug: string) {
  const revalidateTraineeRequirements = useRevalidateFetchTraineeRequirements();
  const revalidateBatchRequirements = useRevalidateFetchBatchRequirements();

  return useMutation({
    mutationKey: [...INTERNSHIP_STATUS_MUTATION_KEY, "reject"],
    mutationFn: (params: { internshipId: string; feedback?: string }) =>
      rejectInternshipFormAction(params),
    onSuccess: () => {
      revalidateTraineeRequirements(slug);
      revalidateBatchRequirements(slug);
    },
  });
}

export function useRevalidateFetchTraineeRequirements() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.invalidateQueries({
        queryKey: [...TRAINEE_REQUIREMENTS_QUERY_KEY, slug],
      });
    },
    [queryClient]
  );
}

export function useRevalidateFetchBatchRequirements() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.invalidateQueries({
        queryKey: [...BATCH_REQUIREMENTS_QUERY_KEY, slug],
      });
    },
    [queryClient]
  );
}

export async function prefetchTraineeRequirements(
  queryClient: QueryClient,
  slug: string
) {
  await queryClient.prefetchQuery({
    queryKey: TRAINEE_REQUIREMENTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getTraineeRequirementsAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchBatchRequirements(
  queryClient: QueryClient,
  slug: string
) {
  return queryClient.prefetchQuery({
    queryKey: BATCH_REQUIREMENTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getBatchRequirementsAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
