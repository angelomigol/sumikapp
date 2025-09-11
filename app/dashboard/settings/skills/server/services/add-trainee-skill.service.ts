import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { Skill } from "@/hooks/use-skills";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createCreateTraineeSkillService() {
  return new CreateTraineeSkillService();
}

/**
 * @name CreateTraineeSkillService
 * @description Service for adding trainee skills to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateTraineeSkillService();
 */
class CreateTraineeSkillService {
  private namespace = "skill.create";

  /**
   * @name createSkill
   * @description Creates a new skill for a trainee
   */
  async createSkill(params: {
    client: SupabaseClient<Database>;
    userId: string;
    skillName: string;
  }) {
    const logger = await getLogger();

    const { userId, skillName } = params;

    const ctx = {
      userId,
      skillName,
      name: this.namespace,
    };

    logger.info(ctx, "Creating trainee skill...");

    try {
      let { data: existingSkill, error: skillLookupError } = await params.client
        .from("skills")
        .select("id, name")
        .ilike("name", skillName)
        .single();

      if (skillLookupError && skillLookupError.code !== "PGRST116") {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: skillLookupError.code,
              message: skillLookupError.message,
              hint: skillLookupError.hint,
              details: skillLookupError.details,
            },
          },

          `Supabase error while looking up skill: ${skillLookupError.message}`
        );

        throw new Error(`Failed to lookup skill`);
      }

      let skillId: string;

      if (!existingSkill) {
        const { data: newSkill, error: createSkillError } = await params.client
          .from("skills")
          .insert({
            name: skillName,
          })
          .select("id, name")
          .single();

        if (createSkillError) {
          logger.error(
            {
              ...ctx,
              supabaseError: {
                code: createSkillError.code,
                message: createSkillError.message,
                hint: createSkillError.hint,
                details: createSkillError.details,
              },
            },

            `Supabase error while creating skill: ${createSkillError.message}`
          );

          throw new Error(`Failed to create skill`);
        }

        existingSkill = newSkill;
        skillId = newSkill.id;

        logger.info(
          {
            ...ctx,
            skillId,
          },

          "Created new skill"
        );
      } else {
        skillId = existingSkill.id;
        logger.info(
          {
            ...ctx,
            skillId,
          },
          "Using existing skill"
        );
      }

      // Check if the trainee already has this skill
      const { data: existingTraineeSkill, error: traineeSkillLookupError } =
        await params.client
          .from("trainee_skills")
          .select("id")
          .eq("trainee_id", userId)
          .eq("skill_id", skillId)
          .single();

      if (
        traineeSkillLookupError &&
        traineeSkillLookupError.code !== "PGRST116"
      ) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: traineeSkillLookupError.code,
              message: traineeSkillLookupError.message,
              hint: traineeSkillLookupError.hint,
              details: traineeSkillLookupError.details,
            },
          },
          `Supabase error while looking up trainee skill: ${traineeSkillLookupError.message}`
        );

        throw new Error(`Failed to lookup trainee skill`);
      }

      if (existingTraineeSkill) {
        logger.info(
          {
            ...ctx,
            skillId,
          },

          "Trainee already has this skill"
        );

        return {
          id: existingSkill.id,
          name: existingSkill.name,
        };
      }

      const { error: addSkillError } = await params.client
        .from("trainee_skills")
        .insert({
          trainee_id: userId,
          skill_id: skillId,
        });

      if (addSkillError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: addSkillError.code,
              message: addSkillError.message,
              hint: addSkillError.hint,
              details: addSkillError.details,
            },
          },

          `Supabase error while adding trainee skill: ${addSkillError.message}`
        );

        throw new Error(`Failed to add skill to trainee`);
      }

      logger.info(
        {
          ...ctx,
          skillId,
        },

        "Successfully added trainee skill"
      );

      return {
        success: true,
        message: "Successfully added trainee skill",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error adding trainee skill"
      );

      throw error;
    }
  }
}
