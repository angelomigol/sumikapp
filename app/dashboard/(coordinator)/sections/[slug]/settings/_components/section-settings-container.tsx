"use client";

import { useState } from "react";

import { useFetchSection } from "@/hooks/use-sections";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

import SectionDangerZone from "./section-danger-zone";
import UpdateSectionDetailsFormContainer from "./update-section-details-form-container";

export default function SectionSettingsContainer({ slug }: { slug: string }) {
  const [isEdit, setIsEdit] = useState(false);
  const section = useFetchSection(slug);

  if (!section.data || section.isPending) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
          <CardDescription>{`Manage this section's OJT settings`}</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateSectionDetailsFormContainer
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            section={section.data}
          />
        </CardContent>
      </Card>

      <SectionDangerZone id={section.data.id} isEdit={isEdit} />
    </>
  );
}
