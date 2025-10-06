"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createGetTraineesForEvaluationService } from "./services/get-trainees-for-evaluation.service";

/**
 * @name getTraineesForEvaluationAction
 * @description Server action to
 */
export const getTraineesForEvaluationAction = enhanceAction(
  async (_, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "evaluate_trainees.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching trainees for evaluation...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetTraineesForEvaluationService();

      const result = await service.getTrainees({
        client,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          trainees: result,
        },
        "Successfully fetched trainees"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch trainees"
      );

      throw error;
    }
  },
  {}
);
