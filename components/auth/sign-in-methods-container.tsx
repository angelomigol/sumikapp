"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { If } from "@/components/sumikapp/if";

import { Button } from "../ui/button";
import { EmailForm } from "./email-form";
import { OtpForm } from "./otp-form";
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

  const [otpStep, setOtpStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");

  const redirectUrl =
    typeof window !== "undefined"
      ? new URL(props.paths.callback, window?.location.origin).toString()
      : "";

  const onSignIn = () => {
    router.replace(nextPath);
  };

  const showToggle = props.providers.magicLink && props.providers.password;

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setOtpStep("verify");
  };

  const handleResendOtp = () => {
    setOtpStep("email");
  };

  return (
    <>
      <If condition={activeMethod === "magicLink" && props.providers.magicLink}>
        <If condition={otpStep === "email"}>
          <EmailForm
            shouldCreateUser={false}
            onEmailSubmit={handleEmailSubmit}
            defaultEmail={email}
          />
        </If>

        <If condition={otpStep === "verify"}>
          <OtpForm
            email={email}
            redirectUrl={redirectUrl}
            onResend={handleResendOtp}
          />
        </If>
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
