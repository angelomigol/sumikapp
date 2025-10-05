import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";
import { Tables } from "@/utils/supabase/supabase.types";

import { IndustryPartnerFormValues } from "@/app/dashboard/(admin)/industry-partners/schema/industry-partner.schema";
import {
  createIndustryPartnerAction,
  getIndustryPartnersAction,
  updateIndustryPartnerAction,
} from "@/app/dashboard/(admin)/industry-partners/server/server-actions";

export const INDUSTRY_PARTNERS_QUERY_KEY = [
  "supabase:industry_partners",
] as const;
export const CREATE_PARTNER_MUTATION_KEY = ["create_industry_partner"] as const;
export const UPDATE_PARTNER_MUTATION_KEY = ["update_industry_partner"] as const;
const BUCKET_NAME = "moa-files";

export type IndustryPartner = Tables<"industry_partners">;
export type UpdateIndustryPartnerPayload = IndustryPartnerFormValues & {
  partnerId: string;
};

export function useFetchIndustryPartners() {
  return useQuery<IndustryPartner[]>({
    queryKey: INDUSTRY_PARTNERS_QUERY_KEY,
    queryFn: async () => {
      const result = await getIndustryPartnersAction(null);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateMoaUrl() {
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

export function useCreateIndustryPartner() {
  const mutationKey = CREATE_PARTNER_MUTATION_KEY;
  const revalidatePartners = useRevalidateFetchIndustryPartners();

  const mutationFn = async (payload: IndustryPartnerFormValues) => {
    const formData = new FormData();

    formData.append("companyName", payload.companyName);
    formData.append("dateOfSigning", payload.dateOfSigning.toISOString());
    if (payload.companyAddress) {
      formData.append("companyAddress", payload.companyAddress);
    }
    if (payload.companyContactNumber) {
      formData.append("companyContactNumber", payload.companyContactNumber);
    }
    if (payload.natureOfBusiness) {
      formData.append("natureOfBusiness", payload.natureOfBusiness);
    }
    if (
      payload.moaFile &&
      payload.moaFile instanceof File &&
      payload.moaFile.size > 0
    ) {
      formData.append("moaFile", payload.moaFile);
    }

    const result = await createIndustryPartnerAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidatePartners();
    },
  });
}

export function useUpdateIndustryPartner() {
  const mutationKey = UPDATE_PARTNER_MUTATION_KEY;
  const revalidatePartners = useRevalidateFetchIndustryPartners();

  const mutationFn = async (payload: UpdateIndustryPartnerPayload) => {
    const formData = new FormData();

    formData.append("partnerId", payload.partnerId);
    formData.append("companyName", payload.companyName);
    formData.append("dateOfSigning", payload.dateOfSigning.toISOString());

    if (payload.companyAddress) {
      formData.append("companyAddress", payload.companyAddress);
    }
    if (payload.companyContactNumber) {
      formData.append("companyContactNumber", payload.companyContactNumber);
    }
    if (payload.natureOfBusiness) {
      formData.append("natureOfBusiness", payload.natureOfBusiness);
    }
    if (
      payload.moaFile &&
      payload.moaFile instanceof File &&
      payload.moaFile.size > 0
    ) {
      formData.append("moaFile", payload.moaFile);
    }

    const result = await updateIndustryPartnerAction(formData);
    return result;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      revalidatePartners();
    },
  });
}

export function useRevalidateFetchIndustryPartners() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: INDUSTRY_PARTNERS_QUERY_KEY,
      }),
    [queryClient]
  );
}

export async function prefetchIndustryPartners(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: INDUSTRY_PARTNERS_QUERY_KEY,
    queryFn: async () => {
      const result = await getIndustryPartnersAction(null);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}
