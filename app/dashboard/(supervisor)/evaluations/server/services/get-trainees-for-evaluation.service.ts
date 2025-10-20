import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { SupervisorTraineesForEvaluationTable } from "@/hooks/use-supervisor-trainees";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

interface TraineeEvaluationInfo {
  tbe_id: string;
  internship_id: string;
  trainee_id: string;
  student_id_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  course: string | null;
  section: string | null;
  company_name: string;
  start_date: string;
  end_date: string;
  internship_status: string;
  required_hours: number;
}

export function createGetTraineesForEvaluationService() {
  return new GetTraineesForEvaluationService();
}

/**
 * @name GetTraineesForEvaluationService
 * @description Service for fetching trainees for evaluation from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineesForEvaluationService();
 */
class GetTraineesForEvaluationService {
  private namespace = "evaluate_trainees.fetch";

  /**
   * @name getTrainees
   * @description Fetch completed trainees that do NOT have employability predictions yet and have met required hours
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
      // Step 1: Get all completed trainees under this supervisor with program batch info
      const { data: completedTrainees, error: completedError } = await client
        .from("supervisors")
        .select(
          `
          id,
          internship_details!inner(
            id,
            company_name,
            start_date,
            end_date,
            status,
            trainee_batch_enrollment!inner(
              id,
              ojt_status,
              program_batch!inner(
                id,
                required_hours
              ),
              trainees!inner(
                id,
                course,
                section,
                student_id_number,
                users!inner(
                  id,
                  first_name,
                  middle_name,
                  last_name,
                  email,
                  deleted_at
                )
              )
            )
          )
        `
        )
        .eq("id", userId)
        .is(
          "internship_details.trainee_batch_enrollment.trainees.users.deleted_at",
          null
        );

      if (completedError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: completedError.code,
              message: completedError.message,
              hint: completedError.hint,
              details: completedError.details,
            },
          },
          `Supabase error while fetching completed trainees: ${completedError.message}`
        );

        throw new Error(`Failed to fetch completed trainees`);
      }

      if (!completedTrainees || completedTrainees.length === 0) {
        logger.info(ctx, "No supervisor found or no completed trainees");
        return [];
      }

      // Extract trainee_batch_enrollment IDs and internship IDs
      const tbeIds: string[] = [];
      const internshipIds: string[] = [];
      const traineeMap = new Map<string, TraineeEvaluationInfo>();

      completedTrainees.forEach((supervisor) => {
        supervisor.internship_details.forEach((internship) => {
          const tbe = internship.trainee_batch_enrollment;
          tbeIds.push(tbe.id);
          internshipIds.push(internship.id);
          traineeMap.set(tbe.id, {
            tbe_id: tbe.id,
            internship_id: internship.id,
            trainee_id: tbe.trainees.id,
            student_id_number: tbe.trainees.student_id_number,
            first_name: tbe.trainees.users.first_name,
            middle_name: tbe.trainees.users.middle_name,
            last_name: tbe.trainees.users.last_name,
            email: tbe.trainees.users.email,
            course: tbe.trainees.course,
            section: tbe.trainees.section,
            company_name: internship.company_name,
            start_date: internship.start_date,
            end_date: internship.end_date,
            internship_status: internship.status,
            required_hours: tbe.program_batch.required_hours,
          });
        });
      });

      if (tbeIds.length === 0) {
        logger.info(ctx, "No completed trainees found");
        return [];
      }

      // Step 2: Get total hours served for each internship from approved attendance reports
      const { data: weeklyReports, error: attendanceError } = await client
        .from("weekly_reports")
        .select("internship_id, period_total")
        .in("internship_id", internshipIds)
        .eq("status", "approved");

      if (attendanceError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: attendanceError.code,
              message: attendanceError.message,
              hint: attendanceError.hint,
              details: attendanceError.details,
            },
          },
          `Supabase error while fetching attendance reports: ${attendanceError.message}`
        );

        throw new Error(`Failed to fetch attendance reports`);
      }

      // Step 3: Calculate total hours for each internship
      const hoursMap = new Map<string, number>();
      weeklyReports?.forEach((report) => {
        const currentTotal = hoursMap.get(report.internship_id) || 0;
        hoursMap.set(report.internship_id, currentTotal + report.period_total);
      });

      // Step 4: Check which trainees have met required hours
      const traineesWithRequiredHours = Array.from(traineeMap.values()).filter(
        (trainee) => {
          const totalHours = hoursMap.get(trainee.internship_id) || 0;
          const requiredHours = trainee.required_hours || 0;
          return totalHours >= requiredHours;
        }
      );

      if (traineesWithRequiredHours.length === 0) {
        logger.info(ctx, "No trainees have met required hours");
        return [];
      }

      // Step 5: Check which ones already have employability predictions
      const eligibleTbeIds = traineesWithRequiredHours.map((t) => t.tbe_id);
      const { data: existingPredictions, error: predictionsError } =
        await client
          .from("employability_predictions")
          .select("trainee_batch_enrollment_id")
          .in("trainee_batch_enrollment_id", eligibleTbeIds);

      if (predictionsError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: predictionsError.code,
              message: predictionsError.message,
              hint: predictionsError.hint,
              details: predictionsError.details,
            },
          },
          `Supabase error while checking existing predictions: ${predictionsError.message}`
        );

        throw new Error(`Failed to check existing predictions`);
      }

      // Step 6: Filter out trainees that already have predictions
      const existingTbeIds = new Set(
        existingPredictions?.map((p) => p.trainee_batch_enrollment_id) || []
      );

      const result = traineesWithRequiredHours.filter(
        (trainee) => !existingTbeIds.has(trainee.tbe_id)
      );

      logger.info(
        {
          ...ctx,
          totalCompleted: traineeMap.size,
          metRequiredHours: traineesWithRequiredHours.length,
          alreadyEvaluated: existingTbeIds.size,
          needingEvaluation: result.length,
        },
        "Successfully fetched trainees for evaluation"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching trainees for evaluation"
      );

      throw error;
    }
  }
}
