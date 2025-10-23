"use client";

import React from "react";

import pathsConfig from "@/config/paths.config";
import { useFetchSectionTrainee } from "@/hooks/use-section-trainees";

import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import TraineeDetailsContainer from "@/components/sumikapp/trainee-details-container";

import NotFoundPage from "@/app/not-found";

export default function SectionTraineeDetailsContainer(params: {
  traineeId: string;
  slug: string;
}) {
  const { data: traineeDetails, isLoading } = useFetchSectionTrainee({
    slug: params.slug,
    id: params.traineeId,
  });

  console.log(params.slug, params.traineeId);

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!traineeDetails) {
    return <NotFoundPage />;
  }

  return (
    <TraineeDetailsContainer
      role={"coordinator"}
      link={pathsConfig.dynamic.sectionTrainees(params.slug)}
      traineeDetails={traineeDetails}
    />
  );
}
