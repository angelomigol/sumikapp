"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerAdminClient } from "@/utils/supabase/client/server-admin-client";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { customRequirementSchema } from "../../../schemas/requirement.schema";
import { createCreateCustomRequirementService } from "./services/create-custom-requirement.service";
import { createDeleteCustomRequirementService } from "./services/delete-custom-requirement.service";
import { createGetBatchRequirementsService } from "./services/get-batch-requirements.service";
import { createGetDocumentSignedUrlService } from "./services/get-document-signed-url.service";
import { createGetTraineeRequirementsService } from "./services/get-trainee-requirements.service";
import { createUpdateCustomRequirementService } from "./services/update-custom-requirement.service";
import { createUpdateInternshipStatusService } from "./services/update-internship-status.service";
import { createUpdateSubmissionStatusService } from "./services/update-submission-status.service";

/**
 * @name getTraineeRequirementsAction
 * @description Server action to
 */
export const getTraineeRequirementsAction = enhanceAction(
  async (sectionName: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "trainee_requirements.fetch",
      userId: user.id,
      sectionName,
    };

    logger.info(ctx, "Fetching trainee requirements...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetTraineeRequirementsService();

      const result = await service.getTraineeRequirements({
        client,
        sectionName,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched trainee requirements"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch trainee requirements"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trainee requirements";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name getDocumentSignedUrlAction
 * @description Server action to
 */
export const getDocumentSignedUrlAction = enhanceAction(
  async (filePath: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "signedUrl.fetch",
      userId: user.id,
      filePath,
    };

    logger.info(ctx, "Fetching signed url...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetDocumentSignedUrlService();

      const result = await service.getSignedUrl({
        client,
        filePath,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched signed url"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch signed url"
      );

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch signed url";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name getBatchRequirementsAction
 * @description Server action to
 */
export const getBatchRequirementsAction = enhanceAction(
  async (sectionName: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "batch_requirements.fetch",
      userId: user.id,
      sectionName,
    };

    logger.info(ctx, "Fetching batch requirements...");

    try {
      const client = getSupabaseServerClient();
      const service = createGetBatchRequirementsService();

      const result = await service.getBatchRequirements({
        client,
        sectionName,
        userId: user.id,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully fetched batch requirements"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to fetch batch requirements"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch batch requirements";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name createCustomRequirementAction
 * @description Server action to
 */
export const createCustomRequirementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const formObject = Object.fromEntries(formData.entries()) as Record<
      string,
      FormDataEntryValue
    >;

    const parsedObject: {
      name: string;
      description?: string;
      allowedFileTypes: string[];
      maxFileSizeBytes: number;
      template?: File;
      slug: string;
    } = {
      name: String(formObject.name ?? ""),
      description:
        typeof formObject.description === "string"
          ? formObject.description
          : undefined,
      allowedFileTypes:
        typeof formObject.allowedFileTypes === "string"
          ? JSON.parse(formObject.allowedFileTypes)
          : [],
      maxFileSizeBytes:
        typeof formObject.maxFileSizeBytes === "string"
          ? Number(formObject.maxFileSizeBytes)
          : 0,
      slug: String(formObject.slug ?? ""),
      template:
        formObject.template instanceof File ? formObject.template : undefined,
    };

    const { data, success, error } =
      customRequirementSchema.safeParse(parsedObject);

    if (!success) {
      throw new Error(
        `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
      );
    }

    const ctx = {
      name: "requirement_type.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating custom requirement...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateCustomRequirementService();

      const result = await service.createCustomRequirement({
        client,
        userId: user.id,
        data: {
          name: data.name,
          description: data.description,
          allowedFileTypes: data.allowedFileTypes,
          maxFileSizeBytes: data.maxFileSizeBytes,
          template: data.template,
          slug: data.slug,
        },
      });

      if (!result?.success) {
        logger.warn(
          {
            ...ctx,
          },
          "Custom requirement creation failed in service"
        );

        throw new Error(result?.message || "Something went wrong");
      }

      logger.info(
        {
          ...ctx,
          section: result.data,
        },
        "Successfully created custom requirement"
      );

      return {
        success: true,
        message: "Successfully created a custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create custom requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create custom requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name updateCustomRequirementAction
 * @description Server action to update a custom requirement
 */
export const updateCustomRequirementAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const formObject = Object.fromEntries(formData.entries()) as Record<
      string,
      FormDataEntryValue
    >;

    const parsedObject: {
      id?: string;
      name: string;
      description?: string;
      allowedFileTypes: string[];
      maxFileSizeBytes: number;
      template?: File;
      slug: string;
    } = {
      id:
        typeof formObject.id === "string" && formObject.id.trim().length > 0
          ? formObject.id
          : undefined,
      name: String(formObject.name ?? ""),
      description:
        typeof formObject.description === "string"
          ? formObject.description
          : undefined,
      allowedFileTypes:
        typeof formObject.allowedFileTypes === "string"
          ? JSON.parse(formObject.allowedFileTypes)
          : [],
      maxFileSizeBytes:
        typeof formObject.maxFileSizeBytes === "string"
          ? Number(formObject.maxFileSizeBytes)
          : 0,
      slug: String(formObject.slug ?? ""),
      template:
        formObject.template instanceof File ? formObject.template : undefined,
    };

    const { data, success, error } =
      customRequirementSchema.safeParse(parsedObject);

    if (!success) {
      throw new Error(
        `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
      );
    }

    const ctx = {
      name: "requirement_type.update",
      userId: user.id,
      requirementId: data.id,
    };

    logger.info(ctx, "Updating custom requirement...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateCustomRequirementService();

      const result = await service.updateCustomRequirement({
        client,
        userId: user.id,
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          allowedFileTypes: data.allowedFileTypes,
          maxFileSizeBytes: data.maxFileSizeBytes,
          template: data.template,
          slug: data.slug,
        },
      });

      if (!result) {
        logger.warn(ctx, "Requirement not found or access denied");
        throw new Error("Requirement not found");
      }

      logger.info(ctx, result.message);

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to update custom requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update custom requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name deleteCustomRequirementAction
 * @description Server action to
 */
export const deleteCustomRequirementAction = enhanceAction(
  async (id: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirement_type.delete",
      userId: user.id,
    };

    logger.info(ctx, `Deleting custom requirement...`);

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteCustomRequirementService();

      await service.deleteCustomRequirement({
        client,
        userId: user.id,
        requirementId: id,
      });

      logger.info(ctx, `Successfully deleted custom requirement`);

      return {
        success: true,
        message: "Successfully deleted custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete custom requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete custom requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name approveDocumentAction
 * @description Server action to
 */
export const approveDocumentAction = enhanceAction(
  async (documentId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirement_type.approve",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee submission...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateSubmissionStatusService();

      const result = await service.approveSubmission({
        client,
        userId: user.id,
        documentId,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully approved trainee submission"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee submission"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name rejectDocumentAction
 * @description Server action to
 */
export const rejectDocumentAction = enhanceAction(
  async (data: { documentId: string; feedback?: string }, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirement_type.reject",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee submission...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateSubmissionStatusService();

      const result = await service.rejectSubmission({
        client,
        userId: user.id,
        documentId: data.documentId,
        feedback: data.feedback,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully rejected trainee submission"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee submission"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name approveInternshipFormAction
 * @description Server action to
 */
export const approveInternshipFormAction = enhanceAction(
  async (internshipId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "internshi_details.approve",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee submission...");

    try {
      const adminClient = getSupabaseServerAdminClient();
      const client = getSupabaseServerClient();
      const service = createUpdateInternshipStatusService();

      const result = await service.approveForm({
        adminClient,
        client,
        userId: user.id,
        internshipId,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully approved trainee internship form"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee internship form"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name rejectInternshipFormAction
 * @description Server action to
 */
export const rejectInternshipFormAction = enhanceAction(
  async (data: { internshipId: string; feedback?: string }, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "internship_details.reject",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee internship form...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateInternshipStatusService();

      const result = await service.rejectForm({
        client,
        userId: user.id,
        internshipId: data.internshipId,
        feedback: data.feedback,
      });

      logger.info(
        {
          ...ctx,
          reports: result,
        },
        "Successfully rejected trainee internship form"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update trainee internship form"
      );

      throw error;
    }
  },
  {}
);
