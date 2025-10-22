"use server";

import { revalidatePath } from "next/cache";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { internshipDetailsFormSchema } from "../schema/internship-details-form.schema";
import { createCreateInternshipPlacementService } from "./services/create-internship-placement.service";
import { createDeleteInternshipPlacementService } from "./services/delete-internship-placement.service";
import { createGetTraineeInternshipsService } from "./services/get-trainee-interships.service";
import { createSubmitInternshipPlacementService } from "./services/submit-internship-form.service";
import { createUpdateInternshipPlacementService } from "./services/update-internship-placement.service";

/**
 * @name getInternshipsAction
 * @description Server action to
 */
export const getInternshipsAction = enhanceAction(async (_, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "internship_details.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching trainee internships...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetTraineeInternshipsService();

    const result = await service.getInternshipDetails({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        internships: result,
      },
      "Successfully fetched trainee internships"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch trainee internships"
    );

    throw error;
  }
}, {});

/**
 * @name createInternshipAction
 * @description Server action to create a new internship placement
 */
export const createInternshipAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const formObject = Object.fromEntries(formData.entries());

    if (
      formObject.dailySchedule &&
      typeof formObject.dailySchedule === "string"
    ) {
      try {
        formObject.dailySchedule = JSON.parse(
          formObject.dailySchedule as string
        );
      } catch (error) {
        throw new Error(`Invalid dailySchedule format: ${error}`);
      }
    }

    const { data, success, error } =
      internshipDetailsFormSchema.safeParse(formObject);

    if (!success) {
      throw new Error(
        `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
      );
    }

    const ctx = {
      name: "internship_details.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating trainee internship placement...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateInternshipPlacementService();

      const result = await service.createInternshipDetails({
        client,
        userId: user.id,
        data: {
          companyAddress: data.companyAddress,
          companyName: data.companyName,
          contactNumber: data.contactNumber,
          dailySchedule: data.dailySchedule,
          endDate: data.endDate,
          endTime: data.endTime,
          jobRole: data.jobRole,
          natureOfBusiness: data.natureOfBusiness,
          startDate: data.startDate,
          startTime: data.startTime,
          supervisorEmail: data.supervisorEmail,
          lunchBreak: data.lunchBreak,
        },
      });

      logger.info(
        {
          ...ctx,
          internship_details: result,
        },

        "Successfully created trainee internship"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to create trainee internship"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name updateInternshipAction
 * @description Server action to update a existing internship placement
 */
export const updateInternshipAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const formObject = Object.fromEntries(formData.entries());

    if (
      formObject.dailySchedule &&
      typeof formObject.dailySchedule === "string"
    ) {
      try {
        formObject.dailySchedule = JSON.parse(
          formObject.dailySchedule as string
        );
      } catch (error) {
        throw new Error(`Invalid dailySchedule format: ${error}`);
      }
    }

    const { data, success, error } =
      internshipDetailsFormSchema.safeParse(formObject);

    if (!success) {
      throw new Error(
        `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
      );
    }

    const ctx = {
      name: "internship_details.update",
      userId: user.id,
    };

    logger.info(ctx, "Updating trainee internship...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateInternshipPlacementService();

      const result = await service.updateInternshipDetails({
        client,
        userId: user.id,
        data: {
          id: data.id,
          companyAddress: data.companyAddress,
          companyName: data.companyName,
          contactNumber: data.contactNumber,
          dailySchedule: data.dailySchedule,
          endDate: data.endDate,
          endTime: data.endTime,
          jobRole: data.jobRole,
          natureOfBusiness: data.natureOfBusiness,
          startDate: data.startDate,
          startTime: data.startTime,
          supervisorEmail: data.supervisorEmail,
          lunchBreak: data.lunchBreak,
          
        },
      });

      if (!result) {
        logger.warn(ctx, "Internship not found or access denied");
        throw new Error("Internship not found");
      }

      logger.info(ctx, result.message);

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform update intership action"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name deleteInternshipAction
 * @description Server action to delete a internship placement
 */
export const deleteInternshipAction = enhanceAction(
  async (internshipId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "internship_details.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting internship placement...");

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteInternshipPlacementService();

      const result = await service.deleteInternshipDetails({
        client,
        userId: user.id,
        internshipId,
      });

      logger.info(ctx, result.message);

      revalidatePath("/dashboard/settings/internship-details");
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform delete internship action"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name submitInternshipAction
 * @description Server action to submit a internship form
 */
export const submitInternshipAction = enhanceAction(
  async (internshipId: string, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "internship_details.submit",
      userId: user.id,
    };

    logger.info(ctx, "Submitting internship form...");

    try {
      const client = getSupabaseServerClient();
      const service = createSubmitInternshipPlacementService();

      const result = await service.submitInternshipDetails({
        client,
        userId: user.id,
        internshipId,
      });

      logger.info(ctx, result.message);

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },

        "Failed to perform submit internship action"
      );

      throw error;
    }
  },
  {}
);
