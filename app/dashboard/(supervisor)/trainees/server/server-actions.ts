"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createGetSupervisorTraineesService } from "./services/get-supervisor-trainees.service";

/**
 * @name getSupervisorTraineesAction
 * @description Server action to
 */
export const getSupervisorTraineesAction = enhanceAction(
  async (_, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "supervisor_trainees.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching supervisor trainees...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSupervisorTraineesService();

      const result = await service.getTrainees({
        client,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          trainees: result,
        },
        "Successfully fetched supervisor trainees"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch supervisor trainees"
      );

      throw error;
    }
  },
  {}
);

export const getSupervisorTraineeByIdAction = enhanceAction(
  async (traineeId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "supervisor_trainee.fetchById",
      userId: user.id,
    };

    logger.info(ctx, "Fetching supervisor trainee...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSupervisorTraineesService();

      const result = await service.getTraineeById({
        client,
        userId: user.id,
        traineeId,
      });

      logger.info(
        {
          ...ctx,
          trainee: result,
        },
        "Successfully fetched supervisor trainee"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch supervisor trainee"
      );

      throw error;
    }
  },
  {}
);
