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
      status,
      name: this.namespace,
    };

    logger.info(ctx, "Updating entry status...");

    try {
      // First verify the entry exists
      const { data: weeklyEntData, error: weeklyEntError } = await client
        .from("weekly_report_entries")
        .select("id, status")
        .eq("id", entryId)
        .maybeSingle();

      if (weeklyEntError) {
        logger.error(
          {
            ...ctx,
            error: weeklyEntError,
          },
          "Error fetching weekly report entry"
        );

        throw new Error("Failed to find weekly report entry");
      }

      if (!weeklyEntData) {
        logger.error(
          {
            ...ctx,
          },
          "Weekly report entry not found"
        );

        throw new Error("Weekly report entry not found");
      }

      // Now update the entry status
      const { data: updateData, error: updateError } = await client
        .from("weekly_report_entries")
        .update({
          status: status,
        })
        .eq("id", entryId)
        .select()
        .maybeSingle();

      if (updateError) {
        logger.error(
          {
            ...ctx,
            error: updateError,
          },
          "Error updating weekly report entry status"
        );

        throw new Error("Failed to update weekly report entry status");
      }

      logger.info(
        {
          ...ctx,
          oldStatus: weeklyEntData.status,
          newStatus: updateData?.status,
        },
        "Successfully updated entry status"
      );

      return {
        success: true,
        message: "Entry status successfully updated",
        data: updateData,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating entry status"
      );

      throw error;
    }
  }
}
