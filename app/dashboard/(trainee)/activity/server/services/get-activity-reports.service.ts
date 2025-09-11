import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  AccomplishmentReport,
  NormalizedAccomplishmentReport,
} from "@/hooks/use-activity-reports";

import { getLogger } from "@/utils/logger";
import { Database, Tables } from "@/utils/supabase/supabase.types";

export function createGetActivityReportsService() {
  return new GetActivityReportsService();
}

/**
 * @name GetActivityReportsService
 * @description Service for fetching activity reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetActivityReportsService();
 */
class GetActivityReportsService {
  private namespace = "activity_reports.fetch";

  /**
   * @name getActivityReports
   * Fetch all activity reports for a user.
   */
  async getActivityReports(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching activity reports for user...");

    try {
      const { data, error } = await params.client
        .from("accomplishment_reports")
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
            error,
          },
          "Error fetching activity reports"
        );

        throw new Error("Failed to fetch activity reports");
      }

      logger.info(ctx, "Successfully fetched activity reports");

      const mappedData: AccomplishmentReport[] = data.map((report) => ({
        created_at: report.created_at,
        end_date: report.end_date,
        id: report.id,
        internship_id: report.internship_id,
        start_date: report.start_date,
        status: report.status,
        submitted_at: report.submitted_at,
        total_hours: report.total_hours,
        internship_code:
          report.internship_details.trainee_batch_enrollment.program_batch
            .internship_code,
      }));

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching activity reports"
      );

      throw error;
    }
  }

  /**
   * @name getActivityReportById
   * Fetch a specific activity report by ID for a user
   */
  async getActivityReportById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();
    const { client, userId, reportId } = params;

    const ctx = {
      userId,
      reportId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching activity report by ID...");

    try {
      const { data, error } = await client
        .from("accomplishment_reports")
        .select(
          `*,
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
          ),
          accomplishment_entries(*)`
        )
        .eq("id", reportId)
        .eq("internship_details.trainee_batch_enrollment.trainees.id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(ctx, "Accomplishment report not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching activity report by ID"
        );

        throw new Error("Failed to fetch activity report");
      }

      logger.info(ctx, "Successfully fetched activity report");

      const mappedData: NormalizedAccomplishmentReport = {
        created_at: data.created_at,
        end_date: data.end_date,
        id: data.id,
        start_date: data.start_date,
        status: data.status,
        submitted_at: data.submitted_at,
        total_hours: data.total_hours,
        internship_code:
          data.internship_details.trainee_batch_enrollment.program_batch
            .internship_code,
        supervisor_approved_at: data.supervisor_approved_at,
        accomplishment_entries: data.accomplishment_entries.map(
          (entry: Tables<"accomplishment_entries">) => ({
            id: entry.id,
            entry_date: entry.entry_date,
            report_id: entry.report_id,
            no_of_working_hours: entry.no_of_working_hours,
            daily_accomplishments: entry.daily_accomplishments,
            status: entry.status,
            is_confirmed: entry.is_confirmed,
            created_at: entry.created_at,
          })
        ),
      };

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching activity report by ID"
      );

      throw error;
    }
  }
}
