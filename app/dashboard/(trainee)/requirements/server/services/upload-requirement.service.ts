import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

const REQS_BUCKET = "static-submissions";

export function createUploadRequirementsService() {
  return new UploadRequirementService();
}

/**
 * @name UploadRequirementService
 * @description Service for uploading requirement to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UploadRequirementService();
 */
class UploadRequirementService {
  private namespace = "requirement.";

  /**
   * @name uploadRequirement
   * Upload a requirement file for a user
   */
  async uploadRequirement(params: {
    client: SupabaseClient<Database>;
    docFile: File;
    requirementName: string;
    userId: string;
  }): Promise<{ requirementId: string }> {
    const logger = await getLogger();

    const { client, docFile, requirementName, userId } = params;
    const ctx = { userId, requirementName, name: `${this.namespace}upload` };

    logger.info(ctx, "Starting requirement upload process...");

    try {
      // Step 1: Get user's enrollment for this batch requirement
      const { data: enrollment, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select(
          `
          id,
          program_batch (
            id,
            title
          )
        `
        )
        .eq("trainee_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (enrollmentError || !enrollment) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: enrollmentError.code,
              message: enrollmentError.message,
              hint: enrollmentError.hint,
              details: enrollmentError.details,
            },
          },

          `No active enrollment found: ${enrollmentError.message}`
        );

        throw new Error(
          `No active enrollment found: ${enrollmentError.message}`
        );
      }

      // Step 2a: First get the requirement type ID
      const { data: requirementType, error: reqTypeError } = await client
        .from("requirement_types")
        .select("id")
        .eq("name", requirementName)
        .single();

      if (reqTypeError || !requirementType) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: reqTypeError.code,
              message: reqTypeError.message,
              hint: reqTypeError.hint,
              details: reqTypeError.details,
            },
          },

          `Requirement type not found: ${reqTypeError.message}`
        );
        throw new Error(`Requirement type not found: ${reqTypeError.message}`);
      }

      // Step 2b: Then get the batch requirement
      const { data: batchRequirement, error: batchReqError } = await client
        .from("batch_requirements")
        .select(
          `
          id,
          program_batch_id,
          requirement_types:requirement_type_id (
            id,
            name,
            description
          )
        `
        )
        .eq("requirement_type_id", requirementType.id)
        .eq("program_batch_id", enrollment.program_batch.id)
        .single();

      if (batchReqError || !batchRequirement) {
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

          `Invalid batch requirement for user's enrollment: ${batchReqError.message}`
        );
        throw new Error(
          `Invalid requirement for your current batch: ${batchReqError.message}`
        );
      }

      // Step 3: Generate file path and upload to storage
      const filePath = `submissions/${userId}/${requirementName.replace(/[\s/]+/g, "_").toLowerCase()}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from(REQS_BUCKET)
        .upload(filePath, docFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              message: uploadError.message,
            },
          },

          `Supabase error while uploading file to storage: ${uploadError.message}`
        );
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Step 4: Check if requirement already exists (update) or create new
      const { data: existingRequirement } = await client
        .from("requirements")
        .select("id")
        .eq("enrollment_id", enrollment.id)
        .eq("batch_requirement_id", batchRequirement.id)
        .single();

      let requirementId: string;

      if (existingRequirement) {
        // Update existing requirement
        const { data: updatedReq, error: updateError } = await client
          .from("requirements")
          .update({
            file_name: docFile.name,
            file_path: uploadData.path,
            file_type: docFile.type,
            file_size: docFile.size.toString(),
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingRequirement.id)
          .select("id")
          .single();

        if (updateError || !updatedReq) {
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

            `Supabase error while updating requirement: ${updateError.message}`
          );
          throw new Error(
            `Failed to update requirement: ${updateError.message}`
          );
        }

        requirementId = updatedReq.id;
      } else {
        // Create new requirement
        const { data: newReq, error: createError } = await client
          .from("requirements")
          .insert({
            enrollment_id: enrollment.id,
            batch_requirement_id: batchRequirement.id,
            file_name: docFile.name,
            file_path: uploadData.path,
            file_type: docFile.type,
            file_size: docFile.size.toString(),
            submitted_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (createError || !newReq) {
          logger.error(
            {
              ...ctx,
              supabaseError: {
                code: createError.code,
                message: createError.message,
                hint: createError.hint,
                details: createError.details,
              },
            },

            `Supabase error while creating requirement: ${createError.message}`
          );

          throw new Error(
            `Failed to create requirement: ${createError.message}`
          );
        }

        requirementId = newReq.id;
      }

      // Step 5: Create history entry
      const { error: historyError } = await client
        .from("requirements_history")
        .insert({
          document_id: requirementId,
          document_status: "not submitted",
          title: "Document Uploaded",
          description: `${docFile.name} has been uploaded.`,
          date: new Date().toISOString(),
        });

      if (historyError) {
        logger.warn(
          {
            ...ctx,
            historyError,
          },
          "Failed to create history entry, but upload succeeded"
        );
      }

      logger.info(
        {
          ...ctx,
          requirementId,
          fileName: docFile.name,
          fileSize: docFile.size,
        },
        "Successfully uploaded requirement"
      );

      return { requirementId };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error during requirement upload"
      );

      throw error;
    }
  }

  /**
   * @name submitRequirement
   * Submit an uploaded requirement for review
   */
  async submitRequirement(params: {
    client: SupabaseClient<Database>;
    requirementId: string;
    userId: string;
  }) {
    const logger = await getLogger();

    const { client, requirementId, userId } = params;
    const ctx = { userId, requirementId, name: `${this.namespace}submit` };

    logger.info(ctx, "Submitting document for review...");

    try {
      // Add history entry for submission
      const { error: historyError } = await client
        .from("requirements_history")
        .insert({
          document_id: requirementId,
          document_status: "pending",
          title: "Document Submitted",
          description:
            "You submitted your document to your OJT coordinator. Please wait for approval.",
        });

      if (historyError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: historyError.code,
              message: historyError.message,
              hint: historyError.hint,
              details: historyError.details,
            },
          },

          `Supabase error while creating submission history: ${historyError.message}`
        );

        throw new Error(
          `Failed to create submission history: ${historyError.message}`
        );
      }

      logger.info(ctx, "Document submitted successfully");

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
        "Unexpected error submitting requirement"
      );

      throw error;
    }
  }
}
