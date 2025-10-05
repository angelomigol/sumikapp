import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createCreateActivityReportService() {
  return new CreateActivityReportService();
}

/**
 * @name CreateActivityReportService
 * @description Service for inserting accomplishment report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateActivityReportService();
 */
class CreateActivityReportService {
  private namespace = "activity_report.create";

  /**
   * @name createActivityReport
   * Creates activity report for a user.
   */
  async createActivityReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesInsert<"accomplishment_reports">;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      startDate: data.start_date,
      endDate: data.end_date,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating activity report for user...");

    try {
      const { data: internshipDetails, error: planError } = await client
        .from("internship_details")
        .select(
          `
          id,
          trainee_batch_enrollment!inner(
            trainee_id
          )
        `
        )
        .eq("trainee_batch_enrollment.trainee_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planError) {
        logger.error(
          {
            ...ctx,
            planError,
          },
          "Error fetching internship plans"
        );

        throw new Error("Error fetching internship plans");
      }

      const { data: reportData, error } = await client
        .from("accomplishment_reports")
        .insert({
          internship_id: internshipDetails.id,
          ...data,
        })
        .select()
        .single();

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error creating activity report"
        );

        throw new Error("Failed to create activity report");
      }

      logger.info(ctx, "Successfully created activity report");

      return {
        success: true,
        data: reportData,
        message: "Successfully created activity report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating activity report"
      );

      throw error;
    }
  }
}
