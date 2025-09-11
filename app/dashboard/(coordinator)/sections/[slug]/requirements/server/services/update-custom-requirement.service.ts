import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesUpdate } from "@/utils/supabase/supabase.types";

export function createUpdateCustomRequirementService() {
  return new UpdateCustomRequirementService();
}

/**
 * @name UpdateCustomRequirementService
 * @description Service for updating a custom requirement for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateCustomRequirementService();
 */
class UpdateCustomRequirementService {
  private namespace = "requirement_type.update";

  /**
   * @name updateCustomRequirement
   * Update a custom requirement for a user.
   */
  async updateCustomRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesUpdate<"requirement_types">;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      requirement_id: data.id,
      requirement_name: data.name,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating custom requirement...");

    try {
      if (!data.id || data.id === undefined) {
        throw new Error("Requirement ID is missing");
      }

      const { error: fetchError } = await client
        .from("requirement_types")
        .select("id, name, description, created_by")
        .eq("id", data.id)
        .eq("created_by", userId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          logger.warn(ctx, "Requirement not found or access denied");
          throw new Error(
            "Requirement not found or you don't have permission to edit it"
          );
        }

        logger.error(
          {
            ...ctx,
            error: fetchError,
          },

          "Error fetching requirement for update"
        );

        throw new Error("Failed to fetch requirement");
      }

      const { data: updatedReq, error: updateError } = await client
        .from("requirement_types")
        .update({
          name: data.name,
          description: data.description ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("created_by", userId)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            ...ctx,
            error: updateError,
          },

          "Error updating custom requirement"
        );

        throw new Error("Failed to update custom requirement");
      }

      logger.info(
        {
          ...ctx,
          updated_requirement: updatedReq,
        },
        "Successfully updated custom requirement"
      );

      return {
        success: true,
        data: updatedReq,
        message: "Successfully updated custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error updating custom requirement"
      );

      throw error;
    }
  }
}
