import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesUpdate } from "@/utils/supabase/supabase.types";

import { AnnouncementFormValues } from "../../schema/announcement.schema";

export function createUpdateAnnouncementService() {
  return new UpdateAnnouncementService();
}

/**
 * @name UpdateAnnouncementService
 * @description Service for updating announcement for a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateAnnouncementService();
 */
class UpdateAnnouncementService {
  private namespace = "announcement.create";

  /**
   * @name updateAnnouncement
   * @description Updates an announcement for a user
   */
  async updateAnnouncement(params: {
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
      if (!data.id || data.id === undefined) {
        throw new Error("Announcement ID is missing");
      }

      const { error: sectionError } = await client
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

      const { error } = await client
        .from("announcements")
        .update({
          title: data.title,
          content: data.content,
        })
        .eq("id", data.id);

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

          `Supabase error while updating announcement ${error.message}`
        );

        throw new Error("Failed to update announcement");
      }

      logger.info(ctx, "Announcement successfully updated");

      return {
        success: true,
        message: "Announcement successfully updated",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating announcement"
      );

      throw error;
    }
  }
}
