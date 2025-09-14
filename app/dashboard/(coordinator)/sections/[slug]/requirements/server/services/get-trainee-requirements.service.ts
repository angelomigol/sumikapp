import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import {
  RequirementWithHistory,
  TraineeWithRequirementsAndInternship,
} from "@/hooks/use-batch-requirements";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetTraineeRequirementsService() {
  return new GetTraineeRequirementsService();
}

/**
 * @name GetTraineeRequirementsService
 * @description Service for fetching trainee requirements from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineeRequirementsService();
 */
class GetTraineeRequirementsService {
  private namespace = "trainee_requirements.fetch";

  /**
   * @name getTraineeRequirements
   * Fetch all trainee requirements for a user.
   */
  async getTraineeRequirements(params: {
    client: SupabaseClient<Database>;
    sectionName: string;
    userId: string;
  }): Promise<TraineeWithRequirementsAndInternship[]> {
    const logger = await getLogger();

    const { client, sectionName, userId } = params;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching trainee requirements for user...");

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
        trainees!inner (
          id,
          users!inner (
            first_name,
            middle_name,
            last_name
          )
        ),
        program_batch (
          title,
          internship_code
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
          id,
          company_name,
          contact_number,
          nature_of_business,
          address,
          job_role,
          start_date,
          end_date,
          start_time,
          end_time,
          daily_schedule,
          status,
          temp_email,
          created_at,
          supervisors (
            users!inner(
              email
            )
          )
        )
      `
        )
        .eq("program_batch_id", batchData.id)
        .eq("program_batch.coordinator_id", userId)
        .is("trainees.users.deleted_at", null);

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },

          "Error fetching trainee requirements"
        );

        throw new Error("Failed to fetch trainee requirements");
      }

      logger.info(
        {
          ...ctx,
          count: data.length || 0,
        },
        "Successfully fetched trainee requirements"
      );

      const result = data
        .map((enrollment) => {
          const trainee = enrollment.trainees;
          const requirements = enrollment.requirements || [];
          const internshipDetails = enrollment.internship_details || [];

          const processedRequirements = requirements.map((req) => {
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
              file_size: req.file_size,
              submitted_at: req.submitted_at,
              status: latestHistoryEntry?.document_status || "not submitted",
              history: history.map((h) => ({
                document_status: h.document_status,
                date: h.date,
              })),
            } as RequirementWithHistory;
          });

          const latestInternship =
            internshipDetails && internshipDetails.length > 0
              ? (() => {
                  // First try to find approved internships
                  const approvedInternships = internshipDetails
                    .filter((internship) => internship.status === "approved")
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );

                  if (approvedInternships.length > 0) {
                    return approvedInternships[0]; // Return latest approved
                  }

                  // If no approved, get latest pending
                  const pendingInternships = internshipDetails
                    .filter((internship) => internship.status === "pending")
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );

                  return pendingInternships.length > 0
                    ? pendingInternships[0]
                    : null;
                })()
              : null;

          return {
            trainee_id: trainee.id,
            first_name: trainee.users.first_name,
            middle_name: trainee.users.middle_name,
            last_name: trainee.users.last_name,
            requirements: processedRequirements,
            internship_details: latestInternship
              ? {
                  id: latestInternship.id,
                  company_name: latestInternship.company_name,
                  contact_number: latestInternship.contact_number,
                  nature_of_business: latestInternship.nature_of_business,
                  address: latestInternship.address,
                  job_role: latestInternship.job_role,
                  start_date: latestInternship.start_date,
                  end_date: latestInternship.end_date,
                  start_time: latestInternship.start_time,
                  end_time: latestInternship.end_time,
                  daily_schedule: latestInternship.daily_schedule,
                  supervisor_email:
                    latestInternship.supervisors?.users.email ??
                    latestInternship.temp_email,
                  status: latestInternship.status,
                  created_at: latestInternship.created_at,
                }
              : null,
          } as TraineeWithRequirementsAndInternship;
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
        "Unexpected error fetching trainee requirements"
      );

      throw error;
    }
  }
}
