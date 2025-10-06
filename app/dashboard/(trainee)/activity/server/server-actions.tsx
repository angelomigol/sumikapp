"use server";

import { format } from "date-fns";

import { NormalizedAccomplishmentReport } from "@/hooks/use-activity-reports";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { ActivityFormValues } from "../schema/activity-report-schema";
import { createCreateActivityReportService } from "./services/create-activity-report.service";
import { createGetActivityReportsService } from "./services/get-activity-reports.service";

/**
 * @name getActivityReportsAction
 * @description Server action to
 */
export const getActivityReportsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "activity_reports.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching activity reports...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetActivityReportsService();

    const result = await service.getActivityReports({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        reports: result,
      },
      "Successfully fetched activity reports"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch accomplishment reports"
    );

    throw error;
  }
}, {});

/**
 * @name getActivityReportByIdAction
 * @description Server action to
 */
export const getActivityReportByIdAction = enhanceAction(
  async (reportId: string, user): Promise<NormalizedAccomplishmentReport> => {
    const logger = await getLogger();

    if (!reportId || typeof reportId !== "string") {
      throw new Error("Report ID is required");
    }

    const ctx = {
      name: "activity_report.fetchById",
      userId: user.id,
      reportId,
    };

    logger.info(ctx, "Fetching activity report by ID...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetActivityReportsService();

      const result = await service.getActivityReportById({
        client,
        userId: user.id,
        reportId,
      });

      if (!result) {
        logger.warn(ctx, "Activity report not found or access denied");
        throw new Error("Report not found");
      }

      logger.info(ctx, "Successfully fetched activity report");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch activity report by ID"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name createActivityReportAction
 * @description Server action to
 */
export const createActivityReportAction = enhanceAction(
  async (data: ActivityFormValues, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "",
      userId: user.id,
    };

    logger.info(ctx, "Creating activity report...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateActivityReportService();

      const result = await service.createActivityReport({
        client,
        userId: user.id,
        data: {
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
        },
      });

      logger.info(
        {
          ...ctx,
          attendance_report: result.data,
        },
        "Successfully created activity report"
      );

      return {
        success: true,
        message: "Successfully created a activity report",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create activity report"
      );

      throw error;
    }
  },
  {}
);
