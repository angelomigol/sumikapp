import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getDocumentSignedUrlAction } from "@/app/dashboard/(coordinator)/sections/[slug]/requirements/server/server-actions";

export const DOCUMENT_SIGNED_URL_QUERY_KEY = ["document", "signedUrl"] as const;

export function useFetchSignedUrl(filePath: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...DOCUMENT_SIGNED_URL_QUERY_KEY, filePath],
    queryFn: async () => {
      if (!filePath) {
        throw new Error("File path is required");
      }
      const result = await getDocumentSignedUrlAction(filePath);
      return result;
    },
    enabled: enabled && !!filePath,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
}

export function usePrefetchSignedUrl() {
  const queryClient = useQueryClient();

  return (filePath: string) => {
    queryClient.prefetchQuery({
      queryKey: [...DOCUMENT_SIGNED_URL_QUERY_KEY, filePath],
      queryFn: async () => {
        const result = await getDocumentSignedUrlAction(filePath);
        return result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
