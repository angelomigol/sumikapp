"use client";

import React from "react";

import { Plus } from "lucide-react";

import { InternshipDetails } from "@/hooks/use-internship-details";

import { getDocumentStatusConfig } from "@/lib/constants";

import { safeFormatDate } from "@/utils/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { If } from "@/components/sumikapp/if";

interface InternshipDetailsListProps {
  onViewInternship: (internship: InternshipDetails) => void;
  onCreateInternship: () => void;
  internships: InternshipDetails[];
}

export default function InternshipDetailsList({
  onViewInternship,
  onCreateInternship,
  internships,
}: InternshipDetailsListProps) {
  const handleCardClick = (
    internship: InternshipDetails,
    e: React.MouseEvent
  ) => {
    if ((e.target as HTMLElement).closest('[data-action="true"]')) {
      return;
    }
    onViewInternship(internship);
  };

  return (
    <div className="space-y-4">
      <If condition={internships.length > 0}>
        {internships.map((internship) => {
          const internDuration = `${safeFormatDate(internship.startDate, "PP")} - ${safeFormatDate(internship.endDate, "PP")}`;

          return (
            <Card
              key={internship.id}
              className="cursor-pointer transition hover:shadow-md"
              onClick={(e) => handleCardClick(internship, e)}
            >
              <CardHeader>
                <CardTitle>{internship.companyName}</CardTitle>
                <CardDescription>
                  {internship.job_role} / {internDuration}
                </CardDescription>
                <CardAction>
                  <Badge
                    className={`${getDocumentStatusConfig(internship.status)?.badgeColor} capitalize`}
                  >
                    {internship.status}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          );
        })}
      </If>

      <Button size={"lg"} className="w-full" onClick={onCreateInternship}>
        <Plus />
        Add Intership Form
      </Button>
    </div>
  );
}
