import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { AnnouncementFormValues } from "../../schema/announcement.schema";

export function createCreateAnnouncementService() {
  return new CreateAnnouncementService();
}

/**
 * @name CreateAnnouncementService
 * @description Service for creating announcement for a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateAnnouncementService();
 */
class CreateAnnouncementService {
  private namespace = "announcement.create";

  /**
   * @name createAnnouncement
   * @description Creates an announcement for a user
   */
  async createAnnouncement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: AnnouncementFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating announcement...");

    try {
      const { data: sectionData, error: sectionError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", data.slug)
        .eq("coordinator_id", userId)
        .single();

      if (sectionError) {
        if (sectionError.code === "PGRST116") {
          logger.warn(ctx, "Section not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: sectionError.code,
              message: sectionError.message,
              hint: sectionError.hint,
              details: sectionError.details,
            },
          },

          `Supabase error while fetching section ${sectionError.message}`
        );

        throw new Error("Failed to fetch section");
      }

      const { error } = await client.from("announcements").insert({
        title: data.title,
        content: data.content,
        program_batch_id: sectionData.id,
      });

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

          `Supabase error while creating announcement ${error.message}`
        );

        throw new Error("Failed to create announcement");
      }

      logger.info(ctx, "Announcement successfully created");

      return {
        success: true,
        message: "Announcement successfully created",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating announcement"
      );

      throw error;
    }
  }
}
