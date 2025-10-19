import type { SignInWithPasswordlessCredentials } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

import { useSupabase } from "./use-supabase";

/**
 * @name useSignInWithOtp
 * @description Handles both sending and verifying OTP authentication via Supabase.
 */
export function useSignInWithOtp() {
  const client = useSupabase();

  const mutationKey = ["auth", "otp"];

  const mutationFn = async (params: {
    action: "send" | "verify";
    email: string;
    otp?: string;
    options?: SignInWithPasswordlessCredentials["options"];
  }) => {
    const { action, email, otp, options } = params;

    if (action === "send") {
      // Step 1: Send OTP email
      const result = await client.auth.signInWithOtp({
        email,
        options,
      });

      if (result.error) handleSupabaseError(result.error.message);
      return { status: "sent", data: result.data };
    }

    if (action === "verify") {
      // Step 2: Verify OTP code
      if (!otp) throw new Error("Missing OTP code");

      const result = await client.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (result.error) handleSupabaseError(result.error.message);
      return { status: "verified", data: result.data };
    }

    throw new Error("Invalid OTP action");
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}

function handleSupabaseError(errorMsg: string): never {
  if (shouldIgnoreError(errorMsg)) {
    console.warn(`Ignoring error during development: ${errorMsg}`);
    return {} as never;
  }
  throw new Error(errorMsg);
}

function shouldIgnoreError(error: string) {
  return signupNotAllowedError(error);
}

function signupNotAllowedError(error: string) {
  return error.includes(`Signups not allowed for otp`);
}
