import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createSubmitAttendanceReportService() {
  return new SubmitAttendanceReportService();
}

/**
 * @name SubmitAttendanceReportService
 * @description Service for submitting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new SubmitAttendanceReportService();
 */
class SubmitAttendanceReportService {
  private namespace = "attendance_report.submit";

  /**
   * @name submitReport
   * Submit an attendance report for a user.
   */
  async submitReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, client } = params;
    const ctx = {
      userId,
      reportId,
      name: this.namespace,
    };

    logger.info(ctx, "Submitting attendance report for user...");

    try {
      const { error } = await client
        .from("attendance_reports")
        .update({
          status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", reportId);

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
          "Supabase error while submitting attendance report"
        );
      }

      return {
        sucess: true,
        message: "Attendance report submitted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error submitting attendance report"
      );

      throw error;
    }
  }
}
