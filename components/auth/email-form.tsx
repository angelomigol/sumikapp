"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useCaptchaToken } from "@/utils/captcha/client/use-captcha-token";
import { useSignInWithOtp } from "@/utils/supabase/hooks/use-sign-in-with-otp";

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

import { AuthErrorAlert } from "./auth-error-alert";

export function EmailForm({
  shouldCreateUser,
  onEmailSubmit,
  defaultEmail,
}: {
  shouldCreateUser: boolean;
  onEmailSubmit: (email: string) => void;
  defaultEmail?: string;
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInWithOtpMutation = useSignInWithOtp();

  const sendForm = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email({ error: "Please enter a valid email address" }),
      })
    ),
    defaultValues: {
      email: defaultEmail ?? "",
    },
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
        onEmailSubmit(email);
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
            control={sendForm.control}
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
