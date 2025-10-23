import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { PredefRequirementFormValues } from "../../schema/predef-requirement.schema";

export function createUpdatePredefRequirementService() {
  return new UpdatePredefRequirementService();
}

/**
 * @name UpdatePredefRequirementService
 * @description Service for updating a predefined requirement for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdatePredefRequirementService();
 */
class UpdatePredefRequirementService {
  private namespace = "requirement_type.update";
  private bucketName = "requirement-templates";

  /**
   * @name updatePredefRequirement
   * Update a predefined requirement for a user.
   */
  async updatePredefRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: PredefRequirementFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      requirement_id: data.id,
      requirement_name: data.name,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating predefined requirement...");

    try {
      if (!data.id || data.id === undefined) {
        throw new Error("Requirement ID is missing");
      }

      const { data: existingReqData, error: existingReqError } = await client
        .from("requirement_types")
        .select("template_file_path, template_file_name")
        .eq("id", data.id)
        .eq("created_by", userId)
        .single();

      if (existingReqError) {
        if (existingReqError.code === "PGRST116") {
          logger.warn(ctx, "Requirement not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: existingReqError.code,
              message: existingReqError.message,
              hint: existingReqError.hint,
              details: existingReqError.details,
            },
          },

          `Supabase error while fetching existing requirement: ${existingReqError.message}`
        );

        throw new Error(
          `Failed to fetch existing requirement: ${data.name} (ID: ${data.id})`
        );
      }

      let filePath: string | null = existingReqData.template_file_path;
      let originalFileName: string | null = existingReqData.template_file_name;

      if (data.template) {
        const fileName = data.template.name;
        const newFilePath = `/${userId}/${fileName}`;
        originalFileName = data.template.name;

        logger.info(
          {
            ...ctx,
            newFilePath,
            fileName,
          },
          "Uploading new template file..."
        );

        const { data: uploadData, error: uploadError } = await client.storage
          .from(this.bucketName)
          .upload(newFilePath, data.template, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          logger.error(
            {
              ...ctx,
              supabaseError: {
                message: uploadError.message,
              },
            },

            `Supabase error upload file to storage: ${uploadError.message}`
          );
          throw new Error("Failed to upload file");
        }

        filePath = uploadData.path ?? newFilePath;

        logger.info(
          {
            ...ctx,
            uploadedFilePath: filePath,
          },

          "Successfully uploaded new template file"
        );

        if (
          existingReqData.template_file_path &&
          existingReqData.template_file_path !== filePath
        ) {
          logger.info(
            {
              ...ctx,
              oldFilePath: existingReqData.template_file_path,
            },

            "Attempting to delete old template file..."
          );

          const { error: deleteError } = await client.storage
            .from(this.bucketName)
            .remove([existingReqData.template_file_path]);

          if (deleteError) {
            logger.warn(
              {
                ...ctx,
                deleteError,
                oldFilePath: existingReqData.template_file_path,
              },

              "Failed to delete old file, but continuing with update"
            );
          } else {
            logger.info(
              {
                ...ctx,
                oldFilePath: existingReqData.template_file_path,
              },

              "Successfully deleted old file"
            );
          }
        } else if (existingReqData.template_file_path === filePath) {
          logger.info(
            {
              ...ctx,
              filePath,
            },

            "New file has same path as old file, file was overwritten via upsert"
          );
        }
      } else {
        logger.info(
          {
            ...ctx,
            preservedFilePath: filePath,
            preservedFileName: originalFileName,
          },
          "No new template provided, preserving existing template"
        );
      }

      logger.info(ctx, "Updating requirement_types record in database...");

      const { data: updatedReq, error: updateError } = await client
        .from("requirement_types")
        .update({
          name: data.name,
          description: data.description || null,
          is_predefined: true,
          allowed_file_types: data.allowedFileTypes,
          max_file_size_bytes: data.maxFileSizeBytes,
          template_file_path: filePath,
          template_file_name: originalFileName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("created_by", userId)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: updateError.code,
              message: updateError.message,
              hint: updateError.hint,
              details: updateError.details,
            },
          },

          `Supabase error while updating predefined requirement: ${updateError.message}`
        );

        throw new Error(`Database Error: ${updateError.message}`);
      }

      logger.info(
        {
          ...ctx,
          updatedRequirementId: updatedReq.id,
        },

        "Successfully updated predefined requirement"
      );

      return {
        success: true,
        data: updatedReq,
        message: "Successfully updated predefined requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error updating predefined requirement"
      );
      throw error;
    }
  }
}
