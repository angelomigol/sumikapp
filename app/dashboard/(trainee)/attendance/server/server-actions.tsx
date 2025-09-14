"use server";

import { format } from "date-fns";

import { NormalizedAttendanceReport } from "@/hooks/use-attendance-reports";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { AttendanceFormValues } from "../schema/attendance-report-schema";
import { createCreateAttendanceReportService } from "./services/create-attendance-report.service";
import { createGetAttendanceReportsService } from "./services/get-attendance-reports.service";

/**
 * @name getAttendanceReportsAction
 * @description Server action to
 */
export const getAttendanceReportsAction = enhanceAction(
  async (_: any, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "attendance_reports.fetch",
      userId: user.id,
    };

    logger.info(ctx, "Fetching attendance reports...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetAttendanceReportsService();

      const result = await service.getAttendanceReports({
        client,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched attendance reports"
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
  },
  {}
);

/**
 * @name getAttendanceReportByIdAction
 * @description Server action to
 */
export const getAttendanceReportByIdAction = enhanceAction(
  async (reportId: string, user): Promise<NormalizedAttendanceReport> => {
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
      const client = getSupabaseServerClient();
      const service = createGetAttendanceReportsService();

      const result = await service.getAttendanceReportById({
        client,
        userId: user.id,
        reportId,
      });

      if (!result) {
        logger.warn(ctx, "Attendance report not found or access denied");
        throw new Error("Report not found");
      }

      logger.info(ctx, "Successfully fetched attendance report");

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch attendance report"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name createAttendanceReportAction
 * @description Server action to
 */
export const createAttendanceReportAction = enhanceAction(
  async (data: AttendanceFormValues, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "",
      userId: user.id,
    };

    logger.info(ctx, "Creating attendance report...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateAttendanceReportService();

      const result = await service.createAttendanceReport({
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
        "Successfully created attendance report"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create attendance report"
      );

      throw error;
    }
  },
  {}
);
