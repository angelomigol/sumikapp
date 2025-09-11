import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, Tables } from "@/utils/supabase/supabase.types";

export function createGetIndustryPartnersService() {
  return new GetIndustryPartnersService();
}

/**
 * @name GetIndustryPartnersService
 * @description Service for fetching industry partners from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const reportsService = new GetIndustryPartnersService();
 */
class GetIndustryPartnersService {
  private namespace = "industry_partners.fetch";

  /**
   * @name getIndustryPartners
   * Fetch all industry partners for a user.
   */
  async getIndustryPartners(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching industry partners for user...");

    try {
      const { data, error } = await params.client
        .from("industry_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: error.code,
              message: error.message,
              hint: error.hint,
              details: error.details,
            },
          },

          `Supabase error while fetching industry partners: ${error.message}`
        );

        throw new Error("Failed to fetch industry partners");
      }

      logger.info(ctx, "Successfully fetched industry partners");

      const mappedData: Tables<"industry_partners">[] = data.map((partner) => ({
        company_address: partner.company_address,
        company_name: partner.company_name,
        created_at: partner.created_at,
        date_of_signing: partner.date_of_signing,
        file_name: partner.file_name,
        id: partner.id,
        moa_file_path: partner.moa_file_path,
        nature_of_business: partner.nature_of_business,
      }));

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching industry partners"
      );

      throw error;
    }
  }
}
