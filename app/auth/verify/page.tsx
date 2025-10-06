import { redirect } from "next/navigation";

import pathsConfig from "@/config/paths.config";

import { checkRequiresMultiFactorAuthentication } from "@/utils/supabase/check-requires-mfa";
import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

import { MultiFactorChallengeContainer } from "@/components/auth/multi-factor-challenge-container";

interface Props {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function VerifyPage(props: Props) {
  const client = getSupabaseServerClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    redirect(pathsConfig.app.index);
  }

  const needsMfa = await checkRequiresMultiFactorAuthentication(client);

  if (!needsMfa) {
    redirect(pathsConfig.app.index);
  }

  const nextPath = (await props.searchParams).next;
  const redirectPath = nextPath ?? pathsConfig.app.dashboard;

  return (
    <MultiFactorChallengeContainer
      userId={user.id}
      paths={{
        redirectPath,
      }}
    />
  );
}
