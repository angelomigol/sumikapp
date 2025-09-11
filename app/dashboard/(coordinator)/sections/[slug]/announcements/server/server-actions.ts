"use server";

import { revalidatePath } from "next/cache";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import {
  announcementSchema,
  deleteAnnouncementSchema,
} from "../schema/announcement.schema";
import { createCreateAnnouncementService } from "./services/create-announcement.service";
import { createDeleteAnnouncementService } from "./services/delete-announcement.service";
import { createGetAnnouncementsService } from "./services/get-announcements.service";
import { createUpdateAnnouncementService } from "./services/update-announcement.service";

/**
 * @name getAnnouncementsAction
 * @description Server action to
 */
export const getAnnouncementsAction = enhanceAction(
  async (slug: string, user) => {
    const logger = await getLogger();

    if (!slug || typeof slug !== "string") {
      throw new Error("Section title is required");
    }

    const ctx = {
      name: "announcements.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching section announcements");

    try {
      const client = getSupabaseServerClient();
      const service = createGetAnnouncementsService();

      const result = await service.getAnnouncements({
        client,
        userId: user.id,
        sectionName: slug,
      });

      logger.info(
        {
          ...ctx,
          anouncements: result,
        },
        "Successfully fetched section announcements"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch section announcements"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name createAnnouncementAction
 * @description Server action to
 */
export const createAnnouncementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = announcementSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "announcement.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating announcement...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateAnnouncementService();

      const result = await service.createAnnouncement({
        client,
        userId: user.id,
        data: {
          title: data.title,
          content: data.content,
          slug: data.slug,
        },
      });

      if (!result) {
        logger.warn(ctx, "Section not found or access denied");
        throw new Error("Section not found");
      }

      logger.info(ctx, result.message);

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform create announcement action"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name updateAnnouncementAction
 * @description Server action to
 */
export const updateAnnouncementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = announcementSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "announcement.update",
      userId: user.id,
    };

    logger.info(ctx, "Updating announcement...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateAnnouncementService();

      const result = await service.updateAnnouncement({
        client,
        userId: user.id,
        data: {
          id: data.id,
          title: data.title,
          content: data.content,
          slug: data.slug,
        },
      });

      if (!result) {
        logger.warn(ctx, "Section not found or access denied");
        throw new Error("Section not found");
      }

      logger.info(ctx, result.message);

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform update announcement action"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name deleteAnnouncementAction
 * @description Server action to
 */
export const deleteAnnouncementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = deleteAnnouncementSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "announcement.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting announcement...");

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteAnnouncementService();

      const result = await service.deleteAnnouncement({
        client,
        userId: user.id,
        announcementId: data.id,
      });

      logger.info(ctx, result.message);

      revalidatePath("/dashboard/sections");
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform delete announcement action"
      );

      throw error;
    }
  },
  {}
);
