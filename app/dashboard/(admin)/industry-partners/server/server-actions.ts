"use server";

import { format } from "date-fns";
import z from "zod";

import { enhanceAction } from "@/lib/server/enhance-actions";

import { getLogger } from "@/utils/logger";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { deleteIndustryPartnerSchema } from "../schema/industry-partner.schema";
import { createCreateIndustryPartnerService } from "./services/create-industry-partner.service";
import { createDeleteIndustryPartnerService } from "./services/delete-industry-partner.service";
import { createGetIndustryPartnersService } from "./services/get-industry-partners.service";
import { createUpdateIndustryPartnerService } from "./services/update-industry-partner.service";

const industryPartnerServerSchema = z.object({
  companyName: z.string().min(1),
  companyAddress: z.string().optional(),
  companyContactNumber: z.any().optional(),
  natureOfBusiness: z.string().optional(),
  dateOfSigning: z.coerce.date(),
  moaFile: z.any().optional(), // FormData gives File or string
});

const updateIndustryPartnerServerSchema = industryPartnerServerSchema.extend({
  partnerId: z.string().min(1),
});

/**
 * @name getIndustryPartnersAction
 * @description Server action to
 */
export const getIndustryPartnersAction = enhanceAction(async (_: any, user) => {
  const logger = await getLogger();

  const ctx = {
    name: "industry_partners.fetch",
    userId: user.id,
  };

  logger.info(ctx, "Fetching industry partners...");

  try {
    const client = getSupabaseServerClient();
    const service = createGetIndustryPartnersService();

    const result = await service.getIndustryPartners({
      client,
      userId: user.id,
    });

    logger.info(
      {
        ...ctx,
        reports: result,
      },
      "Successfully fetched industry partners"
    );

    return result;
  } catch (error) {
    logger.error(
      {
        ...ctx,
        error,
      },
      "Failed to fetch industry partners"
    );

    throw error;
  }
}, {});

/**
 * @name createIndustryPartnerAction
 * @description Server action to
 */
export const createIndustryPartnerAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success, error } = industryPartnerServerSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error(`Invalid form data: ${error.message}`);
    }

    const ctx = {
      name: "industry_partner.create",
      userId: user.id,
    };

    logger.info(ctx, "Creating industry partner...");

    try {
      const client = getSupabaseServerClient();
      const service = createCreateIndustryPartnerService();

      const result = await service.createIndustryPartner({
        client,
        userId: user.id,
        data: {
          company_name: data.companyName,
          company_address: data.companyAddress || null,
          company_contact_number: data.companyContactNumber || null,
          nature_of_business: data.natureOfBusiness || null,
          date_of_signing: format(data.dateOfSigning, "PP"),
        },
        moaFile: data.moaFile || null,
      });

      logger.info(
        {
          ...ctx,
          industry_partner: result.data,
        },
        "Successfully created industry partner"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to create industry partner"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name updateIndustryPartnerAction
 * @description Server action to
 */
export const updateIndustryPartnerAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success, error } =
      updateIndustryPartnerServerSchema.safeParse(
        Object.fromEntries(formData.entries())
      );

    if (!success) {
      throw new Error(`Invalid form data: ${error.message}`);
    }

    const ctx = {
      name: "industry_partner.update",
      userId: user.id,
    };

    logger.info(ctx, "Updating industry partner...");

    try {
      const client = getSupabaseServerClient();
      const service = createUpdateIndustryPartnerService();

      const result = await service.updateIndustryPartner({
        client,
        userId: user.id,
        partnerId: data.partnerId,
        data: {
          company_name: data.companyName,
          company_address: data.companyAddress || null,
          company_contact_number: data.companyContactNumber || null,
          nature_of_business: data.natureOfBusiness || null,
          date_of_signing: format(data.dateOfSigning, "PP"),
        },
        moaFile: data.moaFile || null,
      });

      logger.info(
        {
          ...ctx,
          industry_partner: result.data,
        },
        "Successfully updated industry partner"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update industry partner"
      );

      throw error;
    }
  },
  {}
);

/**
 * @name deleteIndustryPartnerAction
 * @description Server action to
 */
export const deleteIndustryPartnerAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const { data, success } = deleteIndustryPartnerSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!success) {
      throw new Error("Invalid form data");
    }

    const ctx = {
      name: "industry_partner.delete",
      userId: user.id,
    };

    logger.info(ctx, "Deleting industry partner...");

    try {
      const client = getSupabaseServerClient();
      const service = createDeleteIndustryPartnerService();

      const result = await service.deleteIndustryPartner({
        client,
        userId: user.id,
        partnerId: data.id,
      });

      logger.info(
        {
          ...ctx,
          result,
        },
        "Successfully deleted industry partner"
      );

      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete industry partner"
      );

      throw error;
    }
  },
  {}
);
