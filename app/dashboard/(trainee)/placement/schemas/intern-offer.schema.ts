import { z } from "zod";

export const internshipOfferSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  logo: z.url(),
  date_posted: z.date(),
  type: z.string(),
  company: z.string(),
  location: z.string(),
  deadline: z.date(),
  view_details: z.url(),
});
export type InternOffer = z.infer<typeof internshipOfferSchema>;
