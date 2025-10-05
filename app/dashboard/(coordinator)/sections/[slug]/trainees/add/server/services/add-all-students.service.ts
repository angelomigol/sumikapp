import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";

export function createAddAllStudentsService() {
  return new AddAllStudentsService();
}

/**
 * @name AddAllStudentsService
 * @description Service for adding all students to a batch
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new AddAllStudentsService();
 */
class AddAllStudentsService {
  private namespace = "students.create";

  /**
   * @name addAllStudents
   * Create a custom requirement for a user.
   */
  async addAllStudents(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: {
      trainees: SearchableTrainee[];
      slug: string;
    };
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      userId,
      section_name: data.slug,
      name: this.namespace,
    };

    if (!data.slug) {
      throw new Error("Slug missing");
    }

    logger.info(ctx, "Adding all students to a batch...");

    try {
      // Get the program batch with internship code
      const { data: programBatch, error: batchError } = await client
        .from("program_batch")
        .select("id, title, internship_code")
        .eq("title", data.slug)
        .single();

      if (batchError || !programBatch) {
        logger.error(
          {
            ...ctx,
            error: batchError,
          },
          "Failed to find program batch"
        );
        throw new Error(`Program batch with slug "${data.slug}" not found`);
      }

      logger.info(
        {
          ...ctx,
          batchId: programBatch.id,
          internshipCode: programBatch.internship_code,
        },
        "Found program batch"
      );

      const results: {
        successful: Array<{
          trainee: SearchableTrainee;
          userId: string;
          studentId: string;
        }>;
        failed: Array<{
          trainee: SearchableTrainee;
          error: string;
        }>;
        total: number;
      } = {
        successful: [],
        failed: [],
        total: data.trainees.length,
      };

      // Process each trainee
      for (const trainee of data.trainees) {
        try {
          // Validate enrollment eligibility
          const validationResult = await this.validateTraineeEnrollment(
            client,
            trainee.id,
            programBatch.internship_code,
            logger,
            ctx
          );

          if (!validationResult.isValid) {
            results.failed.push({
              trainee,
              error: validationResult.error!,
            });
            continue;
          }

          // Check if trainee is already enrolled in this specific batch
          const { data: existingEnrollment, error: enrollmentCheckError } =
            await client
              .from("trainee_batch_enrollment")
              .select("id")
              .eq("trainee_id", trainee.id)
              .eq("program_batch_id", programBatch.id)
              .single();

          if (
            enrollmentCheckError &&
            enrollmentCheckError.code !== "PGRST116"
          ) {
            logger.error(
              {
                ...ctx,
                traineeId: trainee.id,
                batchId: programBatch.id,
                supabaseError: {
                  code: enrollmentCheckError.code,
                  message: enrollmentCheckError.message,
                },
              },
              "Error checking existing enrollment"
            );

            results.failed.push({
              trainee,
              error: "Failed to check existing enrollment",
            });
            continue;
          }

          if (existingEnrollment) {
            results.failed.push({
              trainee,
              error: "Trainee is already enrolled in this batch",
            });
            continue;
          }

          const { error: enrollmentError } = await client
            .from("trainee_batch_enrollment")
            .insert({
              trainee_id: trainee.id,
              program_batch_id: programBatch.id,
            });

          if (enrollmentError) {
            logger.error(
              {
                ...ctx,
                traineeId: trainee.id,
                batchId: programBatch.id,
                traineeEmail: trainee.email,
                supabaseError: {
                  code: enrollmentError.code,
                  message: enrollmentError.message,
                  hint: enrollmentError.hint,
                  details: enrollmentError.details,
                },
              },
              `Supabase error while creating batch enrollment: ${enrollmentError.message}`
            );

            results.failed.push({
              trainee,
              error: `Failed to create batch enrollment: ${enrollmentError.message}`,
            });
            continue;
          }

          results.successful.push({
            trainee: trainee,
            userId,
            studentId: trainee.student_id_number,
          });

          logger.info(
            {
              ...ctx,
              traineeId: trainee.id,
              studentId: trainee.student_id_number,
            },
            "Successfully added student to batch"
          );
        } catch (error) {
          logger.error(
            {
              ...ctx,
              error,
              traineeEmail: trainee.email,
            },
            "Unexpected error while processing trainee"
          );

          results.failed.push({
            trainee,
            error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      }

      logger.info(
        {
          ...ctx,
          successful: results.successful.length,
          failed: results.failed.length,
          total: results.total,
        },
        "Completed adding students to batch"
      );

      return {
        success: true,
        message: `Successfully added ${results.successful.length} out of ${results.total} students`,
        results,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error adding all students to batch"
      );

      throw error;
    }
  }

  /**
   * Validates if a trainee can be enrolled in a program batch based on business rules
   */
  private async validateTraineeEnrollment(
    client: SupabaseClient<Database>,
    traineeId: string,
    targetInternshipCode: Database["public"]["Enums"]["internship_code"],
    logger: any,
    ctx: any
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Get all existing enrollments for this trainee with batch details
      const { data: existingEnrollments, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          id,
          ojt_status,
          program_batch:program_batch!inner(
            id,
            internship_code,
            start_date,
            end_date
          )
        `
        )
        .eq("trainee_id", traineeId);

      if (enrollmentError) {
        logger.error(
          {
            ...ctx,
            traineeId,
            error: enrollmentError,
          },
          "Failed to fetch existing enrollments"
        );

        return {
          isValid: false,
          error: "Failed to check existing enrollments",
        };
      }

      // Check business rules
      const ctntern1Enrollments =
        existingEnrollments?.filter(
          (e) => e.program_batch.internship_code === "CTNTERN1"
        ) || [];

      const ctntern2Enrollments =
        existingEnrollments?.filter(
          (e) => e.program_batch.internship_code === "CTNTERN2"
        ) || [];

      const currentDate = new Date().toISOString().split("T")[0];

      // Rule 1: Trainee can only be added to one program_batch with either CTNTERN1 or CTNTERN2
      if (targetInternshipCode === "CTNTERN1") {
        if (ctntern1Enrollments.length > 0) {
          return {
            isValid: false,
            error: "Trainee is already enrolled in Internship 1.",
          };
        }
      }

      if (targetInternshipCode === "CTNTERN2") {
        if (ctntern2Enrollments.length > 0) {
          return {
            isValid: false,
            error: "Trainee is already enrolled in Internship 2.",
          };
        }

        // Rule 2: Trainee cannot be added to CTNTERN2 without CTNTERN1
        if (ctntern1Enrollments.length === 0) {
          return {
            isValid: false,
            error:
              "Trainee must complete Internship 1 before enrolling in Internship 2",
          };
        }

        // Rule 3: Trainee cannot be added to CTNTERN2 if CTNTERN1 is still ongoing or OJT status is not completed
        const ctntern1Enrollment = ctntern1Enrollments[0];
        const ctntern1Batch = ctntern1Enrollments[0].program_batch;
        const isOngoing =
          currentDate >= ctntern1Batch.start_date &&
          currentDate <= ctntern1Batch.end_date;

        if (isOngoing) {
          return {
            isValid: false,
            error:
              "Cannot enroll in Internship 2 while Intership 1 is still ongoing",
          };
        }

        if (ctntern1Enrollment.ojt_status !== "completed") {
          return {
            isValid: false,
            error:
              "This trainee has not yet finished Internship 1 to enroll in Internship 2.",
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          traineeId,
          error,
        },
        "Unexpected error during enrollment validation"
      );
      return {
        isValid: false,
        error: "Unexpected error during validation",
      };
    }
  }
}
