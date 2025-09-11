"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import CustomSearchbar from "@/components/sumikapp/custom-search-bar";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import { InternOffer } from "../schemas/intern-offer.schema";
import { fetchInternOffers } from "../server/server-actions";
import InternOfferCard from "./intern-offer-card";
import JobRoleFilter from "./job-role-filter";
import NoMatchingInternships from "./no-matching-internships";

export default function PlacementContainer({
  initialOffers,
}: {
  initialOffers: InternOffer[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    data: offers = initialOffers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["intern-offers"],
    queryFn: fetchInternOffers,
    initialData: initialOffers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredOffers = filterOffers(offers, searchQuery, selectedRoles);

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <CustomSearchbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search keywords, skills, or job title"
        />

        <JobRoleFilter
          selectedRoles={selectedRoles}
          onFilterChange={(roles: string[]) => setSelectedRoles(roles)}
        />
      </div>
      <div className="flex-1 space-y-4">
        <h4 className="text-lg font-bold">
          Recommended Offers for You ({filteredOffers.length})
        </h4>

        <If condition={!isLoading && !error}>
          {filteredOffers.map((offer) => (
            <InternOfferCard key={offer.id} offer={offer} />
          ))}
        </If>

        <If condition={!isLoading && !error && filteredOffers.length === 0}>
          <NoMatchingInternships
            setSearchQuery={setSearchQuery}
            setSelectedRoles={setSelectedRoles}
          />
        </If>
      </div>
    </>
  );
}

const filterOffers = (
  jobs: InternOffer[],
  searchQuery?: string,
  selectedRoles?: string[]
) => {
  return jobs.filter((job) => {
    const lowerSearch = searchQuery?.toLowerCase();
    const lowerRoles = selectedRoles?.map((role) => role.toLowerCase());

    const safeIncludes = (text: string | null | undefined, search: string) => {
      return text?.toLowerCase().includes(search) || false;
    };

    const matchesSearch =
      !searchQuery ||
      safeIncludes(job.title, lowerSearch ?? "") ||
      safeIncludes(job.company, lowerSearch ?? "") ||
      safeIncludes(job.location, lowerSearch ?? "");

    const matchesRoles =
      !selectedRoles?.length ||
      lowerRoles?.some((role) => safeIncludes(job.title, role));

    return matchesSearch && matchesRoles;
  });
};
