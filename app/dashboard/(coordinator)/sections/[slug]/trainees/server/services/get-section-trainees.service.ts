import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { RequirementWithHistory } from "@/hooks/use-batch-requirements";
import {
  TraineeFullDetails,
  TraineeWithUserAndHours,
} from "@/hooks/use-section-trainees";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetSectionTraineesService() {
  return new GetSectionTraineesService();
}

/**
 * @name GetSectionTraineesService
 * @description Service for fetching trainees from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetSectionTraineesService();
 */
class GetSectionTraineesService {
  private namespace = "section_trainees.fetch";

  /**
   * @name getTrainees
   * @description Fetch trainees enrolled in a specific section
   */
  async getTrainees(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
  }): Promise<TraineeWithUserAndHours[]> {
    const logger = await getLogger();
    const { client, userId, sectionName } = params;

    const ctx = {
      userId,
      sectionName,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching section trainees for user...");

    try {
      const { data: batchData, error: batchError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", sectionName)
        .eq("coordinator_id", userId)
        .single();

      if (batchError || !batchData) {
        throw new Error(`Section: "${sectionName}" not found`);
      }

      const { data, error } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          ojt_status,
          trainees!inner (
            id,
            student_id_number,
            users!inner (
              first_name,
              middle_name,
              last_name,
              email
            )
          ),
          internship_details (
            weekly_reports (
              status,
              weekly_report_entries (*)
            )
          )
        `
        )
        .eq("program_batch_id", batchData.id)
        .is("trainees.users.deleted_at", null);

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching section trainees"
        );

        throw new Error(`Failed to fetch section trainees`);
      }

      logger.info(
        {
          ...ctx,
          sectionName,
          count: data.length || 0,
        },
        "Successfully fetched section trainees"
      );

      const result = data
        .map((enrollment) => {
          const trainee = enrollment.trainees;
          const internshipDetailsList = enrollment.internship_details || [];

          const allReports = internshipDetailsList.flatMap(
            (internshipDetail) => internshipDetail.weekly_reports || []
          );

          const hours_logged = allReports
            .filter((r) => r.status === "approved")
            .flatMap((r) => r.weekly_report_entries || [])
            .filter(
              (entry) => entry.status === "present" || entry.status === "late"
            )
            .reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

          return {
            trainee_id: trainee.id,
            student_id_number: trainee.student_id_number,
            ojt_status: enrollment.ojt_status,
            first_name: trainee.users.first_name,
            middle_name: trainee.users.middle_name,
            last_name: trainee.users.last_name,
            email: trainee.users.email,
            hours_logged,
          };
        })
        .sort((a, b) => {
          const lastNameComparison = a.last_name.localeCompare(b.last_name);
          if (lastNameComparison !== 0) {
            return lastNameComparison;
          }
          return a.first_name.localeCompare(b.first_name);
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

  /**
   * @name getTraineeById
   * @description Fetch details of trainee enrolled in a specific section
   */
  async getTraineeById(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
    traineeId: string;
  }): Promise<TraineeFullDetails> {
    const logger = await getLogger();

    const { client, userId, traineeId, sectionName } = params;

    const ctx = {
      userId,
      traineeId,
      sectionName,
      name: `${this.namespace}.ById`,
    };

    logger.info(ctx, "Fetching section trainee...");

    try {
      // First, verify the section exists and belongs to the coordinator
      const { data: batchData, error: batchError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", sectionName)
        .eq("coordinator_id", userId)
        .single();

      if (batchError || !batchData) {
        logger.warn(ctx, "Section not found or access denied");
        throw new Error(`Section: "${sectionName}" not found or access denied`);
      }

      // Fetch trainee details with all related information
      const { data, error } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          id,
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
            internship_code,
            required_hours,
            start_date,
            end_date
          ),
          requirements (
            id,
            file_name,
            file_path,
            file_type,
            file_size,
            submitted_at,
            batch_requirement_id,
            batch_requirements:batch_requirement_id (
              requirement_types:requirement_type_id (
                name,
                description
              )
            ),
            requirements_history (
              document_status,
              date
            )
          ),
          internship_details (
            job_role,
            company_name,
            start_date,
            end_date,
            weekly_reports (
              id,
              created_at,
              start_date,
              end_date,
              period_total,
              status,
              submitted_at,
              weekly_report_entries (*)
            )
          )
        `
        )
        .eq("program_batch_id", batchData.id)
        .eq("trainee_id", traineeId)
        .eq("internship_details.weekly_reports.status", "approved")
        .is("trainees.users.deleted_at", null)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          logger.warn(
            ctx,
            "Trainee not found in this section or access denied"
          );
          throw new Error("Trainee not found in this section or access denied");
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
          "Supabase error while fetching section trainees"
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch section trainees";

        throw new Error(`Database Error: ${errorMessage}`);
      }

      // Fetch employability predictions - use maybeSingle() to handle no results
      const { data: emp_data, error: emp_error } = await client
        .from("employability_predictions")
        .select("*")
        .eq("trainee_batch_enrollment_id", data.id)
        .maybeSingle();

      if (emp_error) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: emp_error.code,
              message: emp_error.message,
              hint: emp_error.hint,
              details: emp_error.details,
            },
          },
          "Supabase error while fetching trainee evaluation results"
        );

        const errorMessage =
          emp_error instanceof Error
            ? emp_error.message
            : "Failed to fetch trainee evaluation results";

        throw new Error(`Database Error: ${errorMessage}`);
      }

      // Log if no evaluation results found
      if (!emp_data) {
        logger.info(ctx, "No evaluation results found for this trainee");
      }

      logger.info(
        {
          ...ctx,
          hasData: !!data,
          hasEvaluationResults: !!emp_data,
        },
        "Successfully fetched section trainee"
      );

      const trainee = data.trainees;
      const internshipDetails = data.internship_details?.[0]; // Assuming one active internship

      // Calculate total hours logged from approved attendance reports
      const hours_logged =
        internshipDetails?.weekly_reports
          ?.filter((r) => r.status === "approved")
          .flatMap((r) => r.weekly_report_entries || [])
          .filter(
            (entry) => entry.status === "present" || entry.status === "late"
          )
          .reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

      const processedRequirements = data.requirements.map((req) => {
        const history = req.requirements_history || [];

        const latestHistoryEntry = history.reduce(
          (latest, current) => {
            if (!latest) return current;
            return new Date(current.date) > new Date(latest.date)
              ? current
              : latest;
          },
          null as (typeof history)[0] | null
        );

        const requirementType = req.batch_requirements?.requirement_types;

        return {
          id: req.id,
          requirement_name: requirementType?.name || "Unknown Requirement",
          requirement_description: requirementType?.description || null,
          file_name: req.file_name,
          file_path: req.file_path,
          file_type: req.file_type,
          file_size: Number(req.file_size),
          submitted_at: req.submitted_at,
          status: latestHistoryEntry?.document_status || "not submitted",
          history: history.map((h) => ({
            document_status: h.document_status,
            date: h.date,
          })),
        } as RequirementWithHistory;
      });

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
        ojt_status: data.ojt_status,
        status: trainee.users.status,
        internship_details: {
          company_name: internshipDetails?.company_name,
          job_role: internshipDetails?.job_role,
          start_date: internshipDetails?.start_date,
          end_date: internshipDetails?.end_date,
        },
        program_batch: {
          internship_code: data.program_batch.internship_code,
          required_hours: data.program_batch.required_hours,
          start_date: data.program_batch.start_date,
          end_date: data.program_batch.end_date,
        },
        weekly_reports: internshipDetails?.weekly_reports?.map((report) => ({
          id: report.id,
          created_at: report.created_at,
          start_date: report.start_date,
          end_date: report.end_date,
          period_total: report.period_total,
          status: report.status,
          submitted_at: report.submitted_at,
        })),
        submitted_requirements: processedRequirements,
        evaluation_results: emp_data
          ? {
              prediction_label: emp_data.prediction_label,
              prediction_probability: emp_data.prediction_probability,
              confidence_level: emp_data.confidence_level,
              prediction_date: emp_data.prediction_date,
              evaluation_scores: emp_data.evaluation_scores as Record<
                string,
                number
              > | null,
              feature_scores: emp_data.feature_scores as Record<
                string,
                number
              > | null,
              recommendations: emp_data.recommendations as Record<
                string,
                number
              > | null,
              risk_factors: emp_data.risk_factors as Record<
                string,
                number
              > | null,
            }
          : null,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching section trainee"
      );

      throw error;
    }
  }
}
