"use server";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { predefRequirementSchema } from "../schema/predef-requirement.schema";
import { createCreatePredefRequirementService } from "./services/create-predef-requirement.service";
import { createDeletePredefRequirementService } from "./services/delete-predef-requirement.service";
import { createGetPredefRequirementsService } from "./services/get-predef-requirements.service";
import { createUpdatePredefRequirementService } from "./services/update-predef-requirement.service";

/**
 * @name getPredefRequirementsAction
 * @description Server action to
 */
export const getPredefRequirementsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "requirement_types.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching predefined requirements...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetPredefRequirementsService();

    const result = await service.getPredefRequirements({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        requirements: result.length,
      },
      "Successfully fetched predefined requirements"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch predefined requirements"
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch predefined requirements";

    throw new Error(errorMessage);
  }
}, {});

/**
 * @name createPredefRequirementAction
 * @description Server action to
 */
export const createPredefRequirementAction = enhanceAction(
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
      template:
        formObject.template instanceof File ? formObject.template : undefined,
    };

    const { data, success, error } =
      predefRequirementSchema.safeParse(parsedObject);

    if (!success) {
      throw new Error(
        `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
      );
    }

    const ctx = {
      name: "requirement_type.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating predefined requirement...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreatePredefRequirementService();

      const result = await service.createPredefRequirement({
        client,
        userId: user.id,
        data: {
          name: data.name,
          description: data.description,
          allowedFileTypes: data.allowedFileTypes,
          maxFileSizeBytes: data.maxFileSizeBytes,
          template: data.template,
        },
      });

      if (!result?.success) {
        logger.warn(
          {
            ...ctx,
          },
          "predefined requirement creation failed in service"
        );

        throw new Error(result?.message || "Something went wrong");
      }

      logger.info(
        {
          ...ctx,
          section: result.data,
        },
        "Successfully created predefined requirement"
      );

      return {
        success: true,
        message: "Successfully created a predefined requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create predefined requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create predefined requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name updatePredefRequirementAction
 * @description Server action to update a predefined requirement
 */
export const updatePredefRequirementAction = enhanceAction(
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
      template:
        formObject.template instanceof File ? formObject.template : undefined,
    };

    const { data, success, error } =
      predefRequirementSchema.safeParse(parsedObject);

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

    logger.info(ctx, "Updating predefined requirement...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdatePredefRequirementService();

      const result = await service.updatePredefRequirement({
        client,
        userId: user.id,
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          allowedFileTypes: data.allowedFileTypes,
          maxFileSizeBytes: data.maxFileSizeBytes,
          template: data.template,
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

        "Failed to update predefined requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update predefined requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);

/**
 * @name deleteCustomRequirementAction
 * @description Server action to
 */
export const deletePredefRequirementAction = enhanceAction(
  async (id: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "requirement_type.delete",
      userId: user.id,
    };

    logger.info(ctx, `Deleting predefined requirement...`);

    try {
      const client = getSupabaseServerClient();
      const service = createDeletePredefRequirementService();

      await service.deletePredefRequirement({
        client,
        userId: user.id,
        requirementId: id,
      });

      logger.info(ctx, `Successfully deleted predefined requirement`);

      return {
        success: true,
        message: "Successfully deleted predefined requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete predefined requirement"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete predefined requirement";

      throw new Error(errorMessage);
    }
  },
  {}
);
