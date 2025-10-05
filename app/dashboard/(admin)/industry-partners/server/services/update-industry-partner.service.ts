import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesUpdate } from "@/utils/supabase/supabase.types";

const REQS_BUCKET = "moa-files";

export function createUpdateIndustryPartnerService() {
  return new UpdateIndustryPartnerService();
}

/**
 * @name UpdateIndustryPartnerService
 * @description Service for updating industry partner details to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateIndustryPartnerService();
 */
class UpdateIndustryPartnerService {
  private namespace = "industry_partner.update";

  /**
   * @name updateIndustryPartner
   * Updates industry partner details for a user.
   */
  async updateIndustryPartner(params: {
    client: SupabaseClient<Database>;
    userId: string;
    partnerId: string;
    data: TablesUpdate<"industry_partners">;
    moaFile: File | null;
  }) {
    const logger = await getLogger();

    const { userId, partnerId, data, moaFile, client } = params;
    const ctx = {
      company: data.company_name,
      userId,
      partnerId,
      name: this.namespace,
    };

    logger.info(ctx, "Updating industry partner...");

    try {
      let filePath: string | null = null;
      let originalFileName: string | null = null;

      if (moaFile) {
        const { data: existingPartner, error: fetchError } = await client
          .from("industry_partners")
          .select("moa_file_path")
          .eq("id", partnerId)
          .single();

        if (fetchError) {
          logger.error(
            {
              ...ctx,
              supabaseError: {
                code: fetchError.code,
                message: fetchError.message,
                hint: fetchError.hint,
                details: fetchError.details,
              },
            },

            `Supabase error fetch existing industry partner: ${fetchError.message}`
          );
          throw new Error("Failed to fetch existing industry partner");
        }

        const fileName = moaFile.name;
        filePath = `${data.company_name}/${fileName}`;
        originalFileName = moaFile.name;

        const { data: uploadData, error: uploadError } = await client.storage
          .from(REQS_BUCKET)
          .upload(filePath, moaFile, {
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
          existingPartner.moa_file_path &&
          existingPartner.moa_file_path !== filePath
        ) {
          const { error: deleteError } = await client.storage
            .from(REQS_BUCKET)
            .remove([existingPartner.moa_file_path]);

          if (deleteError) {
            logger.warn(
              {
                ...ctx,
                deleteError,
                oldFilePath: existingPartner.moa_file_path,
              },
              "Failed to delete old file, but continuing with update"
            );
          } else {
            logger.info(
              {
                ...ctx,
                oldFilePath: existingPartner.moa_file_path,
              },
              "Successfully deleted old file"
            );
          }
        }
      }

      const updateData: TablesUpdate<"industry_partners"> = { ...data };
      if (filePath !== null) {
        updateData.moa_file_path = filePath;
        updateData.file_name = originalFileName;
      }

      const { data: partnerData, error } = await client
        .from("industry_partners")
        .update(updateData)
        .eq("id", partnerId)
        .select()
        .single();

      if (error) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: error.code,
              message: error.message,
              hint: error.hint,
              details: error.details,
            },
          },
          `Supabase error while updating industry partner: ${error.message}`
        );
        throw new Error("Failed to update industry partner");
      }

      logger.info(ctx, "Successfully updated industry partner");

      return {
        success: true,
        data: partnerData,
        message: "Successfully updated industry partner",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating industry partner"
      );
      throw error;
    }
  }
}
