import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createUpdateTraineeReportService() {
  return new UpdateTraineeReportService();
}

/**
 * @name UpdateTraineeReportService
 * @description Service for submitting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateTraineeReportService();
 */
class UpdateTraineeReportService {
  private namespace = "trainee_report.update";

  /**
   * @name approveReport
   * Approve the report of the trainee.
   */
  async approveReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, client } = params;
    const ctx = {
      userId,
      reportId,
      name: `${this.namespace}.approve`,
    };

    logger.info(ctx, "Approving trainee report...");

    try {
      const { data: attData, error: attError } = await client
        .from("weekly_reports")
        .select("id")
        .eq("id", reportId)
        .single();

      if (attData && !attError) {
        const { error } = await client
          .from("weekly_reports")
          .update({
            status: "approved",
            supervisor_approved_at: new Date().toISOString(),
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
          },
          "Successfully approved weekly report"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating trainee report status"
          );

          throw new Error("Failed to approve attendance report");
        }

        return {
          sucess: true,
          message: "Weekly report successfully approved",
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

  /**
   * @name rejectReport
   * Reject the report of the trainee.
   */
  async rejectReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();

    const { userId, reportId, client } = params;
    const ctx = {
      userId,
      reportId,
      name: `${this.namespace}.reject`,
    };

    logger.info(ctx, "Rejecting trainee report...");

    try {
      const { data: attData, error: attError } = await client
        .from("weekly_reports")
        .select("id")
        .eq("id", reportId)
        .single();

      if (attData && !attError) {
        const { error } = await client
          .from("weekly_reports")
          .update({
            status: "rejected",
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
          },
          "Successfully rejected weekly report"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating trainee report status"
          );

          throw new Error("Failed to reject weekly report ");
        }

        return {
          sucess: true,
          message: "Weekly report successfully rejected",
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
