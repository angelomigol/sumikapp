import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { EntryStatus } from "@/lib/constants";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createUpdateEntryStatusService() {
  return new UpdateEntryStatusService();
}

/**
 * @name UpdateEntryStatusService
 * @description Service for submitting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateEntryStatusService();
 */
class UpdateEntryStatusService {
  private namespace = "entry_status.update";

  /**
   * @name updateStatus
   * Update the status of the entry.
   */
  async updateStatus(params: {
    client: SupabaseClient<Database>;
    userId: string;
    entryId: string;
    status: EntryStatus;
  }) {
    const logger = await getLogger();

    const { userId, entryId, status, client } = params;
    const ctx = {
      userId,
      entryId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating entry status...");

    try {
      const { data: attData, error: attError } = await client
        .from("attendance_entries")
        .select("id")
        .eq("id", entryId)
        .single();

      if (attData && !attError) {
        const {} = await client
          .from("attendance_entries")
          .update({
            status: status,
          })
          .eq("id", entryId);

        logger.info(
          {
            ...ctx,
            reportType: "attendance",
          },
          "Successfully updated attendance entry"
        );

        if (attError) {
          logger.error(
            {
              ...ctx,
              attError,
            },
            "Error updating attendance entry status"
          );

          throw new Error("Failed to update attendance entry");
        }

        return {
          sucess: true,
          message: "Attendance entry successfully approved",
        };
      }

      const { data: actData, error: actError } = await client
        .from("accomplishment_entries")
        .select("id")
        .eq("id", entryId);

      if (actData && !actError) {
        const { error } = await client
          .from("accomplishment_entries")
          .update({
            status: status,
          })
          .eq("id", entryId);

        logger.info(
          {
            ...ctx,
            reportType: "activity",
          },
          "Successfully updated activity entry"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating activity entry status"
          );

          throw new Error("Failed to update activity entry");
        }

        return {
          success: true,
          message: "Activity entry successfully approved",
        };
      }
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching trainee report"
      );

      throw error;
    }
  }
}
