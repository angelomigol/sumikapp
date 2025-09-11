import { z } from "zod";

export const deleteCustomRequirementSchema = z.object({
  confirmation: z.string().refine((value) => value === "DELETE"),
  id: z.uuid(),
});

export type DeleteCustomRequirementSchema = z.infer<
  typeof deleteCustomRequirementSchema
>;
