"use server";

import { revalidatePath } from "next/cache";

import { format } from "date-fns";

import { InternshipCode } from "@/lib/constants";
import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { deleteSectionSchema } from "../../../schemas/delete-section.schema";
import { createDeleteSectionService } from "./services/delete-section.service";
import { createUpdateSectionService } from "./services/update-section.service";
import { SectionFormValues } from "../../../schemas/section.schema";

/**
 * @name deleteSectionAction
 * @description Server action to
 */
export const deleteSectionAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = deleteSectionSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "section.delete",
      userId: user.id,
    };

    logger.info(ctx, `Deleting section...`);

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteSectionService();

      const result = await service.deleteSection({
        client,
        userId: user.id,
        sectionId: data.id,
      });

      logger.info(ctx, result.message);

      revalidatePath("/dashboard/sections");
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform delete section action"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name updateSectionAction
 * @description Server action to
 */
export const updateSectionAction = enhanceAction(
  async (data: SectionFormValues, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "section.update",
      userId: user.id,
      sectionTitle: data.title,
    };

    logger.info(ctx, `Updating section...`);

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateSectionService();

      const result = await service.updateSection({
        client,
        userId: user.id,
        data: {
          ...data,
          coordinator_id: user.id,
          internship_code: data.internship_code as InternshipCode,
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
        },
      });

      logger.info(ctx, result.message);

      revalidatePath("/dashboard/sections");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to perform update section action"
      );

      throw error;
    }
  },
  {}
);
