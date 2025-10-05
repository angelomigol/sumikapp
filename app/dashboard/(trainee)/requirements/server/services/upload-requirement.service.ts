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
            title,
            internship_code
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

      // Step 2: Then get the batch requirement
      const { data: batchRequirements, error: batchReqError } = await client
        .from("batch_requirements")
        .select(
          `
          id,
          program_batch_id,
          requirement_types:requirement_type_id (
            id,
            name,
            description,
            allowed_file_types, 
            max_file_size_bytes
          )
        `
        )
        .eq("program_batch_id", enrollment.program_batch.id);

      if (batchReqError) {
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
          `Error fetching batch requirements: ${batchReqError.message}`
        );
        throw new Error(
          `Error fetching requirements for your batch: ${batchReqError.message}`
        );
      }

      const batchRequirement = batchRequirements?.find(
        (req) => req.requirement_types?.name === requirementName
      );

      if (!batchRequirement || !batchRequirement.requirement_types) {
        logger.error(
          {
            ...ctx,
            availableRequirements: batchRequirements
              ?.map((r) => r.requirement_types?.name)
              .filter(Boolean),
            requestedRequirement: requirementName,
          },
          `Requirement '${requirementName}' not found for user's batch`
        );
        throw new Error(
          `Requirement '${requirementName}' is not available for your current batch`
        );
      }

      // Step 3: Validate file
      if (
        batchRequirement.requirement_types.allowed_file_types &&
        batchRequirement.requirement_types.allowed_file_types.length > 0
      ) {
        const fileExtension = docFile.name.split(".").pop()?.toLowerCase();
        const mimeType = docFile.type;

        // Check both file extension and MIME type
        const isValidType =
          batchRequirement.requirement_types.allowed_file_types.some(
            (allowedType) => {
              const normalizedType = allowedType.toLowerCase();

              // Check if it's a file extension (starts with .)
              if (normalizedType.startsWith(".")) {
                return fileExtension === normalizedType.substring(1);
              }

              // Check if it's a MIME type
              if (normalizedType.includes("/")) {
                return mimeType === normalizedType;
              }

              // Check if it's just the extension without dot
              return fileExtension === normalizedType;
            }
          );

        if (!isValidType) {
          const allowedTypesStr =
            batchRequirement.requirement_types.allowed_file_types.join(", ");
          throw new Error(
            `Invalid file type. Allowed types: ${allowedTypesStr}`
          );
        }
      }

      // Validate file size
      if (
        docFile.size > batchRequirement.requirement_types.max_file_size_bytes
      ) {
        const maxSizeMB = (
          batchRequirement.requirement_types.max_file_size_bytes /
          (1024 * 1024)
        ).toFixed(1);
        throw new Error(
          `File size exceeds maximum allowed size of ${maxSizeMB}MB`
        );
      }

      // Step 4: Generate file path and upload to storage
      const filePath = `submissions/${userId}/${enrollment.program_batch.internship_code}/${requirementName.replace(/[\s/]+/g, "_").toLowerCase()}`;

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
      const { error: updateError } = await client
        .from("requirements")
        .update({
          submitted_at: new Date().toISOString(),
        })
        .eq("id", requirementId)
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

          `Supabase error while updating requirement submission date: ${updateError.message}`
        );

        throw new Error(
          `Failed to update requirement submission date: ${updateError.message}`
        );
      }

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
