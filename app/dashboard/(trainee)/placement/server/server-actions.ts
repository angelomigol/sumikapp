"use server";

import {
  InternOffer,
  RawInternshipOffer,
} from "../schemas/intern-offer.schema";

const RAPID_API_KEY = process.env.RAPID_API_KEY;

/**
 * @name fetchInternOffers
 * @description Fetch internship offers from Internship API Rapid API
 */
export async function fetchInternOffers(offset: number = 0) {
  if (!RAPID_API_KEY) {
    throw new Error("RAPID_API_KEY is not set");
  }

  // https://internships-api.p.rapidapi.com/active-ats-7d?location_filter=Philippines&description_type=text&offset=${offset}&ai_work_arrangement_filter=On-site%2CHybrid
  const url = `https://internships-api.p.rapidapi.com/active-jb-7d?location_filter=Philippines&description_type=text&offset=${offset}&ai_work_arrangement_filter=On-site%2CHybrid`;

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

  const data: unknown = await res.json();

  if (!Array.isArray(data)) {
    return [];
  }

  const offers = data
    .map((item) => transformToInternshipOffer(item as RawInternshipOffer))
    .filter((offer): offer is InternOffer => !!offer);

  return offers;
}

/**
 * @name fetchMultiplePages
 * @description Fetch multiple pages of internship offers
 * @param pages Number of pages to fetch (each page = 10 results)
 */
export async function fetchMultiplePages(pages: number = 3) {
  if (!RAPID_API_KEY) {
    throw new Error("RAPID_API_KEY is not set");
  }

  const promises = [];

  for (let i = 0; i < pages; i++) {
    const offset = i * 10;
    promises.push(fetchInternOffers(offset));
  }

  try {
    const results = await Promise.all(promises);

    const allOffers = results.flat();

    const uniqueOffers = allOffers.filter(
      (offer, index, array) =>
        array.findIndex((o) => o.id === offer.id) === index
    );

    return uniqueOffers;
  } catch (error) {
    console.error("Error fetching multiple pages: ", error);
    throw error;
  }
}

/**
 * @name fetchInternOffersWithPagination
 * @description Fetch internship offers with built-in pagination support
 */
export async function fetchInternOffersWithPagination(
  offset: number = 0,
  limit: number = 10
) {
  const offers = await fetchInternOffers(offset);

  return {
    data: offers,
    pagination: {
      offset,
      limit,
      hasMore: offers.length === limit,
      nextOffset: offset + limit,
    },
  };
}

/**
 * @name transformToInternshipOffer
 * @description Transform raw API data into our InternOffer structure
 */
function transformToInternshipOffer(
  rawData: RawInternshipOffer
): InternOffer | null {
  let location: string | null = null;

  if (
    Array.isArray(rawData.locations_derived) &&
    rawData.locations_derived.length > 0
  ) {
    location = rawData.locations_derived[0];
  } else if (
    Array.isArray(rawData.locations_alt_raw) &&
    rawData.locations_alt_raw.length > 0
  ) {
    location = rawData.locations_alt_raw[0];
  } else if (
    Array.isArray(rawData.locations_raw) &&
    rawData.locations_raw.length > 0
  ) {
    const locationRaw = rawData.locations_raw[0];
    if (locationRaw.address) {
      const addressParts = [
        locationRaw.address.addressLocality,
        locationRaw.address.addressRegion,
        locationRaw.address.addressCountry,
      ].filter(Boolean);
      location = addressParts.join(", ");
    } else if (locationRaw.addressLocality) {
      location = locationRaw.addressLocality;
    }
  } else if (
    Array.isArray(rawData.location_requirements_raw) &&
    rawData.location_requirements_raw.length > 0
  ) {
    location = rawData.location_requirements_raw[0].name;
  }

  return {
    id: rawData.id,
    title: rawData.title,
    logo: rawData.organization_logo ?? null,
    date_posted: new Date(rawData.date_posted),
    type:
      Array.isArray(rawData.employment_type) &&
      rawData.employment_type.length > 0
        ? rawData.employment_type[0]
        : null,
    company: rawData.organization,
    location,
    deadline: rawData.date_validthrough
      ? new Date(rawData.date_validthrough)
      : null,
    view_details: rawData.url,
  };
}
