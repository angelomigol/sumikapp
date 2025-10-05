import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createSubmitWeeklyReportService() {
  return new SubmitWeeklyReportService();
}

/**
 * @name SubmitWeeklyReportService
 * @description Service for submitting weekly report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseClient();
 * const service = new SubmitWeeklyReportService();
 */
class SubmitWeeklyReportService {
  private namespace = "weekly_report.submit";

  /**
   * @name submitReport
   * Submit an weekly report for a user.
   */
  async submitReport(params: {
    server: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, server } = params;
    const ctx = {
      userId,
      reportId,
      name: this.namespace,
    };

    logger.info(ctx, "Submitting weekly report for user...");

    try {
      const { error } = await server
        .from("weekly_reports")
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

          "Supabase error while submitting weekly report"
        );
      }

      return {
        sucess: true,
        message: "Weekly report submitted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error submitting weekly report"
      );

      throw error;
    }
  }
}
