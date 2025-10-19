import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { CustomRequirementFormValues } from "../../../../schemas/requirement.schema";

export function createCreateCustomRequirementService() {
  return new CreateCustomRequirementService();
}

/**
 * @name CreateCustomRequirementService
 * @description Service for creating a custom requirement for user
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateCustomRequirementService();
 */
class CreateCustomRequirementService {
  private namespace = "requirement_type.create";
  private bucketName = "requirement-templates";

  /**
   * @name createCustomRequirement
   * Create a custom requirement for a user.
   */
  async createCustomRequirement(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: CustomRequirementFormValues;
  }) {
    const logger = await getLogger();

    const { userId, data, client } = params;
    const ctx = {
      requirement_name: data.name,
      created_by: userId,
      userId,
      name: this.namespace,
    };

    if (!data.slug) {
      throw new Error("Slug missing");
    }

    logger.info(ctx, "Creating custom requirement for user...");

    try {
      // Step 1: Fetch program_batch ID first
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

      // Step 2: Check if requirement with the same name already exists for this batch
      const { data: existingRequirement, error: existingReqError } =
        await client
          .from("batch_requirements")
          .select(
            `
          id,
          requirement_types!inner(name)
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

      if (existingRequirement) {
        logger.warn(
          ctx,
          "Requirement with this name already exists in the batch"
        );

        throw new Error(
          `A requirement with the name "${data.name}" already exists in this batch`
        );
      }

      let templateFilePath: string | null = null;

      // Step 3: Insert template file to storage
      if (data.template) {
        const fileName = data.template.name;
        const filePath = `/${userId}/${pbData.id}/${fileName}`;

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
      }

      // Step 4: Insert new custom requirement
      const { data: reqData, error: reqError } = await client
        .from("requirement_types")
        .insert({
          name: data.name,
          description: data.description || null,
          allowed_file_types: data.allowedFileTypes,
          max_file_size_bytes: data.maxFileSizeBytes,
          created_by: userId,
          template_file_path: templateFilePath,
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

          `Supabase error while creating custom requirement to requirement_types: ${reqError.message}`
        );

        throw new Error("Failed to create custom requirement");
      }

      // Step 5: Insert the custom requirement to batch_requirements
      const { error: batchReqError } = await client
        .from("batch_requirements")
        .insert({
          program_batch_id: pbData.id,
          requirement_type_id: reqData.id,
        });

      if (batchReqError) {
        // If batch_requirements insertion fails, we should clean up the requirement_types record
        await client.from("requirement_types").delete().eq("id", reqData.id);

        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: batchReqError.code,
              message: batchReqError.message,
              hint: batchReqError.hint,
              details: batchReqError.details,
            },
          },

          `Supabase error while inserting custom requirement to batch_requirements: ${batchReqError.message}`
        );

        throw new Error("Failed to create custom requirement");
      }

      logger.info(ctx, "Successfully created custom requirement");

      return {
        success: true,
        data: reqData,
        message: "Successfully created custom requirement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error creating custom requirement"
      );

      throw error;
    }
  }
}
