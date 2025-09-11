import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createSubmitInternshipPlacementService() {
  return new SubmitInternshipPlacementService();
}

/**
 * @name SubmitInternshipPlacementService
 * @description Service for submitting trainee internship placement from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new SubmitInternshipPlacementService();
 */
class SubmitInternshipPlacementService {
  private namespace = "internship_details.submit";

  /**
   * @name submitInternshipDetails
   * @description Submits internship placement
   */
  async submitInternshipDetails(params: {
    client: SupabaseClient<Database>;
    userId: string;
    internshipId: string;
  }) {
    const logger = await getLogger();
    const { userId, internshipId, client } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Submitting intership form...");

    try {
      const { error } = await client
        .from("internship_details")
        .update({
          status: "pending",
        })
        .eq("id", internshipId);

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

          `Supabase error while submitting internship form: ${error.message}`
        );

        throw new Error("Failed to submit internship form");
      }

      logger.info(
        {
          ...ctx,
        },

        "Successfully submitted internship form"
      );

      return {
        success: true,
        message: "Successfully submitted internship form",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error submitted internship form"
      );

      throw error;
    }
  }
}
