import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AttendanceReport,
  NormalizedAttendanceReport,
} from "@/hooks/use-attendance-reports";

import { getLogger } from "@/utils/logger";
import { Database, Tables } from "@/utils/supabase/supabase.types";

export function createGetAttendanceReportsService() {
  return new GetAttendanceReportsService();
}

/**
 * @name GetAttendanceReportsService
 * @description Service for fetching attendance reports from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const reportsService = new GetAttendanceReportsService();
 */
class GetAttendanceReportsService {
  private namespace = "attendance_reports.fetch";

  /**
   * @name getAttendanceReports
   * Fetch all attendance reports for a user.
   */
  async getAttendanceReports(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching attendance reports for user...");

    try {
      const { data, error } = await params.client
        .from("attendance_reports")
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
          "Error fetching attendance reports"
        );

        throw new Error("Failed to fetch attendance reports");
      }

      logger.info(ctx, "Successfully fetched attendance reports");

      const mappedData: AttendanceReport[] = data.map((report) => ({
        created_at: report.created_at,
        end_date: report.end_date,
        id: report.id,
        period_total: report.period_total,
        previous_total: report.previous_total,
        start_date: report.start_date,
        status: report.status,
        submitted_at: report.submitted_at,
        total_hours_served: report.total_hours_served,
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
        "Unexpected error fetching attendance reports"
      );

      throw error;
    }
  }

  /**
   * @name getAttendanceReportById
   * Fetch a specific attendance report by ID for a user
   */
  async getAttendanceReportById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    reportId: string;
  }) {
    const logger = await getLogger();
    const { client, userId, reportId } = params;

    const ctx = {
      userId,
      reportId,
      name: `${this.namespace}ById`,
    };

    logger.info(ctx, "Fetching attendance report by ID...");

    try {
      const { data, error } = await client
        .from("attendance_reports")
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
          attendance_entries(*)`
        )
        .eq("id", reportId)
        .eq("internship_details.trainee_batch_enrollment.trainees.id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(ctx, "Attendance report not found or access denied");
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
          "Supabase error while fetching attendance report"
        );

        throw new Error(`Supabase error: ${error.message}`);
      }

      logger.info(ctx, "Successfully fetched attendance report");

      const mappedData: NormalizedAttendanceReport = {
        created_at: data.created_at,
        end_date: data.end_date,
        id: data.id,
        period_total: data.period_total,
        previous_total: data.previous_total,
        start_date: data.start_date,
        status: data.status,
        submitted_at: data.submitted_at,
        total_hours_served: data.total_hours_served,
        internship_code:
          data.internship_details.trainee_batch_enrollment.program_batch
            .internship_code,
        supervisor_approved_at: data.supervisor_approved_at,
        attendance_entries: data.attendance_entries.map(
          (entry: Tables<"attendance_entries">) => ({
            id: entry.id,
            entry_date: entry.entry_date,
            time_in: entry.time_in,
            time_out: entry.time_out,
            report_id: entry.report_id,
            total_hours: entry.total_hours,
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
        "Unexpected error fetching attendance report by ID"
      );

      throw error;
    }
  }
}
