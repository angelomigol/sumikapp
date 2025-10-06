"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createCreateTraineeSkillService } from "./services/add-trainee-skill.service";
import { createDeleteTraineeSkillService } from "./services/delete-trainee-skill.service";
import { createGetTraineeSkillsService } from "./services/get-trainee-skills.service";

/**
 * @name getSkillsAction
 * Server action to retrieve all trainee skills
 */
export const getSkillsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "users.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching trainee skills...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetTraineeSkillsService();

    const result = await service.getSkills({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        skills: result,
      },

      "Successfully fetched skills"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch trainee skills"
    );

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch trainee skills";

    throw new Error(errorMessage);
  }
}, {});

/**
 * @name createSkillAction
 * Server action to add a new trainee skill
 */
export const createSkillAction = enhanceAction(
  async (skillName: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "skill.create",
      userId: user.id,
      skillName,
    };

    logger.info(ctx, "Creating trainee skill...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateTraineeSkillService();

      const result = await service.createSkill({
        client,
        userId: user.id,
        skillName,
      });

      logger.info(
        {
          ...ctx,
          skillId: result.id,
        },

        result.message
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to add trainee skill"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to add trainee skill";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name deleteSkillAction
 * Server action to delete a trainee skill
 */
export const deleteSkillAction = enhanceAction(
  async (skillId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "skill.delete",
      userId: user.id,
      skillId,
    };

    logger.info(ctx, "Deleting trainee skill...");

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteTraineeSkillService();

      await service.deleteSkill({
        client,
        userId: user.id,
        skillId,
      });

      logger.info(ctx, "Successfully deleted skill");

      return { success: true };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete trainee skill"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete trainee skill";

      throw new Error(errorMessage);
    }
  },
  {}
);
