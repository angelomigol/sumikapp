import React from "react";

import { requireUserInServerComponent } from "@/lib/server/require-user-in-server-component";

import EvaluateTraineeContainer from "./_component/evaluate-trainee-container";

export default async function EvaluateTraineePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUserInServerComponent();

  return (
    <EvaluateTraineeContainer
      traineeId={(await params).id}
      evaluatorId={user.id}
    />
  );
}
