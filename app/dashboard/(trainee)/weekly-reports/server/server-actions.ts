"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import {
  NormalizedWeeklyReport,
  WeeklyReportFormValues,
} from "@/schemas/weekly-report/weekly-report.schema";

import { createCreateWeeklyReportService } from "./services/create-weekly-report.service";
import { createGetWeeklyReportsService } from "./services/get-weekly-reports.service";

/**
 * @name getWeeklyReportsAction
 * @description Server action to
 *
 */
export const getWeeklyReportsAction = enhanceAction(
  async (_, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "weekly_reports.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching weekly reports...");

    try {
      const server = getSupabaseServerClient();
      const service = createGetWeeklyReportsService();

      const result = await service.getWeeklyReports({
        server,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result.data.length,
        },

        result.message
      );

      return result.data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch weekly reports"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch weekly reports";

      throw new Error(errorMessage);
    }
  },
  { auth: true }
);

/**
 * @name getWeeklyReportByIdAction
 * @description Server action to
 */
export const getWeeklyReportByIdAction = enhanceAction(
  async (reportId: string, user): Promise<NormalizedWeeklyReport> => {
    const logger = await getLogger();

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Invalid report ID");
    }

    const ctx = {
      name: "attendance_report.fetchById",
      userId: user.id,
      reportId,
    };

    logger.info(ctx, "Fetching attendance report by ID...");

    try {
      const server = getSupabaseServerClient();
      const service = createGetWeeklyReportsService();

      const result = await service.getWeeklyReportsById({
        server,
        userId: user.id,
        reportId,
      });

      if (!result) {
        logger.warn(ctx, "Weekly report not found or access denied");
        throw new Error("Report not found");
      }

      logger.info(ctx, result.message);

      return result.data;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch weekly report by id"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch weekly report by id";

      throw new Error(errorMessage);
    }
  },
  { auth: true }
);

/**
 * @name createWeeklyReportAction
 * @description Server action to
 */
export const createWeeklyReportAction = enhanceAction(
  async (data: WeeklyReportFormValues, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "weekly_report.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating weekly report...");

    try {
      const server = getSupabaseServerClient();
      const service = createCreateWeeklyReportService();

      const result = await service.createWeeklyReport({
        server,
        userId: user.id,
        data,
      });

      logger.info(
        {
          ...ctx,
          weekly_report: result.data,
        },

        result.message
      );

      return result.message;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create weekly report"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create weekly report";

      throw new Error(errorMessage);
    }
  },
  { auth: true }
);
