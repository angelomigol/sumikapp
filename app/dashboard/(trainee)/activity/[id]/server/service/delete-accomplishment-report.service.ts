import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteAccomplishmentReportService() {
  return new DeleteAccomplishmentReportService();
}

/**
 * @name DeleteAccomplishmentReportService
 * @description Service for deleting Accomplishment report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteAccomplishmentReportService();
 */
class DeleteAccomplishmentReportService {
  private namespace = "accomplishment_report.delete";

  /**
   * @name deleteReport
   * Delete an accomplishment report for a user.
   */
  async deleteReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, client } = params;
    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting accomplishment report for user...");

    try {
      const { error: entriesError } = await client
        .from("accomplishment_entries")
        .delete()
        .eq("report_id", reportId);

      if (entriesError) {
        logger.error(
          {
            ...ctx,
            entriesError,
          },
          "Error deleting accomplishment entries"
        );

        const errorMessage =
          entriesError instanceof Error
            ? entriesError.message
            : "Failed to delete accomplishment entries";

        throw new Error(errorMessage);
      }

      const { error: reportError } = await client
        .from("accomplishment_reports")
        .delete()
        .eq("id", reportId);

      if (reportError) {
        logger.error(
          {
            ...ctx,
            entriesError,
          },
          "Error deleting accomplishment report"
        );

        const errorMessage =
          reportError instanceof Error
            ? reportError.message
            : "Failed to delete accomplishment report";

        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: "Successfully deleted accomplishment report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting accomplishment report"
      );

      throw error;
    }
  }
}
