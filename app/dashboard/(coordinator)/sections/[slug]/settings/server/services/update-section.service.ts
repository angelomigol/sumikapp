import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesUpdate } from "@/utils/supabase/supabase.types";

export function createUpdateSectionService() {
  return new UpdateSectionService();
}

/**
 * @name UpdateSectionService
 * @description Service for updating section details to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const sectionService = new UpdateSectionService();
 */
class UpdateSectionService {
  private namespace = "section.update";

  /**
   * @name updateSection
   * Update a section for a user.
   */
  async updateSection(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesUpdate<"program_batch">;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      title: data.title,
      internshipCode: data.internship_code,
      userId,
      name: this.namespace,
    };

    if (!data.id) {
      throw new Error("Section ID is required");
    }

    logger.info(ctx, "Updating section for user...");

    try {
      const { data: existingSection, error: fetchError } = await client
        .from("program_batch")
        .select("id, coordinator_id")
        .eq("id", data.id)
        .single();

      if (fetchError || !existingSection) {
        logger.error(
          {
            ...ctx,
            error: fetchError,
          },
          "Section not found"
        );
        throw new Error("Section not found");
      }

      if (existingSection.coordinator_id !== userId) {
        logger.error(
          {
            ...ctx,
            coordinatorId: existingSection.coordinator_id,
          },
          "User is not authorized to update this section"
        );
        throw new Error("You are not authorized to update this section");
      }

      const { data: sectionData, error } = await client
        .from("program_batch")
        .update(data)
        .eq("id", data.id)
        .select()
        .single();

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
          "Error updating section"
        );

        throw new Error(`Failed to update section: ${error.message}`);
      }

      logger.info(
        {
          ...ctx,
          sectionId: sectionData.id,
        },
        "Successfully updated section"
      );

      return {
        success: true,
        data: sectionData,
        message: "Successfully updated section",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating section"
      );

      throw error;
    }
  }
}
