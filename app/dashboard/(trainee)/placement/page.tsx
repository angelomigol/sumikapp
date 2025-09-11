import React from "react";

import PlacementContainer from "./_components/placement-container";
import { fetchInternOffers } from "./server/server-actions";

export const generateMetadata = async () => {
  return {
    title: "Recommended Internship Offers",
  };
};

export default async function PlacementPage() {
  const initialOffers = await fetchInternOffers();
  return <PlacementContainer initialOffers={initialOffers} />;
}
