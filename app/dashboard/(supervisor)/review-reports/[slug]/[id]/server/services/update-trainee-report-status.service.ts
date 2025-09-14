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
        .from("attendance_reports")
        .select("id")
        .eq("id", reportId)
        .single();

      if (attData && !attError) {
        const { error } = await client
          .from("attendance_reports")
          .update({
            status: "approved",
            supervisor_approved_at: new Date().toISOString(),
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
            reportType: "attendance",
          },
          "Successfully approved attendance report"
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
          message: "Attendance report successfully approved",
        };
      }

      const { data: actData, error: actError } = await client
        .from("accomplishment_reports")
        .select("id")
        .eq("id", reportId);

      if (actData && !actError) {
        const { error } = await client
          .from("accomplishment_reports")
          .update({
            status: "approved",
            supervisor_approved_at: new Date().toISOString(),
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
            reportType: "activity",
          },
          "Successfully approved attendance report"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating trainee report status"
          );

          throw new Error("Failed to approve activity report");
        }

        return {
          sucess: true,
          message: "Activity report successfully approved",
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
        .from("attendance_reports")
        .select("id")
        .eq("id", reportId)
        .single();

      if (attData && !attError) {
        const { error } = await client
          .from("attendance_reports")
          .update({
            status: "rejected",
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
            reportType: "attendance",
          },
          "Successfully rejected attendance report"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating trainee report status"
          );

          throw new Error("Failed to reject attendance report ");
        }

        return {
          sucess: true,
          message: "Attendance report successfully rejected",
        };
      }

      const { data: actData, error: actError } = await client
        .from("accomplishment_reports")
        .select("*")
        .eq("id", reportId);

      if (actData && !actError) {
        const { error } = await client
          .from("accomplishment_reports")
          .update({
            status: "rejected",
          })
          .eq("id", reportId);

        logger.info(
          {
            ...ctx,
            reportType: "activity",
          },
          "Successfully reject attendance report"
        );

        if (error) {
          logger.error(
            {
              ...ctx,
              error,
            },
            "Error updating trainee report status"
          );

          throw new Error("Failed to reject activity report ");
        }

        return {
          sucess: true,
          message: "Activity report successfully rejected",
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
