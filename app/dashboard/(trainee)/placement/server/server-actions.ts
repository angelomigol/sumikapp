"use server";

import { InternOffer } from "../schemas/intern-offer.schema";

const url = `https://internships-api.p.rapidapi.com/active-jb-7d?location_filter=Philippines&description_type=text&ai_work_arrangement_filter=On-site%2CHybrid`;

const RAPID_API_KEY = process.env.RAPID_API_KEY;

/**
 * @name fetchInternOffers
 * @description Fetch internship offers from Internship API Rapid API
 */
export async function fetchInternOffers() {
  if (!RAPID_API_KEY) {
    throw new Error("RAPID_API_KEY is not set");
  }

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPID_API_KEY,
      "x-rapidapi-host": "internships-api.p.rapidapi.com",
    },
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    console.error(`Intern Rapid API failed:`, res.statusText);

    throw new Error("Failed to fetch internship offers");
  }

  const data = await res.json();

  // if (!data.success) {
  //   throw new Error("API request failed");
  // }

  const offers: InternOffer[] = Array.isArray(data)
    ? data.map((item: any) => transformToInternshipOffer(item))
    : [];

  return offers;
}

function transformToInternshipOffer(rawData: any): InternOffer {
  return {
    id: rawData.id,
    title: rawData.title,
    logo: rawData.organization_logo,
    date_posted: new Date(rawData.date_posted),
    type:
      Array.isArray(rawData.employment_type) &&
      rawData.employment_type.length > 0 &&
      rawData.employment_type[0],
    company: rawData.organization,
    location: rawData.location_requirements_raw?.[0]?.name,
    deadline: new Date(rawData.date_validthrough),
    view_details: rawData.url,
  };
}
