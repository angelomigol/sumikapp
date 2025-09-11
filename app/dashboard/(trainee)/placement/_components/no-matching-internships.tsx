"use client";

import React from "react";

import { Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NoMatchingInternshipsProps {
  setSearchQuery: (value: string) => void;
  setSelectedRoles: (value: string[]) => void;
}

export default function NoMatchingInternships({
  setSearchQuery,
  setSelectedRoles,
}: NoMatchingInternshipsProps) {
  return (
    <div className="flex flex-col items-center space-y-4 py-12 text-center">
      <Briefcase className="text-muted-foreground size-12" />
      <h3 className="text-lg font-semibold">No matching internships found</h3>
      <p className="text-muted-foreground text-sm">
        Try adjusting your search filters or removing some criteria
      </p>
      <Button
        variant="ghost"
        onClick={() => {
          setSearchQuery("");
          setSelectedRoles([]);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );
}
