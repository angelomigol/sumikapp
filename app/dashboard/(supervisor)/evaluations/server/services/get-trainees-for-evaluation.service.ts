import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  SupervisorTrainees,
  SupervisorTraineesForEvaluationTable,
} from "@/hooks/use-supervisor-trainees";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetTraineesForEvaluationService() {
  return new GetTraineesForEvaluationService();
}

/**
 * @name GetTraineesForEvaluationService
 * @description Service for fetching trainees for evaluation from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineeEvaluationsService();
 */
class GetTraineesForEvaluationService {
  private namespace = "evaluate_trainees.fetch";

  /**
   * @name getTrainees
   * @description Fetch trainees with completed OJT required hours
   */
  async getTrainees(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }): Promise<SupervisorTraineesForEvaluationTable[]> {
    const logger = await getLogger();

    const { client, userId } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching supervisor trainees for evaluations...");

    try {
      const { data, error } = await client
        .from("internship_details")
        .select(
          `
            trainee_batch_enrollment!inner (
                trainees!inner (
                    id,
                    student_id_number,
                    course,
                    users!inner (
                        first_name,
                        middle_name,
                        last_name,
                        email
                    )
                )
            )
        `
        )
        .eq("supervisor_id", userId)
        .eq("trainee_batch_enrollment.trainees.ojt_status", "completed")
        .is("trainee_batch_enrollment.trainees.users.deleted_at", null);

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
          `Supabase error while fetching section trainees: ${error.message}`
        );

        throw new Error(`Failed to fetch section trainees`);
      }

      logger.info(
        {
          ...ctx,
          count: data.length || 0,
        },
        "Successfully fetched section trainees"
      );

      const result = data.map((supervisor) => {
        const trainee = supervisor.trainee_batch_enrollment.trainees;

        return {
          trainee_id: trainee.id,
          student_id_number: trainee.student_id_number,
          first_name: trainee.users.first_name,
          middle_name: trainee.users.middle_name,
          last_name: trainee.users.last_name,
          email: trainee.users.email,
          course: trainee.course,
        };
      });

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching section trainees"
      );

      throw error;
    }
  }
}
