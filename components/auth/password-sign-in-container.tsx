"use client";

import { useCallback } from "react";

import type { z } from "zod";

import { useCaptchaToken } from "@/utils/captcha/client/use-captcha-token";
import { useSignInWithEmailPassword } from "@/utils/supabase/hooks/use-sign-in-with-email-password";

import type { PasswordSignInSchema } from "@/schemas/auth/password-sign-in.schema";

import { AuthErrorAlert } from "./auth-error-alert";
import { PasswordSignInForm } from "./password-sign-in-form";

export function PasswordSignInContainer({
  onSignIn,
}: {
  onSignIn?: (userId?: string) => unknown;
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInMutation = useSignInWithEmailPassword();
  const isLoading = signInMutation.isPending;

  const onSubmit = useCallback(
    async (credentials: z.infer<typeof PasswordSignInSchema>) => {
      try {
        const data = await signInMutation.mutateAsync({
          ...credentials,
          options: { captchaToken },
        });

        if (onSignIn) {
          const userId = data?.user?.id;

          onSignIn(userId);
        }
      } catch {
        // wrong credentials, do nothing
      } finally {
        resetCaptchaToken();
      }
    },
    [captchaToken, onSignIn, resetCaptchaToken, signInMutation]
  );

  return (
    <>
      <AuthErrorAlert error={signInMutation.error} />

      <PasswordSignInForm onSubmit={onSubmit} loading={isLoading} />
    </>
  );
}
