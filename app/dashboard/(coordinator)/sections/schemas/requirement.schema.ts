import z from "zod";

export const customRequirementSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().max(150).optional(),
  allowedFileTypes: z
    .array(z.string())
    .min(1, "At least one file type is required"),
  maxFileSizeBytes: z.number().min(1, "File size must be greater than 0"),
  template: z
    .any()
    .refine((file) => file == null || file instanceof File, {
      error: "Invalid file type.",
    })
    .optional(),
  slug: z.string().min(1, { error: "Section is required" }),
});

export type CustomRequirementFormValues = z.infer<
  typeof customRequirementSchema
>;
