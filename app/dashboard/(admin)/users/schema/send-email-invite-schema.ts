import { z } from "zod";

export const sendEmailInviteSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["coordinator", "supervisor", "admin"], {
    error: "Please select a role",
  }),
});

export type SendEmailInviteData = z.infer<typeof sendEmailInviteSchema>;
