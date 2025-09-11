"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { SearchableTrainee } from "@/components/sumikapp/smart-trainee-search";

import { createAddAllStudentsService } from "./services/add-all-students.service";

/**
 * @name addAllStudentsAction
 * @description Server action
 */
export const addAllStudentsAction = enhanceAction(
  async (data: { trainees: SearchableTrainee[]; slug: string }, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "students.create",
      userId: user.id,
    };

    if (!data.slug) {
      throw new Error("Slug is missing");
    }

    if (!Array.isArray(data.trainees) || data.trainees.length === 0) {
      throw new Error("At least one student is required");
    }

    logger.info(ctx, "Adding all students to a batch...");

    try {
      const client = getSupabaseServerClient();
      const service = createAddAllStudentsService();

      const result = await service.addAllStudents({
        client,
        userId: user.id,
        data,
      });

      logger.info(
        {
          ...ctx,
          result: {
            successful: result.results.successful.length,
            failed: result.results.failed.length,
            total: result.results.total,
          },
        },
        "Successfully processed batch student addition"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to processed students to a batch"
      );

      throw error;
    }
  },
  {
    auth: true,
  }
);
