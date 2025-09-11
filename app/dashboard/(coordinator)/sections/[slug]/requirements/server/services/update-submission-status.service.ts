import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createUpdateSubmissionStatusService() {
  return new UpdateSubmissionStatusService();
}

/**
 * @name UpdateSubmissionStatusService
 * @description Service for submitting attendance report to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateSubmissionStatusService();
 */
class UpdateSubmissionStatusService {
  private namespace = "requirement_type.update";

  /**
   * @name approveSubmission
   * Approve the submission of the trainee.
   */
  async approveSubmission(params: {
    client: SupabaseClient<Database>;
    userId: string;
    documentId: string;
  }) {
    const logger = await getLogger();

    const { userId, documentId, client } = params;
    const ctx = {
      userId,
      documentId,
      name: `${this.namespace}.approve`,
    };

    logger.info(ctx, "Approving trainee submission...");

    try {
      const { data: document, error: fetchError } = await client
        .from("requirements")
        .select("*")
        .eq("id", documentId)
        .single();

      if (fetchError) {
        logger.error(
          {
            ...ctx,
            error: fetchError,
          },
          "Failed to fetch document"
        );

        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      if (!document) {
        logger.error(ctx, "Document not found");
        throw new Error("Document not found");
      }

      const { error: historyError } = await client
        .from("requirements_history")
        .insert({
          document_id: documentId,
          title: "Document Approved",
          description: "Your Document has been approved by the coordinator.",
          document_status: "approved",
        });

      if (historyError) {
        logger.error(
          {
            ...ctx,
            error: historyError,
          },
          "Failed to create approval history"
        );

        throw new Error(
          `Failed to create approval history: ${historyError.message}`
        );
      }

      logger.info(ctx, "Successfully approved trainee submission");

      return {
        success: true,
        documentId,
        status: "approved",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error approving trainee submission"
      );

      throw error;
    }
  }

  /**
   * @name rejectSubmission
   * Reject the submission of the trainee.
   */
  async rejectSubmission(params: {
    client: SupabaseClient<Database>;
    userId: string;
    documentId: string;
    feedback?: string;
  }) {
    const logger = await getLogger();

    const { userId, documentId, feedback, client } = params;
    const ctx = {
      userId,
      documentId,
      name: `${this.namespace}.reject`,
    };

    logger.info(ctx, "Rejecting trainee submission...");

    try {
      const { data: document, error: fetchError } = await client
        .from("requirements")
        .select("*")
        .eq("id", documentId)
        .single();

      if (fetchError) {
        logger.error(
          {
            ...ctx,
            error: fetchError,
          },
          "Failed to fetch document"
        );

        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      if (!document) {
        logger.error(ctx, "Document not found");
        throw new Error("Document not found");
      }

      // Add rejection entry to history
      const rejectionDescription = feedback
        ? `Your document has been rejected by your coordinator. Reason: ${feedback}`
        : `Your document has been rejected by your coordinator`;

      const { error: historyError } = await client
        .from("requirements_history")
        .insert({
          document_id: documentId,
          title: "Document Rejected",
          description: rejectionDescription,
          document_status: "rejected",
        });

      if (historyError) {
        logger.error(
          {
            ...ctx,
            error: historyError,
          },
          "Failed to create rejection history"
        );

        throw new Error(
          `Failed to create rejection history: ${historyError.message}`
        );
      }

      logger.info(ctx, "Successfully rejected trainee submission");

      return {
        success: true,
        documentId,
        status: "rejected",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching trainee submission"
      );

      throw error;
    }
  }
}
