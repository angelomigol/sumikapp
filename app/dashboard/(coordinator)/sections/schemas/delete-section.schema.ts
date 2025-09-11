import { z } from "zod";

export const deleteSectionSchema = z.object({
  confirmation: z.string().refine((value) => value === "DELETE"),
  id: z.uuid(),
});

export type DeleteSectionSchema = z.infer<typeof deleteSectionSchema>;
