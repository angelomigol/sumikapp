import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { PredefRequirementFormValues } from "../../schema/predef-requirement.schema";

export function createCreatePredefRequirementService() {
  return new CreatePredefRequirementService();
}

/**
 * @name CreatePredefRequirementService
 * @description Service for creating a predefined requirement for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreatePredefRequirementService();
 */
class CreatePredefRequirementService {
  private namespace = "requirement_type.create";
  private bucketName = "requirement-templates";

  /**
   * @name createPredefRequirement
   * Create a predefined requirement for a user.
   */
  async createPredefRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: PredefRequirementFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      requirement_name: data.name,
      created_by: userId,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating predefined requirement for user...");

    try {
      // Step 1: Check if requirement with the same name already exists for this batch
      const { data: existingRequirement, error: existingReqError } =
        await client
          .from("requirement_types")
          .select(`*`)
          .eq("name", data.name)
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

      if (existingRequirement) {
        logger.warn(
          ctx,
          "Requirement with this name already exists in the batch"
        );

        throw new Error(
          `A requirement with the name "${data.name}" already exists`
        );
      }

      let templateFilePath: string | null = null;
      let templateFileName: string | null = null;

      // Step 2: Insert template file to storage
      if (data.template) {
        const fileName = data.template.name;
        const filePath = `/${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await client.storage
          .from(this.bucketName)
          .upload(filePath, data.template, {
            upsert: true,
            contentType: data.template.type,
          });

        if (uploadError) {
          logger.error(
            {
              ...ctx,
              error: uploadError,
              fileName: fileName,
            },

            "Failed to upload template file"
          );

          throw new Error("Failed to upload template file");
        }

        logger.info(
          {
            ...ctx,
            fileName: fileName,
            filePath: uploadData.path,
          },

          "File uploaded, saving metadata..."
        );

        templateFilePath = uploadData.path;
        templateFileName = fileName;
      }

      // Step 3: Insert new custom requirement
      const { data: reqData, error: reqError } = await client
        .from("requirement_types")
        .insert({
          name: data.name,
          description: data.description || null,
          is_predefined: true,
          allowed_file_types: data.allowedFileTypes,
          max_file_size_bytes: data.maxFileSizeBytes,
          created_by: userId,
          template_file_path: templateFilePath,
          template_file_name: templateFileName,
        })
        .select()
        .single();

      if (reqError) {
        // If requirement_types insertion fails, we should clean up the storage record
        if (templateFilePath) {
          await client.storage.from(this.bucketName).remove([templateFilePath]);
        }

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: reqError.code,
              message: reqError.message,
              hint: reqError.hint,
              details: reqError.details,
            },
          },

          `Supabase error while creating predefined requirement to requirement_types: ${reqError.message}`
        );

        throw new Error("Failed to create predefined requirement");
      }

      logger.info(ctx, "Successfully created predefined requirement");

      return {
        success: true,
        data: reqData,
        message: "Successfully created predefined requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating predefined requirement"
      );

      throw error;
    }
  }
}
