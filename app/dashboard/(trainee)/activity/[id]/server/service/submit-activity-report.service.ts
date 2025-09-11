import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createSubmitActivityReportService() {
  return new SubmitActivityReportService();
}

/**
 * @name SubmitActivityReportService
 * @description Service for submitting activity report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new SubmitActivityReportService();
 */
class SubmitActivityReportService {
  private namespace = "activity_report.submit";

  /**
   * @name submitReport
   * Submit an activity report for a user.
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

    logger.info(ctx, "Submitting activity report for user...");

    try {
      const { error } = await client
        .from("accomplishment_reports")
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
          "Supabase error while submitting activity report"
        );
      }

      return {
        sucess: true,
        message: "Activity report submitted successfully",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error submitting activity report"
      );

      throw error;
    }
  }
}
