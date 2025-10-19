"use server";

import { revalidatePath } from "next/cache";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { createDeleteRequirementService } from "./services/delete-requirement.service";
import { createGetRequirementsService } from "./services/get-requirements.service";
import { createUploadRequirementsService } from "./services/upload-requirement.service";

/**
 * @name getRequirementsAction
 * @description Server action to
 */
export const getRequirementsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "requirements.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching requirements...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetRequirementsService();

    const result = await service.getRequirements({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        reports: result,
      },
      "Successfully fetched requirements"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch requirements"
    );

    throw error;
  }
}, {});

/**
 * @name uploadRequirementAction
 * @description Server action to upload a requirement file
 */
export const uploadRequirementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirements.upload",
      userId: user.id,
    };

    // Extract form data
    const file = formData.get("file") as File;
    const requirement_name = formData.get("requirement_name") as string;

    // Basic validation
    if (!file || !(file instanceof File)) {
      throw new Error("File is required");
    }

    if (!requirement_name) {
      throw new Error("Requirement name is required");
    }

    if (file.size === 0) {
      throw new Error("File cannot be empty");
    }

    logger.info(ctx, "Processing requirement upload...");

    try {
      const client = getSupabaseServerClient();
      const service = createUploadRequirementsService();

      const result = await service.uploadRequirement({
        client,
        docFile: file,
        requirementName: requirement_name,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          result,
        },
        "Successfully uploaded requirement"
      );

      revalidatePath("/dashboard/requirements");

      return {
        success: true,
        message: "Document uploaded successfully",
        requirementId: result.requirementId,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to upload requirement"
      );

      throw error;
    }
  },
  { auth: true }
);

/**
 * @name submitRequirementAction
 * @description Server action to submit an uploaded requirement for review
 */
export const submitRequirementAction = enhanceAction(
  async (requirementId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirements.submit",
      userId: user.id,
    };

    logger.info(ctx, "Processing requirement submission...");

    try {
      const client = getSupabaseServerClient();
      const service = createUploadRequirementsService();

      const result = await service.submitRequirement({
        client,
        requirementId,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          result,
        },
        "Successfully submitted requirement"
      );

      revalidatePath("/dashboard/requirements");

      return {
        success: true,
        message: "Document submitted for review",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to submit requirement"
      );

      throw error;
    }
  },
  { auth: true }
);

/**
 * @name deleteRequirementAction
 * @description Server action to delete an uploaded requirement
 */
export const deleteRequirementAction = enhanceAction(
  async (requirementId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirements.delete",
      userId: user.id,
    };

    logger.info(ctx, "Processing requirement deletion...");

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteRequirementService();

      const result = await service.deleteRequirement({
        client,
        requirementId,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          result,
        },
        "Successfully deleted requirement"
      );

      revalidatePath("/dashboard/requirements");

      return {
        success: true,
        message: "Document successfully deleted",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete requirement"
      );

      throw error;
    }
  },
  { auth: true }
);
