import z from "zod";

const phoneRegex = /^[0-9]+$/;

export const industryPartnerSchema = z.object({
  id: z.uuid().optional(),
  companyName: z.string().min(1, { error: "Name of the company is required" }),
  companyAddress: z.string().optional(),
  companyContactNumber: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Contact number must be 11 digits (e.g. 09xxxxxxxxx)",
    }),
  natureOfBusiness: z.string().optional(),
  dateOfSigning: z.date(),
  moaFile: z
    .any()
    .refine((file) => file == null || file instanceof File, {
      error: "Invalid file type.",
    })
    .optional(),
});

export const deleteIndustryPartnerSchema = z.object({
  id: z.uuid(),
});

export type IndustryPartnerFormValues = z.infer<typeof industryPartnerSchema>;
