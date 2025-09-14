"use client";

import { useCallback, useRef, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import CustomSearchbar from "@/components/sumikapp/custom-search-bar";
import { If } from "@/components/sumikapp/if";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import { InternOffer } from "../schemas/intern-offer.schema";
import {
  fetchInternOffers,
  fetchInternOffersWithPagination,
} from "../server/server-actions";
import InternOfferCard from "./intern-offer-card";
import JobRoleFilter from "./job-role-filter";
import NoMatchingInternships from "./no-matching-internships";
import ScrollToTop from "./scroll-to-top";

export default function PlacementContainer({
  initialOffers,
}: {
  initialOffers: InternOffer[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["intern-offers"],
    queryFn: ({ pageParam = 0 }) => fetchInternOffersWithPagination(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.nextOffset
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const intObserver = useRef<IntersectionObserver | null>(null);
  const lastOfferElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) intObserver.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const offers = data?.pages.flatMap((page) => page.data) || initialOffers;
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
          {filteredOffers.map((offer, index) => (
            <If
              condition={filteredOffers.length === index + 1}
              fallback={<InternOfferCard key={offer.id} offer={offer} />}
            >
              <div key={offer.id} ref={lastOfferElementRef}>
                <InternOfferCard key={offer.id} offer={offer} />
              </div>
            </If>
          ))}
        </If>

        <If condition={!isLoading && !error && filteredOffers.length === 0}>
          <NoMatchingInternships
            setSearchQuery={setSearchQuery}
            setSelectedRoles={setSelectedRoles}
          />
        </If>

        <If condition={isFetchingNextPage}>
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin" />
          </div>
        </If>

        <If
          condition={
            !isLoading && !error && !hasNextPage && filteredOffers.length > 0
          }
        >
          <div className="flex justify-center py-6">
            <span className="text-sm text-gray-500">
              You've reached the end of the internship listings
            </span>
          </div>
        </If>
      </div>

      <ScrollToTop />
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
