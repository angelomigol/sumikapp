"use client";

import React, { useState } from "react";

import { InternshipDetails } from "@/hooks/use-internship-details";

import { DocumentStatus } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import InternshipFormViewerModal from "./internship-form-viewer-modal";

export default function InternshipStatusCell({
  internship_details,
  slug,
}: {
  internship_details?: {
    id: string;
    company_name: string | null;
    contact_number: string | null;
    nature_of_business: string | null;
    address: string | null;
    job_role: string | null;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    daily_schedule: string | null;
    status: DocumentStatus;
    created_at: string;
  } | null;
  slug: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "not submitted":
        return "bg-gray-500 text-white";
      default:
        return "bg-amber-500 text-white";
    }
  };

  if (!internship_details) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-gray-300"
      >
        Missing
      </Badge>
    );
  }

  const handleViewForm = () => {
    if (!internship_details) return;
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Badge className={getStatusColor(internship_details.status)}>
        {internship_details.status.charAt(0).toUpperCase() +
          internship_details.status.slice(1)}
      </Badge>

      <Button
        variant={"outline"}
        size={"sm"}
        className="h-7 text-xs"
        onClick={handleViewForm}
        disabled={!internship_details}
      >
        View
      </Button>

      {isModalOpen && (
        <InternshipFormViewerModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          internshipId={internship_details.id}
          dailySchedule={internship_details.daily_schedule}
          jobRole={internship_details.job_role}
          companyName={internship_details.company_name}
          contactNumber={internship_details.contact_number}
          natureOfBusiness={internship_details.nature_of_business}
          companyAddress={internship_details.address}
          startDate={internship_details.start_date}
          endDate={internship_details.end_date}
          startTime={internship_details.start_time}
          endTime={internship_details.end_time}
          supervisorEmail={""}
          status={internship_details.status}
          slug={slug}
        />
      )}
    </div>
  );
}
