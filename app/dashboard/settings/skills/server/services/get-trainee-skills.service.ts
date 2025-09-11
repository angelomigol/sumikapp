import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { Skill } from "@/hooks/use-skills";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetTraineeSkillsService() {
  return new GetTraineeSkillsService();
}

/**
 * @name GetTraineeSkillsService
 * @description Service for fetching trainee skills from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineeSkillsService();
 */
class GetTraineeSkillsService {
  private namespace = "skills.fetch";

  /**
   * @name getSkills
   * @description Fetch skills
   */
  async getSkills(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching trainee skills...");

    try {
      const { data, error } = await params.client
        .from("trainee_skills")
        .select(
          `
          skills!inner (
            id,
            name
          )  
        `
        )
        .eq("trainee_id", userId);

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

          `Supabase error while fetching trainee skills: ${error.message}`
        );

        throw new Error(`Failed to fetch trainee skills`);
      }

      logger.info(
        {
          ...ctx,
          count: data.length,
        },

        "Successfully fetched trainee skills"
      );

      const mappedData: Skill[] = data.map((data) => ({
        id: data.skills.id,
        name: data.skills.name,
      }));

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error fetching trainee skills"
      );

      throw error;
    }
  }
}
