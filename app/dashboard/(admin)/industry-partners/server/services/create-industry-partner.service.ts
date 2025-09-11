import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database, TablesInsert } from "@/utils/supabase/supabase.types";

const REQS_BUCKET = "moa-files";

export function createCreateIndustryPartnerService() {
  return new CreateIndustryPartnerService();
}

/**
 * @name CreateIndustryPartnerService
 * @description Service for inserting industry partner to the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateIndustryPartnerService();
 */
class CreateIndustryPartnerService {
  private namespace = "industry_partner.create";

  /**
   * @name createIndustryPartner
   * Creates industry partner for a user.
   */
  async createIndustryPartner(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: TablesInsert<"industry_partners">;
    moaFile: File | null;
  }) {
    const logger = await getLogger();

    const { userId, data, moaFile, client } = params;
    const ctx = {
      company: data.company_name,
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating industry partner...");

    try {
      let filePath: string | null = null;
      let originalFileName: string | null = null;

      if (moaFile) {
        const fileExtension = moaFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        filePath = `${data.company_name}/${fileName}`;
        originalFileName = moaFile.name;

        const { data: uploadData, error: uploadError } = await client.storage
          .from(REQS_BUCKET)
          .upload(filePath, moaFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          logger.error(
            {
              ...ctx,
              uploadError,
            },

            "Failed to upload file to storage"
          );
          throw new Error("Failed to upload file");
        }

        filePath = uploadData.path ?? filePath;
      }

      const { data: partnerData, error } = await client
        .from("industry_partners")
        .insert({
          ...data,
          moa_file_path: filePath,
          file_name: originalFileName,
        })
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

          `Supabase error while creating industry partner: ${error.message}`
        );

        throw new Error("Failed to create industry partner");
      }

      logger.info(ctx, "Successfully created industry partner");

      return {
        success: true,
        data: partnerData,
        message: "Successfully created industry partner",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error creating industry partner"
      );
      throw error;
    }
  }
}
