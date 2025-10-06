"use server";

import { revalidatePath } from "next/cache";

import { EntryStatus } from "@/lib/constants";
import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import {
  AttendanceEntrySchema,
  deleteAttendanceReportSchema,
} from "../../schema/attendance-report-schema";
import { createDeleteAttendanceReportService } from "./services/delete-attendance-report.service";
import { createInsertAttendanceEntryService } from "./services/insert-attendance-entry.service";
import { createSubmitAttendanceReportService } from "./services/submit-attendance-report.service";

export const deleteAttendanceReportAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = deleteAttendanceReportSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "attendance_report.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting attendance report...");

    const client = getSupabaseServerClient();
    const service = createDeleteAttendanceReportService();

    const result = await service.deleteReport({
      client,
      userId: user.id,
      reportId: data.id,
    });

    logger.info(ctx, "Attendance report successfully deleted");

    revalidatePath("/dashboard/attendance");

    return result;
  },
  {}
);

export const insertAttendanceEntryAction = enhanceAction(
  async (data: AttendanceEntrySchema, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "attendance_entry.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating attendance entry...");

    const client = getSupabaseServerClient();
    const service = createInsertAttendanceEntryService();

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
        attendance_entry: result?.data,
      },
      "Successfully created attendance entry"
    );

    return {
      success: true,
      message: "Successfully created attendance entry",
    };
  },
  {}
);

export const submitAttendanceReportAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "attendance_report.submit",
      userId: user.id,
    };

    logger.info(ctx, "Submitting attendance report...");

    const client = getSupabaseServerClient();
    const service = createSubmitAttendanceReportService();

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
