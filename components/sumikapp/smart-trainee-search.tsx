"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { BookOpen, Hash, Search, User, Users } from "lucide-react";

import { useSupabase } from "@/utils/supabase/hooks/use-supabase";

import { Input } from "@/components/ui/input";

export type SearchableTrainee = {
  id: string;
  student_id_number: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;
  course: string | null;
  section: string | null;
};

interface SmartTraineeSearchProps {
  onSelect?: (trainee: SearchableTrainee) => void;
  placeholder?: string;
  className?: string;
}

export interface SmartTraineeSearchRef {
  clearSearch: () => void;
}

const SmartTraineeSearch = React.forwardRef<
  SmartTraineeSearchRef,
  SmartTraineeSearchProps
>(
  (
    {
      onSelect,
      placeholder = "Search for student by name, email, ID, course, or section",
      className = "",
    },
    ref
  ) => {
    const supabase = useSupabase();

    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<SearchableTrainee[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [trainees, setTrainees] = useState<SearchableTrainee[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Expose clearSearch method to parent
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

    // Fetch trainees data on component mount
    useEffect(() => {
      const fetchTrainees = async () => {
        try {
          const { data, error } = await supabase
            .from("trainees")
            .select(
              `
              id,
              student_id_number,
              course,
              section,
              users!inner (
                id,
                first_name,
                last_name,
                middle_name,
                email,
                deleted_at
              )
            `
            )
            .is("users.deleted_at", null);

          if (error) {
            console.error("Error fetching trainees:", error);
            return;
          }

          if (data) {
            // Transform the data to match SearchableTrainee type
            const transformedTrainees: SearchableTrainee[] = data.map(
              (item) => ({
                id: item.id,
                student_id_number: item.student_id_number,
                first_name: item.users.first_name,
                last_name: item.users.last_name,
                middle_name: item.users.middle_name,
                email: item.users.email,
                course: item.course,
                section: item.section,
              })
            );

            setTrainees(transformedTrainees);
          }
        } catch (error) {
          console.error("Failed to fetch trainees:", error);
        }
      };

      fetchTrainees();
    }, [supabase]);

    // Smart search function with null safety
    const searchTrainees = useCallback(
      (searchQuery: string): SearchableTrainee[] => {
        if (!searchQuery.trim()) {
          return [];
        }

        const lowercaseQuery = searchQuery.toLowerCase();

        return trainees
          .filter((trainee) => {
            const nameParts = [
              trainee.first_name,
              trainee.middle_name,
              trainee.last_name,
            ].filter(Boolean);
            const fullName = nameParts.join(" ").toLowerCase();

            const email = trainee.email.toLowerCase();
            const studentId = trainee.student_id_number.toLowerCase();
            const course = trainee.course?.toLowerCase() || "";
            const section = trainee.section?.toLowerCase() || "";

            return (
              fullName.includes(lowercaseQuery) ||
              email.includes(lowercaseQuery) ||
              studentId.includes(lowercaseQuery) ||
              (course && course.includes(lowercaseQuery)) ||
              (section && section.includes(lowercaseQuery))
            );
          })
          .slice(0, 5);
      },
      [trainees]
    );

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
          const searchResults = searchTrainees(query);
          setResults(searchResults);
          setIsOpen(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Debounce search

      return () => clearTimeout(delayedSearch);
    }, [query, searchTrainees]);

    // Handle keyboard navigation with proper typing
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

    const handleSelect = (trainee: SearchableTrainee): void => {
      onSelect?.(trainee);

      // Clear the search after selection
      setQuery("");
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    };

    // Close dropdown when clicking outside
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const highlightMatch = (text: string, query: string): React.ReactNode => {
      if (!query.trim()) return text;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      const parts = text.split(regex);

      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 font-medium">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    const formatFullName = (trainee: SearchableTrainee): string => {
      return [trainee.first_name, trainee.middle_name, trainee.last_name]
        .filter(Boolean)
        .join(" ");
    };

    return (
      <div className={`relative max-w-xl ${className}`}>
        <div className="relative" ref={searchRef}>
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="search"
            type="search"
            placeholder={placeholder}
            className="pr-4 pl-8"
            autoComplete="off"
          />
        </div>

        {isLoading && query.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-lg">
            <div className="mx-auto size-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            <p className="mt-2 text-sm">Searching...</p>
          </div>
        )}

        {isOpen && !isLoading && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {results.map((trainee, index) => (
              <div
                key={trainee.id}
                className={`cursor-pointer border-b border-gray-100 p-3 transition-colors last:border-b-0 hover:bg-gray-50 ${
                  index === selectedIndex ? "border-blue-200 bg-blue-50" : ""
                }`}
                onClick={() => handleSelect(trainee)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <User className="size-4 flex-shrink-0 text-gray-500" />
                      <span className="truncate font-medium text-gray-900">
                        {highlightMatch(formatFullName(trainee), query)}
                      </span>
                    </div>

                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="size-3" />
                      <span>
                        {highlightMatch(trainee.student_id_number, query)}
                      </span>
                    </div>

                    <div className="mb-1 text-sm text-gray-500">
                      {highlightMatch(trainee.email, query)}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {trainee.course && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="size-3 text-gray-400" />
                          <span>{highlightMatch(trainee.course, query)}</span>
                        </div>
                      )}
                      {trainee.section && (
                        <div className="flex items-center gap-1">
                          <Users className="size-3 text-gray-400" />
                          <span>{highlightMatch(trainee.section, query)}</span>
                        </div>
                      )}
                    </div>
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
            <Search className="mx-auto mb-2 size-8 text-gray-300" />
            <p>{`No trainees found matching "${query}"`}</p>
            <p className="mt-1 text-xs text-gray-400">
              Try searching by name, email, student ID, course, or section
            </p>
          </div>
        )}
      </div>
    );
  }
);

SmartTraineeSearch.displayName = "SmartTraineeSearch";

export default SmartTraineeSearch;
