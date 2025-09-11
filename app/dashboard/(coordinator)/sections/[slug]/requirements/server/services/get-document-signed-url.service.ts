import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

const REQS_BUCKET = "static-submissions";
const DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour (max recommended for security)

export function createGetDocumentSignedUrlService() {
  return new GetDocumentSignedUrlService();
}

/**
 * @name GetDocumentSignedUrlService
 * @description Service for getting signed url of document from storage
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetDocumentSignedUrlService();
 */
class GetDocumentSignedUrlService {
  private namespace = "signedUrl.fetch";

  /**
   * @name getSignedUrl
   * Get the signed url of the document for a user.
   */
  async getSignedUrl(params: {
    client: SupabaseClient<Database>;
    filePath: string;
    userId: string;
    expiresIn?: number;
  }) {
    const logger = await getLogger();

    const {
      client,
      filePath,
      userId,
      expiresIn = DEFAULT_EXPIRY_SECONDS,
    } = params;

    const ctx = { userId, filePath, name: this.namespace };

    // Input validation
    if (!filePath) {
      logger.error(ctx, "File path is required");
      throw new Error("File path is required");
    }

    if (!filePath.trim()) {
      logger.error(ctx, "File path cannot be empty");
      throw new Error("File path cannot be empty");
    }

    logger.info(ctx, "Fetching signed url of document for user...");

    try {
      const bucket = client.storage.from(REQS_BUCKET);

      // Check if file exists first
      const { data: fileExists, error: existsError } = await bucket.list(
        filePath.substring(0, filePath.lastIndexOf("/")) || "",
        {
          search: filePath.substring(filePath.lastIndexOf("/") + 1),
        }
      );

      if (existsError) {
        logger.error(
          {
            ...ctx,
            error: existsError,
          },
          "Error checking file existence"
        );
        throw new Error("Failed to verify file existence");
      }

      if (!fileExists || fileExists.length === 0) {
        logger.error(ctx, "File not found in storage");
        throw new Error("File not found");
      }

      // Generate signed URL
      const { data, error } = await bucket.createSignedUrl(filePath, expiresIn);

      if (error) {
        logger.error(
          {
            ...ctx,
            error,
          },
          "Error fetching signed url"
        );

        // More specific error messages based on error type
        if (error.message.includes("not found")) {
          throw new Error("Document not found");
        } else if (error.message.includes("unauthorized")) {
          throw new Error("Unauthorized access to document");
        } else {
          throw new Error("Failed to generate document access link");
        }
      }

      if (!data?.signedUrl) {
        logger.error(ctx, "No signed URL returned from storage");
        throw new Error("Failed to generate document access link");
      }

      logger.info(
        {
          ...ctx,
          expiresIn,
        },
        "Successfully fetched signed url"
      );

      return data.signedUrl;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching signed url"
      );

      // Re-throw known errors, wrap unknown ones
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "An unexpected error occurred while accessing the document"
      );
    }
  }
}
