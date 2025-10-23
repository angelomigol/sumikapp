import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteWeeklyReportService() {
  return new DeleteWeeklyReportService();
}

/**
 * @name DeleteWeeklyReportService
 * @description Service for deleting weekly report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseClient();
 * const service = new DeleteWeeklyReportService();
 */
class DeleteWeeklyReportService {
  private namespace = "weekly_report.delete";

  /**
   * @name deleteReport
   * Delete a weekly report for a user.
   */
  async deleteReport(params: {
    server: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, server } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting weekly report...");

    try {
      const { error: reportError } = await server
        .from("weekly_reports")
        .delete()
        .eq("id", reportId);

      if (reportError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: reportError.code,
              message: reportError.message,
              hint: reportError.hint,
              details: reportError.details,
            },
          },

          "Supabase error while deleting weekly report"
        );

        const errorMessage =
          reportError instanceof Error
            ? reportError.message
            : "Failed to delete weekly report";

        throw new Error(`Database error: ${errorMessage}`);
      }

      return {
        success: true,
        message: "Successfully deleted weekly report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting weekly report"
      );

      throw error;
    }
  }
}
