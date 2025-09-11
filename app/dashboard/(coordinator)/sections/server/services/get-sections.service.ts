import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetSectionsService() {
  return new GetSectionsService();
}

/**
 * @name GetSectionsService
 * @description Service for fetching attendance reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const sectionService = new GetSectionsService();
 */
class GetSectionsService {
  private namespace = "sections.fetch";

  /**
   * @name getSections
   * Fetch all sections for a user.
   */
  async getSections(params: {
    browserClient: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching sections for user...");

    try {
      const { data, error } = await params.browserClient
        .from("program_batch")
        .select("*")
        .eq("coordinator_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching sections"
        );

        throw new Error("Failed to fetch sections");
      }

      logger.info(ctx, "Successfully fetched sections");

      return data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching sections"
      );

      throw error;
    }
  }

  /**
   * @name getSectionBySlug
   * Fetch a specific section by slug for a user
   */
  async getSectionBySlug(params: {
    client: SupabaseClient<Database>;
    userId: string;
    slug: string;
  }) {
    const logger = await getLogger();
    const { client, userId, slug } = params;

    const ctx = {
      userId,
      slug,
      name: `${this.namespace}BySlug`,
    };

    logger.info(ctx, "Fetching section by slug...");

    try {
      const { data, error } = await client
        .from("program_batch")
        .select("*")
        .eq("title", slug)
        .eq("coordinator_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(ctx, "Section not found or access denied");
          return null;
        }

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

          `Supabase error while fetching section ${error.message}`
        );

        throw new Error("Failed to fetch section");
      }

      logger.info(ctx, "Successfully fetched section");

      return data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching section by slug"
      );

      throw error;
    }
  }
}
