"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { updateEntryStatusSchema } from "../schema/update-entry-status.schema";
import { createSubmitEntryFeedbackService } from "./services/submit-entry-feedback.service";
import { createUpdateEntryStatusService } from "./services/update-entry-status.service";
import { createUpdateTraineeReportService } from "./services/update-trainee-report-status.service";

/**
 * @name approveReportAction
 * @description Server action to
 */
export const approveReportAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "trainee_reports.update.approve",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee report...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateTraineeReportService();

      const result = await service.approveReport({
        client,
        userId: user.id,
        reportId,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully approved trainee reports"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee reports"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name rejectReportAction
 * @description Server action to
 */
export const rejectReportAction = enhanceAction(
  async (reportId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "trainee_reports.update.reject",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee report...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateTraineeReportService();

      const result = await service.rejectReport({
        client,
        userId: user.id,
        reportId,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully rejected trainee reports"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee reports"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name updateEntryAction
 * @description Server action to
 */
export const updateEntryAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = updateEntryStatusSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "entry_status.update",
      userId: user.id,
    };

    logger.info(ctx, "Updating entry status");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateEntryStatusService();

      const result = await service.updateStatus({
        client,
        userId: user.id,
        entryId: data.entryId,
        status: data.status,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully updated entry status"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update entry status"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name submitFeedbackAction
 * @description Server action to
 */
export const submitFeedbackAction = enhanceAction(
  async (data: { entryId: string; feedback: string }, user) => {
    const logger = await getLogger();
    const { entryId, feedback } = data;

    if (!entryId || typeof entryId !== "string") {
      throw new Error("Invalid entry ID");
    }

    if (feedback && feedback.length > 200) {
      throw new Error("Feedback cannot exceed 200 characters");
    }

    const ctx = {
      name: "weekly_report_entry.submitFeedback",
      userId: user.id,
      entryId,
    };

    logger.info(ctx, "Submitting feedback for entry...");

    try {
      const server = getSupabaseServerClient();
      const service = createSubmitEntryFeedbackService();

      const result = await service.submitFeedback({
        server,
        userId: user.id,
        entryId,
        feedback,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully submitted feedback"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to submit feedback"
      );

      throw error;
    }
  },
  {}
);
