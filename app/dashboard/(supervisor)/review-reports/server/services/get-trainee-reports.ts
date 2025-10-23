import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  NormalizedReviewReport,
  ReviewReports,
} from "@/hooks/use-review-reports";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetTraineeReportsService() {
  return new GetTraineeReportsService();
}

/**
 * @name GetTraineeReportsService
 * @description Service for fetching trainees' reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineeReportsService();
 */
class GetTraineeReportsService {
  private namespace = "trainee_reports.fetch";

  /**
   * @name getTraineeReports
   * @description Fetch reports by the trainees
   */
  async getTraineeReports(params: {
    server: SupabaseClient<Database>;
    userId: string;
  }): Promise<ReviewReports[]> {
    const logger = await getLogger();

    const userId = params.userId;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching trainee reports for user...");

    try {
      const { data, error } = await params.server
        .from("internship_details")
        .select(
          `
          weekly_reports (
            id,
            start_date,
            end_date,
            period_total,
            status,
            submitted_at,
            supervisor_approved_at,
            created_at
          ),
          trainee_batch_enrollment!inner (
            trainees!inner (
              id,
              users!inner (
                first_name,
                middle_name,
                last_name
              )
            )
          )
        `
        )
        .eq("supervisor_id", userId)
        .in("weekly_reports.status", ["approved", "pending", "rejected"]);

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

          `Supabase error while fetching trainee reports: ${error.message}`
        );

        throw new Error(`Failed to fetch trainee reports`);
      }

      logger.info(
        {
          ...ctx,
          count: data.length || 0,
        },
        "Successfully fetched supervisor trainees"
      );

      const result: ReviewReports[] = [];

      data.forEach((supervisor) => {
        const trainee = supervisor.trainee_batch_enrollment.trainees;

        supervisor.weekly_reports.forEach((report) => {
          result.push({
            trainee_id: trainee.id,
            first_name: trainee.users.first_name,
            middle_name: trainee.users.middle_name,
            last_name: trainee.users.last_name,
            report_id: report.id,
            start_date: report.start_date,
            end_date: report.end_date,
            total_hours: report.period_total?.toString() || "0",
            submitted_at: report.submitted_at || "",
            supervisor_approved_at: report.supervisor_approved_at,
            status: report.status,
          });
        });
      });

      result.sort((a, b) => {
        const dateA = new Date(a.submitted_at || 0);
        const dateB = new Date(b.submitted_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching trainee reports"
      );

      throw error;
    }
  }

  /**
   * @name getTraineeReportById
   * @description Fetch report of the trainee by ID
   */
  async getTraineeReportById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }): Promise<NormalizedReviewReport> {
    const logger = await getLogger();

    const { userId, reportId, client } = params;

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Invalid report ID");
    }

    const ctx = {
      userId,
      name: `${this.namespace}byId`,
      reportId,
    };

    logger.info(ctx, "Fetching trainee report by ID...");

    try {
      const { data: weeklyReportData, error: weeklyReportError } = await client
        .from("weekly_reports")
        .select(
          `
          id,
          start_date,
          end_date,
          period_total,
          submitted_at,
          supervisor_approved_at,
          status,
          internship_details!inner (
            supervisor_id,
            company_name,
            job_role,
            trainee_batch_enrollment!inner (
              program_batch!inner (
                internship_code
              ),
              trainees!inner (
                id,
                users!inner (
                  first_name,
                  middle_name,
                  last_name,
                  email
                )
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
        .eq("internship_details.supervisor_id", userId)
        .order("entry_date", {
          ascending: true,
          referencedTable: "weekly_report_entries",
        })
        .single();

      if (weeklyReportError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: weeklyReportError.code,
              message: weeklyReportError.message,
              hint: weeklyReportError.hint,
              details: weeklyReportError.details,
            },
          },

          `Supabase error while fetching report by ID from weekly_reports table: ${weeklyReportError.message}`
        );

        throw new Error(`Failed to fetch trainee report by ID: ${reportId}`);
      }

      const trainee =
        weeklyReportData.internship_details.trainee_batch_enrollment.trainees;

      logger.info(
        {
          ...ctx,
          reportType: "attendance",
        },
        "Successfully fetched attendance report by ID"
      );

      return {
        trainee_id: trainee.id,
        first_name: trainee.users.first_name,
        middle_name: trainee.users.middle_name,
        last_name: trainee.users.last_name,
        email: trainee.users.email,
        intern_code:
          weeklyReportData.internship_details.trainee_batch_enrollment
            .program_batch.internship_code,
        report_id: weeklyReportData.id,
        start_date: weeklyReportData.start_date,
        end_date: weeklyReportData.end_date,
        total_hours: weeklyReportData.period_total?.toString() || "0",
        submitted_at: weeklyReportData.submitted_at || "",
        supervisor_approved_at: weeklyReportData.supervisor_approved_at,
        status: weeklyReportData.status,
        entries: weeklyReportData.weekly_report_entries.map((entry) => ({
          id: entry.id,
          created_at: entry.created_at,
          entry_date: entry.entry_date,
          time_in: entry.time_in,
          time_out: entry.time_out,
          daily_accomplishments: entry.daily_accomplishments,
          total_hours: entry.total_hours,
          status: entry.status,
          is_confirmed: entry.is_confirmed,
          report_id: entry.report_id,
          additional_notes: entry.additional_notes,
          feedback: entry.feedback,
          files: entry.weekly_report_entry_files
            .filter((file) => file.entry_id === entry.id)
            .map((file) => ({
              entry_id: file.entry_id,
              file_name: file.file_name,
              created_at: file.created_at,
              file_path: file.file_path,
              file_size: file.file_size,
              file_type: file.file_type,
            })),
        })),
        company_name: weeklyReportData.internship_details.company_name,
        job_role: weeklyReportData.internship_details.job_role,
      };
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
