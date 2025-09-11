import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteRequirementService() {
  return new DeleteRequirementService();
}
/**
 * @name DeleteRequirementService
 * @description Service for deleting requirement to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteRequirementService();
 */
class DeleteRequirementService {
  private namespace = "requirement.delete";

  /**
   * @name deleteRequirement
   * Delete requirement of user.
   */
  async deleteRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    requirementId: string;
  }) {
    const logger = await getLogger();

    const { client, requirementId, userId } = params;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Deleting document of user...");

    try {
      const { data: requirement, error: fetchError } = await client
        .from("requirements")
        .select("file_name, enrollment_id")
        .eq("id", requirementId)
        .single();

      if (fetchError || !requirement.enrollment_id) {
        logger.warn(
          {
            ...ctx,
            fetchError,
          },
          "Requirement not found"
        );

        throw new Error("Requirement not found");
      }

      const enrollmentId = requirement.enrollment_id;

      const { data: enrollment, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select("trainee_id")
        .eq("id", enrollmentId)
        .single();

      if (enrollmentError || enrollment?.trainee_id !== userId) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: enrollmentError?.code,
              message: enrollmentError?.message,
              hint: enrollmentError?.hint,
              details: enrollmentError?.details,
            },
          },

          `${enrollmentError?.message}` ||
            `Unauthorized to delete this requirement`
        );

        throw new Error("Unauthorized to delete this requirement");
      }

      const { error: deleteError } = await client
        .from("requirements")
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

          `Supabase error while deleting requirement: ${deleteError.message}`
        );

        throw new Error("Failed to delete requirement");
      }

      logger.info(
        {
          ...ctx,
          requirementId,
        },
        "Successfully deleted document"
      );

      return {
        success: true,
        message: "Document deleted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error during requirement delete"
      );
    }
  }
}
