import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

export function createCreateAttendanceReportService() {
  return new CreateAttendanceReportService();
}

/**
 * @name CreateAttendanceReportService
 * @description Service for inserting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateAttendanceReportService();
 */
class CreateAttendanceReportService {
  private namespace = "attendance_report.create";

  /**
   * @name createAttendanceReport
   * Creates attendance report for a user.
   */
  async createAttendanceReport(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesInsert<"attendance_reports">;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      startDate: data.start_date,
      endDate: data.end_date,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating attendance report for user...");

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
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: planError.code,
              message: planError.message,
              hint: planError.hint,
              details: planError.details,
            },
          },

          `Supabase error while fetching internship plans: ${planError.message}`
        );

        throw new Error("Error fetching internship plans");
      }

      const { data: prevReportData, error: prevReportError } = await client
        .from("attendance_reports")
        .select("period_total")
        .eq("internship_id", internshipDetails.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevReportError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: prevReportError.code,
              message: prevReportError.message,
              hint: prevReportError.hint,
              details: prevReportError.details,
            },
          },

          `Supabase error while fetching previous attendance report: ${prevReportError.message}`
        );

        throw new Error("Error fetching previous attendance report");
      }

      const { data: reportData, error } = await client
        .from("attendance_reports")
        .insert({
          previous_total: prevReportData?.period_total ?? 0,
          internship_id: internshipDetails.id,
          ...data,
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
          
          `Supabase error while creating attendance report: ${error.message}`
        );

        throw new Error("Failed to create attendance report");
      }

      logger.info(ctx, "Successfully created attendance report");

      return {
        success: true,
        data: reportData,
        message: "Successfully created attendance report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating attendance report"
      );

      throw error;
    }
  }
}
