import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createDeleteTraineeSkillService() {
  return new DeleteTraineeSkillService();
}

/**
 * @name DeleteTraineeSkillService
 * @description Service for deleting trainee skills from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new DeleteTraineeSkillService();
 */
class DeleteTraineeSkillService {
  private namespace = "skill.delete";

  /**
   * @name deleteSkill
   * @description Delete a skill for a trainee
   */
  async deleteSkill(params: {
    client: SupabaseClient<Database>;
    userId: string;
    skillId: string;
  }) {
    const logger = await getLogger();

    const { userId, skillId } = params;

    const ctx = {
      userId,
      skillId,
      name: this.namespace,
    };

    logger.info(ctx, "Deleting trainee skill...");

    try {
      const { error: deleteError } = await params.client
        .from("trainee_skills")
        .delete()
        .eq("trainee_id", userId)
        .eq("skill_id", skillId);

      if (deleteError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: deleteError.code,
              message: deleteError.message,
              hint: deleteError.hint,
              details: deleteError.details,
            },
          },

          `Supabase error while deleting trainee skill: ${deleteError.message}`
        );

        throw new Error(`Failed to delete trainee skill`);
      }

      logger.info(
        {
          ...ctx,
        },

        "Successfully deleted trainee skill"
      );

      return { success: true, message: "Successfully deleted trainee skill" };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error deleting trainee skill"
      );

      throw error;
    }
  }
}
