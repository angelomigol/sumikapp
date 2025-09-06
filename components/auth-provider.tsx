"use client";

import pathsConfig from "@/config/paths.config";

import { useAuthChangeListener } from "@/utils/supabase/hooks/use-auth-change-listener";

export function AuthProvider(props: React.PropsWithChildren) {
  useAuthChangeListener({
    appIndexPath: pathsConfig.app.index,
  });

  return props.children;
}
