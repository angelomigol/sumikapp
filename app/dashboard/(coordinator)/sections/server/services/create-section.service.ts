import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createCreateSectionService() {
  return new CreateSectionService();
}

/**
 * @name CreateSectionService
 * @description Service for creating section to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const sectionService = new CreateSectionService();
 */
class CreateSectionService {
  private namespace = "section.create";

  /**
   * @name createSection
   * Create a section for a user.
   */
  async createSection(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesInsert<"program_batch">;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      title: data.title,
      internshipCode: data.internship_code,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating section for user...");

    try {
      const { data: existing, error: existingError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", data.title)
        .eq("coordinator_id", userId)
        .maybeSingle();

      if (existingError) {
        logger.error(
          {
            ...ctx,
            error: existingError,
          },
          "Error checking for duplicate title"
        );
        throw new Error("Failed to verify existing section");
      }

      if (existing) {
        logger.warn(
          {
            ...ctx,
          },
          "Duplicate section title found"
        );

        return {
          success: false,
          message: "This section already exists.",
        };
      }

      const { data: sectionData, error } = await client
        .from("program_batch")
        .insert(data)
        .select()
        .single();

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error creating section"
        );

        throw new Error("Failed to create section");
      }

      logger.info(ctx, "Successfully created section");

      return {
        success: true,
        data: sectionData,
        message: "Successfully created section",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating section"
      );

      throw error;
    }
  }
}
