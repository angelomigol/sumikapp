"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createGetTraineeReportsService } from "./services/get-trainee-reports";

/**
 * @name getTraineeReportsAction
 * @description Server action to
 */
export const getTraineeReportsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "trainee_reports.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching trainee reports");

  try {
    const server = getSupabaseServerClient();
    const service = createGetTraineeReportsService();

    const result = await service.getTraineeReports({
      server,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        reports: result,
      },
      "Successfully fetched trainee reports"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch trainee reports"
    );

    throw error;
  }
}, {});

export const getTraineeReportByIdAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Invalid report ID");
    }

    const ctx = {
      name: "trainee_report.fetchById",
      userId: user.id,
      reportId,
    };

    logger.info(ctx, "Fetching trainee report by ID...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetTraineeReportsService();

      const result = await service.getTraineeReportById({
        client,
        userId: user.id,
        reportId,
      });

      if (!result) {
        logger.warn(ctx, "Attendance report not found or access denied");
        throw new Error("Report not found");
      }

      logger.info(ctx, "Successfully fetched trainee report");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch trainee report"
      );

      throw error;
    }
  },
  {}
);
