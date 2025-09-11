import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { InternshipDetails } from "@/hooks/use-internship-details";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

export function createGetTraineeInternshipsService() {
  return new GetTraineeInternshipsService();
}

/**
 * @name GetTraineeInternshipsService
 * @description Service for fetching trainee internship details from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new GetTraineeInternshipsService();
 */
class GetTraineeInternshipsService {
  private namespace = "internship_details.fetch";

  /**
   * @name getInternshipDetails
   * @description Fetch internship details
   */
  async getInternshipDetails(params: {
    client: SupabaseClient<Database>;
    userId: string;
  }) {
    const logger = await getLogger();

    const userId = params.userId;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Fetching trainee interships...");

    try {
      const { data, error } = await params.client
        .from("internship_details")
        .select(
          `
          *,
          trainee_batch_enrollment!inner (
            id,
            trainee_id
          )
        `
        )
        .eq("trainee_batch_enrollment.trainee_id", userId)
        .order("created_at", { ascending: false });

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

          `Supabase error while fetching trainee internships: ${error.message}`
        );

        throw new Error(`Failed to fetch internships`);
      }

      logger.info(
        {
          ...ctx,
          count: data.length,
        },
        "Successfully fetched trainee internships"
      );

      const mappedData: InternshipDetails[] = data.map((a) => ({
        id: a.id,
        companyName: a.company_name,
        contactNumber: a.contact_number,
        natureOfBusiness: a.nature_of_business,
        companyAddress: a.address,
        job_role: a.job_role,
        startDate: a.start_date,
        endDate: a.end_date,
        startTime: a.start_time,
        endTime: a.end_time,
        dailySchedule: a.daily_schedule,
        status: a.status,
      }));

      return mappedData;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error fetching trainee internships"
      );

      throw error;
    }
  }
}
