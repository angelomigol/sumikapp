import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { InternshipDetailsFormValues } from "../../schema/internship-details-form.schema";

export function createUpdateInternshipPlacementService() {
  return new UpdateInternshipPlacementService();
}

/**
 * @name UpdateInternshipPlacementService
 * @description Service for updating trainee internship placement from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new UpdateInternshipPlacementService();
 */
class UpdateInternshipPlacementService {
  private namespace = "internship_details.update";

  /**
   * @name updateInternshipDetails
   * @description Update existing internship details
   */
  async updateInternshipDetails(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: InternshipDetailsFormValues;
  }) {
    const logger = await getLogger();
    const { client, userId, data } = params;

    const ctx = {
      userId: userId,
      internshipId: data.id,
      name: this.namespace,
    };

    logger.info(ctx, "Updating internship placement...");

    if (!data.id) {
      throw new Error("Internship Details ID is missing");
    }

    try {
      const { error } = await client
        .from("internship_details")
        .update({
          company_name: data.companyName,
          contact_number: data.contactNumber,
          nature_of_business: data.natureOfBusiness,
          address: data.companyAddress,
          job_role: data.jobRole,
          start_date: data.startDate,
          end_date: data.endDate,
          start_time: data.startTime,
          end_time: data.endTime,
          daily_schedule: data.dailySchedule,
        })
        .eq("id", data.id);

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

          `Supabase error while updating internship: ${error.message}`
        );

        throw new Error("Failed to update internship placement");
      }

      logger.info(
        {
          ...ctx,
        },

        "Successfully updated internship placement"
      );

      return {
        success: true,
        message: "Successfully updated internship placement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Unexpected error updating internship placement"
      );

      throw error;
    }
  }
}
