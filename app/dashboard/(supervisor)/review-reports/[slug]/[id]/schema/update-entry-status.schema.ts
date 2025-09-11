import z from "zod";

import { Constants } from "@/utils/supabase/supabase.types";

const status = Constants.public.Enums.entry_status;

export const updateEntryStatusSchema = z.object({
  entryId: z.string(),
  status: z.enum(status),
});

export type UpdateEntryStatusFormValues = z.infer<
  typeof updateEntryStatusSchema
>;
