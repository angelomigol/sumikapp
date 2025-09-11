"use client";

import type { User } from "@supabase/supabase-js";

import pathsConfig from "@/config/paths.config";

import { useSignOut } from "@/utils/supabase/hooks/use-sign-out";
import { useUser } from "@/utils/supabase/hooks/use-user";

import NavUser from "./nav-user";

const paths = {
  settings: pathsConfig.app.settings,
  dashboard: pathsConfig.app.dashboard,
};

export function ProfileAccountDropdownContainer(props: {
  user?: User;
  showProfileName?: boolean;

  account?: {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    role: string;
  };
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const userData = user.data;

  if (!userData) {
    return null;
  }

  return (
    <NavUser
      paths={paths}
      user={userData}
      account={props.account}
      signOutRequested={() => signOut.mutateAsync()}
    />
  );
}
