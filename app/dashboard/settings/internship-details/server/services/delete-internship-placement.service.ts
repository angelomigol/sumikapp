import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteInternshipPlacementService() {
  return new DeleteInternshipPlacementService();
}

/**
 * @name DeleteInternshipPlacementService
 * @description Service for deleting trainee internship placement from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteInternshipPlacementService();
 */
class DeleteInternshipPlacementService {
  private namespace = "internship_details.delete";

  /**
   * @name deleteInternshipDetails
   * @description delete internship placement
   */
  async deleteInternshipDetails(params: {
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

    logger.info(ctx, "Deleting trainee intership placement...");

    try {
      const { error } = await client
        .from("internship_details")
        .delete()
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

          `Supabase error while deleting internship: ${error.message}`
        );

        throw new Error("Failed to delete internship placement");
      }

      logger.info(
        {
          ...ctx,
        },

        "Successfully deleted internship placement"
      );

      return {
        success: true,
        message: "Successfully deleted internship placement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting internship placement"
      );

      throw error;
    }
  }
}
