import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { InternshipCode } from "@/lib/constants";

import { Tables } from "@/utils/supabase/supabase.types";

import { updateSectionAction } from "@/app/dashboard/(coordinator)/sections/[slug]/settings/server/server-actions";
import { SectionFormValues } from "@/app/dashboard/(coordinator)/sections/schemas/section.schema";
import {
  createSectionAction,
  getSectionBySlugAction,
  getSectionsAction,
} from "@/app/dashboard/(coordinator)/sections/server/server-actions";

export type Section = Tables<"program_batch">;

export const SECTIONS_QUERY_KEY = ["supabase:program_batches"] as const;
export const SECTION_QUERY_KEY = (slug: string) =>
  ["supabase:program_batch", slug] as const;
export const CREATE_MUTATION_KEY = ["create-section"] as const;
export const UPDATE_MUTATION_KEY = ["update-section"] as const;

export function useFetchSections() {
  return useQuery<Section[]>({
    queryKey: SECTIONS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSectionsAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFetchSection(
  slug: string,
  partialSection?: {
    id: string | null;
    start_date: string | null;
    end_date: string | null;
    coordinator_id: string | null;
    created_at: string | null;
    description: string | null;
    internship_code: InternshipCode | null;
    required_hours: number | null;
    title: string | null;
  }
) {
  const initialData =
    partialSection?.id &&
    partialSection.start_date &&
    partialSection.end_date &&
    partialSection.coordinator_id &&
    partialSection.created_at &&
    partialSection.internship_code &&
    partialSection.required_hours !== null &&
    partialSection.title
      ? {
          id: partialSection.id,
          start_date: partialSection.start_date,
          end_date: partialSection.end_date,
          coordinator_id: partialSection.coordinator_id,
          created_at: partialSection.created_at,
          description: partialSection.description ?? null,
          internship_code: partialSection.internship_code,
          required_hours: partialSection.required_hours,
          title: partialSection.title,
        }
      : undefined;

  return useQuery<Section>({
    queryKey: SECTION_QUERY_KEY(slug),
    queryFn: async () => await getSectionBySlugAction(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData,
  });
}

export function useCreateSection() {
  const mutationKey = CREATE_MUTATION_KEY;
  const revalidateSection = useRevalidateFetchSections();

  const mutationFn = async (payload: SectionFormValues) => {
    const result = await createSectionAction(payload);

    return result;
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      revalidateSection();
    },
  });
}

export function useUpdateSection(slug: string) {
  const mutationKey = UPDATE_MUTATION_KEY;
  const revalidateSection = useRevalidateFetchSection();

  const mutationFn = async (data: SectionFormValues) => {
    const result = await updateSectionAction(data);

    return result;
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      revalidateSection(slug);
    },
  });
}

export function useRevalidateFetchSections() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: SECTIONS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export function useRevalidateFetchSection() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.invalidateQueries({
        queryKey: SECTION_QUERY_KEY(slug),
      });
    },
    [queryClient]
  );
}

export async function prefetchSections(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: SECTIONS_QUERY_KEY,
    queryFn: async () => {
      const result = await getSectionsAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchSection(queryClient: QueryClient, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: SECTION_QUERY_KEY(slug),
    queryFn: async () => {
      const result = await getSectionBySlugAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
