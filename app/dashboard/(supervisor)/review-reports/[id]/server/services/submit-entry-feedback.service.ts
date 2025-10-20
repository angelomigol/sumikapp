import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createSubmitEntryFeedbackService() {
  return new SubmitEntryFeedbackService();
}

/**
 * @name SubmitEntryFeedbackService
 * @description Service for submitting feedback to the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseServerClient();
 * const service = new SubmitEntryFeedbackService();
 */
class SubmitEntryFeedbackService {
  private namespace = "weekly_report_entry.submitFeedback";

  /**
   * @name submitFeedback
   * Submit a feedback for the entry.
   */
  async submitFeedback(params: {
    server: SupabaseClient<Database>;
    userId: string;
    entryId: string;
    feedback: string;
  }) {
    const logger = await getLogger();

    const { userId, entryId, feedback, server } = params;
    const ctx = {
      userId,
      entryId,
      feedback,
      name: this.namespace,
    };

    logger.info(ctx, "Submitting entry feedback...");

    try {
      // First verify the entry exists
      const { data: weeklyEntData, error: weeklyEntError } = await server
        .from("weekly_report_entries")
        .select("id")
        .eq("id", entryId)
        .single();

      if (weeklyEntError) {
        logger.error(
          {
            ...ctx,
            error: weeklyEntError,
          },
          "Error fetching weekly report entry"
        );

        throw new Error("Failed to fetch weekly report entry");
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

      // Now update the entry feedback
      const { data: updateData, error: updateError } = await server
        .from("weekly_report_entries")
        .update({
          feedback,
        })
        .eq("id", entryId)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            ...ctx,
            error: updateError,
          },
          "Error updating weekly report entry feedback"
        );

        throw new Error("Failed to update weekly report entry feedback");
      }

      logger.info(
        {
          ...ctx,
          feedback: updateData.feedback,
        },
        "Successfully submitted entry feedback"
      );

      return {
        success: true,
        message: "Entry feedback successfully submitted",
        data: updateData,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error submitting entry feedback"
      );

      throw error;
    }
  }
}
