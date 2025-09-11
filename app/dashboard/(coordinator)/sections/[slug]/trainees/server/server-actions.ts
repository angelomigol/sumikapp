"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createGetSectionTraineesService } from "./services/get-section-trainees.service";

/**
 * @name getSectionTraineesAction
 * @description Server action to
 */
export const getSectionTraineesAction = enhanceAction(
  async (sectionName: string, user) => {
    const logger = await getLogger();

    if (!sectionName || typeof sectionName !== "string") {
      throw new Error("Section is required");
    }

    const ctx = {
      name: "sections_trainees.fetch",
      userId: user.id,
      sectionName,
    };

    logger.info(ctx, "Fetching section trainees...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSectionTraineesService();

      const result = await service.getTrainees({
        client,
        userId: user.id,
        sectionName,
      });
      logger.info(
        {
          ...ctx,
          trainees: result,
        },
        "Successfully fetched section trainees"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch section trainees"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name getSectionTraineeByIdAction
 * @description Server action to
 */
export const getSectionTraineeByIdAction = enhanceAction(
  async (data: { sectionName: string; traineeId: string }, user) => {
    const logger = await getLogger();

    if (!data.sectionName || typeof data.sectionName !== "string") {
      throw new Error("Section ID is required");
    }

    const ctx = {
      name: "section_trainee.fetch",
      userId: user.id,
      section: data.sectionName,
      traineeId: data.traineeId,
    };

    logger.info(ctx, "Fetching section trainee...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSectionTraineesService();

      const result = await service.getTraineeById({
        client,
        userId: user.id,
        sectionName: data.sectionName,
        traineeId: data.traineeId,
      });
      logger.info(
        {
          ...ctx,
          trainees: result,
        },
        "Successfully fetched section trainees"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch section trainees"
      );

      throw error;
    }
  },
  {}
);
