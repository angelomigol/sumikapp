import z from "zod";

export const adminSchema = z.object({
  id: z.uuid(),
  first_name: z.string().min(1, { error: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Invalid email address" }),
});

export type AdminFormValues = z.infer<typeof adminSchema>;
