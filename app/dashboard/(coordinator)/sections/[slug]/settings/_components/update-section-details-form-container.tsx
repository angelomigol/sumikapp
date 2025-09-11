import React from "react";

import { useRevalidateFetchSection } from "@/hooks/use-sections";

import { InternshipCode } from "@/lib/constants";

import UpdateSectionDetailsForm from "./update-section-details-form";

export default function UpdateSectionDetailsFormContainer({
  isEdit,
  setIsEdit,
  section,
}: {
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  section: {
    id: string;
    start_date: string;
    end_date: string;
    coordinator_id: string;
    created_at: string;
    description: string | null;
    internship_code: InternshipCode;
    required_hours: number;
    title: string;
  };
}) {
  const revalidateSection = useRevalidateFetchSection();

  return (
    <UpdateSectionDetailsForm
      isEdit={isEdit}
      setIsEdit={setIsEdit}
      onUpdate={() => revalidateSection(section.id)}
      sectionId={section.id}
      title={section.title}
      description={section.description}
      start_date={new Date(section.start_date)}
      end_date={new Date(section.end_date)}
      internship_code={section.internship_code}
      required_hours={section.required_hours}
    />
  );
}
