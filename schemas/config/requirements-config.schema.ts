import z from "zod";

import { Constants } from "@/utils/supabase/supabase.types";

const DocumentStatusEnum = Constants.public.Enums
  .document_status as readonly string[];

const DocumentHistory = z.object({
  status: z.enum([...DocumentStatusEnum]),
});

const Document = z.object({
  name: z.string(),
  history: z.array(DocumentHistory).optional(),
});

const Requirements = z.object({
  children: z.array(Document),
});

export const RequirementsConfigSchema = z.object({
  requirements: z.array(Requirements),
});
