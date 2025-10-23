"use client";

import React from "react";

import pathsConfig from "@/config/paths.config";
import { useFetchSupervisorTrainee } from "@/hooks/use-supervisor-trainees";

import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";
import TraineeDetailsContainer from "@/components/sumikapp/trainee-details-container";

import NotFoundPage from "@/app/not-found";

export default function SupervisorTraineeDetailsContainer(params: {
  internshipId: string;
}) {
  const { data: traineeDetails, isLoading } = useFetchSupervisorTrainee(
    params.internshipId
  );

  if (isLoading) {
    return <LoadingOverlay fullPage />;
  }

  if (!traineeDetails) {
    return <NotFoundPage />;
  }

  return (
    <TraineeDetailsContainer
      role={"supervisor"}
      link={pathsConfig.app.trainees}
      traineeDetails={traineeDetails}
    />
  );
}
