"use client";

import React from "react";

import { NormalizedUser, useFetchUser } from "@/hooks/use-users";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

type TraineeUser = Extract<NormalizedUser, { role: "trainee" }>;

export default function TraineeSettings(params: { userId: string }) {
  const user = useFetchUser(params.userId);

  if (!user.data || user.isLoading) {
    return <LoadingOverlay />;
  }

  const traineeData = user.data as TraineeUser;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>First Name</Label>
          <Input readOnly value={traineeData.first_name} />
        </div>
        <div className="space-y-1">
          <Label>Middle Name</Label>
          <Input readOnly value={traineeData.middle_name || ""} />
        </div>
        <div className="space-y-1">
          <Label>Last Name</Label>
          <Input readOnly value={traineeData.last_name} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Email Address</Label>
        <Input readOnly value={traineeData.email} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Student ID Number</Label>
          <Input readOnly value={traineeData.student_id_number} />
        </div>
        <div className="space-y-1">
          <Label>Course</Label>
          <Input readOnly value={traineeData.course} />
        </div>
        <div className="space-y-1">
          <Label>Section</Label>
          <Input readOnly value={traineeData.section} />
        </div>
        <div className="space-y-1">
          <Label>Mobile Number</Label>
          <Input readOnly value={traineeData.mobile_number} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Address</Label>
        <Input readOnly value={traineeData.address} />
      </div>
    </>
  );
}
