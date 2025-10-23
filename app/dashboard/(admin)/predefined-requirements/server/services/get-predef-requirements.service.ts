import "server-only";
import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetPredefRequirementsService() {
  return new GetPredefRequirementsService();
}

/**
 * @name GetPredefRequirementsService
 * @description Service for fetching predefined requirements from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetPredefRequirementsService();
 */
class GetPredefRequirementsService {
  private namespace = "requirement_types.fetch";

  /**
   * @name getPredefRequirements
   * Fetch all predefined requirements for a user.
   */
  async getPredefRequirements(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();
    const { client, userId } = params;

    const ctx = {
      userId,
      name: `${this.namespace}`,
    };

    logger.info(ctx, "Fetching predefined requirements...");

    try {
      const { data, error } = await client
        .from("requirement_types")
        .select("*")
        .eq("is_predefined", true)
        .eq("created_by", userId)
        .order("name", { ascending: false });

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching predefined requirements"
        );

        throw new Error("Failed to fetch predefined requirements");
      }

      logger.info(ctx, "Successfully fetched predefined requirements");

      return data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching predefined requirements"
      );

      throw error;
    }
  }
}
