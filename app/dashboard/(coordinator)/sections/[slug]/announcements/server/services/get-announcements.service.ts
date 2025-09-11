import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { Announcement } from "@/hooks/use-announcements";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetAnnouncementsService() {
  return new GetAnnouncementsService();
}

/**
 * @name GetAnnouncementsService
 * @description Service for fetching announcements from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetSectionTraineeReportsService();
 */
class GetAnnouncementsService {
  private namespace = "announcements.fetch";

  /**
   * @name getAnnouncements
   * @description Fetch announcements
   */
  async getAnnouncements(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
  }): Promise<Announcement[]> {
    const logger = await getLogger();

    const { userId, sectionName, client } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching section announcements...");

    try {
      const { data, error } = await client
        .from("announcements")
        .select(
          `
          id,
          title,
          content,
          program_batch!inner (
            title,
            coordinator_id
          ),
          created_at
        `
        )
        .eq("program_batch.title", sectionName)
        .eq("program_batch.coordinator_id", userId)
        .order("created_at", { ascending: false });

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

          `Supabase error while fetching section announcements: ${error.message}`
        );

        throw new Error(`Failed to fetch section announcements`);
      }

      logger.info(
        {
          ...ctx,
          count: data.length,
        },
        "Successfully fetched section announcements"
      );

      const mappedData: Announcement[] = data.map((a) => ({
        title: a.title,
        content: a.content,
        id: a.id,
        createdAt: a.created_at,
      }));

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error fetching section announcements"
      );

      throw error;
    }
  }
}
