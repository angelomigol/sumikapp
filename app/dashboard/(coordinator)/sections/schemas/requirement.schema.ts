import z from "zod";

export const customRequirementSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().max(150).optional(),
  slug: z.string().min(1, { error: "Section is required" }),
});

export type CustomRequirementFormValues = z.infer<
  typeof customRequirementSchema
>;
