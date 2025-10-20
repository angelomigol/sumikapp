"use client";

import { useState } from "react";

import { Edit } from "lucide-react";

import type { Role } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiFactorAuthFactorsList } from "@/components/mfa/multi-factor-auth-list";
import { If } from "@/components/sumikapp/if";

export function SettingsContainer({
  role,
  userId,
  SettingsComponent,
}: {
  role: Role;
  userId: string;
  SettingsComponent: React.ComponentType<{
    userId: string;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
}) {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          {/* <If condition={role !== "trainee"}>
            <CardAction>
              <Button size={"sm"} onClick={() => setIsEdit(true)}>
                <Edit className="size-4" />
                Edit Profile
              </Button>
            </CardAction>
          </If> */}
        </CardHeader>

        <CardContent className="space-y-4">
          <SettingsComponent
            userId={userId}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
          />
        </CardContent>
      </Card>

      <MultiFactorAuthFactorsList userId={userId} />
    </>
  );
}
