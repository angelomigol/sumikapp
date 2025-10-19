import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { RequirementWithHistory } from "@/hooks/use-requirements";

import { DocumentStatus } from "@/lib/constants";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

type RequirementHistoryEntry =
  Database["public"]["Tables"]["requirements_history"]["Row"];

export function createGetRequirementsService() {
  return new GetRequirementsService();
}

/**
 * @name GetRequirementsService
 * @description Service for fetching requirements from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetRequirementsService();
 */
class GetRequirementsService {
  private namespace = "requirements.fetch";

  /**
   * @name getRequirements
   * Fetch all requirements for a user.
   */
  async getRequirements(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }): Promise<RequirementWithHistory[]> {
    const logger = await getLogger();

    const userId = params.userId;
    const ctx = { userId, name: this.namespace };

    logger.info(ctx, "Fetching requirements for user...");

    try {
      // Step 1: Get latest enrollment
      const { data: enrollments, error: enrollmentError } = await params.client
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

      if (enrollmentError) {
        logger.warn(
          {
            ...ctx,
            enrollmentError,
          },
          "No active enrollment found"
        );

        return [];
      }

      // Step 2: Get batch requirements for this program batch
      const { data: batchRequirements, error: batchReqError } =
        await params.client
          .from("batch_requirements")
          .select(
            `
          id,
          requirement_types:requirement_type_id (
            id,
            name,
            description,
            allowed_file_types,
            max_file_size_bytes,
            template_file_name,
            template_file_path
          )
        `
          )
          .eq("program_batch_id", enrollments.program_batch.id);

      if (batchReqError) {
        logger.error(
          {
            ...ctx,
            batchReqError,
          },
          "Error fetching batch requirements"
        );

        throw new Error("Failed to fetch batch requirements");
      }

      // Step 3: Get existing submitted requirements
      const { data: requirements, error: reqError } = await params.client
        .from("requirements")
        .select(
          `
          *,
          batch_requirements:batch_requirement_id (
            requirement_types:requirement_type_id (
              id,
              name,
              description,
              allowed_file_types,
              max_file_size_bytes,
              template_file_name,
              template_file_path
            )
          )
        `
        )
        .eq("enrollment_id", enrollments.id);

      if (reqError) {
        logger.error(
          {
            ...ctx,
            reqError,
          },
          "Error fetching requirements"
        );

        throw new Error("Failed to fetch requirements");
      }

      const safeRequirements = requirements ?? [];
      const requirementIds = safeRequirements.map((r) => r.id);
      const submittedRequirementTypeIds = safeRequirements
        .map((r) => r.batch_requirements?.requirement_types?.id)
        .filter(Boolean);

      // Step 4: Get submission history for existing documents
      const { data: history = [], error: histError } = await params.client
        .from("requirements_history")
        .select("*")
        .in("document_id", requirementIds)
        .order("date", { ascending: true });

      if (histError) {
        logger.error(
          {
            ...ctx,
            histError,
          },
          "Error fetching requirement history"
        );

        throw new Error("Failed to fetch requirement history");
      }

      const safeHistory = history ?? [];

      // Step 5: Map submitted requirements + history
      const withHistory = safeRequirements.map((req) => {
        const historyItems = safeHistory
          .filter((h) => h.document_id === req.id)
          .map(mapHistory);

        const latestStatus =
          historyItems.length > 0
            ? (historyItems[historyItems.length - 1]
                .document_status as RequirementWithHistory["status"])
            : "not submitted";

        const requirementType = req.batch_requirements?.requirement_types;

        return {
          id: req.id,
          requirement_name: requirementType?.name || "Unknown Requirement",
          requirement_description: requirementType?.description || null,
          file_name: req.file_name,
          file_size: safeNumber(req.file_size),
          file_type: req.file_type,
          allowed_file_types: requirementType?.allowed_file_types || null,
          max_file_size_bytes: requirementType?.max_file_size_bytes || null,
          template_file_name: requirementType?.template_file_name || null,
          template_file_path: requirementType?.template_file_path || null,
          submitted_at: req.submitted_at,
          status: latestStatus,
          history: historyItems,
        };
      });

      // Step 6: Add missing requirements (requirements that exist for the batch but haven't been submitted)
      const missingRequirements: RequirementWithHistory[] = batchRequirements
        .filter(
          (batchReq) =>
            batchReq.requirement_types &&
            !submittedRequirementTypeIds.includes(batchReq.requirement_types.id)
        )
        .map((batchReq) => ({
          id: `placeholder-${batchReq.requirement_types!.id}`,
          requirement_name: batchReq.requirement_types!.name,
          requirement_description:
            batchReq.requirement_types!.description || null,
          file_name: null,
          file_size: null,
          file_type: null,
          submitted_at: null,
          status: "not submitted" as const,
          allowed_file_types:
            batchReq.requirement_types!.allowed_file_types || null,
          max_file_size_bytes:
            batchReq.requirement_types!.max_file_size_bytes || null,
          template_file_name:
            batchReq.requirement_types!.template_file_name || null,
          template_file_path:
            batchReq.requirement_types!.template_file_path || null,
          history: [],
        }));

      const allRequirements = [...withHistory, ...missingRequirements];

      logger.info(
        {
          ...ctx,
          submitted: withHistory.length,
          missing: missingRequirements.length,
          total: allRequirements.length,
        },
        "Successfully fetched requirements"
      );

      return allRequirements;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error fetching requirements"
      );

      throw error;
    }
  }
}

function safeNumber(val: unknown): number | null {
  const parsed = Number(val);
  return isNaN(parsed) ? null : parsed;
}

function mapHistory(entry: RequirementHistoryEntry) {
  return {
    id: entry.id,
    document_id: entry.document_id,
    document_status: entry.document_status as DocumentStatus,
    title: entry.title,
    description: entry.description,
    date: new Date(entry.date),
  };
}
