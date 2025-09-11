import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { AnnouncementFormValues } from "@/app/dashboard/(coordinator)/sections/[slug]/announcements/schema/announcement.schema";
import {
  createAnnouncementAction,
  getAnnouncementsAction,
  updateAnnouncementAction,
} from "@/app/dashboard/(coordinator)/sections/[slug]/announcements/server/server-actions";

const ANNOUNCEMENTS_QUERY_KEY = (slug: string) =>
  ["supabase:announcements", slug] as const;
export const CREATE_ANNOUNCEMENT_MUTATION_KEY = [
  "create_announcement",
] as const;
export const UPDATE_ANNOUNCEMENT_MUTATION_KEY = [
  "update_announcement",
] as const;

export type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export function useFetchAnnouncements(slug: string) {
  return useQuery<Announcement[]>({
    queryKey: ANNOUNCEMENTS_QUERY_KEY(slug),
    queryFn: async () => {
      const result = await getAnnouncementsAction(slug);
      return result;
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAnnouncement(slug: string) {
  const mutationKey = CREATE_ANNOUNCEMENT_MUTATION_KEY;
  const revalidateAnnouncements = useRevalidateFetchAnnouncements();

  const mutationFn = async (payload: AnnouncementFormValues) => {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("slug", payload.slug);

    const result = await createAnnouncementAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateAnnouncements(slug);
    },
  });
}

export function useUpdateAnnouncement(slug: string) {
  const mutationKey = UPDATE_ANNOUNCEMENT_MUTATION_KEY;
  const revalidateAnnouncements = useRevalidateFetchAnnouncements();

  const mutationFn = async (payload: AnnouncementFormValues) => {
    const formData = new FormData();

    if (payload.id) {
      formData.append("id", payload.id);
    }
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("slug", payload.slug);

    const result = await updateAnnouncementAction(formData);

    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidateAnnouncements(slug);
    },
  });
}

export function useRevalidateFetchAnnouncements() {
  const queryClient = useQueryClient();

  return useCallback(
    (slug: string) => {
      queryClient.invalidateQueries({
        queryKey: ANNOUNCEMENTS_QUERY_KEY(slug),
      });
    },
    [queryClient]
  );
}

export async function prefetchAnnouncements(
  queryClient: QueryClient,
  slug: string
) {
  await queryClient.prefetchQuery({
    queryKey: ANNOUNCEMENTS_QUERY_KEY(slug),
    queryFn: async () => {
      const result = await getAnnouncementsAction(slug);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
