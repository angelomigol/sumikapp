import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeletePredefRequirementService() {
  return new DeletePredefRequirementService();
}

/**
 * @name DeletePredefRequirementService
 * @description Service for creating a predefined requirment for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeletePredefRequirementService();
 */
class DeletePredefRequirementService {
  private namespace = "requirement_type.delete";
  private bucketName = "requirement-templates";

  /**
   * @name deletePredefRequirement
   * Delete a predefined requirement for a user.
   */
  async deletePredefRequirement(params: {
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

    logger.info(ctx, "Deleting predefined requirement for a user...");

    try {
      const { data: requirement, error: fetchError } = await client
        .from("requirement_types")
        .select("id, name, template_file_path")
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

      if (requirement.template_file_path) {
        await client.storage
          .from(this.bucketName)
          .remove([requirement.template_file_path]);
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
        "Successfully deleted predefined requirement"
      );

      return {
        success: true,
        message: "predefined requirement deleted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting predefined requirement"
      );

      throw error;
    }
  }
}
