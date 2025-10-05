import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

import { WeeklyReportFormValues } from "@/schemas/weekly-report/weekly-report.schema";

export function createCreateWeeklyReportService() {
  return new CreateWeeklyReportService();
}

/**
 * @name CreateWeeklyReportService
 * @description Service for inserting weekly report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseClient();
 * const service = new CreateWeeklyReportService();
 */
class CreateWeeklyReportService {
  private namespace = "weekly_report.create";

  /**
   * @name createWeeklyReport
   * Creates weekly report for a user.
   */
  async createWeeklyReport(params: {
    server: SupabaseClient<Database>;
    userId: string;
    data: WeeklyReportFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, server } = params;
    const ctx = {
      name: this.namespace,
      startDate: data.start_date,
      endDate: data.end_date,
      userId,
    };

    logger.info(ctx, "Creating weekly report...");

    try {
      const { data: internshipDetails, error: internshipError } = await server
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

      if (internshipError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: internshipError.code,
              message: internshipError.message,
              hint: internshipError.hint,
              details: internshipError.details,
            },
          },

          `Supabase error while fetching internship details: ${internshipError.message}`
        );

        throw new Error("Error fetching internship details");
      }

      const { data: reportData, error } = await server
        .from("weekly_reports")
        .insert({
          internship_id: internshipDetails.id,
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
        })
        .select()
        .single();

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

          `Supabase error while creating weekly report: ${error.message}`
        );

        throw new Error("Failed to create weekly report");
      }

      logger.info(ctx, "Successfully created weekly report");

      return {
        success: true,
        data: reportData,
        message: "Successfully created weekly report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error while creating attendance report"
      );

      throw error;
    }
  }
}
