import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  NormalizedReviewReport,
  ReviewReports,
} from "@/hooks/use-review-reports";

import { getLogger } from "@/utils/logger";
import { Database, Tables } from "@/utils/supabase/supabase.types";

export function createGetSectionTraineeReportsService() {
  return new GetSectionTraineeReportsService();
}

/**
 * @name GetSectionTraineeReportsService
 * @description Service for fetching trainees from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetSectionTraineeReportsService();
 */
class GetSectionTraineeReportsService {
  private namespace = "section_trainee_reports.fetch";

  /**
   * @name getSectionTraineeReports
   * @description Fetch reports by the trainees
   */
  async getSectionTraineeReports(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
  }): Promise<ReviewReports[]> {
    const logger = await getLogger();

    const { userId, sectionName, client } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching section trainee reports for user...");

    try {
      const { data, error } = await client
        .from("internship_details")
        .select(
          `
        attendance_reports (
          id,
          start_date,
          end_date,
          period_total,
          total_hours_served,
          previous_total,
          submitted_at,
          created_at,
          status
        ),
        accomplishment_reports (
          id,
          start_date,
          end_date,
          total_hours,
          submitted_at,
          created_at,
          status
        ),
        trainee_batch_enrollment!inner (
          trainees!inner (
            id,
            users!inner (
              first_name,
              middle_name,
              last_name,
              email
            )
          ),
          program_batch!inner (
            title,
            coordinator_id
          )
        )
      `
        )
        .eq("trainee_batch_enrollment.program_batch.title", sectionName)
        .eq("trainee_batch_enrollment.program_batch.coordinator_id", userId)
        .in("attendance_reports.status", ["approved", "pending", "rejected"])
        .in("accomplishment_reports.status", [
          "approved",
          "pending",
          "rejected",
        ]);

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching supervisor trainees"
        );

        throw new Error(`Failed to fetch supervisor trainees`);
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

        supervisor.attendance_reports.forEach((report) => {
          result.push({
            trainee_id: trainee.id,
            first_name: trainee.users.first_name,
            middle_name: trainee.users.middle_name,
            last_name: trainee.users.last_name,
            report_type: "attendance",
            report_id: report.id,
            start_date: report.start_date,
            end_date: report.end_date,
            total_hours: report.period_total?.toString() || "0",
            submitted_at: report.submitted_at || "",
            status: report.status,
          });
        });
      });

      data.forEach((supervisor) => {
        const trainee = supervisor.trainee_batch_enrollment.trainees;

        supervisor.accomplishment_reports.forEach((report) => {
          result.push({
            trainee_id: trainee.id,
            first_name: trainee.users.first_name,
            middle_name: trainee.users.middle_name,
            last_name: trainee.users.last_name,
            report_type: "accomplishment",
            report_id: report.id,
            start_date: report.start_date,
            end_date: report.end_date,
            total_hours: report.total_hours?.toString() || "0",
            submitted_at: report.submitted_at || "",
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
   * @description Fetch report of the trainees by ID
   */
  async getSectionTraineeReportById(params: {
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

    logger.info(ctx, "Fetching section trainee report by ID...");

    try {
      const { data: attendanceData, error: attendanceError } = await client
        .from("attendance_reports")
        .select(
          `
            id,
            start_date,
            end_date,
            period_total,
            submitted_at,
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
            attendance_entries (*)
          `
        )
        .eq("id", reportId)
        .eq(
          "internship_details.trainee_batch_enrollment.program_batch.coordinator_id",
          userId
        )
        .single();

      if (attendanceData && !attendanceError) {
        const trainee =
          attendanceData.internship_details.trainee_batch_enrollment.trainees;

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
          report_type: "attendance",
          intern_code:
            attendanceData.internship_details.trainee_batch_enrollment
              .program_batch.internship_code,
          report_id: attendanceData.id,
          start_date: attendanceData.start_date,
          end_date: attendanceData.end_date,
          total_hours: attendanceData.period_total?.toString() || "0",
          submitted_at: attendanceData.submitted_at || "",
          status: attendanceData.status,
          entries: attendanceData.attendance_entries.map(
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
          company_name: attendanceData.internship_details.company_name,
          job_role: attendanceData.internship_details.job_role,
        };
      }

      const { data: accomplishmentData, error: accomplishmentError } =
        await client
          .from("accomplishment_reports")
          .select(
            `
            *,
            internship_details!inner (
              supervisor_id,
              company_name,
              job_role,
              trainee_batch_enrollment!inner (
                program_batch!inner (
                  internship_code
                ),
                trainee:trainee_id (
                  id,
                  user:users (
                    first_name,
                    middle_name,
                    last_name,
                    email
                  )
                )
              )
            ),
            accomplishment_entries (*)
          `
          )
          .eq("id", reportId)
          .eq(
            "internship_details.trainee_batch_enrollment.program_batch.coordinator_id",
            userId
          )
          .single();

      if (accomplishmentData && !accomplishmentError) {
        const trainee =
          accomplishmentData.internship_details.trainee_batch_enrollment
            .trainee;

        logger.info(
          {
            ...ctx,
            reportType: "activity",
          },
          "Successfully fetched activty report by ID"
        );

        return {
          trainee_id: trainee.id,
          first_name: trainee.user.first_name,
          middle_name: trainee.user.middle_name,
          last_name: trainee.user.last_name,
          email: trainee.user.email,
          report_type: "accomplishment",
          intern_code:
            accomplishmentData.internship_details.trainee_batch_enrollment
              .program_batch.internship_code,
          report_id: accomplishmentData.id,
          start_date: accomplishmentData.start_date,
          end_date: accomplishmentData.end_date,
          total_hours: accomplishmentData.total_hours?.toString() || "0",
          submitted_at: accomplishmentData.submitted_at || "",
          status: accomplishmentData.status,
          supervisor_approved_at: accomplishmentData.supervisor_approved_at,
          entries: accomplishmentData.accomplishment_entries.map(
            (entry: Tables<"accomplishment_entries">) => ({
              created_at: entry.created_at,
              daily_accomplishment: entry.daily_accomplishments,
              entry_date: entry.entry_date,
              id: entry.id,
              is_confirmed: entry.is_confirmed,
              no_of_working_hours: entry.no_of_working_hours,
              report_id: entry.report_id,
              status: entry.status,
            })
          ),
          company_name: accomplishmentData.internship_details.company_name,
          job_role: accomplishmentData.internship_details.job_role,
        };
      }

      if (attendanceError && accomplishmentError) {
        logger.error(
          {
            ...ctx,
            attendanceError,
            accomplishmentError,
          },
          "Error fetching section trainee report by ID from both tables"
        );

        throw new Error(
          `Failed to fetch section trainee report by ID: ${reportId}`
        );
      }

      logger.warn(
        {
          ...ctx,
        },
        "Section trainee report not found"
      );

      throw new Error(`Section trainee report not found with ID: ${reportId}`);
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error fetching section trainee report"
      );

      throw error;
    }
  }
}
