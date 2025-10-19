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
 * @description Server action to delete weekly report
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

    const server = getSupabaseServerClient();
    const service = createDeleteWeeklyReportService();

    const result = await service.deleteReport({
      server,
      userId: user.id,
      reportId: data.id,
    });

    logger.info(ctx, result.message);

    revalidatePath("/dashboard/weekly-reports");

    return result;
  },
  { auth: true }
);

/**
 * @name insertWeeklyReportEntryAction
 * @description Server action to insert weekly report entry WITHOUT files
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
      const { ...entryData } = data;

      const result = await service.insertEntry({
        server,
        userId: user.id,
        data: {
          ...entryData,
          status: data.status as EntryStatus,
        },
      });

      return result;
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
 * @description Server action to submit weekly report
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

/**
 * @name uploadEntryFileAttachments
 * @description Server action to upload file attachments for an entry
 *
 */
export const uploadEntryFileAttachmentsAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const entryId = formData.get("entry_id") as string;
    const reportId = formData.get("report_id") as string;
    const files = formData.getAll("files") as File[];

    const ctx = {
      name: "entry_files.upload",
      userId: user.id,
      entryId,
    };

    logger.info(ctx, "Uploading entry file attachments...");

    const server = getSupabaseServerClient();
    const service = createInsertWeeklyReportEntryService();

    try {
      const { data: entry, error: entryError } = await server
        .from("weekly_report_entries")
        .select("id, report_id")
        .eq("id", entryId)
        .single();

      if (entryError || !entry) {
        throw new Error("Entry not found");
      }

      if (!files || files.length === 0) {
        return { success: true, message: "No files to upload" };
      }

      const result = await service.uploadAttachments({
        server,
        userId: user.id,
        entryId,
        reportId,
        files,
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
