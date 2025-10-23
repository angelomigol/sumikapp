import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import z from "zod";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import {
  WeeklyReportFormValues,
  WeeklyReportServerPayload,
} from "@/schemas/weekly-report/weekly-report.schema";

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

  private isValidDateString(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }

  /**
   * @name createWeeklyReport
   * Creates weekly report for a user.
   */
  async createWeeklyReport(params: {
    server: SupabaseClient<Database>;
    userId: string;
    data: WeeklyReportServerPayload;
  }) {
    const logger = await getLogger();

    const { userId, data, server } = params;

    if (!this.isValidDateString(data.start_date)) {
      throw new Error(
        `Invalid start_date format: "${data.start_date}". Expected YYYY-MM-DD`
      );
    }

    if (!this.isValidDateString(data.end_date)) {
      throw new Error(
        `Invalid end_date format: "${data.end_date}". Expected YYYY-MM-DD`
      );
    }

    const ctx = {
      name: this.namespace,
      userId,
      startDate: data.start_date,
      endDate: data.end_date,
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

      if (internshipError || !internshipDetails) {
        logger.error(
          {
            ...ctx,
            supabaseError: internshipError.code,
          },

          `Supabase error while fetching internship details: ${internshipError.message}`
        );

        return {
          success: false,
          message: "Unable to fetch approved internship details.",
        };
      }

      const { data: reportData, error } = await server
        .from("weekly_reports")
        .insert({
          internship_id: internshipDetails.id,
          start_date: data.start_date,
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
