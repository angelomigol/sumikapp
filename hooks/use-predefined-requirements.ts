import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Tables } from "@/utils/supabase/supabase.types";

import { PredefRequirementFormValues } from "@/app/dashboard/(admin)/predefined-requirements/schema/predef-requirement.schema";
import {
  createPredefRequirementAction,
  getPredefRequirementsAction,
  updatePredefRequirementAction,
} from "@/app/dashboard/(admin)/predefined-requirements/server/sever-actions";

const BUCKET_NAME = "requirement-templates" as const;
const PREDEF_REQUIREMENTS_QUERY_KEY = ["supabase:requirement_types"] as const;
const CREATE_MUTATION_KEY = ["supabase:requirement_types", "create"] as const;
const UPDATE_MUTATION_KEY = ["supabase:requirement_types", "update"] as const;

export function useFetchPredefRequirements() {
  return useQuery<Tables<"requirement_types">[]>({
    queryKey: [PREDEF_REQUIREMENTS_QUERY_KEY],
    queryFn: async () => {
      const result = await getPredefRequirementsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateTemplateUrl() {
  const client = useSupabase();

  const generateSignedUrl = useCallback(
    async (
      filePath: string,
      expiresIn: number = 3600
    ): Promise<string | null> => {
      if (!filePath) return null;

      try {
        const { data, error } = await client.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          console.error("Error generating signed URL:", error);
          return null;
        }

        return data?.signedUrl || null;
      } catch (error) {
        console.error("Error generating signed URL:", error);
        return null;
      }
    },
    [client]
  );

  return { generateSignedUrl };
}

export function useCreatePredefRequirement() {
  const mutationKey = CREATE_MUTATION_KEY;
  const revalidatePredefRequirements = useRevalidatePredefRequirements();

  const mutationFn = async (payload: PredefRequirementFormValues) => {
    const formData = new FormData();

    if (payload.description) {
      formData.append("description", payload.description);
    }
    formData.append("name", payload.name);
    formData.append(
      "allowedFileTypes",
      JSON.stringify(payload.allowedFileTypes)
    );
    formData.append("maxFileSizeBytes", payload.maxFileSizeBytes.toString());
    if (payload.template) {
      formData.append("template", payload.template);
    }

    const result = await createPredefRequirementAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidatePredefRequirements();
    },
  });
}

export function useUpdatePredefRequirement() {
  const mutationKey = UPDATE_MUTATION_KEY;
  const revalidatePredefRequirements = useRevalidatePredefRequirements();

  const mutationFn = async (payload: PredefRequirementFormValues) => {
    const formData = new FormData();

    if (payload.id) {
      formData.append("id", payload.id);
    }
    if (payload.description) {
      formData.append("description", payload.description);
    }
    formData.append("name", payload.name);
    formData.append(
      "allowedFileTypes",
      JSON.stringify(payload.allowedFileTypes)
    );
    formData.append("maxFileSizeBytes", payload.maxFileSizeBytes.toString());
    if (payload.template) {
      formData.append("template", payload.template);
    }

    const result = await updatePredefRequirementAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidatePredefRequirements();
    },
  });
}

export function useRevalidatePredefRequirements() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [PREDEF_REQUIREMENTS_QUERY_KEY],
    });
  }, [queryClient]);
}

export function prefetchPredefRequirements(
  queryClient: QueryClient,
  slug: string
) {
  return queryClient.prefetchQuery({
    queryKey: PREDEF_REQUIREMENTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getPredefRequirementsAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
