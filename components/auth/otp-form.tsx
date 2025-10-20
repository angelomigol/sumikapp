"use client";

import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { CircleAlertIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useSignInWithOtp } from "@/utils/supabase/hooks/use-sign-in-with-otp";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const OTP_EXPIRY_SECS = 60;

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function OtpForm({
  email,
  redirectUrl,
  onResend,
}: {
  email: string;
  redirectUrl: string;
  onResend: () => void;
}) {
  const signInWithOtpMutation = useSignInWithOtp();
  const [timeRemaining, setTimeRemaining] = useState<number>(OTP_EXPIRY_SECS);
  const [canResend, setCanResend] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  useEffect(() => {
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
  }, []);

  const handleResendCode = () => {
    if (!canResend) return;
    onResend();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(1, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const promise = async () => {
      await signInWithOtpMutation.mutateAsync({
        action: "verify",
        email,
        otp: data.pin,
      });
    };

    toast.promise(promise, {
      loading: "Verifying OTP Code...",
      success: () => {
        window.location.href = redirectUrl;
        return "Successfully Signed In!";
      },
      error: (err) => {
        form.reset();
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while verifying your OTP code. Please try again.";
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OtpSentAlert email={email} />

        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Enter 6-digit verification code
              </FormLabel>
              <FormControl>
                <InputOTP
                  {...field}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  inputMode="text"
                  onComplete={() => {
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={form.formState.isSubmitting}
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
              <FormDescription>
                <Button
                  type="button"
                  variant={"link"}
                  onClick={handleResendCode}
                  className={cn(
                    "px-0 py-0 text-xs text-white has-[>svg]:px-0",
                    canResend ? "hover:text-white/80" : "cursor-not-allowed"
                  )}
                  disabled={!canResend || form.formState.isSubmitting}
                >
                  {`Didn't receive the code? Send again ${!canResend ? `in ${formatTime(timeRemaining)}` : ""}`}
                </Button>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
            We&#39;ve sent an OTP code to <strong>{email}</strong>. Check your
            email to complete the sign-in.
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
