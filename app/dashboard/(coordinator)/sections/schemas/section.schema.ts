import z from "zod";

import { Constants } from "@/utils/supabase/supabase.types";

const InternCodes = Constants.public.Enums.internship_code as readonly string[];

export const sectionSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(150).nullable(),
  internship_code: z.enum(InternCodes),
  start_date: z.date(),
  end_date: z.date(),
  required_hours: z.number().min(1, "Minimum value should be 1"),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
