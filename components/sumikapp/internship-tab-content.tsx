"use client";

import React from "react";

import { TraineeFullDetails } from "@/hooks/use-section-trainees";

import TraineeDetailsContainer from "./trainee-details-container";

export default function InternshipTabContent({
  role,
  link,
  traineeDetails,
}: {
  role: "coordinator" | "supervisor" | "trainee";
  link?: string;
  traineeDetails: TraineeFullDetails;
}) {
  return (
    <TraineeDetailsContainer
      role={role}
      link={link}
      traineeDetails={traineeDetails}
    />
  );
}
