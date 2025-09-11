import React from "react";
import { redirect } from "next/navigation";

import { prefetchUser } from "@/hooks/use-users";

import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryClient } from "@/components/get-query-client";
import { If } from "@/components/sumikapp/if";

import AdminSettings from "../_components/admin-settings";
import CoordinatorSettings from "../_components/coordinator-settings";
import SupervisorSettings from "../_components/supervisor-settings";
import TraineeSettings from "../_components/trainee-settings";
import ProfileDangerZone from "./_components/profile-danger-zone";

export const generateMetadata = async () => {
  return {
    title: "Settings",
  };
};

export default async function SettingsPage() {
  const queryClient = getQueryClient();
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) redirect("/");

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!data?.role) redirect("/");

  const roleComponents: Record<string, (id: string) => React.ReactNode> = {
    admin: (id) => <AdminSettings userId={id} />,
    trainee: (id) => <TraineeSettings userId={id} />,
    supervisor: (id) => <SupervisorSettings userId={id} />,
    coordinator: (id) => <CoordinatorSettings userId={id} />,
  };

  const SettingsComponent = roleComponents[data.role]?.(user.id) ?? redirect("/");

  await prefetchUser(queryClient, user.id);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{SettingsComponent}</CardContent>
      </Card>

      {/* <If condition={data.role !== "trainee"}>
        <ProfileDangerZone />
      </If> */}
    </>
  );
}
