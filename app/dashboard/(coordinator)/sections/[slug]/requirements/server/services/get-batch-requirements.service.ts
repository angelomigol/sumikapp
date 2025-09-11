import "server-only";
import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetBatchRequirementsService() {
  return new GetBatchRequirementsService();
}

/**
 * @name GetBatchRequirementsService
 * @description Service for fetching batch requirements from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetBatchRequirementsService();
 */
class GetBatchRequirementsService {
  private namespace = "batch_requirements.fetch";

  /**
   * @name getBatchRequirements
   * Fetch all batch requirements for a user.
   */
  async getBatchRequirements(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
  }) {
    const logger = await getLogger();
    const { client, userId, sectionName } = params;

    const ctx = {
      userId,
      sectionName,
      name: `${this.namespace}`,
    };

    logger.info(ctx, "Fetching batch requirements...");

    try {
      const { data, error } = await client
        .from("batch_requirements_compliance_summary")
        .select("*")
        .eq("batch_title", sectionName)
        .eq("coordinator_id", userId)
        .order("batch_title", { ascending: false });

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching batch requirements"
        );

        throw new Error("Failed to fetch batch requirements");
      }

      logger.info(ctx, "Successfully fetched batch requirements");

      return data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching batch requirements"
      );

      throw error;
    }
  }
}
