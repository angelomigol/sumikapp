"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { If } from "@/components/sumikapp/if";

import { Button } from "../ui/button";
import { OtpCodeAuthContainer } from "./otp-code-auth-container";
import { PasswordSignInContainer } from "./password-sign-in-container";

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    dashboard: string;
  };

  providers: {
    password: boolean;
    magicLink: boolean;
  };
}) {
  const router = useRouter();
  const nextPath = useSearchParams().get("next") ?? props.paths.dashboard;

  const [activeMethod, setActiveMethod] = useState<"magicLink" | "password">(
    props.providers.magicLink ? "magicLink" : "password"
  );

  const redirectUrl =
    typeof window !== "undefined"
      ? new URL(props.paths.callback, window?.location.origin).toString()
      : "";

  const onSignIn = () => {
    router.replace(nextPath);
  };

  const showToggle = props.providers.magicLink && props.providers.password;

  return (
    <>
      <If condition={activeMethod === "magicLink" && props.providers.magicLink}>
        <OtpCodeAuthContainer
          redirectUrl={redirectUrl}
          shouldCreateUser={false}
        />
      </If>

      <If condition={activeMethod === "password" && props.providers.password}>
        <PasswordSignInContainer onSignIn={onSignIn} />
      </If>

      <If condition={showToggle}>
        <div className="text-center">
          <If condition={activeMethod === "magicLink"}>
            <Button
              type="button"
              variant={"link"}
              size={"sm"}
              onClick={() => setActiveMethod("password")}
              className="text-white"
            >
              Sign in with password instead
            </Button>
          </If>

          <If condition={activeMethod === "password"}>
            <Button
              type="button"
              variant={"link"}
              size={"sm"}
              onClick={() => setActiveMethod("magicLink")}
              className="text-white"
            >
              Send me an OTP code instead
            </Button>
          </If>
        </div>
      </If>
    </>
  );
}
