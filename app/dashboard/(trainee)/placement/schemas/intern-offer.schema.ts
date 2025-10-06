import { z } from "zod";

export const internshipOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  logo: z.url().nullable(),
  date_posted: z.date(),
  type: z.string().nullable(),
  company: z.string(),
  location: z.string().nullable(),
  deadline: z.date().nullable(),
  view_details: z.url(),
});

export type InternOffer = z.infer<typeof internshipOfferSchema>;

/**
 * Raw structure returned from RapidAPI
 */
export interface RawInternshipOffer {
  id: string;
  title: string;
  organization_logo?: string | null;
  organization: string;
  date_posted: string;
  employment_type?: string[] | null;
  date_validthrough?: string | null;
  url: string;

  // Optional nested location structures
  locations_derived?: string[];
  locations_alt_raw?: string[];
  locations_raw?: {
    address?: {
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
    addressLocality?: string;
  }[];
  location_requirements_raw?: { name: string }[];
}
