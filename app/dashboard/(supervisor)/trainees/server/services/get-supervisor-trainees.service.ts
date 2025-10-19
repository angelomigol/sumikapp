import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  SupervisorTrainees,
  TraineeFullDetails,
} from "@/hooks/use-supervisor-trainees";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetSupervisorTraineesService() {
  return new GetSupervisorTraineesService();
}

/**
 * @name GetSupervisorTraineesService
 * @description Service for fetching trainees from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetSupervisorTraineesService();
 */
class GetSupervisorTraineesService {
  private namespace = "supervisor_trainees.fetch";

  /**
   * @name getTrainees
   * @description Fetch trainees handled by a supervisor
   */
  async getTrainees(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }): Promise<SupervisorTrainees[]> {
    const logger = await getLogger();

    const userId = params.userId;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching supervisor trainees for user...");

    try {
      const { data, error } = await params.client
        .from("internship_details")
        .select(
          `
          weekly_reports (
            period_total,
            status,
            weekly_report_entries (
              status,
              total_hours
            )
          ),
          trainee_batch_enrollment!inner (
            ojt_status,
            trainee:trainee_id (
              id,
              student_id_number,
              course,
              user:users (
                id,
                first_name,
                middle_name,
                last_name,
                email,
                status
              )
            )
          )
        `
        )
        .eq("supervisor_id", userId)
        .is("trainee_batch_enrollment.trainee.user.deleted_at", null);

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

      const result = data.map((supervisor) => {
        const trainee = supervisor.trainee_batch_enrollment.trainee;

        const hours_logged = supervisor.weekly_reports
          .filter((r) => r.status === "approved")
          .flatMap((r) => r.weekly_report_entries || [])
          .filter(
            (entry) => entry.status === "present" || entry.status === "late"
          )
          .reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

        return {
          trainee_id: trainee.id,
          student_id_number: trainee.student_id_number,
          first_name: trainee.user.first_name,
          middle_name: trainee.user.middle_name,
          last_name: trainee.user.last_name,
          email: trainee.user.email,
          course: trainee.course,
          ojt_status: supervisor.trainee_batch_enrollment.ojt_status,
          hours_logged,
        };
      });

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching supervisor trainees"
      );

      throw error;
    }
  }

  /**
   * @name getTraineeById
   * @description Fetch trainee handled by a supervisor by ID
   */
  async getTraineeById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    traineeId: string;
  }): Promise<TraineeFullDetails> {
    const logger = await getLogger();

    const { client, userId, traineeId } = params;

    const ctx = {
      userId,
      traineeId,
      name: `${this.namespace}.ById`,
    };

    logger.info(ctx, "Fetching supervisor trainee...");

    try {
      const { data, error } = await client
        .from("internship_details")
        .select(
          `
          job_role,
          company_name,
          start_date,
          end_date,
          lunch_break_in_mins,
          weekly_reports (
            id,
            created_at,
            start_date,
            end_date,
            period_total,
            status,
            submitted_at,
            internship_id,
            supervisor_approved_at,
            weekly_report_entries (*)
          ),
          trainee_batch_enrollment!inner (
            ojt_status,
            trainees!inner (
              id,
              student_id_number,
              course,
              section,
              users!inner (
                first_name,
                middle_name,
                last_name,
                email,
                status
              )
            ),
            program_batch (
              required_hours,
              start_date,
              end_date
            )
          )
        `
        )
        .eq("supervisor_id", userId)
        .eq("trainee_batch_enrollment.trainee_id", traineeId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(ctx, "Trainee not found or access denied");
          throw new Error("Trainee not found or access denied");
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
          "Supabase error while fetching supervisor trainee"
        );

        throw new Error(`Supabase error: ${error.message}`);
      }

      logger.info(
        {
          ...ctx,
          hasData: !!data,
        },
        "Successfully fetched supervisor trainee"
      );

      const trainee = data.trainee_batch_enrollment.trainees;

      const hours_logged = data.weekly_reports
        .filter((r) => r.status === "approved")
        .flatMap((r) => r.weekly_report_entries || [])
        .filter(
          (entry) => entry.status === "present" || entry.status === "late"
        )
        .reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

      return {
        trainee_id: trainee.id,
        student_id_number: trainee.student_id_number,
        course: trainee.course,
        section: trainee.section,
        first_name: trainee.users.first_name,
        middle_name: trainee.users.middle_name,
        last_name: trainee.users.last_name,
        email: trainee.users.email,
        hours_logged: hours_logged,
        ojt_status: data.trainee_batch_enrollment.ojt_status,
        status: trainee.users.status,
        internship_details: {
          company_name: data.company_name,
          job_role: data.job_role,
          start_date: data.start_date,
          end_date: data.end_date,
        },
        program_batch: {
          required_hours:
            data.trainee_batch_enrollment.program_batch.required_hours,
          start_date: data.trainee_batch_enrollment.program_batch.start_date,
          end_date: data.trainee_batch_enrollment.program_batch.end_date,
        },
        weekly_reports: data.weekly_reports.map((report) => ({
          id: report.id,
          created_at: report.created_at,
          start_date: report.start_date,
          end_date: report.end_date,
          period_total: report.period_total,
          status: report.status,
          submitted_at: report.submitted_at,
          internship_id: report.internship_id,
          supervisor_approved_at: report.supervisor_approved_at,
        })),
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching supervisor trainee"
      );

      throw error;
    }
  }
}
