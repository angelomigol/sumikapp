import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteTraineeFromSectionService() {
  return new DeleteTraineeFromSectionService();
}

/**
 * @name DeleteTraineeFromSectionService
 * @description Service for deleting a trainee from a section from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetSectionTraineesService();
 */
class DeleteTraineeFromSectionService {
  private namespace = "section_trainees.delete";

  /**
   * @name removeTrainee
   * @description Remove trainee batch enrollment in a specific section
   */
  async removeTrainee(params: {
    client: SupabaseClient<Database>;
    userId: string;
    sectionName: string;
    traineeId: string;
  }) {
    const logger = await getLogger();
    const { client, userId, sectionName, traineeId } = params;

    const ctx = {
      userId,
      section: sectionName,
      traineeId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting trainee from section...");

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
        .delete()
        .eq("program_batch_id", batchData.id)
        .eq("trainee_id", traineeId);

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

          `Supabase error while deleting trainee batch enrollment: ${error.message}`
        );

        throw new Error(`Failed to remove trainee from section`);
      }

      logger.info(
        {
          ...ctx,
          sectionName,
        },
        "Successfully deleted trainee batch enrollment"
      );

      return {
        success: true,
        message: "Successfully removed trainee from section",
      };
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
