"use client";

import React from "react";

import { NormalizedUser, useFetchUser } from "@/hooks/use-users";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

type CoordinatorUser = Extract<NormalizedUser, { role: "coordinator" }>;

export default function CoordinatorSettings(params: { userId: string }) {
  const user = useFetchUser(params.userId);

  if (!user.data || user.isLoading) {
    return <LoadingOverlay />;
  }

  const coordinatorData = user.data as CoordinatorUser;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>First Name</Label>
          <Input readOnly value={coordinatorData.first_name} />
        </div>
        <div className="space-y-1">
          <Label>Middle Name</Label>
          <Input readOnly value={coordinatorData.middle_name || ""} />
        </div>
        <div className="space-y-1">
          <Label>Last Name</Label>
          <Input readOnly value={coordinatorData.last_name} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Email Address</Label>
        <Input readOnly value={coordinatorData.email} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Department</Label>
          <Input readOnly value={coordinatorData.department} />
        </div>
      </div>
    </>
  );
}
