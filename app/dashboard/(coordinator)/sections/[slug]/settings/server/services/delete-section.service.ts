import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteSectionService() {
  return new DeleteSectionService();
}

/**
 * @name DeleteSectionService
 * @description Service for deleting section to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteSectionService();
 */
class DeleteSectionService {
  private namespace = "section.delete";

  /**
   * @name deleteSection
   * @description Delete a section for a user.
   */
  async deleteSection(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionId: string;
  }) {
    const logger = await getLogger();

    const { userId, sectionId, client } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting section...");

    try {
      const { error } = await client
        .from("program_batch")
        .delete()
        .eq("id", sectionId);

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
          `Supabase error while deleting section ${error.message}`
        );

        throw new Error("Failed to delete section");
      }

      logger.info(ctx, "Section successfully deleted");

      return {
        success: true,
        message: "Section successfully deleted",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting section"
      );

      throw error;
    }
  }
}
