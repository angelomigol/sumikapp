"use client";

import React from "react";

import { NormalizedUser, useFetchUser } from "@/hooks/use-users";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

type AdminUser = Extract<NormalizedUser, { role: "admin" }>;

export default function AdminSettings(params: {
  userId: string;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
}) {
  const user = useFetchUser(params.userId);

  if (!user.data || user.isLoading) {
    return <LoadingOverlay />;
  }

  const adminData = user.data as AdminUser;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>First Name</Label>
          <Input readOnly value={adminData.first_name} />
        </div>
        <div className="space-y-1">
          <Label>Middle Name</Label>
          <Input readOnly value={adminData.middle_name || ""} />
        </div>
        <div className="space-y-1">
          <Label>Last Name</Label>
          <Input readOnly value={adminData.last_name} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Email Address</Label>
        <Input readOnly value={adminData.email} />
      </div>
    </>
  );
}
