"use client";

import { useUser } from "@/utils/supabase/hooks/use-user";

import { LoadingOverlay } from "../sumikapp/loading-overlay";
import { Alert } from "../ui/alert";
import { UpdatePasswordForm } from "./update-password-form";

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>
) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user) {
    return null;
  }

  const canUpdatePassword = user.identities?.some(
    (item) => item.provider === `email`
  );

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  return <UpdatePasswordForm callbackPath={props.callbackPath} user={user} />;
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert variant={"destructive"}>
      You cannot update your password because your account is not linked to any.
    </Alert>
  );
}
