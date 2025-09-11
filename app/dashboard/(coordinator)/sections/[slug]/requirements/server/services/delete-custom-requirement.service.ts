import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteCustomRequirementService() {
  return new DeleteCustomRequirementService();
}

/**
 * @name DeleteCustomRequirementService
 * @description Service for creating a custom requirment for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteCustomRequirementService();
 */
class DeleteCustomRequirementService {
  private namespace = "requirement_type.delete";

  /**
   * @name deleteCustomRequirement
   * Delete a custom requirement for a user.
   */
  async deleteCustomRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    requirementId: string;
  }) {
    const logger = await getLogger();

    const { userId, requirementId, client } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting custom requirement for a user...");

    try {
      const { data: requirement, error: fetchError } = await client
        .from("requirement_types")
        .select("id, name, created_by, is_predefined")
        .eq("id", requirementId)
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
          `Supabase error while fetching requirement type: ${fetchError.message}`
        );
        
        throw new Error("Failed to fetch requirement type");
      }

      if (!requirement) {
        logger.warn(ctx, "Requirement type not found");
        throw new Error("Requirement type not found");
      }

      // Check if it's a predefined requirement (shouldn't be deleted)
      if (requirement.is_predefined) {
        logger.warn(ctx, "Attempted to delete predefined requirement");
        throw new Error("Cannot delete predefined requirement types");
      }

      // Check if user has permission to delete (if they created it or are admin)
      if (requirement.created_by !== userId) {
        // You might want to add admin role check here
        logger.warn(
          ctx,
          "User does not have permission to delete this requirement"
        );
        throw new Error(
          "You do not have permission to delete this requirement"
        );
      }

      // Delete the requirement type
      const { error: deleteError } = await client
        .from("requirement_types")
        .delete()
        .eq("id", requirementId);

      if (deleteError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: deleteError.code,
              message: deleteError.message,
              hint: deleteError.hint,
              details: deleteError.details,
            },
          },
          `Supabase error while deleting requirement type ${deleteError.message}`
        );
        throw new Error("Failed to delete requirement type");
      }

      logger.info(
        {
          ...ctx,
          requirementName: requirement.name,
        },
        "Successfully deleted custom requirement"
      );

      return {
        success: true,
        message: "Custom requirement deleted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting custom requirement"
      );

      throw error;
    }
  }
}
