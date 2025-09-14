"use client";

import React from "react";

import { NormalizedUser, useFetchUser } from "@/hooks/use-users";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

type SupervisorUser = Extract<NormalizedUser, { role: "supervisor" }>;

export default function SupervisorSettings(params: { userId: string }) {
  const user = useFetchUser(params.userId);

  if (!user.data || user.isLoading) {
    return <LoadingOverlay />;
  }

  const supervisorData = user.data as SupervisorUser;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>First Name</Label>
          <Input readOnly value={supervisorData.first_name} />
        </div>
        <div className="space-y-1">
          <Label>Middle Name</Label>
          <Input readOnly value={supervisorData.middle_name || ""} />
        </div>
        <div className="space-y-1">
          <Label>Last Name</Label>
          <Input readOnly value={supervisorData.last_name} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Email Address</Label>
        <Input readOnly value={supervisorData.email} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Position</Label>
          <Input readOnly value={supervisorData.position} />
        </div>
        <div className="space-y-1">
          <Label>Department</Label>
          <Input readOnly value={supervisorData.department} />
        </div>
        <div className="space-y-1">
          <Label>Contact No.</Label>
          <Input readOnly value={supervisorData.telephone_number} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Company Name</Label>
        <Input readOnly value={supervisorData.company_name} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Company Address</Label>
          <Input readOnly value={supervisorData.company_address} />
        </div>
        <div className="space-y-1">
          <Label>Company Contact No.</Label>
          <Input readOnly value={supervisorData.company_contact_no} />
        </div>
      </div>
    </>
  );
}
