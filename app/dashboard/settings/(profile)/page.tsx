import React from "react";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import AdminSettings from "../_components/admin-settings";
import CoordinatorSettings from "../_components/coordinator-settings";
import SupervisorSettings from "../_components/supervisor-settings";
import TraineeSettings from "../_components/trainee-settings";
import { SettingsContainer } from "./_components/settings-container";

export const generateMetadata = async () => {
  return {
    title: "Settings",
  };
};

export default async function SettingsPage() {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) redirect("/");

  const { data } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!data?.role) redirect("/");

  const roleComponents: Record<
    string,
    React.ComponentType<{
      userId: string;
      isEdit: boolean;
      setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    }>
  > = {
    admin: AdminSettings,
    trainee: TraineeSettings,
    supervisor: SupervisorSettings,
    coordinator: CoordinatorSettings,
  };

  const SettingsComponent = roleComponents[data.role];
  if (!SettingsComponent) redirect("/");

  return (
    <SettingsContainer
      role={data.role}
      userId={user.id}
      SettingsComponent={SettingsComponent}
    />
  );
}
