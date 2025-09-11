import React from "react";

import AddSectionTraineesContainer from "./_components/add-section-trainees-container";

export default async function AddSectionTraineesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <AddSectionTraineesContainer slug={(await params).slug} />;
}
