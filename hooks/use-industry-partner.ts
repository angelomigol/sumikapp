import { useCallback } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
      formData.append("companyAddress", payload.companyContactNumber);
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
      formData.append("companyAddress", payload.companyContactNumber);
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
