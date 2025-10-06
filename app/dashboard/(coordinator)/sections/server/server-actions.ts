"use server";

import { format } from "date-fns";

import { InternshipCode } from "@/lib/constants";
import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { SectionFormValues } from "../schemas/section.schema";
import { createCreateSectionService } from "./services/create-section.service";
import { createGetSectionsService } from "./services/get-sections.service";

/**
 * @name getSectionsAction
 * @description Server action to
 */
export const getSectionsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "sections.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching sections...");

  try {
    const browserClient = getSupabaseServerClient();
    const service = createGetSectionsService();

    const result = await service.getSections({
      browserClient,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        reports: result,
      },
      "Successfully fetched sections"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch attendance reports"
    );

    throw error;
  }
}, {});

/**
 * @name getSectionBySlugAction
 * @description Server action to
 */
export const getSectionBySlugAction = enhanceAction(
  async (slug: string, user) => {
    const logger = await getLogger();

    if (!slug || typeof slug !== "string") {
      throw new Error("Section title is required");
    }

    const ctx = {
      name: "attendance_report.fetchBySlug",
      userId: user.id,
      slug,
    };

    logger.info(ctx, "Fetching section by slug...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSectionsService();

      const result = await service.getSectionBySlug({
        client,
        userId: user.id,
        slug,
      });

      if (!result) {
        logger.warn(ctx, "Section not found or access denied");
        throw new Error("Section not found");
      }

      logger.info(ctx, "Successfully fetched section");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch attendance report by slug"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name createSectionAction
 * @description Server action to
 */
export const createSectionAction = enhanceAction(
  async (data: SectionFormValues, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "section.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating section...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateSectionService();

      const result = await service.createSection({
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

      if (!result.success) {
        logger.warn(
          {
            ...ctx,
          },
          "Section creation failed in service"
        );

        throw new Error(result.message || "Something went wrong");
      }

      logger.info(
        {
          ...ctx,
          section: result.data,
        },
        "Successfully created section"
      );

      return {
        success: true,
        message: "Successfully created a section",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create section"
      );

      throw error;
    }
  },
  {}
);
