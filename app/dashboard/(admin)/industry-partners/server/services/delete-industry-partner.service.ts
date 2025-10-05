import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

const REQS_BUCKET = "moa-files";

export function createDeleteIndustryPartnerService() {
  return new DeleteIndustryPartnerService();
}

/**
 * @name DeleteIndustryPartnerService
 * @description Service for inserting industry partner to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteIndustryPartnerService();
 */
class DeleteIndustryPartnerService {
  private namespace = "industry_partner.delete";

  /**
   * @name deleteIndustryPartner
   * Deletes industry partner for a user.
   */
  async deleteIndustryPartner(params: {
    client: SupabaseClient<Database>;
    userId: string;
    partnerId: string;
  }) {
    const logger = await getLogger();

    const { userId, partnerId, client } = params;
    const ctx = {
      partnerId,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting industry partner...");

    try {
      const { data, error: fetchError } = await client
        .from("industry_partners")
        .select("moa_file_path")
        .eq("id", partnerId)
        .single();

      if (fetchError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: fetchError.code,
              message: fetchError.message,
              hint: fetchError.hint,
              details: fetchError.details,
            },
          },

          `Supabase error while fetching industry partner: ${fetchError.message}`
        );
        throw new Error("Failed to fetch industry partner");
      }

      if (data.moa_file_path) {
        const { error: storageError } = await client.storage
          .from(REQS_BUCKET)
          .remove([data.moa_file_path]);

        if (storageError) {
          logger.error(
            {
              ...ctx,
              supabaseError: {
                message: storageError.message,
              },
            },

            `Supabase error while deleting file from storage: ${storageError.message}`
          );

          throw new Error("Failed to delete MOA file from storage");
        }
      }

      const { error: partnerError } = await client
        .from("industry_partners")
        .delete()
        .eq("id", partnerId);

      if (partnerError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: partnerError.code,
              message: partnerError.message,
              hint: partnerError.hint,
              details: partnerError.details,
            },
          },

          `Supabase error while deleting industry partner: ${partnerError.message}`
        );
        throw new Error("Failed to delete industry partner");
      }

      logger.info(ctx, "Successfully deleted industry partner");

      return {
        success: true,
        message: "Successfully deleted industry partner",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error deleting industry partner"
      );
      throw error;
    }
  }
}
