"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useCaptchaToken } from "@/utils/captcha/client/use-captcha-token";
import { useSignInWithOtp } from "@/utils/supabase/hooks/use-sign-in-with-otp";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { AuthErrorAlert } from "./auth-error-alert";

const OTP_EXPIRY_SECS = 60;

export function OtpCodeAuthContainer({
  redirectUrl,
  defaultValues,
  shouldCreateUser,
}: {
  redirectUrl: string;
  shouldCreateUser: boolean;

  defaultValues?: {
    email: string;
  };
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInWithOtpMutation = useSignInWithOtp();

  const [step, setStep] = useState<"send" | "verify">(
    defaultValues?.email ? "verify" : "send"
  );
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [timeRemaining, setTimeRemaining] = useState<number>(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== "verify") return;

    setTimeRemaining(OTP_EXPIRY_SECS);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, OTP_EXPIRY_SECS]);

  const sendForm = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email({ error: "Please enter a valid email address" }),
      })
    ),
    defaultValues: {
      email: defaultValues?.email ?? "",
    },
  });

  const verifyForm = useForm({
    resolver: zodResolver(
      z.object({
        otp: z.string().length(6, { error: "OTP must be 6 digits" }),
      })
    ),
    defaultValues: { otp: "" },
  });

  const onSubmit = ({ email }: { email: string }) => {
    const promise = async () => {
      await signInWithOtpMutation.mutateAsync({
        action: "send",
        email,
        options: {
          captchaToken,
          shouldCreateUser,
        },
      });
    };

    toast.promise(promise, {
      loading: "Sending OTP Code...",
      success: () => {
        setEmail(email);
        setStep("verify");
        verifyForm.reset();
        return "OTP code sent successfully";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while sending OTP code. Please try again.";
      },
    });

    resetCaptchaToken();
  };

  const onVerify = ({ otp }: { otp: string }) => {
    const promise = async () => {
      await signInWithOtpMutation.mutateAsync({
        action: "verify",
        email,
        otp,
      });
    };

    toast.promise(promise, {
      loading: "Verifying OTP Code...",
      success: () => {
        window.location.href = redirectUrl;
        return "Successfully Signed In!";
      },
      error: (err) => {
        verifyForm.reset();
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while verifying your OTP code. Please try again.";
      },
    });
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setStep("send");
    sendForm.setValue("email", email);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (step === "verify") {
    return (
      <Form {...verifyForm}>
        <form
          className="w-full space-y-6"
          onSubmit={verifyForm.handleSubmit(onVerify)}
        >
          <OtpSentAlert email={email} />

          <div className="space-y-1">
            <FormField
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="otp-input" className="text-white">
                    Enter 6-digit verification code
                  </FormLabel>
                  <FormControl className="flex w-full items-center justify-center">
                    <InputOTP
                      {...field}
                      maxLength={6}
                      id="otp-input"
                      aria-label="One-time password input"
                      onComplete={(value) => {
                        if (
                          value.length === 6 &&
                          !verifyForm.formState.isSubmitting
                        ) {
                          verifyForm.handleSubmit(onVerify)();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                        <InputOTPSlot
                          index={1}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                        <InputOTPSlot
                          index={2}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                        <InputOTPSlot
                          index={3}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                        <InputOTPSlot
                          index={4}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                        <InputOTPSlot
                          index={5}
                          className="text-foreground dark:text-background bg-white dark:bg-white"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center">
              <Button
                type="button"
                variant={"link"}
                onClick={handleResendCode}
                className={cn(
                  "text-xs text-white p-0 ",
                  canResend ? "hover:text-white/80" : "cursor-not-allowed"
                )}
                disabled={!canResend || verifyForm.formState.isSubmitting}
              >
                {`Didn't receive the code? Send again ${!canResend ? `in ${formatTime(timeRemaining)}` : ""}`}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...sendForm}>
      <form
        className="w-full space-y-6"
        onSubmit={sendForm.handleSubmit(onSubmit)}
      >
        <If condition={signInWithOtpMutation.error}>
          <AuthErrorAlert error={signInWithOtpMutation.error} />
        </If>

        <div className="flex flex-col space-y-4">
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white" htmlFor="email-input">
                  Email Address
                </FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    id="email-input"
                    className={cn(
                      "text-foreground dark:text-background bg-white dark:bg-white"
                    )}
                    data-test="email-input"
                    required
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    disabled={signInWithOtpMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className={cn(
              "bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black"
            )}
            disabled={signInWithOtpMutation.isPending}
            type="submit"
          >
            <If
              condition={signInWithOtpMutation.isPending}
              fallback="Send OTP Code"
            >
              Sending OTP Code...
            </If>
          </Button>
        </div>
      </form>
    </Form>
  );
}

const OtpSentAlert = ({ email }: { email: string }) => {
  const [isActive, setIsActive] = useState(true);

  if (!isActive) return null;

  return (
    <Alert className="flex justify-between">
      <CircleAlertIcon />
      <div className="flex-1 flex-col justify-center gap-1">
        <AlertTitle>OTP code was sent to your email!</AlertTitle>
        <AlertDescription>
          <p className="text-pretty">
            We've sent an OTP code to <strong>{email}</strong>. Check your email
            to complete the sign-in.
          </p>
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="ml-2 cursor-pointer p-0"
        onClick={() => setIsActive(false)}
        aria-label="Close alert"
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </Button>
    </Alert>
  );
};
