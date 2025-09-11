import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getLogger } from "@/utils/logger";
import { Database } from "@/utils/supabase/supabase.types";

import { InternshipDetailsFormValues } from "../../schema/internship-details-form.schema";

export function createCreateInternshipPlacementService() {
  return new CreateInternshipPlacementService();
}

/**
 * @name CreateInternshipPlacementService
 * @description Service for creating trainee internship placement from the database
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const service = new CreateInternshipPlacementService();
 */
class CreateInternshipPlacementService {
  private namespace = "internship_details.create";

  /**
   * @name createInternshipDetails
   * @description Create internship placement
   */
  async createInternshipDetails(params: {
    client: SupabaseClient<Database>;
    userId: string;
    data: InternshipDetailsFormValues;
  }) {
    const logger = await getLogger();
    const { userId, data, client } = params;

    const ctx = {
      userId,
      name: this.namespace,
    };

    logger.info(ctx, "Creating trainee intership placement...");

    try {
      const { data: enrollment, error: enrollmentError } = await client
        .from("trainee_batch_enrollment")
        .select("id")
        .eq("trainee_id", userId)
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

          `Supabase error while fetching trainee enrollment: ${enrollmentError.message}`
        );

        throw new Error("No trainee enrollment found");
      }

      const { data: internshipData, error: internshipError } =
        await params.client
          .from("internship_details")
          .insert({
            enrollment_id: enrollment.id,
            company_name: data.companyName,
            contact_number: data.contactNumber,
            nature_of_business: data.natureOfBusiness,
            address: data.companyAddress,
            job_role: data.jobRole,
            start_date: data.startDate,
            end_date: data.endDate,
            start_time: data.startTime,
            end_time: data.endTime,
            daily_schedule: JSON.stringify(data.dailySchedule),
            status: "not submitted" as const,
            temp_email: data.supervisorEmail,
          })
          .select()
          .single();

      if (internshipError) {
        logger.error(
          {
            ...ctx,
            supabaseError: {
              code: internshipError.code,
              message: internshipError.message,
              hint: internshipError.hint,
              details: internshipError.details,
            },
          },

          `Supabase error while creating internship: ${internshipError.message}`
        );

        throw new Error("Failed to create internship placement");
      }

      logger.info(
        {
          ...ctx,
          internshipId: internshipData.id,
        },

        "Successfully created internship placement"
      );

      return {
        success: true,
        message: "Successfully created internship placement",
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Unexpected error creating internship placement"
      );

      throw error;
    }
  }
}
