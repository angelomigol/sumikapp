import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteAnnouncementService() {
  return new DeleteAnnouncementService();
}

/**
 * @name DeleteAnnouncementService
 * @description Service for deleting announcement from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteAnnouncementService();
 */
class DeleteAnnouncementService {
  private namespace = "announcement.delete";

  /**
   * @name deleteAnnouncement
   * @description Deletes an announcement for a user
   */
  async deleteAnnouncement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    announcementId: string;
  }) {
    const logger = await getLogger();

    const { userId, announcementId, client } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting announcement...");

    try {
      const { error } = await client
        .from("announcements")
        .delete()
        .eq("id", announcementId);

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

          `Supabase error while deleting announcement ${error.message}`
        );

        throw new Error("Failed to delete announcement");
      }

      logger.info(ctx, "Announcement successfully deleted");

      return {
        success: true,
        message: "Announcement successfully deleted",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting announcement"
      );

      throw error;
    }
  }
}
