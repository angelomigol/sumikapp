"use server";

import { revalidatePath } from "next/cache";

import { EntryStatus } from "@/lib/constants";
import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import {
  DailyEntrySchema,
  deleteWeeklyReportSchema,
} from "@/schemas/weekly-report/weekly-report.schema";

import { createDeleteWeeklyReportService } from "./services/delete-weekly-report.service";
import { createInsertWeeklyReportEntryService } from "./services/insert-weekly-report-entry.service";
import { createSubmitWeeklyReportService } from "./services/submit-weekly-report.service";

/**
 * @name deleteWeeklyReportAction
 * @description Server action to
 *
 */
export const deleteWeeklyReportAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, error } = deleteWeeklyReportSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (error) {
      throw new Error(`Invalid form data: ${error.message}`);
    }

    const ctx = {
      name: "weekly_report.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting weekly report...");

    const client = getSupabaseServerClient();
    const service = createDeleteWeeklyReportService();

    const result = await service.deleteReport({
      client,
      userId: user.id,
      reportId: data.id,
    });

    logger.info(ctx, result.message);

    revalidatePath("/dashboard/weekly-reports");
  },
  { auth: true }
);

/**
 * @name insertWeeklyReportEntryAction
 * @description Server action to
 *
 */
export const insertWeeklyReportEntryAction = enhanceAction(
  async (data: DailyEntrySchema, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "daily_entry.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating weekly report entry...");

    const server = getSupabaseServerClient();
    const service = createInsertWeeklyReportEntryService();

    try {
      const result = await service.insertEntry({
        server,
        userId: user.id,
        data: {
          ...data,
          status: data.status as EntryStatus,
        },
      });

      return result?.message;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create weekly report entry"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create weekly report entry";

      throw new Error(errorMessage);
    }
  },
  { auth: true }
);

/**
 * @name submitWeeklyReportAction
 * @description Server action to
 *
 */
export const submitWeeklyReportAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "weekly_report.submit",
      userId: user.id,
    };

    logger.info(ctx, "Submitting weekly report...");

    const server = getSupabaseServerClient();
    const service = createSubmitWeeklyReportService();

    try {
      const result = await service.submitReport({
        server,
        userId: user.id,
        reportId,
      });

      return result.message;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to submit weekly report"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit weekly report";

      throw new Error(errorMessage);
    }
  },
  { auth: true }
);
