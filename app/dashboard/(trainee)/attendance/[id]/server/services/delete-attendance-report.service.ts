import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteAttendanceReportService() {
  return new DeleteAttendanceReportService();
}

/**
 * @name DeleteAttendanceReportService
 * @description Service for deleting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteAttendanceReportService();
 */
class DeleteAttendanceReportService {
  private namespace = "attendance_report.delete";

  /**
   * @name deleteReport
   * Delete an attendance report for a user.
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

    logger.info(ctx, "Deleting attendance report for user...");

    try {
      const { error: entriesError } = await client
        .from("attendance_entries")
        .delete()
        .eq("report_id", reportId);

      if (entriesError) {
        logger.error(
          {
            ...ctx,
            entriesError,
          },
          "Error deleting attendance entries"
        );

        const errorMessage =
          entriesError instanceof Error
            ? entriesError.message
            : "Failed to delete attendance entries";

        throw new Error(errorMessage);
      }

      const { error: reportError } = await client
        .from("attendance_reports")
        .delete()
        .eq("id", reportId);

      if (reportError) {
        logger.error(
          {
            ...ctx,
            entriesError,
          },
          "Error deleting attendance report"
        );

        const errorMessage =
          reportError instanceof Error
            ? reportError.message
            : "Failed to delete attendance report";

        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: "Successfully deleted attendance report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting attendance report"
      );

      throw error;
    }
  }
}
