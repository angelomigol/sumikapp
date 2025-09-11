"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createGetSectionTraineeReportsService } from "./services/get-section-trainee-reports.service";

/**
 * @name getSectionTraineeReportsAction
 * @description Server action to
 */
export const getSectionTraineeReportsAction = enhanceAction(
  async (slug: string, user) => {
    const logger = await getLogger();

    if (!slug || typeof slug !== "string") {
      throw new Error("Section title is required");
    }

    const ctx = {
      name: "section_trainee_reports.fetch",
      section: slug,
      userId: user.id,
    };

    logger.info(ctx, "Fetching trainee reports");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSectionTraineeReportsService();

      const result = await service.getSectionTraineeReports({
        client,
        userId: user.id,
        sectionName: slug,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched section trainee reports"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch section trainee reports"
      );

      throw error;
    }
  },
  {}
);

export const getSectionTraineeReportByIdAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Invalid report ID");
    }

    const ctx = {
      name: "section_trainee_report.fetchById",
      userId: user.id,
      reportId,
    };

    logger.info(ctx, "Fetching section trainee report by ID...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetSectionTraineeReportsService();

      const result = await service.getSectionTraineeReportById({
        client,
        userId: user.id,
        reportId,
      });

      if (!result) {
        logger.warn(ctx, "Attendance report not found or access denied");
        throw new Error("Report not found");
      }

      logger.info(ctx, "Successfully fetched section trainee report");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch section trainee report"
      );

      throw error;
    }
  },
  {}
);
