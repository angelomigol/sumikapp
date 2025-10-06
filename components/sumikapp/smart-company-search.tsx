"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

import { Briefcase, Building2, MapPin, Phone } from "lucide-react";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { Input } from "@/components/ui/input";

import { Badge } from "../ui/badge";

export type SearchableCompany = {
  id: string;
  company_name: string;
  company_address: string | null;
  company_contact_number: string | null;
  nature_of_business: string | null;
  date_of_signing: string | null;
  moa_file_path: string | null;
};

interface SmartCompanySearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (company: SearchableCompany) => void;
  className?: string;
  disabled?: boolean;
}

export interface SmartCompanySearchRef {
  clearSearch: () => void;
}

const SmartCompanySearch = React.forwardRef<
  SmartCompanySearchRef,
  SmartCompanySearchProps
>(({ value = "", onChange, onSelect, className = "", disabled }, ref) => {
  const supabase = useSupabase();

  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchableCompany[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<SearchableCompany[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      clearSearch: () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
      },
    }),
    []
  );

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fetch companies data on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from("industry_partners")
          .select("*")
          .order("company_name");

        if (error) {
          console.error("Error fetching companies:", error);
          return;
        }

        if (data) {
          setCompanies(data);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchCompanies();
  }, [supabase]);

  // Smart search function with null safety
  const searchCompanies = (searchQuery: string): SearchableCompany[] => {
    if (!searchQuery.trim()) {
      return [];
    }

    const lowercaseQuery = searchQuery.toLowerCase();

    return companies
      .filter((company) => {
        const companyName = company.company_name.toLowerCase();
        const address = company.company_address?.toLowerCase() || "";
        const business = company.nature_of_business?.toLowerCase() || "";
        const contactNumber = company.company_contact_number || "";

        return (
          companyName.includes(lowercaseQuery) ||
          (address && address.includes(lowercaseQuery)) ||
          (business && business.includes(lowercaseQuery)) ||
          contactNumber.includes(lowercaseQuery)
        );
      })
      .slice(0, 8);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayedSearch = setTimeout(() => {
      try {
        const searchResults = searchCompanies(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, companies, searchCompanies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (company: SearchableCompany): void => {
    setQuery(company.company_name);
    onChange?.(company.company_name);
    onSelect?.(company);
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const formatPhoneNumber = (phone: string | null): string => {
    if (!phone) return "";
    // Simple phone formatting - adjust based on your needs
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  const hasActiveMOA = (company: SearchableCompany): boolean => {
    return !!company.moa_file_path && !!company.date_of_signing;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative" ref={searchRef}>
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
          autoComplete="off"
        />
      </div>

      {isLoading && query.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-lg">
          <div className="mx-auto size-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
          <p className="mt-2 text-sm">Searching companies...</p>
        </div>
      )}

      {isOpen && !isLoading && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {results.map((company, index) => (
            <div
              key={company.id}
              className={`cursor-pointer border-b border-gray-100 p-4 transition-colors last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? "border-blue-200 bg-blue-50" : ""
              }`}
              onClick={() => handleSelect(company)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  {/* Company Name */}
                  <div className="mb-2 flex items-center gap-2">
                    <Building2 className="size-4 flex-shrink-0 text-blue-600" />
                    <span className="truncate text-lg font-semibold text-gray-900">
                      {highlightMatch(company.company_name, query)}
                    </span>
                  </div>

                  {/* Business Type */}
                  {company.nature_of_business && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="size-3" />
                      <span>
                        {highlightMatch(company.nature_of_business, query)}
                      </span>
                    </div>
                  )}

                  {/* Address */}
                  {company.company_address && (
                    <div className="mb-2 flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="mt-0.5 size-3 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {highlightMatch(company.company_address, query)}
                      </span>
                    </div>
                  )}

                  {/* Contact Number */}
                  {company.company_contact_number && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="size-3" />
                      <span>
                        {highlightMatch(
                          formatPhoneNumber(company.company_contact_number),
                          query
                        )}
                      </span>
                    </div>
                  )}

                  {/* MOA Status and Date */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {hasActiveMOA(company) ? (
                      <>
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          Active MOA
                        </Badge>
                        {company.date_of_signing && (
                          <span className="text-gray-400">
                            Signed:{" "}
                            {new Date(
                              company.date_of_signing
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700"
                      >
                        No MOA
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="ml-3 flex-shrink-0">
                  <div
                    className={`size-3 rounded-full ${
                      hasActiveMOA(company) ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.length > 0 && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-lg"
        >
          <Building2 className="mx-auto mb-2 size-8 text-gray-300" />
          <p>{`No companies found matching "${query}"`}</p>
          <p className="mt-1 text-xs text-gray-400">
            Try searching by company name, address, or business type
          </p>
        </div>
      )}
    </div>
  );
});

SmartCompanySearch.displayName = "SmartCompanySearch";

export default SmartCompanySearch;
