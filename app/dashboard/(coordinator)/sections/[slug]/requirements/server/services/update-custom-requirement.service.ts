import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { CustomRequirementFormValues } from "../../../../schemas/requirement.schema";

export function createUpdateCustomRequirementService() {
  return new UpdateCustomRequirementService();
}

/**
 * @name UpdateCustomRequirementService
 * @description Service for updating a custom requirement for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateCustomRequirementService();
 */
class UpdateCustomRequirementService {
  private namespace = "requirement_type.update";
  private bucketName = "requirement-templates";

  /**
   * @name updateCustomRequirement
   * Update a custom requirement for a user.
   */
  async updateCustomRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: CustomRequirementFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      requirement_id: data.id,
      requirement_name: data.name,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating custom requirement...");

    try {
      let filePath: string | null = null;
      let originalFileName: string | null = null;

      if (!data.id || data.id === undefined) {
        throw new Error("Requirement ID is missing");
      }

      const { data: pbData, error: pbError } = await client
        .from("program_batch")
        .select("id")
        .eq("title", data.slug)
        .eq("coordinator_id", userId)
        .limit(1)
        .single();

      if (pbError) {
        if (pbError.code === "PGRST116") {
          logger.warn(ctx, "Section not found or access denied");
          return null;
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: pbError.code,
              message: pbError.message,
              hint: pbError.hint,
              details: pbError.details,
            },
          },

          `Supabase error while fetching program batch: ${pbError.message}`
        );

        throw new Error("Failed to fetch program batch");
      }

      if (data.template) {
        const { data: existingRequirement, error: existingReqError } =
          await client
            .from("batch_requirements")
            .select(
              `
              id,
              requirement_types!inner(
                name,
                template_file_path,
                template_file_name
              )
            `
            )
            .eq("program_batch_id", pbData.id)
            .eq("requirement_types.name", data.name)
            .maybeSingle();

        if (existingReqError) {
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

            `Supabase error while checking for existing requirements: ${existingReqError.message}`
          );

          throw new Error("Failed to check for existing requirements");
        }

        const fileName = data.template.name;
        filePath = `/${userId}/${pbData.id}/${fileName}`;
        originalFileName = data.template.name;

        const { data: uploadData, error: uploadError } = await client.storage
          .from(this.bucketName)
          .upload(filePath, data.template, {
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

        filePath = uploadData.path ?? filePath;

        if (
          existingRequirement?.requirement_types.template_file_path &&
          existingRequirement.requirement_types.template_file_path !== filePath
        ) {
          const { error: deleteError } = await client.storage
            .from(this.bucketName)
            .remove([existingRequirement.requirement_types.template_file_path]);

          if (deleteError) {
            logger.warn(
              {
                ...ctx,
                deleteError,
                oldFilePath:
                  existingRequirement.requirement_types.template_file_path,
              },
              "Failed to delete old file, but continuing with update"
            );
          } else {
            logger.info(
              {
                ...ctx,
                oldFilePath:
                  existingRequirement.requirement_types.template_file_path,
              },
              "Successfully deleted old file"
            );
          }
        }
      }

      const { data: updatedReq, error: updateError } = await client
        .from("requirement_types")
        .update({
          name: data.name,
          description: data.description || null,
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
          `Supabase error while updating custom requirement: ${updateError.message}`
        );
        throw new Error("Failed to update custom requirement");
      }

      logger.info(ctx, "Successfully updated custom requirement");

      return {
        success: true,
        data: updatedReq,
        message: "Successfully updated custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error updating custom requirement"
      );
      throw error;
    }
  }
}
