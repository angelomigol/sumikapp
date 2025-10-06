"use server";

import { revalidatePath } from "next/cache";

import { EntryStatus } from "@/lib/constants";
import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import {
  ActivityEntrySchema,
  deleteActivityReportSchema,
} from "../../schema/activity-report-schema";
import { createDeleteAccomplishmentReportService } from "./service/delete-accomplishment-report.service";
import { createInsertActivityEntryService } from "./service/insert-activity-entry.service";
import { createSubmitActivityReportService } from "./service/submit-activity-report.service";

export const deleteActivityReportAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = deleteActivityReportSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "activity_report.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting activity report...");

    const client = getSupabaseServerClient();
    const service = createDeleteAccomplishmentReportService();

    const result = await service.deleteReport({
      client,
      userId: user.id,
      reportId: data.id,
    });

    logger.info(ctx, "Activity report successfully deleted");

    revalidatePath("/dashboard/activity");

    return result;
  },
  {}
);

export const insertActivityEntryAction = enhanceAction(
  async (data: ActivityEntrySchema, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "activity_entry.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating activity entry...");

    const client = getSupabaseServerClient();
    const service = createInsertActivityEntryService();

    const result = await service.insertEntry({
      client,
      userId: user.id,
      reportId: data.report_id,
      data: {
        ...data,
        status: data.status as EntryStatus,
      },
    });

    logger.info(
      {
        ...ctx,
        activity_entry: result?.data,
      },
      "Successfully created activity entry"
    );

    return {
      success: true,
      message: "Successfully created activity entry",
    };
  },
  {}
);

export const submitActivityReportAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "activity_report.submit",
      userId: user.id,
    };

    logger.info(ctx, "Submitting activity report...");

    const client = getSupabaseServerClient();
    const service = createSubmitActivityReportService();

    const result = await service.submitReport({
      client,
      userId: user.id,
      reportId,
    });

    logger.info(ctx, result.message);

    return result;
  },
  {}
);
