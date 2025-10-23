import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import {
  NormalizedWeeklyReport,
  WeeklyReport,
} from "@/schemas/weekly-report/weekly-report.schema";

export function createGetWeeklyReportsService() {
  return new GetWeeklyReportsService();
}

/**
 * @name GetWeeklyReportsService
 * @description Service for fetching weekly reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const server = getSupabaseServerClient();
 * const service = new GetWeeklyReportsService();
 */
class GetWeeklyReportsService {
  private namespace = "weekly_reports.fetch";

  /**
   * @name getWeeklyReports
   * Fetch all weekly reports of user.
   */
  async getWeeklyReports(params: {
    server: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, `Fetching all weekly reports of user: ${params.userId}`);

    try {
      const { data, error } = await params.server
        .from("weekly_reports")
        .select(
          `
          *,
          internship_details!inner(
            enrollment_id,
            trainee_batch_enrollment!inner(
              trainee_id,
              trainees!inner(
                id
              ),
              program_batch!inner(
                internship_code
              )
            )
          )
        `
        )
        .eq("internship_details.trainee_batch_enrollment.trainees.id", userId)
        .order("created_at", { ascending: false });

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
          "Supabase error while fetching weekly reports"
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch weekly reports";

        throw new Error(`Database Error: ${errorMessage}`);
      }

      logger.info(ctx, "Successfully fetched weekly reports");

      const mappedData: WeeklyReport[] = data.map((report) => ({
        id: report.id,
        created_at: report.created_at,
        start_date: report.start_date,
        end_date: report.end_date,
        period_total: report.period_total,
        status: report.status,
        submitted_at: report.submitted_at,
        internship_id: report.internship_id,
        supervisor_approved_at: report.supervisor_approved_at,
        internship_code:
          report.internship_details.trainee_batch_enrollment.program_batch
            .internship_code,
      }));

      return {
        success: true,
        message: `Successfully fetched ${data.length} weekly reports`,
        data: mappedData,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error while fetching weekly reports"
      );

      throw error;
    }
  }

  /**
   * @name getWeeklyReportsById
   * Fetch a specific weekly report of user by reportId.
   */
  async getWeeklyReportsById(params: {
    server: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();
    const { server, userId, reportId } = params;

    const ctx = {
      name: `${this.namespace}ById`,
      userId,
    };

    logger.info(ctx, "Fetching weekly report by reportId...");

    try {
      const { data, error } = await server
        .from("weekly_reports")
        .select(
          `
            *,
            internship_details!inner(
            company_name,
            enrollment_id,
            lunch_break_in_mins,
            trainee_batch_enrollment!inner(
              trainee_id,
              trainees!inner(
                id
              ),
              program_batch!inner(
                internship_code
              )
            )
          ),
          weekly_report_entries(
            *,
            weekly_report_entry_files(
              *
            )
          )
        `
        )
        .eq("id", reportId)
        .eq("internship_details.trainee_batch_enrollment.trainees.id", userId)
        .order("entry_date", {
          ascending: true,
          referencedTable: "weekly_report_entries",
        })
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(ctx, "Weekly report not found or access denied");
          return null;
        }

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

          "Supabase error while fetching weekly report"
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch weekly reports";

        throw new Error(`Database error: ${errorMessage}`);
      }

      logger.info(ctx, `Successfully fetched weekly report: ${reportId}`);

      const mappedData: NormalizedWeeklyReport = {
        created_at: data.created_at,
        end_date: data.end_date,
        id: data.id,
        internship_id: data.internship_id,
        period_total: data.period_total,
        start_date: data.start_date,
        status: data.status,
        submitted_at: data.submitted_at,
        supervisor_approved_at: data.supervisor_approved_at,
        internship_code:
          data.internship_details.trainee_batch_enrollment.program_batch
            .internship_code,
        company_name: data.internship_details.company_name,
        lunch_break: data.internship_details.lunch_break_in_mins,
        weekly_report_entries: data.weekly_report_entries.map((entry) => ({
          created_at: entry.created_at,
          daily_accomplishments: entry.daily_accomplishments,
          entry_date: entry.entry_date,
          id: entry.id,
          is_confirmed: entry.is_confirmed,
          report_id: entry.report_id,
          status: entry.status,
          time_in: entry.time_in,
          time_out: entry.time_out,
          total_hours: entry.total_hours,
          additional_notes: entry.additional_notes,
          feedback: entry.feedback,
        })),
        file_attachments: data.weekly_report_entries.flatMap((entry) =>
          entry.weekly_report_entry_files.map((file) => ({
            entry_id: file.entry_id,
            file_name: file.file_name,
            created_at: file.created_at,
            file_path: file.file_path,
            file_size: file.file_size,
            file_type: file.file_type,
          }))
        ),
      };

      return {
        success: true,
        message: "Successfully fetched weekly report",
        data: mappedData,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error while fetching weekly report by reportId"
      );

      throw error;
    }
  }
}
