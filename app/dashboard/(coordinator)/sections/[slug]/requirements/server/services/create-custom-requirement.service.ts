import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createCreateCustomRequirementService() {
  return new CreateCustomRequirementService();
}

/**
 * @name CreateCustomRequirementService
 * @description Service for creating a custom requirment for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateCustomRequirementService();
 */
class CreateCustomRequirementService {
  private namespace = "requirement_type.create";

  /**
   * @name createCustomRequirement
   * Create a custom requirement for a user.
   */
  async createCustomRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    slug?: string;
    data: TablesInsert<"requirement_types">;
  }) {
    const logger = await getLogger();

    const { userId, slug, data, client } = params;
    const ctx = {
      reuirement_name: data.name,
      created_by: userId,
      userId,
      name: this.namespace,
    };

    if (!slug) {
      throw new Error("Slug missing");
    }

    logger.info(ctx, "Creating custom requirement for user...");

    try {
      // Step 1: Insert new custom requirement
      const { data: reqData, error: reqError } = await client
        .from("requirement_types")
        .insert(data)
        .select()
        .single();

      if (reqError) {
        logger.error(
          {
            ...ctx,
            error: reqError,
          },
          "Error inserting custom requirement to requirement_types"
        );

        throw new Error("Failed to create custom requirement");
      }

      // Step 2: Fetch program_batch ID
      const { data: pbData, error: pbError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", slug)
        .eq("coordinator_id", userId)
        .limit(1)
        .single();

      if (pbError) {
        if (pbError.code === "PGRST116") {
          logger.warn(ctx, "Section not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            pbError,
          },
          "Error fetching section by slug"
        );

        throw new Error("Failed to fetch attendance report");
      }

      // Step 3: Insert the custom requirement to batch_requirements
      const { error: batchReqError } = await client
        .from("batch_requirements")
        .insert({
          program_batch_id: pbData.id,
          requirement_type_id: reqData.id,
        });

      if (batchReqError) {
        logger.error(
          {
            ...ctx,
            error: batchReqError,
          },
          "Error inserting custom requirement to batch_requirements"
        );

        throw new Error("Failed to create custom requirement");
      }

      logger.info(ctx, "Successfully created custom requirement");

      return {
        success: true,
        data: reqData,
        message: "Successfully created custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating custom requirement"
      );

      throw error;
    }
  }
}
